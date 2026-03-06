<template>
  <div class="flex flex-col h-full gap-3 overflow-y-auto pr-1">
    <!-- 1. Patient History -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <History class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">患者历史影像</h3>
      </div>
      <div class="px-4 py-4">
        <div class="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <div class="flex flex-col items-center gap-2">
            <FolderOpen class="w-8 h-8 text-muted-foreground/40" />
            <span>暂无历史影像</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. AI Detection Results - Grouped by Organ -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <BrainCircuit class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">AI自动检测结果</h3>
        <span class="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {{ store.aiDetections.length }}个发现
        </span>
      </div>
      
      <!-- Grouped Tables by Organ -->
      <div class="divide-y divide-border">
        <div
          v-for="(items, organ) in groupedDetections"
          :key="organ"
          class="px-3 py-3"
        >
          <!-- Organ Header -->
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-4 rounded-full bg-primary"></div>
            <span class="text-sm font-semibold text-foreground">{{ organ }}</span>
            <span class="text-xs text-muted-foreground">({{ items.length }}处病灶)</span>
            <button 
              @click="addDetection(organ as string)"
              class="ml-auto p-1 rounded hover:bg-secondary transition-colors"
              title="添加病灶"
            >
              <Plus class="w-3.5 h-3.5 text-primary" />
            </button>
          </div>

          <!-- Editable Table -->
          <div class="border border-border rounded-lg overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-secondary/50">
                <tr>
                  <th class="px-2 py-1.5 text-left font-medium text-muted-foreground w-[25%]">类型</th>
                  <th class="px-2 py-1.5 text-left font-medium text-muted-foreground w-[20%]">位置</th>
                  <th class="px-2 py-1.5 text-left font-medium text-muted-foreground w-[22%]">大小</th>
                  <th class="px-2 py-1.5 text-center font-medium text-muted-foreground w-[15%]">置信度</th>
                  <th class="px-2 py-1.5 text-center font-medium text-muted-foreground w-[13%]">分级</th>
                  <th class="px-2 py-1.5 w-[5%]"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="det in items"
                  :key="det.id"
                  class="hover:bg-secondary/30 transition-colors group"
                >
                  <td class="px-2 py-1.5">
                    <input
                      v-model="det.type"
                      class="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5 text-foreground"
                      placeholder="类型"
                    />
                  </td>
                  <td class="px-2 py-1.5">
                    <input
                      v-model="det.location"
                      class="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5 text-foreground"
                      placeholder="位置"
                    />
                  </td>
                  <td class="px-2 py-1.5">
                    <input
                      v-model="det.size"
                      class="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5 font-mono text-foreground"
                      placeholder="尺寸"
                    />
                  </td>
                  <td class="px-2 py-1.5 text-center">
                    <span
                      class="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                      :class="getConfidenceClass(det.confidence)"
                    >
                      {{ (det.confidence * 100).toFixed(0) }}%
                    </span>
                  </td>
                  <td class="px-2 py-1.5">
                    <select
                      v-model="det.grade"
                      class="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 py-0.5 text-foreground text-center"
                    >
                      <option value="">-</option>
                      <option value="1">1级</option>
                      <option value="2">2级</option>
                      <option value="3">3级</option>
                      <option value="4a">4a</option>
                      <option value="4b">4b</option>
                      <option value="4c">4c</option>
                      <option value="5">5级</option>
                    </select>
                  </td>
                  <td class="px-1 py-1.5">
                    <button
                      @click="removeDetection(det.id)"
                      class="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all"
                      title="删除"
                    >
                      <X class="w-3 h-3 text-destructive" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="Object.keys(groupedDetections).length === 0" class="px-4 py-8 text-center">
          <div class="flex flex-col items-center gap-2 text-muted-foreground">
            <Search class="w-8 h-8 opacity-40" />
            <span class="text-sm">暂无检测结果</span>
            <button
              @click="addNewOrganDetection"
              class="mt-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              + 手动添加
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Organ Section -->
      <div v-if="Object.keys(groupedDetections).length > 0" class="px-3 py-2 border-t border-border">
        <button
          @click="addNewOrganDetection"
          class="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          添加其他部位
        </button>
      </div>
    </section>

    <!-- 3. Exam Findings -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <FileSearch class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">检查所见</h3>
        <span class="ml-auto text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">AI生成</span>
      </div>
      <div class="px-4 py-3">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
          <div>
            <label class="text-muted-foreground">检查器官</label>
            <p class="text-foreground font-medium mt-0.5">{{ store.examFinding.organ }}</p>
          </div>
          <div>
            <label class="text-muted-foreground">病灶位置</label>
            <p class="text-foreground font-medium mt-0.5">{{ store.examFinding.location }}</p>
          </div>
          <div>
            <label class="text-muted-foreground">大小</label>
            <p class="text-foreground font-medium font-mono mt-0.5">{{ store.examFinding.size }}</p>
          </div>
          <div>
            <label class="text-muted-foreground">回声特征</label>
            <p class="text-foreground font-medium mt-0.5">{{ store.examFinding.echoFeature }}</p>
          </div>
          <div>
            <label class="text-muted-foreground">边界</label>
            <p class="text-foreground font-medium mt-0.5">{{ store.examFinding.boundary }}</p>
          </div>
          <div>
            <label class="text-muted-foreground">血流信号</label>
            <p class="text-foreground font-medium mt-0.5">{{ store.examFinding.bloodFlow }}</p>
          </div>
        </div>
        <div>
          <label class="text-xs text-muted-foreground">描述</label>
          <textarea
            v-model="store.examFinding.description"
            rows="3"
            class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </section>

    <!-- 4. Diagnosis -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <Stethoscope class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">检查诊断</h3>
      </div>
      <div class="px-4 py-3">
        <textarea
          v-model="store.diagnosis"
          rows="2"
          class="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="请输入诊断结论..."
        />

        <!-- Critical toggle -->
        <div class="flex items-center justify-between mt-3 py-2 px-3 rounded-lg bg-secondary/50">
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-destructive" />
            <span class="text-sm font-medium text-foreground">危急值</span>
          </div>
          <button
            class="relative w-10 h-5 rounded-full transition-colors"
            :class="store.isCritical ? 'bg-destructive' : 'bg-muted'"
            @click="store.isCritical = !store.isCritical"
            :aria-label="store.isCritical ? '关闭危急值' : '开启危急值'"
          >
            <span
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
              :class="store.isCritical ? 'translate-x-5' : 'translate-x-0.5'"
            ></span>
          </button>
        </div>

        <!-- Result buttons -->
        <div class="flex items-center gap-2 mt-3">
          <span class="text-xs text-muted-foreground">诊断结果:</span>
          <button
            class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            :class="store.examResult === '阳性' ? 'bg-amber-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
            @click="store.examResult = '阳性'"
          >
            阳性
          </button>
          <button
            class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            :class="store.examResult === '阴性' ? 'bg-emerald-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
            @click="store.examResult = '阴性'"
          >
            阴性
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2 mt-4">
          <RouterLink
            to="/report"
            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <BrainCircuit class="w-4 h-4" />
            生成AI报告
          </RouterLink>
          <button
            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-medical-success text-white hover:opacity-90 transition-colors"
          >
            <Save class="w-4 h-4" />
            保存报告
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import type { AIDetection } from '@/app/types'
import {
  History,
  FolderOpen,
  BrainCircuit,
  FileSearch,
  Stethoscope,
  AlertTriangle,
  Save,
  Plus,
  X,
  Search,
} from 'lucide-vue-next'

const store = useWorkstationStore()

// Group detections by organ
const groupedDetections = computed(() => {
  const groups: Record<string, AIDetection[]> = {}
  for (const det of store.aiDetections) {
    if (!groups[det.organ]) {
      groups[det.organ] = []
    }
    groups[det.organ].push(det)
  }
  return groups
})

// Get confidence badge class
function getConfidenceClass(confidence: number) {
  if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-700'
  if (confidence >= 0.75) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

// Add new detection to existing organ
function addDetection(organ: string) {
  const newId = `det-${Date.now()}`
  store.aiDetections.push({
    id: newId,
    organ,
    location: '',
    size: '',
    confidence: 0,
    type: '',
    grade: '',
  })
}

// Add detection for new organ
function addNewOrganDetection() {
  const organName = prompt('请输入检查部位名称:', '肝脏')
  if (organName && organName.trim()) {
    addDetection(organName.trim())
  }
}

// Remove detection
function removeDetection(id: string) {
  const index = store.aiDetections.findIndex(d => d.id === id)
  if (index !== -1) {
    store.aiDetections.splice(index, 1)
  }
}
</script>
