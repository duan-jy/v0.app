<template>
  <div class="flex flex-col h-full">
    <!-- Tabs Header -->
    <div class="flex border-b border-border bg-panel-bg rounded-t-xl">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative"
        :class="activeTab === tab.id 
          ? 'text-primary' 
          : 'text-muted-foreground hover:text-foreground'"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="w-3.5 h-3.5" />
        {{ tab.label }}
        <span v-if="tab.badge" class="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">
          {{ tab.badge }}
        </span>
        <span
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
        ></span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto bg-panel-bg rounded-b-xl">
      <!-- Tab 1: AI Detection Results -->
      <div v-show="activeTab === 'detection'" class="p-3">
        <!-- Lesion Summary Bar -->
        <div v-if="store.aiDetections.length > 0" class="flex items-center gap-2 mb-3 px-2 py-1.5 bg-secondary/50 rounded-lg">
          <span class="text-xs text-muted-foreground">共</span>
          <span class="text-xs font-bold text-foreground">{{ store.aiDetections.length }}</span>
          <span class="text-xs text-muted-foreground">处病灶</span>
          <span class="mx-2 text-border">|</span>
          <span class="text-xs text-muted-foreground">最高分级:</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="getGradeClass(highestGrade)">
            {{ highestGrade ? getTiradsLabel(highestGrade) : '-' }}
          </span>
        </div>

        <!-- Grouped Detections -->
        <div class="space-y-2">
          <div
            v-for="(items, organ) in groupedDetections"
            :key="organ"
          >
            <!-- Organ Header -->
            <div class="flex items-center gap-2 mb-1.5">
              <div class="w-1 h-3.5 rounded-full bg-primary"></div>
              <span class="text-xs font-semibold text-foreground">{{ organ }}</span>
              <span class="text-[10px] text-muted-foreground">({{ items.length }})</span>
              <button 
                @click="addDetection(organ as string)"
                class="ml-auto p-0.5 rounded hover:bg-secondary transition-colors"
                title="添加病灶"
              >
                <Plus class="w-3 h-3 text-primary" />
              </button>
            </div>

            <!-- Compact Detection Cards -->
            <div class="space-y-1.5">
              <div
                v-for="(det, idx) in items"
                :key="det.id"
                class="border border-border rounded-lg overflow-hidden bg-background"
              >
                <!-- Card Header - Always visible -->
                <div 
                  class="flex items-center justify-between px-2.5 py-1.5 cursor-pointer hover:bg-secondary/30 transition-colors"
                  @click="toggleExpand(det.id)"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[10px] font-medium text-muted-foreground shrink-0">#{{ idx + 1 }}</span>
                    <span class="text-xs text-foreground truncate">{{ det.location || '未指定位置' }}</span>
                    <span class="text-[10px] text-muted-foreground truncate">{{ det.size }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span
                      v-if="det.grade"
                      class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      :class="getGradeClass(det.grade)"
                    >
                      {{ det.grade }}
                    </span>
                    <ChevronDown 
                      class="w-3.5 h-3.5 text-muted-foreground transition-transform"
                      :class="{ 'rotate-180': expandedIds.has(det.id) }"
                    />
                  </div>
                </div>

                <!-- Expanded Detail - Compact 3-column grid -->
                <div v-if="expandedIds.has(det.id)" class="px-2.5 py-2 border-t border-border bg-secondary/20">
                  <div class="grid grid-cols-3 gap-x-2 gap-y-1.5 text-[11px]">
                    <div>
                      <label class="text-muted-foreground">位置</label>
                      <input v-model="det.location" class="field-input" placeholder="右叶中部" />
                    </div>
                    <div class="col-span-2">
                      <label class="text-muted-foreground">大小 (mm)</label>
                      <input v-model="det.size" class="field-input font-mono" placeholder="8x5x4" />
                    </div>
                    <div>
                      <label class="text-muted-foreground">形态</label>
                      <select v-model="det.shape" class="field-input">
                        <option value="">-</option>
                        <option value="规则">规则</option>
                        <option value="不规则">不规则</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-muted-foreground">纵横比</label>
                      <select v-model="det.aspectRatio" class="field-input">
                        <option value="">-</option>
                        <option value="小于1">&lt;1</option>
                        <option value="大于等于1">&ge;1</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-muted-foreground">边缘</label>
                      <select v-model="det.margin" class="field-input">
                        <option value="">-</option>
                        <option value="完整">完整</option>
                        <option value="模糊">模糊</option>
                        <option value="毛刺">毛刺</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-muted-foreground">回声</label>
                      <select v-model="det.echoPattern" class="field-input">
                        <option value="">-</option>
                        <option value="无回声">无回声</option>
                        <option value="低回声">低回声</option>
                        <option value="等回声">等回声</option>
                        <option value="高回声">高回声</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-muted-foreground">钙化</label>
                      <select v-model="det.calcification" class="field-input">
                        <option value="">-</option>
                        <option value="无">无</option>
                        <option value="微钙化">微钙化</option>
                        <option value="粗大钙化">粗钙化</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-muted-foreground">血流</label>
                      <select v-model="det.bloodFlow" class="field-input">
                        <option value="">-</option>
                        <option value="无血供">无</option>
                        <option value="内部血供">内部</option>
                        <option value="边缘血供">边缘</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-muted-foreground">TI-RADS</label>
                      <select v-model="det.grade" class="field-input">
                        <option value="">-</option>
                        <option value="2">2级</option>
                        <option value="3">3级</option>
                        <option value="4a">4a</option>
                        <option value="4b">4b</option>
                        <option value="4c">4c</option>
                        <option value="5">5级</option>
                      </select>
                    </div>
                    <div class="flex items-end">
                      <button
                        @click="removeDetection(det.id)"
                        class="flex items-center gap-1 px-1.5 py-1 text-[10px] text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 class="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="Object.keys(groupedDetections).length === 0" class="py-8 text-center">
          <Search class="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p class="text-sm text-muted-foreground">暂无检测结果</p>
          <button
            @click="addNewOrganDetection"
            class="mt-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            + 手动添加
          </button>
        </div>

        <!-- Add Organ -->
        <button
          v-if="Object.keys(groupedDetections).length > 0"
          @click="addNewOrganDetection"
          class="w-full mt-2 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          + 添加其他部位
        </button>
      </div>

      <!-- Tab 2: Exam Findings -->
      <div v-show="activeTab === 'findings'" class="p-3">
        <!-- AI Generate Button -->
        <div class="flex justify-end mb-2">
          <button
            @click="generateDescription"
            class="flex items-center gap-1 px-2 py-1 text-[10px] text-primary bg-primary/10 rounded-full font-medium hover:bg-primary/20"
          >
            <BrainCircuit class="w-3 h-3" />
            AI生成描述
          </button>
        </div>

        <!-- Thyroid Basic Info - Collapsible -->
        <div v-if="store.examFinding.thyroid" class="mb-3 border border-border rounded-lg overflow-hidden">
          <div 
            class="flex items-center justify-between px-3 py-2 bg-secondary/30 cursor-pointer"
            @click="showThyroidBasic = !showThyroidBasic"
          >
            <span class="text-xs font-medium text-foreground">甲状腺基本情况</span>
            <ChevronDown 
              class="w-3.5 h-3.5 text-muted-foreground transition-transform"
              :class="{ 'rotate-180': showThyroidBasic }"
            />
          </div>
          <div v-if="showThyroidBasic" class="p-2.5 border-t border-border">
            <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
              <div>
                <label class="text-muted-foreground">左叶</label>
                <input v-model="store.examFinding.thyroid.leftLobeSize" class="field-input font-mono" placeholder="48x18x16" />
              </div>
              <div>
                <label class="text-muted-foreground">右叶</label>
                <input v-model="store.examFinding.thyroid.rightLobeSize" class="field-input font-mono" placeholder="50x20x18" />
              </div>
              <div>
                <label class="text-muted-foreground">峡部</label>
                <input v-model="store.examFinding.thyroid.isthmusThickness" class="field-input font-mono" placeholder="3mm" />
              </div>
              <div>
                <label class="text-muted-foreground">被膜</label>
                <select v-model="store.examFinding.thyroid.capsuleIntegrity" class="field-input">
                  <option value="">-</option>
                  <option value="光整">光整</option>
                  <option value="不光整">不光整</option>
                </select>
              </div>
              <div>
                <label class="text-muted-foreground">内部回声</label>
                <select v-model="store.examFinding.thyroid.internalEcho" class="field-input">
                  <option value="">-</option>
                  <option value="均匀">均匀</option>
                  <option value="不均匀">不均匀</option>
                </select>
              </div>
              <div>
                <label class="text-muted-foreground">血流</label>
                <select v-model="store.examFinding.thyroid.bloodFlowPattern" class="field-input">
                  <option value="">-</option>
                  <option value="正常">正常</option>
                  <option value="增多">增多</option>
                  <option value="减少">减少</option>
                </select>
              </div>
              <div>
                <label class="text-muted-foreground">甲状旁腺</label>
                <select v-model="store.examFinding.thyroid.parathyroidStatus" class="field-input">
                  <option value="">-</option>
                  <option value="未见异常">未见异常</option>
                  <option value="可见异常回声">异常</option>
                </select>
              </div>
              <div>
                <label class="text-muted-foreground">淋巴结</label>
                <select v-model="store.examFinding.thyroid.lymphNodeStatus" class="field-input">
                  <option value="">-</option>
                  <option value="未见异常肿大淋巴结">未见异常</option>
                  <option value="可见异常淋巴结">可见异常</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- TI-RADS Version -->
        <div class="flex items-center gap-2 mb-2 text-[11px]">
          <label class="text-muted-foreground">TI-RADS版本:</label>
          <select v-model="store.examFinding.tiradsVersion" class="field-input w-auto">
            <option value="">请选择</option>
            <option value="C-TIRADS">C-TIRADS</option>
            <option value="K-TIRADS">K-TIRADS</option>
            <option value="ACR-TIRADS">ACR-TIRADS</option>
          </select>
        </div>

        <!-- Description Textarea -->
        <div>
          <label class="text-[11px] text-muted-foreground">超声描述</label>
          <textarea
            v-model="store.examFinding.description"
            rows="6"
            class="w-full mt-1 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="点击AI生成按钮自动生成规范描述..."
          />
        </div>
      </div>

      <!-- Tab 3: Diagnosis -->
      <div v-show="activeTab === 'diagnosis'" class="p-3">
        <!-- AI Generate -->
        <div class="flex justify-end mb-2">
          <button
            @click="generateDiagnosis"
            class="flex items-center gap-1 px-2 py-1 text-[10px] text-primary bg-primary/10 rounded-full font-medium hover:bg-primary/20"
          >
            <BrainCircuit class="w-3 h-3" />
            AI生成提示
          </button>
        </div>

        <!-- Diagnosis Textarea -->
        <div class="mb-3">
          <label class="text-[11px] text-muted-foreground">超声提示</label>
          <textarea
            v-model="store.diagnosis"
            rows="3"
            class="w-full mt-1 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="点击AI生成按钮自动生成超声提示..."
          />
        </div>

        <!-- Recommendation -->
        <div class="mb-3">
          <label class="text-[11px] text-muted-foreground">建议</label>
          <input
            v-model="store.examFinding.recommendation"
            class="w-full mt-1 px-2.5 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="如：建议行FNA、定期复查等"
          />
        </div>

        <!-- Critical & Result -->
        <div class="flex items-center gap-3 mb-3 p-2 rounded-lg bg-secondary/50">
          <!-- Critical Toggle -->
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-3.5 h-3.5 text-destructive" />
            <span class="text-xs text-foreground">危急值</span>
            <button
              class="relative w-8 h-4 rounded-full transition-colors"
              :class="store.isCritical ? 'bg-destructive' : 'bg-muted'"
              @click="store.isCritical = !store.isCritical"
            >
              <span
                class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                :class="store.isCritical ? 'translate-x-4' : 'translate-x-0.5'"
              ></span>
            </button>
          </div>
          <span class="text-border">|</span>
          <!-- Result Buttons -->
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-muted-foreground">结果:</span>
            <button
              class="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              :class="store.examResult === '阳性' ? 'bg-amber-500 text-white' : 'bg-background text-muted-foreground hover:bg-secondary'"
              @click="store.examResult = '阳性'"
            >
              阳性
            </button>
            <button
              class="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              :class="store.examResult === '阴性' ? 'bg-emerald-500 text-white' : 'bg-background text-muted-foreground hover:bg-secondary'"
              @click="store.examResult = '阴性'"
            >
              阴性
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <RouterLink
            to="/report"
            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FileText class="w-3.5 h-3.5" />
            生成报告
          </RouterLink>
          <button
            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-medical-success text-white hover:opacity-90"
          >
            <Save class="w-3.5 h-3.5" />
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, markRaw } from 'vue'
import { RouterLink } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import type { AIDetection } from '@/app/types'
import {
  BrainCircuit,
  FileSearch,
  Stethoscope,
  AlertTriangle,
  Save,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  FileText,
} from 'lucide-vue-next'

