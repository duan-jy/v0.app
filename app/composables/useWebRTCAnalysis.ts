import { ref, computed, onUnmounted } from 'vue'
import { useWorkstationStore } from '@/app/stores/workstation'
import type { AIDetection } from '@/app/types'

export interface DetectionBox {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  score: number
  track_id?: number
}

export interface GradeInfo {
  grade: string
  score: number
}

export interface PerfMetrics {
  infer_ms: number
  e2e_ms: number
}

export function useWebRTCAnalysis() {
  const store = useWorkstationStore()

  // State
  const isRunning = ref(false)
  const statusMessage = ref('')
  const latestBoxes = ref<DetectionBox[]>([])
  const gradeMap = ref<Record<number, GradeInfo>>({})
  const perfMetrics = ref<PerfMetrics | null>(null)
  const videoProgress = ref(0)
  const videoDuration = ref(0)
  const currentTimeFormatted = ref('00:00 / 00:00')

  // WebSocket connections
  let resultWs: WebSocket | null = null
  let controlWs: WebSocket | null = null
  let signalingWs: WebSocket | null = null
  let peerConnection: RTCPeerConnection | null = null

  // Helpers
  function sanitizeDeviceId(id: string): string {
    return id.trim().replace(/\s+/g, '_')
  }

  function wsScheme(): string {
    return window.location.protocol === 'https:' ? 'wss' : 'ws'
  }

  function setStatus(msg: string) {
    statusMessage.value = msg
  }

  function formatTime(seconds: number): string {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(Math.floor(seconds % 60)).padStart(2, '0')
    return `${m}:${s}`
  }

  // WebSocket probe for connection test
  async function wsProbe(url: string): Promise<{ ok: boolean; err?: string }> {
    return new Promise((resolve) => {
      const ws = new WebSocket(url)
      const timer = setTimeout(() => {
        ws.close()
        resolve({ ok: false, err: 'timeout' })
      }, 3000)
      ws.onopen = () => {
        clearTimeout(timer)
        ws.close()
        resolve({ ok: true })
      }
      ws.onerror = () => {
        clearTimeout(timer)
        resolve({ ok: false, err: 'error' })
      }
    })
  }

  // Connect to result WebSocket (receives AI detections)
  async function connectResultWS(server: string, port: string, deviceId: string): Promise<WebSocket> {
    const id = encodeURIComponent(sanitizeDeviceId(deviceId))
    const uri = `${wsScheme()}://${server}:${port}/ws/result/${id}`
    const ws = new WebSocket(uri)

    ws.onopen = () => {
      setStatus('结果通道已连接')
      store.connectionStatus = '已连接'
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'detection') {
          latestBoxes.value = msg.boxes_norm || []
          perfMetrics.value = msg.perf || null

          // Convert to store format for AI panel display
          const detections: AIDetection[] = latestBoxes.value.map((b, idx) => {
            const grade = b.track_id != null ? gradeMap.value[b.track_id] : null
            return {
              id: String(b.track_id ?? idx),
              organ: store.currentPatient?.examPart || '未知',
              location: `检测区域 ${idx + 1}`,
              size: `${((b.x2 - b.x1) * 100).toFixed(1)}% x ${((b.y2 - b.y1) * 100).toFixed(1)}%`,
              confidence: b.score,
              type: b.label,
              grade: grade?.grade,
            }
          })
          store.aiDetections = detections
        } else if (msg.type === 'grade') {
          if (msg.track_id != null) {
            gradeMap.value[msg.track_id] = { grade: msg.grade || '', score: msg.grade_score }
          }
        }
      } catch (e) {
        console.error('[v0] Result WS parse error:', e)
      }
    }

    ws.onerror = (e) => {
      console.error('[v0] Result WS error:', e)
      store.connectionStatus = '连接错误'
    }

    ws.onclose = () => {
      store.connectionStatus = '已断开'
    }

    return ws
  }

  // Connect to control WebSocket (send parts, receive status)
  async function connectControlWS(server: string, port: string, deviceId: string): Promise<WebSocket> {
    const id = encodeURIComponent(sanitizeDeviceId(deviceId))
    const uri = `${wsScheme()}://${server}:${port}/ws/control/${id}`
    const ws = new WebSocket(uri)

    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('控制通道连接超时')), 3000)
      ws.onopen = () => {
        clearTimeout(t)
        setStatus('控制通道已连接')
        resolve()
      }
      ws.onerror = (e) => {
        clearTimeout(t)
        reject(e)
      }
    })

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'status') {
          console.log('[v0] Control status:', msg)
        }
      } catch (e) {
        console.error('[v0] Control WS parse error:', e)
      }
    }

    ws.onerror = (e) => console.error('[v0] Control WS error:', e)

    return ws
  }

  // Start WebRTC connection
  async function startWebRTC(
    server: string,
    port: string,
    deviceId: string,
    stream: MediaStream,
    turn: { url: string; user: string; pass: string }
  ) {
    const id = encodeURIComponent(sanitizeDeviceId(deviceId))
    const signalingUri = `${wsScheme()}://${server}:${port}/ws/signaling/${id}`
    const ws = new WebSocket(signalingUri)

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: [turn.url], username: turn.user, credential: turn.pass }],
    })

    stream.getTracks().forEach((t) => pc.addTrack(t, stream))

    pc.onicecandidate = (event) => {
      if (!event.candidate) return
      ws.send(
        JSON.stringify({
          type: 'ice',
          device_id: deviceId,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        })
      )
    }

    ws.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: msg.sdp_type, sdp: msg.sdp }))
      } else if (msg.type === 'ice') {
        const c = msg.candidate
        await pc.addIceCandidate(
          new RTCIceCandidate({
            candidate: c.candidate,
            sdpMid: c.sdpMid,
            sdpMLineIndex: c.sdpMLineIndex,
          })
        )
      }
    }

    await new Promise<void>((resolve) => {
      ws.onopen = () => resolve()
    })

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    ws.send(
      JSON.stringify({
        type: 'offer',
        device_id: deviceId,
        sdp: pc.localDescription!.sdp,
        sdp_type: pc.localDescription!.type,
      })
    )

    signalingWs = ws
    peerConnection = pc

    return { pc, ws }
  }

  // Get video stream from video element
  function getVideoStream(videoEl: HTMLVideoElement): MediaStream {
    if (typeof videoEl.captureStream === 'function') {
      return (videoEl as any).captureStream()
    }

    // Fallback: draw to canvas and capture
    const srcCanvas = document.createElement('canvas')
    const srcCtx = srcCanvas.getContext('2d')!

    function pump() {
      if (videoEl.readyState >= 2) {
        const w = videoEl.videoWidth || 640
        const h = videoEl.videoHeight || 360
        if (srcCanvas.width !== w || srcCanvas.height !== h) {
          srcCanvas.width = w
          srcCanvas.height = h
        }
        srcCtx.drawImage(videoEl, 0, 0, w, h)
      }
      requestAnimationFrame(pump)
    }

    pump()
    return srcCanvas.captureStream(30)
  }

  // Main start function
  async function start(
    videoEl: HTMLVideoElement,
    file: File,
    options: {
      server: string
      port: string
      deviceId: string
      turnUrl: string
      turnUser: string
      turnPass: string
      parts: string[]
    }
  ) {
    if (isRunning.value) return

    const { server, port, deviceId, turnUrl, turnUser, turnPass, parts } = options

    // Load video file
    videoEl.src = URL.createObjectURL(file)
    await videoEl.play()
    const stream = getVideoStream(videoEl)

    isRunning.value = true
    setStatus('正在启动...')
    store.connectionStatus = '连接中'

    // Clear previous data
    latestBoxes.value = []
    gradeMap.value = {}
    perfMetrics.value = null

    // Connect result WebSocket
    resultWs = await connectResultWS(server, port, deviceId)

    // Connect control WebSocket and send parts
    try {
      controlWs = await connectControlWS(server, port, deviceId)
      if (controlWs && controlWs.readyState === WebSocket.OPEN) {
        controlWs.send(JSON.stringify({ type: 'parts', device_id: deviceId, parts }))
      }
    } catch (e) {
      setStatus('控制通道连接失败')
      console.error('[v0] Control WS connect failed:', e)
    }

    // Start WebRTC
    await startWebRTC(server, port, deviceId, stream, {
      url: turnUrl,
      user: turnUser,
      pass: turnPass,
    })

    setStatus('视频流传输中')
    store.connectionStatus = '已连接'
  }

  // Send parts update
  function sendParts(server: string, port: string, deviceId: string, parts: string[]) {
    const send = () => {
      controlWs!.send(JSON.stringify({ type: 'parts', device_id: deviceId, parts }))
      setStatus('检查部位已更新')
    }

    if (controlWs && controlWs.readyState === WebSocket.OPEN) {
      send()
      return Promise.resolve()
    }

    return connectControlWS(server, port, deviceId)
      .then((ws) => {
        controlWs = ws
        send()
      })
      .catch((e) => {
        setStatus('控制通道连接失败')
        console.error('[v0] Control WS connect failed:', e)
      })
  }

  // Test connection
  async function testConnection(server: string, port: string, deviceId: string) {
    const id = encodeURIComponent(sanitizeDeviceId(deviceId))
    const resultUrl = `${wsScheme()}://${server}:${port}/ws/result/${id}`
    const signalingUrl = `${wsScheme()}://${server}:${port}/ws/signaling/${id}`

    setStatus('正在测试...')
    store.connectionStatus = '连接中'

    const r1 = await wsProbe(resultUrl)
    const r2 = await wsProbe(signalingUrl)

    const resultStatus = r1.ok ? '正常' : '失败'
    const signalingStatus = r2.ok ? '正常' : '失败'

    setStatus(`结果通道: ${resultStatus} | 信令通道: ${signalingStatus}`)
    store.connectionStatus = r1.ok && r2.ok ? '已连接' : '连接错误'

    return { result: r1.ok, signaling: r2.ok }
  }

  // Stop and cleanup
  function stop() {
    isRunning.value = false

    if (resultWs) {
      resultWs.close()
      resultWs = null
    }
    if (controlWs) {
      controlWs.close()
      controlWs = null
    }
    if (signalingWs) {
      signalingWs.close()
      signalingWs = null
    }
    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }

    latestBoxes.value = []
    gradeMap.value = {}
    perfMetrics.value = null
    setStatus('已停止')
    store.connectionStatus = '已断开'
  }

  // Update video progress
  function updateVideoProgress(currentTime: number, duration: number) {
    videoProgress.value = currentTime
    videoDuration.value = duration
    currentTimeFormatted.value = `${formatTime(currentTime)} / ${formatTime(duration)}`
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    isRunning,
    statusMessage,
    latestBoxes,
    gradeMap,
    perfMetrics,
    videoProgress,
    videoDuration,
    currentTimeFormatted,
    start,
    stop,
    sendParts,
    testConnection,
    updateVideoProgress,
    getVideoStream,
  }
}
