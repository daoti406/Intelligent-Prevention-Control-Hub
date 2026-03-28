import axios from "axios";
import request from "../utils/request";

const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api";

export async function login(data) {
  try {
    const response = await axios({
      url: `${apiPrefix}/user/login`,
      method: "get",
      params: {
        username: data.username,
        passwordHash: data.password,
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "登录失败，请检查账号密码";
    throw new Error(message);
  }
}

export function getCurrentUser() {
  return request({
    url: "/user/me",
    method: "get",
  });
}