const store = useWorkstationStore()

// Tabs
const tabs = computed(() => [
  { id: 'detection', label: 'AI检测', icon: markRaw(BrainCircuit), badge: store.aiDetections.length || null },
  { id: 'findings', label: '检查所见', icon: markRaw(FileSearch), badge: null },
  { id: 'diagnosis', label: '诊断', icon: markRaw(Stethoscope), badge: null },
])
const activeTab = ref('detection')

// Expanded states
const expandedIds = ref<Set<string>>(new Set(['1']))
const showThyroidBasic = ref(false)

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

// Group detections by organ
const groupedDetections = computed(() => {
  const groups: Record<string, AIDetection[]> = {}
  for (const det of store.aiDetections) {
    if (!groups[det.organ]) groups[det.organ] = []
    groups[det.organ].push(det)
  }
  return groups
})

// Get highest TI-RADS grade
const highestGrade = computed(() => {
  const grades = store.aiDetections.filter(d => d.grade).map(d => d.grade!)
  if (grades.length === 0) return ''
  const order = ['1', '2', '3', '4a', '4b', '4c', '5']
  let highest = grades[0]
  for (const g of grades) {
    if (order.indexOf(g) > order.indexOf(highest)) highest = g
  }
  return highest
})

function getTiradsLabel(grade: string) {
  const labels: Record<string, string> = {
    '1': '1级', '2': '2级', '3': '3级', '4a': '4a', '4b': '4b', '4c': '4c', '5': '5级',
  }
  return labels[grade] || grade
}

