<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-section">
        <img
          src="/src/assets/images/logo.jpg"
          alt="logo"
          style="height: 50px"
        />
        <h1 class="app-title">慧牧云眸</h1>
        <span class="app-subtitle">畜禽健康智能防控中枢系统</span>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeIndex"
        background-color="transparent"
        text-color="#333"
        active-text-color="#52c41a"
        @select="handleSelect"
        class="nav-menu"
        style="
          border-bottom: none;
          flex: 1;
          display: flex;
          justify-content: center;
          gap: 20px;
        "
      >
        <el-menu-item index="dashboard">首页</el-menu-item>
        <el-menu-item index="monitor">实时监控</el-menu-item>
        <el-menu-item index="ai-sentinel">智栏卫士</el-menu-item>
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
            <el-dropdown-item command="notifications"
              >消息通知</el-dropdown-item
            >
            <el-dropdown-item divided command="logout"
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { inject } from "vue";
const activeIndex = inject("activeIndex");
const handleSelect = inject("handleSelect");
const username = inject("username");
const handleCommand = inject("handleCommand");
</script>

<style scoped>
/* 原头部样式已放在全局，此处可空或保留特有样式 */
</style>
