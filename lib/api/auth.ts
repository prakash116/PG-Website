import { apiRequest } from "@/lib/api/client";

export type UserRole = "PG_OWNER" | "USER";

export type UserType =
  | "STUDENT"
  | "TOURIST"
  | "WORKING_PROFESSIONAL"
  | "EMPLOYEE"
  | "OTHER";

export type UserGender = "MALE" | "FEMALE" | "OTHER";

export interface RegisterPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  userType?: UserType;
  gender?: UserGender;
  dateOfBirth?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
}

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  role: UserRole;
  userType: UserType | null;
  createdAt: string;
}

export interface RegisterResponse {
  success: true;
  message: "Registration successful.";
  data: RegisteredUser;
}

export function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
