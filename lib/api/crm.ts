import { apiRequest } from "@/lib/api/client";
import type { UserGender, UserType } from "@/lib/api/auth";
import type { RoomType } from "@/lib/api/pg";

export type ResidentStatus = "ACTIVE" | "LEFT";
/** Reuses the type a Find-PG user already chose when registering. */
export const USER_TYPE_LABELS: Record<UserType, string> = {
  STUDENT: "Student",
  TOURIST: "Tourist",
  WORKING_PROFESSIONAL: "Working professional",
  EMPLOYEE: "Employee",
  OTHER: "Other",
};

export interface ResidentService {
  id: string;
  name: string;
  monthlyAmount: number;
}

export const GUEST_GENDER_LABELS: Record<UserGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export interface Payment {
  id: string;
  amount: number;
  paidOn: string;
  forMonth: string | null;
  note: string | null;
}

export interface Resident {
  id: string;
  fullName: string;
  phone: string;
  address: string | null;
  gender: UserGender | null;
  userType: UserType | null;
  roomType: RoomType;
  roomId: string | null;
  /** The room they are allocated, e.g. 201. */
  roomNumber: string | null;
  monthlyRent: number;
  servicesTotal: number;
  /** Rent plus services; what pending is measured against. */
  monthlyTotal: number;
  services: ResidentService[];
  joinedAt: string;
  dueDate: string | null;
  leftAt: string | null;
  status: ResidentStatus;
  userId: string | null;
  /** True when this guest also has a Pzee account. */
  hasAccount: boolean;
  totalPaid: number;
  pendingAmount: number;
  /** Derived from the payment records, never stored. */
  lastPaymentDate: string | null;
  payments: Payment[];
}

export interface RoomTypeOccupancy {
  type: RoomType;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

export interface CrmSummary {
  totalGuests: number;
  pendingAmount: number;
  collected: number;
  from: string;
  to: string;
  totalBeds: number;
  availableBeds: number;
  occupancy: RoomTypeOccupancy[];
}

export interface CreateResidentPayload {
  fullName: string;
  phone: string;
  address?: string;
  gender?: UserGender;
  userType?: UserType;
  roomType: RoomType;
  roomId?: string;
  services?: Array<{ name: string; monthlyAmount: number }>;
  monthlyRent: number;
  joinedAt?: string;
  dueDate?: string;
}

export type UpdateResidentPayload = Partial<
  Omit<CreateResidentPayload, "joinedAt">
>;

export interface CreatePaymentPayload {
  amount: number;
  paidOn?: string;
  forMonth?: string;
  note?: string;
}

interface ListResponse {
  data: Resident[];
}
interface OneResponse {
  data: Resident;
}
interface SummaryResponse {
  data: CrmSummary;
}

export async function fetchResidents(params: {
  status?: ResidentStatus;
  search?: string;
}): Promise<Resident[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search?.trim()) query.set("search", params.search.trim());

  const suffix = query.toString() ? `?${query}` : "";
  const response = await apiRequest<ListResponse>(
    `/v1/pg/me/residents${suffix}`
  );

  return response.data;
}

export async function createResident(
  payload: CreateResidentPayload
): Promise<Resident> {
  const response = await apiRequest<OneResponse>("/v1/pg/me/residents", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateResident(
  id: string,
  payload: UpdateResidentPayload
): Promise<Resident> {
  const response = await apiRequest<OneResponse>(`/v1/pg/me/residents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/** Marks the guest as moved out, which returns their bed to the pool. */
export async function checkoutResident(id: string): Promise<Resident> {
  const response = await apiRequest<OneResponse>(
    `/v1/pg/me/residents/${id}/checkout`,
    { method: "POST" }
  );

  return response.data;
}

export async function deleteResident(id: string): Promise<void> {
  await apiRequest<null>(`/v1/pg/me/residents/${id}`, { method: "DELETE" });
}

export async function recordPayment(
  id: string,
  payload: CreatePaymentPayload
): Promise<Resident> {
  const response = await apiRequest<OneResponse>(
    `/v1/pg/me/residents/${id}/payments`,
    { method: "POST", body: JSON.stringify(payload) }
  );

  return response.data;
}

export async function fetchCrmSummary(params: {
  from?: string;
  to?: string;
}): Promise<CrmSummary> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);

  const suffix = query.toString() ? `?${query}` : "";
  const response = await apiRequest<SummaryResponse>(
    `/v1/pg/me/crm/summary${suffix}`
  );

  return response.data;
}
