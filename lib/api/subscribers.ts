import { apiRequest } from "@/lib/api/client";

export type SubscriberStatus = "ACTIVE" | "BLOCKED";

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  subscribedAt: string;
  /** When an admin blocked them; null while active. */
  blockedAt: string | null;
}

export interface SubscribersListResponse {
  success: true;
  message: string;
  data: Subscriber[];
}

export interface SubscriberResponse {
  success: true;
  message: string;
  data: Subscriber;
}

export interface SubscribeResponse {
  success: true;
  message: string;
}

/**
 * Public. Subscribing twice reports the same message as the first time, so the
 * form cannot be used to test which addresses are already on the list.
 */
export function subscribe(email: string): Promise<SubscribeResponse> {
  return apiRequest<SubscribeResponse>("/v1/subscribers", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Super Admin only. */
export function fetchSubscribers(): Promise<SubscribersListResponse> {
  return apiRequest<SubscribersListResponse>("/v1/subscribers");
}

/** Super Admin only. Blocking keeps the row but stops the email. */
export function setSubscriberStatus(
  id: string,
  status: SubscriberStatus
): Promise<SubscriberResponse> {
  return apiRequest<SubscriberResponse>(`/v1/subscribers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/** Super Admin only. A real delete — use block to keep the record. */
export function deleteSubscriber(id: string): Promise<SubscriberResponse> {
  return apiRequest<SubscriberResponse>(`/v1/subscribers/${id}`, {
    method: "DELETE",
  });
}
