import { apiRequest } from "@/lib/api/client";

export type UserRole = "SUPER_ADMIN" | "PG_OWNER" | "USER";

export type RegistrationRole = Exclude<UserRole, "SUPER_ADMIN">;

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
  role: RegistrationRole;
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
  role: RegistrationRole;
  userType: UserType | null;
  createdAt: string;
}

export interface RegisterResponse {
  success: true;
  message: "Registration successful.";
  data: RegisteredUser;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  role: UserRole;
  userType: UserType | null;
  profileImage: string | null;
  lastLogin: string;
}

export interface LoginResponse {
  success: true;
  message: "Login successful.";
  data: {
    accessToken: string;
    user: AuthenticatedUser;
  };
}

export function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
