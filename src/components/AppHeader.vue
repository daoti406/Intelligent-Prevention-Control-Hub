<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-section">
        <img
          src="/src/assets/images/logo.jpg"
          alt="logo"
          style="height: 50px"
        />
        <h1 class="app-title">智栏哨兵</h1>
        <span class="app-subtitle">畜禽健康智能防控中枢系统</span>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="currentRoute.name?.toLowerCase() || 'dashboard'"
        background-color="transparent"
        text-color="#333"
        active-text-color="#52c41a"
        @select="handleMenuSelect"
        class="nav-menu"
      >
        <el-menu-item index="dashboard">首页</el-menu-item>
        <el-menu-item index="monitor">实时监控</el-menu-item>
        <el-menu-item index="data">数据分析</el-menu-item>
        <el-menu-item index="warning">预警中心</el-menu-item>
        <el-menu-item index="knowledge">防疫知识</el-menu-item>
      </el-menu>
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <el-avatar
            :size="36"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span class="username">{{ username }}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="notifications">消息通知</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const currentRoute = useRoute();
const username = ref("用户");

const handleMenuSelect = (key) => {
  router.push(`/${key}`);
};

const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => ElMessage.success("退出成功"))
      .catch(() => {});
  } else if (command === "profile") {
    ElMessage.info("跳转到个人中心");
  } else if (command === "notifications") {
    ElMessage.info("跳转到消息通知");
  }
};
</script>

<style scoped>
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 300px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
}

.app-subtitle {
  font-size: 12px;
  color: #999;
}

.nav-menu {
  flex: 1;
  border: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 0 10px;
}

.username {
  color: #333;
  font-size: 14px;
}
</style>
