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
  lastLogin: string | null;
}

// The access token is never returned in the body: the API sets it as an
// HttpOnly cookie that JavaScript cannot read.
export interface LoginResponse {
  success: true;
  message: "Login successful.";
  data: {
    user: AuthenticatedUser;
  };
}

export interface SessionResponse {
  success: true;
  message: "Session is active.";
  data: AuthenticatedUser;
}

export interface LogoutResponse {
  success: true;
  message: "Logout successful.";
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

/** Reads the signed-in user from the session cookie and extends it by 30 days. */
export function fetchSession(): Promise<SessionResponse> {
  return apiRequest<SessionResponse>("/v1/auth/me");
}

export function logoutUser(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/v1/auth/logout", { method: "POST" });
}