function getGradeClass(grade: string) {
  if (!grade) return 'bg-secondary text-secondary-foreground'
  if (grade === '1' || grade === '2') return 'bg-emerald-100 text-emerald-700'
  if (grade === '3') return 'bg-blue-100 text-blue-700'
  if (grade === '4a') return 'bg-amber-100 text-amber-700'
  if (grade === '4b' || grade === '4c') return 'bg-orange-100 text-orange-700'
  if (grade === '5') return 'bg-red-100 text-red-700'
  return 'bg-secondary text-secondary-foreground'
}

function addDetection(organ: string) {
  const newId = `det-${Date.now()}`
  store.aiDetections.push({
    id: newId, organ, location: '', size: '', confidence: 0, type: '实性结节',
    grade: '', shape: '', aspectRatio: '', margin: '', echoPattern: '',
    posteriorFeature: '', calcification: '', bloodFlow: '', bloodRichness: '',
    capsuleInvasion: false, lymphNode: '',
  })
  expandedIds.value.add(newId)
}

function addNewOrganDetection() {
  const organName = prompt('请输入检查部位名称:', '甲状腺')
  if (organName?.trim()) addDetection(organName.trim())
}

function removeDetection(id: string) {
  const index = store.aiDetections.findIndex(d => d.id === id)
  if (index !== -1) {
    store.aiDetections.splice(index, 1)
    expandedIds.value.delete(id)
  }
}

