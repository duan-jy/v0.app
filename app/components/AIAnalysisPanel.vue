<template>
  <div class="flex flex-col h-full gap-3">
    <!-- Card 1: AI Detection Results -->
    <div class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden flex flex-col min-h-0 flex-1">
      <div class="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <BrainCircuit class="w-4 h-4 text-primary" />
          AI检测结果
        </h2>
        <span v-if="store.aiDetections.length > 0" class="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
          {{ store.aiDetections.length }}个
        </span>
      </div>

      <!-- Lesion Summary -->
      <div v-if="store.aiDetections.length > 0" class="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/30 shrink-0">
        <span class="text-xs text-muted-foreground">共 <span class="font-bold text-foreground">{{ store.aiDetections.length }}</span> 处病灶</span>
        <span class="text-border">|</span>
        <span class="text-xs text-muted-foreground">最高分级:</span>
        <span class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getGradeClass(highestGrade)">
          {{ highestGrade || '-' }}
        </span>
      </div>

      <!-- Detection List -->
      <div class="flex-1 overflow-y-auto px-3 py-2">
        <div class="space-y-1.5">
          <div
            v-for="(det, idx) in store.aiDetections"
            :key="det.id"
            class="border border-border rounded-lg bg-background overflow-hidden"
          >
            <!-- Header -->
            <div 
              class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-secondary/30"
              @click="toggleExpand(det.id)"
            >
              <div class="flex items-center gap-2 min-w-0 text-xs">
                <span class="text-muted-foreground font-mono">#{{ idx + 1 }}</span>
                <span class="text-foreground font-medium truncate">{{ det.location || '未定位' }}</span>
                <span class="text-muted-foreground truncate">{{ det.size }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="det.grade" class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getGradeClass(det.grade)">
                  {{ det.grade }}
                </span>
                <ChevronDown class="w-4 h-4 text-muted-foreground transition-transform" :class="{ 'rotate-180': expandedIds.has(det.id) }" />
              </div>
            </div>
            <!-- Expanded -->
            <div v-if="expandedIds.has(det.id)" class="px-3 py-2 border-t border-border bg-secondary/20">
              <div class="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label class="text-muted-foreground">位置</label>
                  <input v-model="det.location" class="field-input" />
                </div>
                <div>
                  <label class="text-muted-foreground">大小(mm)</label>
                  <input v-model="det.size" class="field-input font-mono" />
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
                    <option value="无回声">无</option>
                    <option value="低回声">低</option>
                    <option value="等回声">等</option>
                    <option value="高回声">高</option>
                  </select>
                </div>
                <div>
                  <label class="text-muted-foreground">钙化</label>
                  <select v-model="det.calcification" class="field-input">
                    <option value="">-</option>
                    <option value="无">无</option>
                    <option value="微钙化">微</option>
                    <option value="粗大钙化">粗</option>
                  </select>
                </div>
                <div>
                  <label class="text-muted-foreground">血流</label>
                  <select v-model="det.bloodFlow" class="field-input">
                    <option value="">-</option>
                    <option value="无血供">无</option>
                    <option value="内部血供">内</option>
                    <option value="边缘血供">边</option>
                  </select>
                </div>
                <div>
                  <label class="text-muted-foreground">TI-RADS</label>
                  <select v-model="det.grade" class="field-input">
                    <option value="">-</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4a">4a</option>
                    <option value="4b">4b</option>
                    <option value="4c">4c</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div class="flex items-end">
                  <button @click="removeDetection(det.id)" class="px-2 py-1 text-destructive hover:bg-destructive/10 rounded text-xs flex items-center gap-1">
                    <Trash2 class="w-3 h-3" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add -->
        <button
          @click="addDetection('甲状腺')"
          class="w-full mt-2 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/30"
        >
          + 添加病灶
        </button>
      </div>
    </div>

    <!-- Card 2: Exam Findings -->
    <div class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden shrink-0">
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <FileSearch class="w-4 h-4 text-primary" />
          检查所见
        </h2>
        <button
          @click="generateDescription"
          class="flex items-center gap-1 px-2 py-1 text-xs text-primary bg-primary/10 rounded-md font-medium hover:bg-primary/20"
        >
          <BrainCircuit class="w-3.5 h-3.5" />
          AI生成
        </button>
      </div>

      <div class="px-4 py-3">
        <!-- Thyroid Basic - Compact Row -->
        <div v-if="store.examFinding.thyroid" class="mb-3 p-2 bg-secondary/30 rounded-lg">
          <div class="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span class="text-muted-foreground">左叶:</span>
              <input v-model="store.examFinding.thyroid.leftLobeSize" class="field-input font-mono" placeholder="48x18x16" />
            </div>
            <div>
              <span class="text-muted-foreground">右叶:</span>
              <input v-model="store.examFinding.thyroid.rightLobeSize" class="field-input font-mono" placeholder="50x20x18" />
            </div>
            <div>
              <span class="text-muted-foreground">被膜:</span>
              <select v-model="store.examFinding.thyroid.capsuleIntegrity" class="field-input">
                <option value="">-</option>
                <option value="光整">光整</option>
                <option value="不光整">不光整</option>
              </select>
            </div>
            <div>
              <span class="text-muted-foreground">回声:</span>
              <select v-model="store.examFinding.thyroid.internalEcho" class="field-input">
                <option value="">-</option>
                <option value="均匀">均匀</option>
                <option value="不均匀">不均匀</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Description -->
        <textarea
          v-model="store.examFinding.description"
          rows="3"
          class="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="点击AI生成按钮自动生成检查所见..."
        />
      </div>
    </div>

    <!-- Card 3: Diagnosis -->
    <div class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden shrink-0">
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <Stethoscope class="w-4 h-4 text-primary" />
          超声提示
        </h2>
        <button
          @click="generateDiagnosis"
          class="flex items-center gap-1 px-2 py-1 text-xs text-primary bg-primary/10 rounded-md font-medium hover:bg-primary/20"
        >
          <BrainCircuit class="w-3.5 h-3.5" />
          AI生成
        </button>
      </div>

      <div class="px-4 py-3">
        <!-- Diagnosis Text -->
        <textarea
          v-model="store.diagnosis"
          rows="2"
          class="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring mb-3"
          placeholder="超声提示内容..."
        />

        <!-- Recommendation -->
        <input
          v-model="store.examFinding.recommendation"
          class="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring mb-3"
          placeholder="建议：如FNA、定期复查等"
        />

        <!-- Status Row -->
        <div class="flex items-center justify-between mb-3 py-2 px-3 bg-secondary/30 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-destructive" />
              <span class="text-xs text-foreground">危急值</span>
              <button
                class="relative w-9 h-5 rounded-full transition-colors"
                :class="store.isCritical ? 'bg-destructive' : 'bg-muted'"
                @click="store.isCritical = !store.isCritical"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  :class="store.isCritical ? 'translate-x-4' : 'translate-x-0.5'"
                ></span>
              </button>
            </div>
            <span class="text-border">|</span>
            <div class="flex items-center gap-1">
              <button
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                :class="store.examResult === '阳性' ? 'bg-amber-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'"
                @click="store.examResult = '阳性'"
              >阳性</button>
              <button
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                :class="store.examResult === '阴性' ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'"
                @click="store.examResult = '阴性'"
              >阴性</button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <RouterLink
            to="/report"
            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FileText class="w-4 h-4" />
            生成报告
          </RouterLink>
          <button class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-medical-success text-white hover:opacity-90">
            <Save class="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import {
  BrainCircuit,
  FileSearch,
  Stethoscope,
  AlertTriangle,
  Save,
  ChevronDown,
  Trash2,
  FileText,
} from 'lucide-vue-next'

