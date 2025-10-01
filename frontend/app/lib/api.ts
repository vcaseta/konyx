"use client";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  timeout: 15000,
});

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem("konyxToken", token);
  else localStorage.removeItem("konyxToken");
}

export function getAuthToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("konyxToken");
}

export function setCompany(id: string) {
  localStorage.setItem("konyxCompany", id);
}

export function getCompany() {
  return typeof window === "undefined" ? null : localStorage.getItem("konyxCompany");
}

// Interceptores: añadir Authorization y X-Company
api.interceptors.request.use((config) => {
  const t = getAuthToken();
  const c = getCompany();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  if (c) config.headers["X-Company"] = c;   // o query ?companyId=...
  return config;
});

export default api;
