<template>
  <div class="flex flex-col h-full bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 class="text-sm font-bold text-foreground">今日患者</h2>
      <span class="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
        {{ store.todayStats.total }}人
      </span>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-1 px-3 py-2 border-b border-border">
      <span class="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        待检 {{ store.todayStats.registered }}
      </span>
      <span class="flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        检查中 {{ store.todayStats.inProgress }}
      </span>
      <span class="flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        完成 {{ store.todayStats.completed }}
      </span>
    </div>

    <!-- Patient List -->
    <div class="flex-1 overflow-y-auto">
      <button
        v-for="patient in store.patients"
        :key="patient.id"
        class="w-full flex items-start gap-3 px-4 py-3 border-b border-border/50 text-left transition-colors hover:bg-secondary/50"
        :class="{ 'bg-primary/5 border-l-2 border-l-primary': store.currentPatient?.id === patient.id }"
        @click="store.selectPatient(patient)"
      >
        <!-- Avatar -->
        <div
          class="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0"
          :class="patient.gender === '男' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'"
        >
          {{ patient.name.charAt(0) }}
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-foreground">{{ patient.name }}</span>
            <StatusBadge :status="patient.status" />
          </div>
          <div class="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>{{ patient.gender }} / {{ patient.age }}岁</span>
            <span class="text-border">|</span>
            <span>{{ patient.examPart }}</span>
          </div>
          <div class="text-xs text-muted-foreground/70 mt-0.5 font-mono">
            {{ patient.examId }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkstationStore } from '@/app/stores/workstation'
import StatusBadge from './StatusBadge.vue'

const store = useWorkstationStore()
</script>
