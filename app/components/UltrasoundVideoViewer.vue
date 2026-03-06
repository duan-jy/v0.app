<template>
  <div class="flex flex-col h-full bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-foreground">实时超声视频</h2>
        <ConnectionBadge :status="store.connectionStatus" />
      </div>
      <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <template v-if="webrtc.isRunning.value">
          <span v-if="webrtc.perfMetrics.value">
            推理: {{ webrtc.perfMetrics.value.infer_ms.toFixed(1) }}ms
          </span>
          <span class="text-border">|</span>
          <span v-if="webrtc.perfMetrics.value">
            端到端: {{ webrtc.perfMetrics.value.e2e_ms.toFixed(1) }}ms
          </span>
        </template>
        <template v-else>
          <span>帧: {{ frameCount }}</span>
          <span class="text-border">|</span>
          <span>{{ currentTime }}</span>
        </template>
      </div>
    </div>

    <!-- Video Area -->
    <div class="relative flex-1 bg-video-bg flex items-center justify-center overflow-hidden">
      <div class="relative w-full h-full">
        <!-- Hidden video element for file playback -->
        <video
          ref="videoRef"
          class="hidden"
          muted
          playsinline
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onVideoLoaded"
        ></video>

        <!-- Main canvas for rendering -->
        <canvas
          ref="canvasRef"
          class="w-full h-full"
          @click="handleCanvasClick"
        ></canvas>

        <!-- Patient overlay info -->
        <div class="absolute top-3 left-3 text-[11px] text-emerald-400/80 font-mono leading-relaxed">
          <div>{{ store.currentPatient?.name || '---' }}</div>
          <div>{{ store.currentPatient?.examPart || '---' }}</div>
          <div>{{ store.currentPatient?.examId || '---' }}</div>
          <div>MI 0.7 / TIS 0.4</div>
        </div>

        <!-- Depth scale -->
        <div class="absolute top-3 right-3 flex flex-col items-end gap-2 text-[10px] text-emerald-400/60 font-mono">
          <span>0cm</span>
          <span>2cm</span>
          <span>4cm</span>
          <span>6cm</span>
          <span>8cm</span>
        </div>

        <!-- Status message overlay -->
        <div
          v-if="webrtc.statusMessage.value"
          class="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-emerald-400 font-mono"
        >
          {{ webrtc.statusMessage.value }}
        </div>
      </div>
    </div>

    <!-- Progress bar (when video loaded) -->
    <div v-if="hasVideo" class="flex items-center gap-3 px-4 py-2 border-t border-border bg-secondary/20">
      <input
        ref="progressRef"
        type="range"
        min="0"
        :max="webrtc.videoDuration.value"
        step="0.01"
        :value="webrtc.videoProgress.value"
        class="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        @input="onProgressInput"
        @change="onProgressChange"
      />
      <span class="text-xs text-muted-foreground font-mono min-w-[90px] text-right">
        {{ webrtc.currentTimeFormatted.value }}
      </span>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/30">
      <div class="flex items-center gap-2">
        <!-- File input -->
        <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer">
          <Upload class="w-3.5 h-3.5" />
          选择视频
          <input
            ref="fileInputRef"
            type="file"
            accept="video/mp4"
            class="hidden"
            @change="onFileSelect"
          />
        </label>

        <!-- Start/Stop button -->
        <button
          v-if="selectedFile"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="webrtc.isRunning.value
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'"
          @click="toggleAnalysis"
        >
          <component :is="webrtc.isRunning.value ? Square : Play" class="w-3.5 h-3.5" />
          {{ webrtc.isRunning.value ? '停止分析' : '开始分析' }}
        </button>

        <!-- Play/Pause when running -->
        <button
          v-if="hasVideo"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          @click="togglePlay"
        >
          <component :is="isPlaying ? Pause : Play" class="w-3.5 h-3.5" />
          {{ isPlaying ? '暂停' : '播放' }}
        </button>

        <!-- Test connection -->
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          @click="testConnection"
        >
          <Wifi class="w-3.5 h-3.5" />
          连接测试
        </button>

        <!-- Screenshot -->
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          @click="takeScreenshot"
        >
          <Camera class="w-3.5 h-3.5" />
          截图
        </button>
      </div>

      <!-- Screenshots thumbnails -->
      <div class="flex items-center gap-1.5">
        <div
          v-for="(shot, idx) in store.screenshots.slice(-4)"
          :key="idx"
          class="w-10 h-8 rounded border border-border bg-video-bg overflow-hidden"
        >
          <div class="w-full h-full bg-emerald-900/30 flex items-center justify-center text-[8px] text-emerald-400/50 font-mono">
            {{ idx + 1 }}
          </div>
        </div>
        <span v-if="store.screenshots.length > 0" class="text-xs text-muted-foreground ml-1">
          {{ store.screenshots.length }}张
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWorkstationStore } from '@/app/stores/workstation'
import { useWebRTCAnalysis } from '@/app/composables/useWebRTCAnalysis'
import { Play, Pause, Camera, Upload, Square, Wifi } from 'lucide-vue-next'
import ConnectionBadge from './ConnectionBadge.vue'

