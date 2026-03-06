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

          <!-- Screenshots Section -->
          <div class="px-6 py-4 border-b border-border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon class="w-4 h-4 text-primary" />
                检查图像
                <span class="text-xs font-normal text-muted-foreground ml-1">
                  (共 {{ store.screenshots.length }} 张)
                </span>
              </h3>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                @click="addImageFromFile"
              >
                <Plus class="w-3.5 h-3.5" />
                添加图片
              </button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileSelected"
              />
            </div>

            <!-- Screenshots Grid -->
            <div v-if="store.screenshots.length > 0" class="grid grid-cols-3 gap-4">
              <div
                v-for="shot in store.screenshots"
                :key="shot.id"
                class="group relative rounded-lg border border-border bg-muted/30 overflow-hidden"
              >
                <!-- Image -->
                <div class="aspect-[4/3] bg-video-bg">
                  <img
                    :src="shot.dataUrl"
                    :alt="shot.label"
                    class="w-full h-full object-cover"
                  />
                </div>

                <!-- Hover overlay with actions -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors"
                    title="预览"
                    @click="previewImage(shot)"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors"
                    title="替换"
                    @click="replaceImage(shot.id)"
                  >
                    <RefreshCw class="w-4 h-4" />
                  </button>
                  <button
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/90 text-white hover:bg-destructive transition-colors"
                    title="删除"
                    @click="removeImage(shot.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <!-- Label -->
                <div class="px-2 py-1.5 border-t border-border bg-card">
                  <input
                    :value="shot.label"
                    class="w-full text-xs text-foreground bg-transparent border-none outline-none"
                    @change="updateLabel(shot.id, ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg"
            >
              <ImageIcon class="w-10 h-10 mb-2 opacity-40" />
              <p class="text-sm">暂无检查图像</p>
              <p class="text-xs mt-1">请在工作站进行截图或点击上方添加图片</p>
            </div>
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

    <!-- Hidden file input for replace -->
    <input
      ref="replaceInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onReplaceFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
  Trash2,
  X,
} from 'lucide-vue-next'

const store = useWorkstationStore()
const doctorName = ref('王医生')
const reportDate = ref('2026-03-06')

const fileInputRef = ref<HTMLInputElement | null>(null)
const replaceInputRef = ref<HTMLInputElement | null>(null)
const previewShot = ref<Screenshot | null>(null)
const replaceTargetId = ref<string | null>(null)

function generateAIReport() {
  store.examFinding.description =
    '甲状腺右叶中部可见一低回声结节，大小约8.2mm x 5.1mm，边界清晰，形态规则，内部回声均匀，周边可见少许血流信号。CDFI示结节周边可见点条状血流信号。甲状腺左叶下极可见一囊性结节，大小约4.5mm x 3.2mm，边界清晰，内部透声好，未见明显血流信号。双侧颈部未见明显肿大淋巴结。'
  store.diagnosis =
    '1. 甲状腺右叶实性结节（TI-RADS 3类），考虑良性可能性大，建议6个月后复查超声。\n2. 甲状腺左叶囊性结节（TI-RADS 2类），考虑良性，建议定期随访。'
}

function addImageFromFile() {
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
      const label = `${organ} 图片 ${store.screenshots.length + 1}`
      store.addScreenshot(dataUrl, label, organ)
    }
  }
  reader.readAsDataURL(file)
  input.value = '' // Reset input
}

function replaceImage(id: string) {
  replaceTargetId.value = id
  replaceInputRef.value?.click()
}

function onReplaceFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !replaceTargetId.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl && replaceTargetId.value) {
      store.replaceScreenshot(replaceTargetId.value, dataUrl)
    }
    replaceTargetId.value = null
  }
  reader.readAsDataURL(file)
  input.value = '' // Reset input
}

function removeImage(id: string) {
  store.removeScreenshot(id)
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
