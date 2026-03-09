import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../pages/DashboardPage.vue';
import MonitorPage from '../pages/MonitorPage.vue';
import DataPage from '../pages/DataPage.vue';
import WarningPage from '../pages/WarningPage.vue';
import KnowledgePage from '../pages/KnowledgePage.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: MonitorPage
  },
  {
    path: '/data',
    name: 'Data',
    component: DataPage
  },
  {
    path: '/warning',
    name: 'Warning',
    component: WarningPage
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: KnowledgePage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
