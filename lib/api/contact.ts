import { apiRequest } from "@/lib/api/client";

export type ContactEnquiryStatus = "NEW" | "RESOLVED";

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  /** What it is about, in the sender's own words. */
  reason: string;
  description: string;
  status: ContactEnquiryStatus;
  sentAt: string;
  resolvedAt: string | null;
}

export interface ContactEnquiriesResponse {
  success: true;
  message: string;
  data: ContactEnquiry[];
}

export interface ContactEnquiryResponse {
  success: true;
  message: string;
  data: ContactEnquiry;
}

export interface EnquirySentResponse {
  success: true;
  message: string;
}

export interface SendEnquiryPayload {
  name: string;
  phone: string;
  reason: string;
  description: string;
}

/** Public. Anyone may send a message from the Contact Us page. */
export function sendEnquiry(
  payload: SendEnquiryPayload
): Promise<EnquirySentResponse> {
  return apiRequest<EnquirySentResponse>("/v1/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Super Admin: every enquiry, new ones first. */
export function fetchEnquiries(): Promise<ContactEnquiriesResponse> {
  return apiRequest<ContactEnquiriesResponse>("/v1/contact");
}

/** Super Admin: this one has been dealt with. Final — there is no reopening. */
export function resolveEnquiry(id: string): Promise<ContactEnquiryResponse> {
  return apiRequest<ContactEnquiryResponse>(`/v1/contact/${id}/resolve`, {
    method: "PATCH",
  });
}

/** Super Admin: remove an enquiry for good. */
export function deleteEnquiry(id: string): Promise<ContactEnquiryResponse> {
  return apiRequest<ContactEnquiryResponse>(`/v1/contact/${id}`, {
    method: "DELETE",
  });
}
