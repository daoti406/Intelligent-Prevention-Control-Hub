import axios from "axios";

const farmBaseUrl = import.meta.env.VITE_FARM_API_BASE_URL || "";

export async function login(data) {
  const baseUrl = farmBaseUrl || "http://10.10.110.219:8081";
  try {
    const response = await axios({
      url: `${baseUrl}/user/login`,
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
      "请求失败";
    throw new Error(message);
  }
}

export function getCurrentUser() {
  return request({
    url: "/user/me",
    method: "get",
  });
}
