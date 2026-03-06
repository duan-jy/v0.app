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

    <!-- 2. AI Detection Results - Grouped by Organ with detailed thyroid fields -->
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

          <!-- Detection Cards (for thyroid with detailed fields) -->
          <div class="space-y-2">
            <div
              v-for="(det, idx) in items"
              :key="det.id"
              class="border border-border rounded-lg overflow-hidden"
            >
              <!-- Card Header -->
              <div 
                class="flex items-center justify-between px-3 py-2 bg-secondary/30 cursor-pointer"
                @click="toggleExpand(det.id)"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-foreground">病灶 {{ idx + 1 }}</span>
                  <span class="text-xs text-muted-foreground">{{ det.location }}</span>
                  <span
                    v-if="det.grade"
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    :class="getGradeClass(det.grade)"
                  >
                    {{ getTiradsLabel(det.grade) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                    :class="getConfidenceClass(det.confidence)"
                  >
                    {{ (det.confidence * 100).toFixed(0) }}%
                  </span>
                  <ChevronDown 
                    class="w-4 h-4 text-muted-foreground transition-transform"
                    :class="{ 'rotate-180': expandedIds.has(det.id) }"
                  />
                </div>
              </div>

              <!-- Expanded Detail (Thyroid-specific) -->
              <div v-if="expandedIds.has(det.id)" class="px-3 py-2 border-t border-border bg-background">
                <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <!-- Basic Info -->
                  <div>
                    <label class="text-muted-foreground">位置</label>
                    <input
                      v-model="det.location"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="如：右叶中部"
                    />
                  </div>
                  <div>
                    <label class="text-muted-foreground">大小</label>
                    <input
                      v-model="det.size"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="如：8.2mm x 5.1mm x 4.8mm"
                    />
                  </div>

                  <!-- Shape & Aspect Ratio -->
                  <div>
                    <label class="text-muted-foreground">形态</label>
                    <select
                      v-model="det.shape"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="规则">规则</option>
                      <option value="不规则">不规则</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-muted-foreground">纵横比</label>
                    <select
                      v-model="det.aspectRatio"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="小于1">小于1</option>
                      <option value="大于等于1">大于等于1</option>
                    </select>
                  </div>

                  <!-- Margin & Echo -->
                  <div>
                    <label class="text-muted-foreground">边缘</label>
                    <select
                      v-model="det.margin"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="完整">完整</option>
                      <option value="不完整">不完整</option>
                      <option value="模糊">模糊</option>
                      <option value="毛刺">毛刺</option>
                      <option value="成角">成角</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-muted-foreground">回声模式</label>
                    <select
                      v-model="det.echoPattern"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="无回声">无回声</option>
                      <option value="高回声">高回声</option>
                      <option value="囊实性混合回声">囊实性混合回声</option>
                      <option value="低回声">低回声</option>
                      <option value="等回声">等回声</option>
                      <option value="不均匀回声">不均匀回声</option>
                    </select>
                  </div>

                  <!-- Posterior Feature & Calcification -->
                  <div>
                    <label class="text-muted-foreground">后方回声特征</label>
                    <select
                      v-model="det.posteriorFeature"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="无改变">无改变</option>
                      <option value="衰减声影">衰减声影</option>
                      <option value="增强">增强</option>
                      <option value="混合性改变">混合性改变</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-muted-foreground">钙化类型</label>
                    <select
                      v-model="det.calcification"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="无">无</option>
                      <option value="微钙化">微钙化</option>
                      <option value="粗大钙化">粗大钙化</option>
                      <option value="蛋壳样钙化">蛋壳样钙化</option>
                    </select>
                  </div>

                  <!-- Blood Flow -->
                  <div>
                    <label class="text-muted-foreground">血流分布</label>
                    <select
                      v-model="det.bloodFlow"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="无血供">无血供</option>
                      <option value="内部血供">内部血供</option>
                      <option value="边缘血供">边缘血供</option>
                      <option value="内部和边缘血供">内部和边缘血供</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-muted-foreground">血流丰富程度</label>
                    <select
                      v-model="det.bloodRichness"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="不丰富">不丰富</option>
                      <option value="较丰富">较丰富</option>
                      <option value="丰富">丰富</option>
                    </select>
                  </div>

                  <!-- TI-RADS Grade -->
                  <div>
                    <label class="text-muted-foreground">TI-RADS分级</label>
                    <select
                      v-model="det.grade"
                      class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">请选择</option>
                      <option value="1">1级 - 正常</option>
                      <option value="2">2级 - 良性</option>
                      <option value="3">3级 - 可能良性</option>
                      <option value="4a">4a级 - 低度可疑</option>
                      <option value="4b">4b级 - 中度可疑</option>
                      <option value="4c">4c级 - 高度可疑</option>
                      <option value="5">5级 - 高度提示恶性</option>
                    </select>
                  </div>

                  <!-- Capsule Invasion -->
                  <div class="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      :id="`capsule-${det.id}`"
                      v-model="det.capsuleInvasion"
                      class="w-4 h-4 rounded border-input"
                    />
                    <label :for="`capsule-${det.id}`" class="text-muted-foreground">侵犯被膜</label>
                  </div>
                </div>

                <!-- Lymph Node (for suspicious malignancy) -->
                <div v-if="isSuspiciousMalignancy(det)" class="mt-2 pt-2 border-t border-border">
                  <label class="text-xs text-muted-foreground">颈部淋巴结描述</label>
                  <input
                    v-model="det.lymphNode"
                    class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="若可疑恶性，请描述颈部淋巴结情况"
                  />
                </div>

                <!-- Delete Button -->
                <div class="flex justify-end mt-2 pt-2 border-t border-border">
                  <button
                    @click="removeDetection(det.id)"
                    class="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 class="w-3 h-3" />
                    删除病灶
                  </button>
                </div>
              </div>
            </div>
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

    <!-- 3. Exam Findings - Thyroid specific -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <FileSearch class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">检查所见</h3>
        <button
          @click="generateDescription"
          class="ml-auto flex items-center gap-1 px-2 py-1 text-[10px] text-primary bg-primary/10 rounded-full font-medium hover:bg-primary/20 transition-colors"
        >
          <BrainCircuit class="w-3 h-3" />
          AI生成
        </button>
      </div>
      <div class="px-4 py-3">
        <!-- Thyroid Gland Basic Info -->
        <div v-if="store.examFinding.thyroid" class="mb-3">
          <h4 class="text-xs font-semibold text-foreground mb-2">甲状腺基本情况</h4>
          <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <label class="text-muted-foreground">左叶大小</label>
              <input
                v-model="store.examFinding.thyroid.leftLobeSize"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="长x宽x厚 mm"
              />
            </div>
            <div>
              <label class="text-muted-foreground">右叶大小</label>
              <input
                v-model="store.examFinding.thyroid.rightLobeSize"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="长x宽x厚 mm"
              />
            </div>
            <div>
              <label class="text-muted-foreground">峡部厚度</label>
              <input
                v-model="store.examFinding.thyroid.isthmusThickness"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="mm"
              />
            </div>
            <div>
              <label class="text-muted-foreground">被膜</label>
              <select
                v-model="store.examFinding.thyroid.capsuleIntegrity"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">请选择</option>
                <option value="光整">光整</option>
                <option value="不光整">不光整</option>
              </select>
            </div>
            <div>
              <label class="text-muted-foreground">内部回声</label>
              <select
                v-model="store.examFinding.thyroid.internalEcho"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">请选择</option>
                <option value="均匀">均匀</option>
                <option value="不均匀">不均匀</option>
              </select>
            </div>
            <div>
              <label class="text-muted-foreground">血流情况</label>
              <select
                v-model="store.examFinding.thyroid.bloodFlowPattern"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">请选择</option>
                <option value="正常">正常</option>
                <option value="增多">增多</option>
                <option value="减少">减少</option>
              </select>
            </div>
            <div>
              <label class="text-muted-foreground">甲状旁腺</label>
              <select
                v-model="store.examFinding.thyroid.parathyroidStatus"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">请选择</option>
                <option value="未见异常">未见异常</option>
                <option value="可见异常回声">可见异常回声</option>
              </select>
            </div>
            <div>
              <label class="text-muted-foreground">颈部淋巴结</label>
              <select
                v-model="store.examFinding.thyroid.lymphNodeStatus"
                class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">请选择</option>
                <option value="未见异常肿大淋巴结">未见异常肿大淋巴结</option>
                <option value="可见异常淋巴结">可见异常淋巴结</option>
              </select>
            </div>
          </div>
          <!-- Lymph node detail if abnormal -->
          <div v-if="store.examFinding.thyroid.lymphNodeStatus === '可见异常淋巴结'" class="mt-2">
            <label class="text-xs text-muted-foreground">淋巴结详情</label>
            <input
              v-model="store.examFinding.thyroid.lymphNodeDetail"
              class="w-full mt-0.5 px-2 py-1 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="描述异常淋巴结位置、大小、特征等"
            />
          </div>
        </div>

        <!-- TI-RADS Classification -->
        <div class="mb-3 p-2 rounded-lg bg-secondary/30">
          <div class="flex items-center gap-3 text-xs">
            <div class="flex items-center gap-2">
              <label class="text-muted-foreground">TI-RADS版本:</label>
              <select
                v-model="store.examFinding.tiradsVersion"
                class="px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">请选择</option>
                <option value="C-TIRADS">C-TIRADS</option>
                <option value="K-TIRADS">K-TIRADS</option>
                <option value="ACR-TIRADS">ACR-TIRADS</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-muted-foreground">最高分级:</label>
              <span class="px-2 py-0.5 rounded font-medium" :class="getGradeClass(highestGrade)">
                {{ highestGrade ? getTiradsLabel(highestGrade) : '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Generated Description -->
        <div>
          <label class="text-xs text-muted-foreground">超声描述</label>
          <textarea
            v-model="store.examFinding.description"
            rows="4"
            class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="点击AI生成按钮自动生成规范描述..."
          />
        </div>
      </div>
    </section>

    <!-- 4. Diagnosis -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <Stethoscope class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">超声提示</h3>
        <button
          @click="generateDiagnosis"
          class="ml-auto flex items-center gap-1 px-2 py-1 text-[10px] text-primary bg-primary/10 rounded-full font-medium hover:bg-primary/20 transition-colors"
        >
          <BrainCircuit class="w-3 h-3" />
          AI生成
        </button>
      </div>
      <div class="px-4 py-3">
        <textarea
          v-model="store.diagnosis"
          rows="2"
          class="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="点击AI生成按钮自动生成超声提示..."
        />

        <!-- Recommendation -->
        <div class="mt-2">
          <label class="text-xs text-muted-foreground">建议</label>
          <input
            v-model="store.examFinding.recommendation"
            class="w-full mt-0.5 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="如：建议行FNA细针穿刺活检、定期复查等"
          />
        </div>

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
import { computed, ref } from 'vue'
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
  Search,
  ChevronDown,
  Trash2,
} from 'lucide-vue-next'

const store = useWorkstationStore()

// Expanded card IDs
const expandedIds = ref<Set<string>>(new Set(['1'])) // First one expanded by default

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
    if (!groups[det.organ]) {
      groups[det.organ] = []
    }
    groups[det.organ].push(det)
  }
  return groups
})

