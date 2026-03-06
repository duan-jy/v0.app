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

    <!-- 2. AI Detection Results -->
    <section class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border">
        <BrainCircuit class="w-4 h-4 text-primary" />
        <h3 class="text-sm font-bold text-foreground">AI自动检测结果</h3>
        <span class="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {{ store.aiDetections.length }}个发现
        </span>
      </div>
      <div class="divide-y divide-border">
        <div
          v-for="det in store.aiDetections"
          :key="det.id"
          class="px-4 py-3"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-semibold text-foreground">{{ det.type }}</span>
            <span
              class="text-xs font-mono px-2 py-0.5 rounded-full"
              :class="det.confidence >= 0.9 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ (det.confidence * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span class="text-muted-foreground">器官: </span>
              <span class="text-foreground">{{ det.organ }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">位置: </span>
              <span class="text-foreground">{{ det.location }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-muted-foreground">大小: </span>
              <span class="text-foreground font-mono">{{ det.size }}</span>
            </div>
          </div>
        </div>
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
import { RouterLink } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import {
  History,
  FolderOpen,
  BrainCircuit,
  FileSearch,
  Stethoscope,
  AlertTriangle,
  Save,
} from 'lucide-vue-next'

const store = useWorkstationStore()
</script>