function generateDescription() {
  const thyroid = store.examFinding.thyroid
  const detections = store.aiDetections.filter(d => d.organ === '甲状腺')
  if (!thyroid) return

  let desc = `甲状腺切面形态大小未见异常，`
  if (thyroid.capsuleIntegrity) desc += `表面${thyroid.capsuleIntegrity}，`
  if (thyroid.internalEcho) desc += `内部回声${thyroid.internalEcho}。`

  if (detections.length > 0) {
    desc += '\n'
    for (const det of detections) {
      desc += `${det.location}可见一`
      if (det.echoPattern) desc += `${det.echoPattern}`
      desc += `结节，`
      if (det.size) desc += `大小约${det.size}mm，`
      if (det.shape) desc += `形态${det.shape}，`
      if (det.margin) desc += `边缘${det.margin}，`
      if (det.calcification && det.calcification !== '无') desc += `内见${det.calcification}，`
      if (det.bloodFlow) desc += `CDFI示${det.bloodFlow === '无血供' ? '无明显血流' : det.bloodFlow}`
      desc += '。'
      if (det.grade) desc += `${store.examFinding.tiradsVersion || 'TI-RADS'} ${det.grade}类。`
      desc += '\n'
    }
  } else {
    desc += '其内未见异常回声。'
  }

  desc += `\n甲状旁腺区${thyroid.parathyroidStatus || '未见异常回声'}。`
  desc += `\n颈部${thyroid.lymphNodeStatus || '未见异常肿大淋巴结'}。`

  store.examFinding.description = desc.trim()
}

