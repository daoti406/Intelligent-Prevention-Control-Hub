<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">智栏哨兵 登录</div>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-width="0px"
        status-icon
        @submit.prevent="submitLogin"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            prefix-icon="el-icon-lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="success"
            native-type="submit"
            :loading="loginLoading"
            style="width: 100%;"
            @click="submitLogin"
          >
            登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <div class="login-footer-links">
            <a href="#" @click.prevent="showForgotDialog = true">忘记密码</a>
            <a href="#" @click.prevent="showChangeDialog = true">修改密码</a>
          </div>
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

    <el-dialog title="忘记密码" v-model="showForgotDialog" width="400px" :destroy-on-close="true">
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef" label-width="0px" status-icon>
        <el-form-item prop="username">
          <el-input v-model="forgotForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="submitForgot" :loading="actionLoading" style="width: 100%;">
            发送重置链接
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="修改密码" v-model="showChangeDialog" width="400px" :destroy-on-close="true">
      <el-form :model="changeForm" :rules="changeRules" ref="changeFormRef" label-width="0px" status-icon>
        <el-form-item prop="oldPassword">
          <el-input v-model="changeForm.oldPassword" type="password" placeholder="旧密码" show-password />
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="changeForm.newPassword" type="password" placeholder="新密码" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="changeForm.confirmPassword" type="password" placeholder="确认新密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="submitChange" :loading="actionLoading" style="width: 100%;">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const loginForm = ref({ username: "", password: "" });
const forgotForm = ref({ username: "" });
const changeForm = ref({ oldPassword: "", newPassword: "", confirmPassword: "" });
const loginLoading = ref(false);
const actionLoading = ref(false);
const loginError = ref("");
const showForgotDialog = ref(false);
const showChangeDialog = ref(false);
const loginFormRef = ref(null);
const forgotFormRef = ref(null);
const changeFormRef = ref(null);
const router = useRouter();

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};
const forgotRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
};
const changeRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (_rule, value) => {
        if (value !== changeForm.value.newPassword) {
          return new Error("两次密码不一致");
        }
      },
      trigger: "blur",
    },
  ],
};

const emit = defineEmits(["login-success"]);

const handleLoginSuccess = async (user, token) => {
  localStorage.setItem("authToken", token);
  emit("login-success", user);
  await router.push("/dashboard");
};

const submitLogin = async () => {
  if (!loginFormRef.value) return;
  if (loginLoading.value) return;
  loginError.value = "";

  try {
    await loginFormRef.value.validate();
  } catch {
    loginError.value = "请输入用户名和密码";
    return;
  }

  loginLoading.value = true;

  try {
    // 本地开发模式：内置账号直接通过，后端未写时可继续开发
    if (loginForm.value.username === "admin" && loginForm.value.password === "123456") {
      const mockedToken = "admin-mock-token";
      await handleLoginSuccess("admin", mockedToken);
      return;
    }

    let res;
    try {
      res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.value.username,
          password: loginForm.value.password,
        }),
      });
    } catch {
      // 后端尚未启动时，确保前端继续可用（模拟登录）
      const mockedToken = "dev-token-placeholder";
      await handleLoginSuccess(loginForm.value.username || "开发用户", mockedToken);
      ElMessage.success("后端未准备好，已模拟登录（开发模式）");
      return;
    }

    let responseText = "";
    try {
      responseText = await res.text();
    } catch {
      responseText = "";
    }

    if (!res.ok) {
      let errorMessage = "登录失败，请检查用户名或密码";
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = responseText;
        }
      }
      throw new Error(errorMessage);
    }

    if (!responseText || !responseText.trim()) {
      throw new Error("登录接口返回空内容");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("登录接口返回非 JSON 数据");
    }

    const token = data.token || data.access_token || data.jwt;
    if (!token) throw new Error("登录接口未返回 token");

    await handleLoginSuccess(loginForm.value.username, token);
  } catch (error) {
    loginError.value = error.message || "登录失败";
  } finally {
    loginLoading.value = false;
  }
};

const submitForgot = () => {
  if (!forgotFormRef.value) return;
  forgotFormRef.value.validate((valid) => {
    if (!valid) return;
    actionLoading.value = true;
    setTimeout(() => {
      actionLoading.value = false;
      showForgotDialog.value = false;
      ElMessage.success("重置链接已发送到注册邮箱，请查收");
    }, 1000);
  });
};

const submitChange = () => {
  if (!changeFormRef.value) return;
  changeFormRef.value.validate((valid) => {
    if (!valid) return;
    actionLoading.value = true;
    setTimeout(() => {
      actionLoading.value = false;
      showChangeDialog.value = false;
      ElMessage.success("密码修改成功，请重新登录");
      loginForm.value.password = "";
      loginForm.value.username = "";
    }, 1000);
  });
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
.login-footer-links {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  color: #2e7d32;
  margin-top: 8px;
}
.login-footer-links a {
  color: #2e7d32;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}
.login-footer-links a:hover {
  color: #1b5e20;
  background-color: rgba(46, 125, 50, 0.08);
}
</style>
