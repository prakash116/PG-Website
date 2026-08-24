import { apiRequest } from "@/lib/api/client";

export type SupportTicketStatus = "OPEN" | "SOLVED" | "REJECTED";

/** A query as its PG owner sees it. */
export interface SupportTicket {
  id: string;
  title: string;
  message: string;
  status: SupportTicketStatus;
  /** What Pzee replied. Null while the query is still open. */
  response: string | null;
  raisedAt: string;
  resolvedAt: string | null;
}

/** The same query with the context a Super Admin needs to answer it. */
export interface AdminSupportTicket extends SupportTicket {
  pgName: string;
  pgCode: string;
  ownerName: string;
  ownerPhone: string;
}

export interface SupportTicketsResponse {
  success: true;
  message: string;
  data: SupportTicket[];
}

export interface AdminSupportTicketsResponse {
  success: true;
  message: string;
  data: AdminSupportTicket[];
}

export interface SupportTicketResponse {
  success: true;
  message: string;
  data: SupportTicket;
}

export interface RaiseTicketPayload {
  title: string;
  message: string;
}

/** PG owner: your own queries, newest first. */
export function fetchMyTickets(): Promise<SupportTicketsResponse> {
  return apiRequest<SupportTicketsResponse>("/v1/support/me");
}

/** PG owner: raise a query with Pzee. */
export function raiseTicket(
  payload: RaiseTicketPayload
): Promise<SupportTicketResponse> {
  return apiRequest<SupportTicketResponse>("/v1/support/me", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Super Admin: every query, open ones first. */
export function fetchAllTickets(): Promise<AdminSupportTicketsResponse> {
  return apiRequest<AdminSupportTicketsResponse>("/v1/support");
}

/** Super Admin: answer a query. Answering is final — there is no reopening. */
export function resolveTicket(
  id: string,
  status: "SOLVED" | "REJECTED",
  response?: string
): Promise<SupportTicketResponse> {
  return apiRequest<SupportTicketResponse>(`/v1/support/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, response: response ?? "" }),
  });
}

/** Super Admin: remove a query for good. */
export function deleteTicket(id: string): Promise<SupportTicketResponse> {
  return apiRequest<SupportTicketResponse>(`/v1/support/${id}`, {
    method: "DELETE",
  });
}
