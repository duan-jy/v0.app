<template>
  <div class="flex flex-col h-screen bg-background overflow-hidden">
    <HeaderBar />

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Page Title -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <RouterLink
              to="/"
              class="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft class="w-4 h-4 text-foreground" />
            </RouterLink>
            <div>
              <h1 class="text-xl font-bold text-foreground">AI报告编辑</h1>
              <p class="text-sm text-muted-foreground">结构化超声检查报告</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              @click="generateAIReport"
            >
              <BrainCircuit class="w-4 h-4" />
              AI生成报告
            </button>
            <button class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              <Save class="w-4 h-4" />
              保存
            </button>
            <button class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-medical-success text-white hover:opacity-90 transition-colors">
              <FileDown class="w-4 h-4" />
              导出PDF
            </button>
          </div>
        </div>

        <!-- Report Content -->
        <div class="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <!-- Report Header -->
          <div class="bg-primary/5 px-6 py-4 border-b border-border">
            <div class="text-center">
              <h2 class="text-lg font-bold text-foreground">超声检查报告</h2>
              <p class="text-xs text-muted-foreground mt-1">超声智能体 AI 工作站 3.0</p>
            </div>
          </div>

          <!-- Patient Info Section -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <User class="w-4 h-4 text-primary" />
              患者信息
            </h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-xs text-muted-foreground">姓名</label>
                <input
                  :value="store.currentPatient?.name || ''"
                  readonly
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-foreground"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">性别 / 年龄</label>
                <input
                  :value="store.currentPatient ? `${store.currentPatient.gender} / ${store.currentPatient.age}岁` : ''"
                  readonly
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-foreground"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">检查部位</label>
                <input
                  :value="store.currentPatient?.examPart || ''"
                  readonly
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-foreground"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">检查号</label>
                <input
                  :value="store.currentPatient?.examId || ''"
                  readonly
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-foreground font-mono"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">检查时间</label>
                <input
                  :value="store.currentPatient?.examTime || ''"
                  readonly
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-foreground font-mono"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">诊断结果</label>
                <div class="mt-1">
                  <span
                    class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium"
                    :class="store.examResult === '阳性' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                  >
                    {{ store.examResult }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Screenshots Section - Fixed 2 slots -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <ImageIcon class="w-4 h-4 text-primary" />
              检查图像
              <span class="text-xs font-normal text-muted-foreground ml-1">(限2张)</span>
            </h3>

            <!-- Two Image Slots Grid -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Slot 1 -->
              <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
                <template v-if="reportImages[0]">
                  <!-- Image -->
                  <div class="aspect-[4/3] bg-video-bg group">
                    <img
                      :src="reportImages[0].dataUrl"
                      :alt="reportImages[0].label"
                      class="w-full h-full object-cover"
                    />
                    <!-- Hover overlay -->
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        class="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors"
                        title="预览"
                        @click="previewImage(reportImages[0])"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                      <button
                        class="flex items-center justify-center w-9 h-9 rounded-full bg-primary/90 text-white hover:bg-primary transition-colors"
                        title="替换图片"
                        @click="replaceSlot(0)"
                      >
                        <RefreshCw class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <!-- Label -->
                  <div class="px-3 py-2 border-t border-border bg-card">
                    <input
                      :value="reportImages[0].label"
                      class="w-full text-xs text-foreground bg-transparent border-none outline-none"
                      placeholder="图片标签"
                      @change="updateLabel(reportImages[0].id, ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                </template>
                <!-- Empty slot -->
                <template v-else>
                  <div
                    class="aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    @click="selectSlot(0)"
                  >
                    <div class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                      <Plus class="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p class="text-sm text-muted-foreground">图片 1</p>
                    <p class="text-xs text-muted-foreground/60 mt-0.5">点击添加或从工作站截图</p>
                  </div>
                </template>
              </div>

              <!-- Slot 2 -->
              <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
                <template v-if="reportImages[1]">
                  <!-- Image -->
                  <div class="aspect-[4/3] bg-video-bg group">
                    <img
                      :src="reportImages[1].dataUrl"
                      :alt="reportImages[1].label"
                      class="w-full h-full object-cover"
                    />
                    <!-- Hover overlay -->
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        class="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors"
                        title="预览"
                        @click="previewImage(reportImages[1])"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                      <button
                        class="flex items-center justify-center w-9 h-9 rounded-full bg-primary/90 text-white hover:bg-primary transition-colors"
                        title="替换图片"
                        @click="replaceSlot(1)"
                      >
                        <RefreshCw class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <!-- Label -->
                  <div class="px-3 py-2 border-t border-border bg-card">
                    <input
                      :value="reportImages[1].label"
                      class="w-full text-xs text-foreground bg-transparent border-none outline-none"
                      placeholder="图片标签"
                      @change="updateLabel(reportImages[1].id, ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                </template>
                <!-- Empty slot -->
                <template v-else>
                  <div
                    class="aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    @click="selectSlot(1)"
                  >
                    <div class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                      <Plus class="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p class="text-sm text-muted-foreground">图片 2</p>
                    <p class="text-xs text-muted-foreground/60 mt-0.5">点击添加或从工作站截图</p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Hidden file input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileSelected"
            />
          </div>

          <!-- Findings Section -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <FileSearch class="w-4 h-4 text-primary" />
              检查所见
            </h3>
            <textarea
              v-model="store.examFinding.description"
              rows="5"
              class="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
              placeholder="请输入检查所见..."
            />
          </div>

          <!-- Diagnosis Section -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Stethoscope class="w-4 h-4 text-primary" />
              诊断结论
            </h3>
            <textarea
              v-model="store.diagnosis"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
              placeholder="请输入诊断结论..."
            />
            <!-- Critical Warning -->
            <div
              v-if="store.isCritical"
              class="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <AlertTriangle class="w-4 h-4 text-destructive" />
              <span class="text-sm font-medium text-destructive">该报告已标记为危急值</span>
            </div>
          </div>

          <!-- Doctor Signature -->
          <div class="px-6 py-4">
            <h3 class="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <PenTool class="w-4 h-4 text-primary" />
              医生签名
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-muted-foreground">检查医生</label>
                <input
                  v-model="doctorName"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="请输入医生姓名"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">报告日期</label>
                <input
                  :value="reportDate"
                  readonly
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-foreground font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div
        v-if="previewShot"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click.self="previewShot = null"
      >
        <div class="relative max-w-4xl max-h-[90vh] rounded-lg overflow-hidden bg-card shadow-xl">
          <img
            :src="previewShot.dataUrl"
            :alt="previewShot.label"
            class="max-w-full max-h-[85vh] object-contain"
          />
          <div class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
            <p class="text-white text-sm font-medium">{{ previewShot.label }}</p>
            <p class="text-white/60 text-xs">{{ formatTimestamp(previewShot.timestamp) }}</p>
          </div>
          <button
            class="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            @click="previewShot = null"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
    </Teleport>

    
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import HeaderBar from '@/app/components/HeaderBar.vue'
import type { Screenshot } from '@/app/types'
import {
  ArrowLeft,
  BrainCircuit,
  Save,
  FileDown,
  User,
  FileSearch,
  Stethoscope,
  AlertTriangle,
  PenTool,
  Image as ImageIcon,
  Plus,
  Eye,
  RefreshCw,
  X,
} from 'lucide-vue-next'

const store = useWorkstationStore()
const doctorName = ref('王医生')
const reportDate = ref('2026-03-06')

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewShot = ref<Screenshot | null>(null)
const currentSlot = ref<number>(0) // 0 or 1

// Only show first 2 screenshots in report
const reportImages = computed(() => store.screenshots.slice(0, 2))

function generateAIReport() {
  store.examFinding.description =
    '甲状腺右叶中部可见一低回声结节，大小约8.2mm x 5.1mm，边界清晰，形态规则，内部回声均匀，周边可见少许血流信号。CDFI示结节周边可见点条状血流信号。甲状腺左叶下极可见一囊性结节，大小约4.5mm x 3.2mm，边界清晰，内部透声好，未见明显血流信号。双侧颈部未见明显肿大淋巴结。'
  store.diagnosis =
    '1. 甲状腺右叶实性结节（TI-RADS 3类），考虑良性可能性大，建议6个月后复查超声。\n2. 甲状腺左叶囊性结节（TI-RADS 2类），考虑良性，建议定期随访。'
}

// Select slot to add new image
function selectSlot(slot: number) {
  currentSlot.value = slot
  fileInputRef.value?.click()
}

// Replace existing image in slot
function replaceSlot(slot: number) {
  currentSlot.value = slot
  fileInputRef.value?.click()
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      const organ = store.currentPatient?.examPart || '超声'
      const label = `${organ} 图片 ${currentSlot.value + 1}`
      
      // Check if slot already has an image
      const existingImage = reportImages.value[currentSlot.value]
      if (existingImage) {
        // Replace existing image
        store.replaceScreenshot(existingImage.id, dataUrl)
      } else {
        // Add new image
        store.addScreenshot(dataUrl, label, organ)
      }
    }
  }
  reader.readAsDataURL(file)
  input.value = '' // Reset input
}

function previewImage(shot: Screenshot) {
  previewShot.value = shot
}

function updateLabel(id: string, label: string) {
  store.updateScreenshotLabel(id, label)
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>