const store = useWorkstationStore()
const webrtc = useWebRTCAnalysis()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const progressRef = ref<HTMLInputElement | null>(null)

const isPlaying = ref(false)
const frameCount = ref(0)
const currentTime = ref('00:00:00')
const selectedFile = ref<File | null>(null)
const hasVideo = ref(false)
const isDraggingProgress = ref(false)

let animationId: number | null = null
let startTime = Date.now()

// Draw video frame with AI detection overlays
function draw() {
  const canvas = canvasRef.value
  const video = videoRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.clientWidth
  const h = canvas.clientHeight

  // Set canvas resolution
  canvas.width = w * window.devicePixelRatio
  canvas.height = h * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  if (video && video.readyState >= 2 && hasVideo.value) {
    // Draw video frame
    ctx.drawImage(video, 0, 0, w, h)

    // Draw AI detection boxes
    const boxes = webrtc.latestBoxes.value
    ctx.strokeStyle = '#22c55e' // lime/emerald
    ctx.lineWidth = 2
    ctx.font = '14px Arial'
    ctx.fillStyle = '#22c55e'

    for (const b of boxes) {
      const x1 = b.x1 * w
      const y1 = b.y1 * h
      const x2 = b.x2 * w
      const y2 = b.y2 * h

      // Draw box
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

      // Draw corner markers
      const cornerSize = 8
      ctx.lineWidth = 3
      // Top-left
      ctx.beginPath()
      ctx.moveTo(x1, y1 + cornerSize)
      ctx.lineTo(x1, y1)
      ctx.lineTo(x1 + cornerSize, y1)
      ctx.stroke()
      // Top-right
      ctx.beginPath()
      ctx.moveTo(x2 - cornerSize, y1)
      ctx.lineTo(x2, y1)
      ctx.lineTo(x2, y1 + cornerSize)
      ctx.stroke()
      // Bottom-left
      ctx.beginPath()
      ctx.moveTo(x1, y2 - cornerSize)
      ctx.lineTo(x1, y2)
      ctx.lineTo(x1 + cornerSize, y2)
      ctx.stroke()
      // Bottom-right
      ctx.beginPath()
      ctx.moveTo(x2 - cornerSize, y2)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x2, y2 - cornerSize)
      ctx.stroke()
      ctx.lineWidth = 2

      // Build label text
      const trk = b.track_id
      const g = trk != null ? webrtc.gradeMap.value[trk] : null
      const gradeVal = g && g.grade ? g.grade : ''
      const grade = gradeVal ? ` ${gradeVal}` : ''
      const text = `${b.label} ${(b.score * 100).toFixed(0)}%${grade}`

      // Draw label background
      const textWidth = ctx.measureText(text).width
      ctx.fillStyle = 'rgba(34, 197, 94, 0.85)'
      ctx.fillRect(x1, Math.max(0, y1 - 20), textWidth + 8, 18)

      // Draw label text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text, x1 + 4, Math.max(14, y1 - 6))
    }

    // Draw performance metrics
    if (webrtc.perfMetrics.value) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(8, 8, 140, 44)
      ctx.fillStyle = '#facc15' // yellow
      ctx.font = '12px monospace'
      ctx.fillText(`推理: ${webrtc.perfMetrics.value.infer_ms.toFixed(1)} ms`, 14, 24)
      ctx.fillText(`端到端: ${webrtc.perfMetrics.value.e2e_ms.toFixed(1)} ms`, 14, 42)
    }
  } else {
    // Draw simulated ultrasound when no video
    drawSimulatedUltrasound(ctx, w, h)
  }

  frameCount.value++

  // Update time display for simulation mode
  if (!hasVideo.value) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0')
    const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
    const ss = String(elapsed % 60).padStart(2, '0')
    currentTime.value = `${hh}:${mm}:${ss}`
  }

  if (isPlaying.value || hasVideo.value) {
    animationId = requestAnimationFrame(draw)
  }
}

