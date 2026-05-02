<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">慧牧云眸登录</div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0px"
        status-icon
        @submit.prevent="submitLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="success"
            native-type="submit"
            :loading="loginLoading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>

        <el-alert
          v-if="loginError"
          :title="loginError"
          type="error"
          show-icon
          closable
          @close="loginError = ''"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "../api/auth";

const emit = defineEmits(["login-success"]);
const router = useRouter();

const loginFormRef = ref(null);
const loginLoading = ref(false);
const loginError = ref("");
const loginForm = ref({
  username: "admin",
  password: "123456",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const normalizeToken = (data) => {
  if (typeof data === "string") {
    const matchedSessionId = data.match(/sessionId:\s*([A-Za-z0-9]+)/i);
    return matchedSessionId?.[1] || "";
  }

  return (
    data?.token ||
    data?.access_token ||
    data?.jwt ||
    data?.data?.token ||
    data?.data?.access_token ||
    data?.result?.token ||
    data?.result?.access_token ||
    ""
  );
};

const normalizeUser = (data, username) => {
  if (typeof data === "string") {
    return username;
  }

  return (
    data?.user?.username ||
    data?.user?.name ||
    data?.data?.user?.username ||
    data?.data?.user?.name ||
    data?.result?.user?.username ||
    data?.result?.user?.name ||
    username
  );
};

const handleLoginSuccess = async (user, token) => {
  localStorage.setItem("authToken", token);
  emit("login-success", user);
  await router.push("/dashboard");
};

const submitLogin = async () => {
  if (!loginFormRef.value || loginLoading.value) return;
  loginError.value = "";

  try {
    await loginFormRef.value.validate();
  } catch {
    loginError.value = "请输入用户名和密码";
    return;
  }

  loginLoading.value = true;

  try {
    const data = await login({
      username: loginForm.value.username,
      password: loginForm.value.password,
    });

    const token = normalizeToken(data);
    const user = normalizeUser(data, loginForm.value.username);

    if (!token) {
      localStorage.removeItem("authToken");
      throw new Error("账号或密码错误，后端未返回有效登录凭证");
    }

    await handleLoginSuccess(user, token);
  } catch (error) {
    // 增强错误处理，避免显示 [object Object]
    const errorMsg = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : JSON.stringify(error, null, 2);
    
    // 检测网络错误
    if (errorMsg.includes('Network Error') || errorMsg.includes('ERR_CONNECTION')) {
      loginError.value = "无法连接到后端服务，请检查网络或联系管理员";
    } else if (errorMsg.includes('404')) {
      loginError.value = "登录接口未找到，请检查后端服务是否正确部署";
    } else if (errorMsg.includes('CORS')) {
      loginError.value = "跨域请求被阻止，请配置正确的 CORS 策略";
    } else {
      loginError.value = errorMsg || "登录失败";
    }
  } finally {
    loginLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.login-card {
  width: 360px;
  border-radius: 14px;
  box-shadow: 0 16px 60px rgba(46, 125, 50, 0.18);
}

.login-header {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 18px;
}
</style>
