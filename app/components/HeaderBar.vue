<template>
  <header class="flex items-center justify-between h-14 px-5 bg-header-bg text-header-foreground shrink-0">
    <!-- Left: Logo & Title -->
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h1 class="text-base font-bold tracking-wide">超声智能体 AI 工作站 3.0</h1>
      </div>
    </div>

    <!-- Center: Patient Info -->
    <div v-if="store.currentPatient" class="flex items-center gap-6 text-sm">
      <div class="flex items-center gap-1.5">
        <span class="text-header-foreground/60">姓名</span>
        <span class="font-medium">{{ store.currentPatient.name }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-header-foreground/60">年龄</span>
        <span class="font-medium">{{ store.currentPatient.age }}岁</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-header-foreground/60">性别</span>
        <span class="font-medium">{{ store.currentPatient.gender }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-header-foreground/60">检查部位</span>
        <span class="font-medium">{{ store.currentPatient.examPart }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-header-foreground/60">检查号</span>
        <span class="font-mono text-xs">{{ store.currentPatient.examId }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-header-foreground/60">时间</span>
        <span class="font-mono text-xs">{{ store.currentPatient.examTime }}</span>
      </div>
    </div>

    <!-- Right: Nav Buttons -->
    <nav class="flex items-center gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="isActive(item.path) ? 'bg-primary text-primary-foreground' : 'text-header-foreground/80 hover:bg-white/10'"
      >
        <component :is="item.icon" class="w-4 h-4" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import { BrainCircuit, PenTool, FileText, ShieldCheck, Settings } from 'lucide-vue-next'
import { computed, h, type FunctionalComponent } from 'vue'

const store = useWorkstationStore()
const route = useRoute()

interface NavItem {
  label: string
  path: string
  icon: FunctionalComponent
}

const navItems: NavItem[] = [
  { label: 'AI分析', path: '/', icon: BrainCircuit as unknown as FunctionalComponent },
  { label: '图像标注', path: '/', icon: PenTool as unknown as FunctionalComponent },
  { label: '报告编辑', path: '/report', icon: FileText as unknown as FunctionalComponent },
  { label: '质控中心', path: '/quality-control', icon: ShieldCheck as unknown as FunctionalComponent },
  { label: '系统配置', path: '/settings', icon: Settings as unknown as FunctionalComponent },
]

function isActive(path: string): boolean {
  return route.path === path
}
</script>
