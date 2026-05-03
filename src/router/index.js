import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../components/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/monitor",
    name: "Monitor",
    component: () => import("../components/Monitor.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-sentinel",
    name: "AISentinel",
    component: () => import("../components/AISentinel.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/warning",
    name: "Warning",
    component: () => import("../components/Warning.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/knowledge",
    name: "Knowledge",
    component: () => import("../components/Knowledge.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ranch",
    name: "RanchManagement",
    component: () => import("../components/RanchManagement.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../components/Profile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-panel",
    name: "AffordableAI",
    component: () => import("../components/affordableAIPanel.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/performance",
    name: "Performance",
    component: () => import("../components/PerformanceDashboard.vue"),
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
