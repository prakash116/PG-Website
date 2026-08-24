import { apiRequest } from "@/lib/api/client";

export interface OtpSentResponse {
  success: true;
  message: string;
  data: {
    expiresAt: string;
    /** Seconds before another code can be asked for. */
    resendAfterSeconds: number;
  };
}

export interface OtpVerifiedResponse {
  success: true;
  message: string;
}

/**
 * Public. Sends a six-digit code to the address, and stops any earlier code
 * for it from working.
 */
export function sendEmailCode(
  email: string,
  name?: string
): Promise<OtpSentResponse> {
  return apiRequest<OtpSentResponse>("/v1/email/send-code", {
    method: "POST",
    body: JSON.stringify({ email, ...(name ? { name } : {}) }),
  });
}

/**
 * Public. On success the address counts as verified for the next 30 minutes,
 * which is what registration checks — the browser is never trusted to assert it.
 */
export function verifyEmailCode(
  email: string,
  code: string
): Promise<OtpVerifiedResponse> {
  return apiRequest<OtpVerifiedResponse>("/v1/email/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

/** The mail account Pzee sends from. The password is never returned. */
export interface MailSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  fromEmail: string;
  /** Whether a password is stored — never the password itself. */
  hasPassword: boolean;
  /** ENVIRONMENT means nothing is saved yet and SMTP_* is in use. */
  source: "DATABASE" | "ENVIRONMENT";
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface MailSettingsResponse {
  success: true;
  message: string;
  data: MailSettings;
}

export interface MailTestResponse {
  success: true;
  message: string;
}

export interface UpdateMailSettingsPayload {
  host: string;
  port: number;
  secure?: boolean;
  username: string;
  /** Leave out to keep the password already stored. */
  password?: string;
  fromName: string;
  fromEmail: string;
}

/** Super Admin only. */
export function fetchMailSettings(): Promise<MailSettingsResponse> {
  return apiRequest<MailSettingsResponse>("/v1/email/settings");
}

/** Super Admin only. Takes effect on the next email, with no redeploy. */
export function updateMailSettings(
  payload: UpdateMailSettingsPayload
): Promise<MailSettingsResponse> {
  return apiRequest<MailSettingsResponse>("/v1/email/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Super Admin only. Proves the credentials work and a message arrives. */
export function sendTestMail(email: string): Promise<MailTestResponse> {
  return apiRequest<MailTestResponse>("/v1/email/settings/test", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Whether registration has to prove the email address with a code. */
export interface VerificationPolicy {
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface VerificationPolicyResponse {
  success: true;
  message: string;
  data: VerificationPolicy;
}

/**
 * Public: the registration form reads it to decide whether to ask for a code.
 * The API enforces the same rule on its own side regardless of what the form
 * does, so this only shapes what is shown.
 */
export function fetchVerificationPolicy(): Promise<VerificationPolicyResponse> {
  return apiRequest<VerificationPolicyResponse>(
    "/v1/email/verification-policy"
  );
}

/** Super Admin only. Takes effect on the next registration, with no redeploy. */
export function setVerificationPolicy(
  required: boolean
): Promise<VerificationPolicyResponse> {
  return apiRequest<VerificationPolicyResponse>(
    "/v1/email/settings/verification",
    {
      method: "PATCH",
      body: JSON.stringify({ required }),
    }
  );
}

/**
 * Super Admin only. The phone half of the same policy — lives under /v1/phone
 * on the API, but returns the whole policy shape like its email counterpart.
 */
export function setPhoneVerificationPolicy(
  required: boolean
): Promise<VerificationPolicyResponse> {
  return apiRequest<VerificationPolicyResponse>(
    "/v1/phone/settings/verification",
    {
      method: "PATCH",
      body: JSON.stringify({ required }),
    }
  );
}
