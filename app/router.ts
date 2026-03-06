import { createRouter, createWebHistory } from 'vue-router'
import Workstation from './pages/Workstation.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Workstation',
      component: Workstation,
    },
    {
      path: '/report',
      name: 'ReportEditor',
      component: () => import('./pages/ReportEditorPage.vue'),
    },
    {
      path: '/quality-control',
      name: 'QualityControl',
      component: () => import('./pages/QualityControlPage.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./pages/SettingsPage.vue'),
    },
  ],
})