const store = useWorkstationStore()
const expandedIds = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

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
    for (const det of detections) {
      desc += `\n${det.location}可见一`
      if (det.echoPattern) desc += `${det.echoPattern}`
      desc += `结节，`
      if (det.size) desc += `大小约${det.size}mm，`
      if (det.shape) desc += `形态${det.shape}，`
      if (det.margin) desc += `边缘${det.margin}，`
      if (det.calcification && det.calcification !== '无') desc += `内见${det.calcification}，`
      if (det.bloodFlow) desc += `CDFI示${det.bloodFlow === '无血供' ? '无明显血流' : det.bloodFlow}`
      desc += '。'
      if (det.grade) desc += `${store.examFinding.tiradsVersion || 'TI-RADS'} ${det.grade}类。`
    }
  } else {
    desc += '其内未见异常回声。'
  }

  desc += `\n甲状旁腺区${thyroid.parathyroidStatus || '未见异常回声'}。`
  store.examFinding.description = desc.trim()
}

function generateDiagnosis() {
  const detections = store.aiDetections.filter(d => d.organ === '甲状腺')
  
  if (detections.length === 0) {
    store.diagnosis = '甲状腺及甲状旁腺区未见明显异常。'
    store.examFinding.recommendation = '建议定期体检。'
    return
  }

  let diagnosis = ''
  const version = store.examFinding.tiradsVersion || 'TI-RADS'
  
  for (const det of detections) {
    const grade = det.grade || ''
    if (grade === '2') {
      diagnosis += `甲状腺${det.location}结节，考虑良性（${version} ${grade}类）。`
    } else if (grade === '3') {
      diagnosis += `甲状腺${det.location}结节（${version} ${grade}类），可能良性。`
    } else if (grade === '4a') {
      diagnosis += `甲状腺${det.location}结节（${version} ${grade}类），低度可疑。`
    } else if (grade === '4b' || grade === '4c') {
      diagnosis += `甲状腺${det.location}结节（${version} ${grade}类），中-高度可疑。`
    } else if (grade === '5') {
      diagnosis += `甲状腺${det.location}结节（${version} ${grade}类），高度提示恶性。`
    } else {
      diagnosis += `甲状腺${det.location}结节。`
    }
    diagnosis += '\n'
  }

  store.diagnosis = diagnosis.trim()

  if (highestGrade.value === '5' || highestGrade.value === '4c' || highestGrade.value === '4b') {
    store.examFinding.recommendation = '建议行FNA细针穿刺活检。'
  } else if (highestGrade.value === '4a') {
    store.examFinding.recommendation = '建议FNA或3-6个月后复查。'
  } else if (highestGrade.value === '3') {
    store.examFinding.recommendation = '建议6-12个月后复查。'
  } else {
    store.examFinding.recommendation = '建议每年体检复查。'
  }
}
</script>

<style scoped>
.field-input {
  width: 100%;
  margin-top: 0.125rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--input));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 11px;
}
.field-input:focus {
  outline: none;
  box-shadow: 0 0 0 1px hsl(var(--ring));
}
</style>
