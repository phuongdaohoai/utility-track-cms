// services/residentsService.ts
import { api } from '../utils/api';

export interface Resident {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  citizenCard: string;
  gender: string;
  birthday: string;
  apartment: {
    id: number,
    building: string;
    floorNumber: number;
    roomNumber: string;
  };
  qrCode: string;
  faceIdData: string;
  status: number;
  version: number;
  avatar: string | null;
}

const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  
  const response = await api.upload('/upload/avatar', formData);

  return response;
};

const create = async (data: any) => {
  const res = await api.post('/residents/create', data);
  return res.json;
};

const update = async (id: number, data: any) => {
  const res = await api.put(`/residents/update/${id}`, data);

  return res;
};

const getById = async (id: number | string) => {
  const response = await api.get(`/residents/getById/${id}`);
  return response;
};

const deleteResident = async (id: number | string) => {
  const response = await api.del(`/residents/delete/${id}`);
  return response;
};

const resetQrCode= async (residentId: number) => {
    return api.put(`/residents/resetQrCode/${residentId}`, {});
  };
export default {
  getById,
  update,
  delete: deleteResident,
  create,
  uploadAvatar,
  resetQrCode
};