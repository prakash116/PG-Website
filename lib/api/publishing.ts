import { apiRequest } from "@/lib/api/client";

export type ListingFeeStatus = "PENDING" | "PAID";

/** The one-off fee that makes a listing public. */
export interface ListingFee {
  id: string;
  /** Rupees. */
  amount: number;
  status: ListingFeeStatus;
  reference: string | null;
  paidAt: string | null;
  requestedAt: string;
}

export interface PublishStatus {
  isPublished: boolean;
  publishedAt: string | null;
  feeRupees: number;
  /** Empty until SUPER_ADMIN_UPI_ID is set on the API. */
  payeeUpiId: string;
  /** The customer who referred this PG, if a code was given at registration. */
  referredBy: string | null;
  /** Null until the owner has asked to publish. */
  fee: ListingFee | null;
}

export interface PublishStatusResponse {
  success: true;
  message: string;
  data: PublishStatus;
}

/** A fee waiting on a Super Admin, with what they need to match the transfer. */
export interface PendingFee {
  id: string;
  amount: number;
  requestedAt: string;
  pgCode: string;
  pgName: string;
  pgLocation: string;
  ownerName: string;
  ownerPhone: string;
  referredByName: string | null;
  referralCode: string | null;
  /** Credited to the referrer on confirmation. Zero when there is none. */
  rewardRupees: number;
}

export interface PendingFeesResponse {
  success: true;
  message: string;
  data: PendingFee[];
}

/** PG owner: where the listing stands. */
export function fetchPublishStatus(): Promise<PublishStatusResponse> {
  return apiRequest<PublishStatusResponse>("/v1/pg/me/publish");
}

/**
 * PG owner: ask to publish. Raises the fee and returns where to pay it — the
 * listing does not go public until a Super Admin confirms the money arrived.
 * Safe to call twice.
 */
export function requestPublish(): Promise<PublishStatusResponse> {
  return apiRequest<PublishStatusResponse>("/v1/pg/me/publish", {
    method: "POST",
  });
}

/** Super Admin: fees still waiting to be confirmed. */
export function fetchPendingFees(): Promise<PendingFeesResponse> {
  return apiRequest<PendingFeesResponse>("/v1/pg/listing-fees/pending");
}

/** Super Admin: confirm the money arrived, publishing the PG and paying the referrer. */
export function confirmListingFee(
  pgCode: string,
  reference?: string
): Promise<PublishStatusResponse> {
  return apiRequest<PublishStatusResponse>(
    `/v1/pg/listing-fees/${pgCode}/confirm`,
    {
      method: "POST",
      body: JSON.stringify({ reference: reference ?? "" }),
    }
  );
}
