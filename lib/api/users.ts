import { apiRequest } from "@/lib/api/client";
import type { CloseAccountResponse } from "@/lib/api/account";
import type { UserRole, UserType } from "@/lib/api/auth";

/** Super Admin only. Every route in this file requires the SUPER_ADMIN role. */
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  role: UserRole;
  userType: UserType | null;
  profileImage: string | null;
  state: string | null;
  city: string | null;
  isActive: boolean;
  /** Set once the account is closed and counting down to being purged. */
  deletedAt: string | null;
  createdAt: string;
}

export interface UsersListResponse {
  success: true;
  message: string;
  data: AdminUser[];
}

export function fetchUsers(): Promise<UsersListResponse> {
  return apiRequest<UsersListResponse>("/v1/users");
}

/**
 * Closes a customer account. PG owner and Super Admin accounts are refused by
 * the API, so the list offers this only where it can succeed.
 */
export function deleteUserAccount(id: string): Promise<CloseAccountResponse> {
  return apiRequest<CloseAccountResponse>(`/v1/users/${id}`, {
    method: "DELETE",
  });
}

/** Undoes a close, for as long as the account has not been purged. */
export function restoreUserAccount(id: string): Promise<CloseAccountResponse> {
  return apiRequest<CloseAccountResponse>(`/v1/users/${id}/restore`, {
    method: "POST",
  });
}
