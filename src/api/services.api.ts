import axios from "axios";
import { API_BASE_URL } from "../utils/url";

const API_URL = `${API_BASE_URL}/services-used`;

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token cho tất cả request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===== GET ALL =====
export const getServices = (page = 1, pageSize = 10) =>
  api.get(`${API_URL}/getAll`, {
    params: { page, pageSize },
  });

// ===== GET BY ID =====
export const getServiceById = (id: number) =>
  api.get(`${API_URL}/getById/${id}`);

// ===== CREATE =====
export const createService = (data: any) =>
  api.post(`${API_URL}/create`, data);

// ===== UPDATE =====
export const updateService = (id: number, data: any) =>
  api.put(`${API_URL}/update/${id}`, data);

// ===== DELETE (QUAN TRỌNG) =====
export const deleteService = (id: number) =>
  api.delete(`${API_URL}/delete/${id}`);
