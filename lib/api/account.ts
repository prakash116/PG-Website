import { apiRequest } from "@/lib/api/client";
import type { UserGender, UserRole, UserType } from "@/lib/api/auth";
import type { PgGender, RoomType, VerificationStatus } from "@/lib/api/pg";

/**
 * The whole account, as opposed to the trimmed session user the header holds.
 * `GET /v1/auth/me` deliberately returns less; this is what the account page
 * needs.
 */
export interface AccountProfile {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  role: UserRole;
  userType: UserType | null;
  gender: UserGender | null;
  /** YYYY-MM-DD, so it cannot shift across a timezone boundary. */
  dateOfBirth: string | null;
  profileImage: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

/** Send only what changed; anything omitted is left alone. */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  userType?: UserType;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface ProfileResponse {
  success: true;
  message: string;
  data: AccountProfile;
}

export interface StayService {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface StayPg {
  id: string;
  pgCode: string;
  name: string;
  location: string;
  city: string | null;
  logo: string | null;
  image: string | null;
  gender: PgGender | null;
  foodIncluded: boolean;
  verification: VerificationStatus;
  ownerName: string;
  ownerPhone: string;
}

export interface Stay {
  residentId: string;
  roomNumber: string | null;
  roomType: RoomType;
  monthlyRent: number;
  /** Rent plus every service taken. */
  monthlyTotal: number;
  joinedAt: string;
  dueDate: string | null;
  services: StayService[];
  pg: StayPg;
}

export interface StayResponse {
  success: true;
  message: string;
  /** Null is the ordinary answer for someone still looking, not an error. */
  data: Stay | null;
}

export function fetchProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/v1/users/me");
}

export function updateProfile(
  payload: UpdateProfilePayload
): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** The PG this account currently lives in, or null. */
export function fetchStay(): Promise<StayResponse> {
  return apiRequest<StayResponse>("/v1/users/me/stay");
}

/** One PG that went live from this customer's code, and what it earned them. */
export interface ReferralRewardItem {
  id: string;
  pgName: string;
  pgCode: string;
  /** Rupees. */
  amount: number;
  earnedAt: string;
}

export interface Referrals {
  /** Null for an account that is not a customer. */
  referralCode: string | null;
  earnedRupees: number;
  rewardPerReferral: number;
  /** PGs that used the code but have not published, so nothing is earned yet. */
  pendingReferrals: number;
  rewards: ReferralRewardItem[];
}

export interface ReferralsResponse {
  success: true;
  message: string;
  data: Referrals;
}

/** The signed-in customer's referral code and what it has earned. */
export function fetchReferrals(): Promise<ReferralsResponse> {
  return apiRequest<ReferralsResponse>("/v1/users/me/referrals");
}

/** An account that has been closed, and the date it stops being recoverable. */
export interface ClosedAccount {
  id: string;
  name: string;
  email: string;
  deletedAt: string | null;
  purgeOn: string | null;
  graceDays: number;
}

export interface CloseAccountResponse {
  success: true;
  message: string;
  data: ClosedAccount;
}

/**
 * Closes the signed-in account. The session cookie is cleared by the API, so
 * the caller should clear its own state and send them to the homepage.
 *
 * A PG owner is refused with a 409 explaining why — removing the owner would
 * take the PG and its payment history with it.
 */
export function deleteOwnAccount(): Promise<CloseAccountResponse> {
  return apiRequest<CloseAccountResponse>("/v1/users/me", {
    method: "DELETE",
  });
}