// Get highest TI-RADS grade
const highestGrade = computed(() => {
  const grades = store.aiDetections
    .filter(d => d.grade)
    .map(d => d.grade!)
  if (grades.length === 0) return ''
  
  const order = ['1', '2', '3', '4a', '4b', '4c', '5']
  let highest = grades[0]
  for (const g of grades) {
    if (order.indexOf(g) > order.indexOf(highest)) {
      highest = g
    }
  }
  return highest
})

// Get TI-RADS label
function getTiradsLabel(grade: string) {
  const labels: Record<string, string> = {
    '1': 'TI-RADS 1级',
    '2': 'TI-RADS 2级',
    '3': 'TI-RADS 3级',
    '4a': 'TI-RADS 4a',
    '4b': 'TI-RADS 4b',
    '4c': 'TI-RADS 4c',
    '5': 'TI-RADS 5级',
  }
  return labels[grade] || grade
}

// Get confidence badge class
function getConfidenceClass(confidence: number) {
  if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-700'
  if (confidence >= 0.75) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

// Get grade badge class
function getGradeClass(grade: string) {
  if (!grade) return 'bg-secondary text-secondary-foreground'
  if (grade === '1' || grade === '2') return 'bg-emerald-100 text-emerald-700'
  if (grade === '3') return 'bg-blue-100 text-blue-700'
  if (grade === '4a') return 'bg-amber-100 text-amber-700'
  if (grade === '4b' || grade === '4c') return 'bg-orange-100 text-orange-700'
  if (grade === '5') return 'bg-red-100 text-red-700'
  return 'bg-secondary text-secondary-foreground'
}

// Check if detection is suspicious for malignancy
function isSuspiciousMalignancy(det: AIDetection) {
  return det.grade === '4b' || det.grade === '4c' || det.grade === '5'
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
    type: '实性结节',
    grade: '',
    shape: '',
    aspectRatio: '',
    margin: '',
    echoPattern: '',
    posteriorFeature: '',
    calcification: '',
    bloodFlow: '',
    bloodRichness: '',
    capsuleInvasion: false,
    lymphNode: '',
  })
  expandedIds.value.add(newId)
}

