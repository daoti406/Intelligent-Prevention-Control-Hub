import axios from "axios";
import request from "../utils/request";

const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api";

export async function login(data) {
  // 模拟本地登录，不调用后端
  if (data.username === "admin" && data.password === "123456") {
    return {
      token: "mock-token-" + Date.now(),
      user: {
        username: "admin",
        name: "管理员"
      }
    };
  } else {
    throw new Error("用户名或密码错误");
  }
}

export function getCurrentUser() {
  return request({
    url: "/user/me",
    method: "get",
  });
}
