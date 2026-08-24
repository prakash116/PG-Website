import { apiRequest } from "@/lib/api/client";
import type { PgGender, RoomType, VerificationStatus } from "@/lib/api/pg";
import type { ListingFeeStatus } from "@/lib/api/publishing";
import type { ResidentStatus } from "@/lib/api/crm";

/** One PG as it appears in the Super Admin list. */
export interface AdminPgSummary {
  pgCode: string;
  name: string;
  address: string;
  city: string | null;
  ownerName: string;
  ownerPhone: string;
  logo: string | null;
  gender: PgGender | null;
  verification: VerificationStatus;
  /** False means the PG is hidden from the public site. */
  isPublished: boolean;
  /** The ₹100 listing fee. Null when it has never been raised. */
  membership: ListingFeeStatus | null;
  membershipPaidAt: string | null;
  rooms: number;
  beds: number;
  residents: number;
  /** Rent collected, in rupees. */
  revenue: number;
  registeredAt: string;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface AdminPgRoom {
  number: string;
  type: RoomType;
  totalBeds: number;
  occupiedBeds: number;
}

export interface AdminPgRoomType {
  type: RoomType;
  pricePerBed: number;
  rooms: number;
}

export interface AdminPgResident {
  fullName: string;
  phone: string;
  roomNumber: string | null;
  roomType: RoomType;
  monthlyRent: number;
  status: ResidentStatus;
  joinedAt: string;
  dueDate: string | null;
}

/** Everything behind one PG: its rooms, its guests, and what it has collected. */
export interface AdminPgDetail extends AdminPgSummary {
  description: string | null;
  amenities: string[];
  images: string[];
  ownerEmail: string;
  availableBeds: number;
  roomTypes: AdminPgRoomType[];
  roomList: AdminPgRoom[];
  residentList: AdminPgResident[];
  /** The last 12 months of rent collected, oldest first. */
  revenueByMonth: RevenuePoint[];
}

export interface AdminPgListResponse {
  success: true;
  message: string;
  data: AdminPgSummary[];
}

export interface AdminPgDetailResponse {
  success: true;
  message: string;
  data: AdminPgDetail;
}

export interface AdminPgActionResponse {
  success: true;
  message: string;
  data: AdminPgSummary;
}

/** Super Admin: every PG, newest first. */
export function fetchAdminPgs(): Promise<AdminPgListResponse> {
  return apiRequest<AdminPgListResponse>("/v1/pg/admin/list");
}

/** Super Admin: one PG with its rooms, guests and revenue. */
export function fetchAdminPg(pgCode: string): Promise<AdminPgDetailResponse> {
  return apiRequest<AdminPgDetailResponse>(`/v1/pg/admin/${pgCode}`);
}

/**
 * Super Admin: verify a listing, or take it off the site. Hiding a PG leaves
 * the owner their dashboard, rooms and guests.
 */
export function updateAdminPg(
  pgCode: string,
  patch: { verification?: VerificationStatus; isPublished?: boolean }
): Promise<AdminPgActionResponse> {
  return apiRequest<AdminPgActionResponse>(`/v1/pg/admin/${pgCode}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** Super Admin: delete a listing for good. The owner keeps their account. */
export function deleteAdminPg(
  pgCode: string
): Promise<AdminPgActionResponse> {
  return apiRequest<AdminPgActionResponse>(`/v1/pg/admin/${pgCode}`, {
    method: "DELETE",
  });
}
