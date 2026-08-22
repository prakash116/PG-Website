import { apiRequest } from "@/lib/api/client";

export type VisitStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  PENDING: "New request",
  CONFIRMED: "Visit confirmed",
  COMPLETED: "Visited",
  CANCELLED: "Cancelled",
};

export interface Visit {
  id: string;
  pgCode: string;
  pgName: string;
  /** Copied from the customer's account when they booked. */
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string | null;
  message: string | null;
  status: VisitStatus;
  requestedAt: string;
}

export interface BookVisitPayload {
  pgCode: string;
  preferredDate?: string;
  message?: string;
}

interface OneResponse {
  data: Visit;
}
interface ListResponse {
  data: Visit[];
}

/** Requires a signed-in customer; the API takes their details from the session. */
export async function bookVisit(payload: BookVisitPayload): Promise<Visit> {
  const response = await apiRequest<OneResponse>("/v1/visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/** Visits the signed-in customer has booked. */
export async function fetchMyVisits(): Promise<Visit[]> {
  const response = await apiRequest<ListResponse>("/v1/visits/me");
  return response.data;
}

/** Visit requests for the signed-in owner's PG. */
export async function fetchOwnerVisits(status?: VisitStatus): Promise<Visit[]> {
  const suffix = status ? `?status=${status}` : "";
  const response = await apiRequest<ListResponse>(`/v1/pg/me/visits${suffix}`);
  return response.data;
}

export async function updateVisitStatus(
  id: string,
  status: VisitStatus
): Promise<Visit> {
  const response = await apiRequest<OneResponse>(`/v1/pg/me/visits/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return response.data;
}

export interface PublicPg {
  pgCode: string;
  name: string;
  location: string;
  city: string | null;
  description: string | null;
  price: number | null;
  deposit: number | null;
  amenities: string[];
  images: string[];
  logo: string | null;
  verified: boolean;
  rating: number;
  reviewCount: number;
}

/** Public lookup, so a visitor can see a listing before booking. */
export async function fetchPublicPg(pgCode: string): Promise<PublicPg> {
  const response = await apiRequest<{ data: PublicPg }>(
    `/v1/pg/public/${encodeURIComponent(pgCode)}`
  );

  return response.data;
}
