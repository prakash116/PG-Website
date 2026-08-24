import { apiRequest } from "@/lib/api/client";

/**
 * What the register page needs to run the MSG91 OTP widget. Both values are
 * client-side by MSG91's design — the account authkey never appears here.
 */
export interface WidgetConfig {
  /** False until a Super Admin (or the server environment) sets the widget up. */
  configured: boolean;
  widgetId: string | null;
  tokenAuth: string | null;
}

export interface WidgetConfigResponse {
  success: true;
  message: string;
  data: WidgetConfig;
}

export interface PhoneVerifiedResponse {
  success: true;
  message: string;
}

/** Public. The register page reads it to decide whether to load the widget. */
export function fetchWidgetConfig(): Promise<WidgetConfigResponse> {
  return apiRequest<WidgetConfigResponse>("/v1/phone/widget-config");
}

/**
 * Public. The MSG91 widget checked the code in the browser and returned an
 * access token; the API confirms that token with MSG91 directly and records
 * the number as verified for the next 30 minutes — the browser is never
 * trusted to simply assert it.
 */
export function verifyPhoneToken(
  phone: string,
  accessToken: string
): Promise<PhoneVerifiedResponse> {
  return apiRequest<PhoneVerifiedResponse>("/v1/phone/verify-token", {
    method: "POST",
    body: JSON.stringify({ phone, accessToken }),
  });
}

/** The MSG91 account, as the settings page sees it — never the authkey. */
export interface SmsSettings {
  widgetId: string;
  tokenAuth: string;
  /** Whether an authkey is stored — never the authkey itself. */
  hasAuthkey: boolean;
  /** ENVIRONMENT means nothing is saved yet and MSG91_* is in use. */
  source: "DATABASE" | "ENVIRONMENT";
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface SmsSettingsResponse {
  success: true;
  message: string;
  data: SmsSettings;
}

export interface UpdateSmsSettingsPayload {
  widgetId: string;
  tokenAuth: string;
  /** Leave out to keep the authkey already stored. */
  authkey?: string;
}

/** Super Admin only. */
export function fetchSmsSettings(): Promise<SmsSettingsResponse> {
  return apiRequest<SmsSettingsResponse>("/v1/phone/settings");
}

/** Super Admin only. Takes effect on the next verification, with no redeploy. */
export function updateSmsSettings(
  payload: UpdateSmsSettingsPayload
): Promise<SmsSettingsResponse> {
  return apiRequest<SmsSettingsResponse>("/v1/phone/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
