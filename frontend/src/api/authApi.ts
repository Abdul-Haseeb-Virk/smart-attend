import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "PROFESSOR" | "STUDENT";
}

export interface LoginResponse {
  message: string;
  token: string;
  user: LoginUser;
}

export const loginUser = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};