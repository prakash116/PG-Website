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
  /** Blocked accounts cannot sign in; reversible, and nothing is deleted. */
  isBlocked: boolean;
  /** Set once the account is closed and counting down to being purged. */
  deletedAt: string | null;
  createdAt: string;
}

/** One day on the sign-ups chart. */
export interface SignupPoint {
  date: string;
  customers: number;
  owners: number;
  /** Everyone on the platform by the end of that day. */
  total: number;
}

export interface UserStats {
  from: string;
  to: string;
  totalAccounts: number;
  totalCustomers: number;
  totalOwners: number;
  joinedInRange: number;
  series: SignupPoint[];
}

export interface UserStatsResponse {
  success: true;
  message: string;
  data: UserStats;
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

/**
 * Blocks an account, or lets it back in. Takes effect on the account's very
 * next request — nothing is deleted and it is reversible at any time.
 */
export function setUserBlocked(
  id: string,
  blocked: boolean
): Promise<CloseAccountResponse> {
  return apiRequest<CloseAccountResponse>(`/v1/users/${id}/block`, {
    method: "PATCH",
    body: JSON.stringify({ blocked }),
  });
}

/** Sign-ups per day over a range. Defaults to the last 30 days. */
export function fetchUserStats(
  from?: string,
  to?: string
): Promise<UserStatsResponse> {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);

  const suffix = query.toString();

  return apiRequest<UserStatsResponse>(
    `/v1/users/stats${suffix ? `?${suffix}` : ""}`
  );
}