function generateDiagnosis() {
  const detections = store.aiDetections.filter(d => d.organ === '甲状腺')
  const thyroid = store.examFinding.thyroid
  
  if (detections.length === 0) {
    store.diagnosis = '甲状腺及甲状旁腺区未见明显异常。'
    store.examFinding.recommendation = '建议定期体检。'
    return
  }

  let diagnosis = ''
  const version = store.examFinding.tiradsVersion || 'TI-RADS'
  
  const gradeGroups: Record<string, AIDetection[]> = {}
  for (const det of detections) {
    const grade = det.grade || '未分级'
    if (!gradeGroups[grade]) gradeGroups[grade] = []
    gradeGroups[grade].push(det)
  }

  for (const [grade, dets] of Object.entries(gradeGroups)) {
    const locations = dets.map(d => d.location).join('、')
    if (grade === '1' || grade === '2') {
      diagnosis += `甲状腺${locations}结节，考虑良性（${version} ${grade}类）。`
    } else if (grade === '3') {
      diagnosis += `甲状腺${locations}结节，可能良性（${version} ${grade}类），建议6-12个月复查。`
    } else if (grade === '4a') {
      diagnosis += `甲状腺${locations}结节（${version} ${grade}类），低度可疑，建议FNA或密切随访。`
    } else if (grade === '4b' || grade === '4c') {
      diagnosis += `甲状腺${locations}结节（${version} ${grade}类），中-高度可疑，建议FNA。`
    } else if (grade === '5') {
      diagnosis += `甲状腺${locations}结节（${version} ${grade}类），高度提示恶性，建议FNA后手术。`
    } else {
      diagnosis += `甲状腺${locations}结节。`
    }
    diagnosis += '\n'
  }

  if (thyroid?.lymphNodeStatus === '可见异常淋巴结') {
    diagnosis += '颈部淋巴结异常，需进一步评估。\n'
  }

  store.diagnosis = diagnosis.trim()

  if (highestGrade.value === '5' || highestGrade.value === '4c') {
    store.examFinding.recommendation = '建议行FNA细针穿刺活检明确诊断。'
  } else if (highestGrade.value === '4b' || highestGrade.value === '4a') {
    store.examFinding.recommendation = '建议FNA或3-6个月后复查超声。'
  } else if (highestGrade.value === '3') {
    store.examFinding.recommendation = '建议6-12个月后复查超声。'
  } else {
    store.examFinding.recommendation = '建议每年常规体检复查。'
  }
}
</script>

<style scoped>
@reference "@/app/globals.css";

.field-input {
  @apply w-full px-1.5 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring;
  margin-top: 0.125rem;
  font-size: 11px;
}
</style>
