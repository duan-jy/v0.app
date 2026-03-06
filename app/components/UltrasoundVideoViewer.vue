<template>
  <div class="flex flex-col h-full bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-foreground">实时超声视频</h2>
        <ConnectionBadge :status="store.connectionStatus" />
      </div>
      <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <span>帧: {{ frameCount }}</span>
        <span class="text-border">|</span>
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <!-- Video Area -->
    <div class="relative flex-1 bg-video-bg flex items-center justify-center overflow-hidden">
      <!-- Simulated Ultrasound Display -->
      <div class="relative w-full h-full">
        <!-- Ultrasound simulation canvas -->
        <canvas
          ref="canvasRef"
          class="w-full h-full"
          @click="handleCanvasClick"
        ></canvas>

        <!-- AI Detection Overlays -->
        <div
          v-for="detection in store.aiDetections"
          :key="detection.id"
          class="absolute border-2 border-emerald-400 rounded"
          :style="getDetectionStyle(detection.id)"
        >
          <div class="absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/90 rounded text-white text-[10px] whitespace-nowrap">
            <span>{{ detection.type }}</span>
            <span class="font-mono">{{ (detection.confidence * 100).toFixed(0) }}%</span>
          </div>
          <!-- Corner markers -->
          <div class="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-emerald-400"></div>
          <div class="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-emerald-400"></div>
          <div class="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-emerald-400"></div>
          <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-emerald-400"></div>
        </div>

        <!-- Measurement line -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="35%" y1="30%" x2="55%" y2="45%" stroke="#22d3ee" stroke-width="1" stroke-dasharray="4 2" />
          <circle cx="35%" cy="30%" r="3" fill="#22d3ee" />
          <circle cx="55%" cy="45%" r="3" fill="#22d3ee" />
          <text x="46%" y="28%" fill="#22d3ee" font-size="11" font-family="monospace">8.2mm</text>
        </svg>

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
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/30">
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          @click="togglePlay"
        >
          <component :is="isPlaying ? Pause : Play" class="w-3.5 h-3.5" />
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useWorkstationStore } from '@/app/stores/workstation'
import { Play, Pause, Camera } from 'lucide-vue-next'
import ConnectionBadge from './ConnectionBadge.vue'

const store = useWorkstationStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isPlaying = ref(true)
const frameCount = ref(0)
const currentTime = ref('00:00:00')

let animationId: number | null = null
let startTime = Date.now()

function getDetectionStyle(id: string) {
  if (id === '1') {
    return { top: '25%', left: '30%', width: '18%', height: '22%' }
  }
  return { top: '55%', left: '50%', width: '12%', height: '15%' }
}

function drawUltrasound(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Dark background
  ctx.fillStyle = '#0a0e1a'
  ctx.fillRect(0, 0, width, height)

  // Ultrasound sector / fan shape
  const cx = width / 2
  const topY = 10

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx, topY)
  ctx.lineTo(cx - width * 0.42, height * 0.95)
  ctx.lineTo(cx + width * 0.42, height * 0.95)
  ctx.closePath()
  ctx.clip()

  // Fill with grainy texture to simulate ultrasound
  const time = Date.now() * 0.001
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const distFromCenter = Math.abs(x - cx) / width
      const depth = y / height
      const noise = Math.random()
      const base = 25 + depth * 30 - distFromCenter * 40

      // Create tissue-like patterns
      const tissue = Math.sin((x * 0.05) + (y * 0.03) + time) * 15
      const speckle = noise * 25

      let brightness = base + tissue + speckle

      // Simulate a nodule region
      const dx1 = (x - width * 0.4) / width
      const dy1 = (y - height * 0.35) / height
      const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
      if (dist1 < 0.08) {
        brightness = 20 + noise * 15 // hypoechoic
      }

      // Second nodule
      const dx2 = (x - width * 0.56) / width
      const dy2 = (y - height * 0.62) / height
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      if (dist2 < 0.05) {
        brightness = 10 + noise * 10 // cystic/dark
      }

      const g = Math.max(0, Math.min(255, brightness))
      ctx.fillStyle = `rgb(${g * 0.6}, ${g * 0.9}, ${g * 0.7})`
      ctx.fillRect(x, y, 3, 3)
    }
  }

  ctx.restore()

  // Scan line
  const scanY = ((Date.now() % 3000) / 3000) * height
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, scanY)
  ctx.lineTo(width, scanY)
  ctx.stroke()
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvas.clientWidth * window.devicePixelRatio
  canvas.height = canvas.clientHeight * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  drawUltrasound(ctx, canvas.clientWidth, canvas.clientHeight)

  frameCount.value++

  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const s = String(elapsed % 60).padStart(2, '0')
  currentTime.value = `${h}:${m}:${s}`

  if (isPlaying.value) {
    animationId = requestAnimationFrame(render)
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    render()
  } else if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

function takeScreenshot() {
  store.addScreenshot(`screenshot_${Date.now()}`)
}

function handleCanvasClick() {
  // Placeholder for future annotation interaction
}

onMounted(() => {
  render()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>
