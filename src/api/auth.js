import request from "../utils/request";

const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api";

export async function login(data) {
  return request({
    url: "/api/auth",
    method: "post",
    data
  });
}

export function getCurrentUser() {
  return request({
    url: "/api/user/me",
    method: "get",
  });
}