// Draw simulated ultrasound texture
function drawSimulatedUltrasound(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#0a0e1a'
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const topY = 10

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx, topY)
  ctx.lineTo(cx - width * 0.42, height * 0.95)
  ctx.lineTo(cx + width * 0.42, height * 0.95)
  ctx.closePath()
  ctx.clip()

  const time = Date.now() * 0.001
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const distFromCenter = Math.abs(x - cx) / width
      const depth = y / height
      const noise = Math.random()
      const base = 25 + depth * 30 - distFromCenter * 40
      const tissue = Math.sin((x * 0.05) + (y * 0.03) + time) * 15
      const speckle = noise * 25
      let brightness = base + tissue + speckle

      const dx1 = (x - width * 0.4) / width
      const dy1 = (y - height * 0.35) / height
      const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
      if (dist1 < 0.08) {
        brightness = 20 + noise * 15
      }

      const dx2 = (x - width * 0.56) / width
      const dy2 = (y - height * 0.62) / height
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      if (dist2 < 0.05) {
        brightness = 10 + noise * 10
      }

      const g = Math.max(0, Math.min(255, brightness))
      ctx.fillStyle = `rgb(${g * 0.6}, ${g * 0.9}, ${g * 0.7})`
      ctx.fillRect(x, y, 3, 3)
    }
  }

  ctx.restore()

  const scanY = ((Date.now() % 3000) / 3000) * height
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, scanY)
  ctx.lineTo(width, scanY)
  ctx.stroke()
}

// File selection handler
function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

// Start/stop analysis
async function toggleAnalysis() {
  if (webrtc.isRunning.value) {
    webrtc.stop()
    hasVideo.value = false
    isPlaying.value = false
  } else if (selectedFile.value && videoRef.value) {
    const config = store.config
    await webrtc.start(videoRef.value, selectedFile.value, {
      server: config.serverAddress,
      port: String(config.serverPort),
      deviceId: config.deviceId,
      turnUrl: `turn:${config.turnServerAddress}:3478`,
      turnUser: config.turnUsername,
      turnPass: config.turnPassword,
      parts: getSelectedParts(),
    })
    hasVideo.value = true
    isPlaying.value = true
    draw()
  }
}

// Get selected exam parts from current patient
function getSelectedParts(): string[] {
  const parts: string[] = []
  const examPart = store.currentPatient?.examPart
  if (examPart?.includes('甲状腺')) parts.push('thyroid')
  if (examPart?.includes('乳腺')) parts.push('breast')
  if (parts.length === 0) parts.push('thyroid', 'breast') // default
  return parts
}

// Test connection
async function testConnection() {
  const config = store.config
  await webrtc.testConnection(config.serverAddress, String(config.serverPort), config.deviceId)
}

// Toggle play/pause
function togglePlay() {
  const video = videoRef.value
  if (!video) return

  if (isPlaying.value) {
    video.pause()
    isPlaying.value = false
  } else {
    video.play()
    isPlaying.value = true
  }
}

// Video time update
function onTimeUpdate() {
  const video = videoRef.value
  if (!video || !isFinite(video.duration)) return

  if (!isDraggingProgress.value) {
    webrtc.updateVideoProgress(video.currentTime, video.duration)
  }
}

// Video loaded
function onVideoLoaded() {
  const video = videoRef.value
  if (video && isFinite(video.duration)) {
    webrtc.updateVideoProgress(0, video.duration)
  }
}

// Progress bar handlers
function onProgressInput() {
  isDraggingProgress.value = true
}

function onProgressChange(event: Event) {
  const input = event.target as HTMLInputElement
  const video = videoRef.value
  if (video && isFinite(video.duration)) {
    video.currentTime = Number(input.value)
  }
  isDraggingProgress.value = false
}

// Take screenshot
function takeScreenshot() {
  store.addScreenshot(`screenshot_${Date.now()}`)
}

// Canvas click handler
function handleCanvasClick() {
  // Placeholder for annotation
}

onMounted(() => {
  isPlaying.value = true
  draw()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  webrtc.stop()
})
</script>