// Add detection for new organ
function addNewOrganDetection() {
  const organName = prompt('请输入检查部位名称:', '甲状腺')
  if (organName && organName.trim()) {
    addDetection(organName.trim())
  }
}

// Remove detection
function removeDetection(id: string) {
  const index = store.aiDetections.findIndex(d => d.id === id)
  if (index !== -1) {
    store.aiDetections.splice(index, 1)
    expandedIds.value.delete(id)
  }
}

// Generate description based on thyroid findings (following standard format)
function generateDescription() {
  const thyroid = store.examFinding.thyroid
  const detections = store.aiDetections.filter(d => d.organ === '甲状腺')
  
  if (!thyroid) return

  let desc = ''
  
  // Basic gland description
  desc += `甲状腺切面形态大小未见异常，`
  if (thyroid.capsuleIntegrity) {
    desc += `表面${thyroid.capsuleIntegrity}，`
  }
  if (thyroid.internalEcho) {
    desc += `内部回声${thyroid.internalEcho}。`
  }

  // Nodule descriptions
  if (detections.length > 0) {
    desc += '\n\n'
    for (const det of detections) {
      desc += `${det.location}可见一`
      if (det.echoPattern) desc += `${det.echoPattern}`
      desc += `结节，`
      if (det.size) desc += `大小约${det.size}，`
      if (det.shape) desc += `形态${det.shape}，`
      if (det.margin) desc += `边缘${det.margin}，`
      if (det.aspectRatio) desc += `纵横比${det.aspectRatio}，`
      if (det.posteriorFeature && det.posteriorFeature !== '无改变') desc += `后方${det.posteriorFeature}，`
      if (det.calcification && det.calcification !== '无') desc += `内见${det.calcification}，`
      if (det.bloodFlow) {
        desc += `CDFI示${det.bloodFlow === '无血供' ? '结节内未见明显血流信号' : `结节内${det.bloodFlow}`}`
        if (det.bloodRichness && det.bloodFlow !== '无血供') desc += `，血流${det.bloodRichness}`
      }
      desc += '。'
      if (det.grade) {
        desc += `${store.examFinding.tiradsVersion || 'TI-RADS'} ${det.grade}类。`
      }
      desc += '\n'
    }
  } else {
    desc += '其内未见异常回声。'
  }

  // Parathyroid and lymph nodes
  desc += `\n甲状旁腺区${thyroid.parathyroidStatus || '未见异常回声'}。`
  desc += `\n颈部${thyroid.lymphNodeStatus || '未见异常肿大淋巴结'}。`
  if (thyroid.lymphNodeStatus === '可见异常淋巴结' && thyroid.lymphNodeDetail) {
    desc += thyroid.lymphNodeDetail
  }

  store.examFinding.description = desc.trim()
}

