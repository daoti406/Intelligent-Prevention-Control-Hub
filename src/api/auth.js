import request from "../utils/request";

export function login(data) {
  return request({
    url: "/user/login",
    method: "get",
    params: {
      username: data.username,
      passwordHash: data.password,
    },
  });
}

export function getCurrentUser() {
  return request({
    url: "/user/me",
    method: "get",
  });
}
