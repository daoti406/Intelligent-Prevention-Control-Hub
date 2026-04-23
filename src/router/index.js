import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import Monitor from "../components/Monitor.vue";
import AISentinel from "../components/AISentinel.vue";
import Warning from "../components/Warning.vue";
import Knowledge from "../components/Knowledge.vue";
import RanchManagement from "../components/RanchManagement.vue";
import Profile from "../components/Profile.vue";
import affordableAIPanel from "../components/affordableAIPanel.vue";
import PerformanceDashboard from "../components/PerformanceDashboard.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/monitor",
    name: "Monitor",
    component: Monitor,
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-sentinel",
    name: "AISentinel",
    component: AISentinel,
    meta: { requiresAuth: true },
  },
  {
    path: "/warning",
    name: "Warning",
    component: Warning,
    meta: { requiresAuth: true },
  },
  {
    path: "/knowledge",
    name: "Knowledge",
    component: Knowledge,
    meta: { requiresAuth: true },
  },
  {
    path: "/ranch",
    name: "RanchManagement",
    component: RanchManagement,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-panel",
    name: "AffordableAI",
    component: affordableAIPanel,
    meta: { requiresAuth: true },
  },
  {
    path: "/performance",
    name: "Performance",
    component: PerformanceDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");

  if (to.path === "/login") {
    if (token) {
      next("/dashboard");
    } else {
      next();
    }
    return;
  }

  if (to.meta.requiresAuth && !token) {
    next("/login");
    return;
  }

  next();
});

export default router;