// Generate diagnosis
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
  
  // Group by grade
  const gradeGroups: Record<string, AIDetection[]> = {}
  for (const det of detections) {
    const grade = det.grade || '未分级'
    if (!gradeGroups[grade]) gradeGroups[grade] = []
    gradeGroups[grade].push(det)
  }

  // Generate diagnosis text
  for (const [grade, dets] of Object.entries(gradeGroups)) {
    const locations = dets.map(d => d.location).join('、')
    if (grade === '1' || grade === '2') {
      diagnosis += `甲状腺${locations}结节，考虑良性（${version} ${grade}类）。`
    } else if (grade === '3') {
      diagnosis += `甲状腺${locations}结节，可能良性（${version} ${grade}类），建议6-12个月复查。`
    } else if (grade === '4a') {
      diagnosis += `甲状腺${locations}结节（${version} ${grade}类），低度可疑恶性，建议FNA或密切随访。`
    } else if (grade === '4b' || grade === '4c') {
      diagnosis += `甲状腺${locations}结节（${version} ${grade}类），中-高度可疑恶性，强烈建议FNA细针穿刺活检。`
    } else if (grade === '5') {
      diagnosis += `甲状腺${locations}结节（${version} ${grade}类），高度提示恶性，建议FNA明确诊断后手术治疗。`
    } else {
      diagnosis += `甲状腺${locations}结节。`
    }
    diagnosis += '\n'
  }

  // Lymph node
  if (thyroid?.lymphNodeStatus === '可见异常淋巴结') {
    diagnosis += '颈部淋巴结异常，需结合临床进一步评估。\n'
  }

  store.diagnosis = diagnosis.trim()

  // Set recommendation based on highest grade
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
