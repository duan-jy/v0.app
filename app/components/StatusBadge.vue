<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    :class="statusClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: '已登记' | '检查中' | '已完成'
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case '已登记': return 'bg-blue-50 text-blue-700'
    case '检查中': return 'bg-amber-50 text-amber-700'
    case '已完成': return 'bg-emerald-50 text-emerald-700'
    default: return 'bg-secondary text-secondary-foreground'
  }
})

const dotClass = computed(() => {
  switch (props.status) {
    case '已登记': return 'bg-blue-500'
    case '检查中': return 'bg-amber-500 animate-pulse'
    case '已完成': return 'bg-emerald-500'
    default: return 'bg-muted-foreground'
  }
})
</script>
