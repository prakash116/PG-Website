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

/** Shared by both registration shapes. */
interface RegisterPayloadBase {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  /** URL returned by `uploadProfileImage`. */
  profileImage?: string;
}

/** "Find a PG": someone looking for a place to stay. */
export interface SeekerRegisterPayload extends RegisterPayloadBase {
  role: "USER";
  address: string;
  dateOfBirth: string;
  userType?: UserType;
  gender?: UserGender;
}

/** "List a PG": an owner, whose PG is created alongside the account. */
export interface OwnerRegisterPayload extends RegisterPayloadBase {
  role: "PG_OWNER";
  pgName: string;
  pgLocation: string;
  /**
   * Optional. The referral code of the customer who introduced this PG — they
   * are credited once the listing is published. An unknown code is refused, so
   * leave it out rather than guessing.
   */
  referralCode?: string;
}

export type RegisterPayload = SeekerRegisterPayload | OwnerRegisterPayload;

/** The PG created with a PG_OWNER account. */
export interface RegisteredPg {
  id: string;
  /** Unique, shareable PG identifier, e.g. PZ-4F7K2A. */
  pgCode: string;
  name: string;
  location: string;
}

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  role: RegistrationRole;
  userType: UserType | null;
  profileImage: string | null;
  createdAt: string;
  /** Present only for accounts registered as a PG owner. */
  pg: RegisteredPg | null;
}

export interface RegisterResponse {
  success: true;
  message: "Registration successful.";
  data: RegisteredUser;
}

export interface UploadImageResponse {
  success: true;
  message: "Image uploaded successfully.";
  data: { url: string };
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

/**
 * Registers a PG seeker or a PG owner. The API sets the session cookie on
 * success, so the new account is signed in straight away.
 */
export function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Uploads a profile photo and returns its URL, for use as `profileImage`. */
export async function uploadProfileImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await apiRequest<UploadImageResponse>(
    "/v1/uploads/profile-image",
    { method: "POST", body }
  );

  return response.data.url;
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
