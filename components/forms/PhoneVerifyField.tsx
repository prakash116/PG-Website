"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { verifyPhoneToken, type WidgetConfig } from "@/lib/api/phone";
import {
  CAPTCHA_RENDER_ID,
  widgetRetryOtp,
  widgetSendOtp,
  widgetVerifyOtp,
} from "@/lib/msg91-widget";
import { cn } from "@/lib/utils";

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/** MSG91's own resend window; the widget refuses retries inside it anyway. */
const RESEND_COOLDOWN_SECONDS = 30;

interface PhoneVerifyFieldProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  /** True once the number has been proven. */
  isVerified: boolean;
  onVerified: (verified: boolean) => void;
  /**
   * Whether registration is blocked without it. Defaults to false — phone
   * verification has never been enforced, so every existing call site keeps
   * today's behaviour until a Super Admin turns the requirement on.
   */
  required?: boolean;
  /**
   * The MSG91 widget's public configuration, or null while it loads. When the
   * widget is not configured the field renders as the plain input it always
   * was — verification simply is not offered.
   */
  widgetConfig: WidgetConfig | null;
}

/**
 * The +91 mobile field, with the MSG91 OTP widget behind its Verify button.
 *
 * The widget sends and checks the code in the browser; the access token it
 * returns is confirmed by our API with MSG91 directly before the number is
 * recorded as verified. Editing the number clears the verification, exactly
 * as editing the email does.
 */
export function PhoneVerifyField({
  phone,
  onPhoneChange,
  isVerified,
  onVerified,
  required = false,
  widgetConfig,
}: PhoneVerifyFieldProps) {
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Counts the resend cooldown down to zero.
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((left) => left - 1), 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const canVerify = Boolean(
    widgetConfig?.configured && widgetConfig.widgetId && widgetConfig.tokenAuth
  );
  const looksLikeMobile = INDIAN_MOBILE.test(phone);

  function handlePhoneChange(next: string) {
    onPhoneChange(next);

    // A verification belongs to one number, so it cannot survive an edit.
    if (isVerified || codeSent) {
      onVerified(false);
      setCodeSent(false);
      setCode("");
    }
  }

  async function handleSend() {
    if (!widgetConfig?.widgetId || !widgetConfig.tokenAuth) return;

    if (!looksLikeMobile) {
      toast.error("Enter a valid 10-digit mobile number first.");
      return;
    }

    setIsSending(true);

    try {
      if (codeSent) {
        await widgetRetryOtp(widgetConfig.widgetId, widgetConfig.tokenAuth);
      } else {
        await widgetSendOtp(
          widgetConfig.widgetId,
          widgetConfig.tokenAuth,
          `91${phone}`
        );
      }

      setCodeSent(true);
      setCode("");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      toast.success("Code sent. Check your phone.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send the code. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify() {
    if (code.length < 4) return;
    if (!widgetConfig?.widgetId || !widgetConfig.tokenAuth) return;

    setIsChecking(true);

    try {
      // 1. The widget checks the code with MSG91 and returns an access token.
      const accessToken = await widgetVerifyOtp(
        widgetConfig.widgetId,
        widgetConfig.tokenAuth,
        code
      );
      // 2. Our API confirms that token with MSG91 and records the proof.
      await verifyPhoneToken(phone, accessToken);
      onVerified(true);
      toast.success("Mobile number verified.");
    } catch (error: unknown) {
      toast.error(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Could not check the code. Please try again."
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="register-phone">
        Mobile number <span className="text-destructive">*</span>
        {canVerify && !required && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (verification optional)
          </span>
        )}
      </Label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div
          className={cn(
            "flex h-12 flex-1 overflow-hidden rounded-xl border bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            isVerified && "border-success/40 bg-success/5"
          )}
        >
          <span className="flex items-center border-r bg-secondary px-3.5 text-sm font-semibold text-secondary-foreground">
            +91
          </span>
          <Input
            id="register-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) =>
              handlePhoneChange(
                event.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="98765 43210"
            autoComplete="tel-national"
            readOnly={isVerified}
            className="h-full flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
          />
          {isVerified && (
            <span className="flex items-center pr-3.5 text-success">
              <BadgeCheck className="size-4" />
            </span>
          )}
        </div>

        {canVerify && !isVerified && (
          <Button
            type="button"
            variant="outline"
            disabled={!looksLikeMobile || isSending || secondsLeft > 0}
            onClick={() => void handleSend()}
            className="h-12 shrink-0 gap-2 rounded-xl px-5 font-semibold sm:w-auto"
          >
            {isSending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {isSending
              ? "Sending..."
              : secondsLeft > 0
                ? `Resend in ${secondsLeft}s`
                : codeSent
                  ? "Resend code"
                  : "Verify number"}
          </Button>
        )}
      </div>

      {/* MSG91 renders its captcha here if one is enabled on the widget. */}
      <div id={CAPTCHA_RENDER_ID} />

      {canVerify &&
        (isVerified ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-success">
            <BadgeCheck className="size-3.5" />
            Verified. Edit the number if you need to change it.
          </p>
        ) : codeSent ? (
          <div className="mt-1 rounded-2xl border bg-card p-4">
            <Label htmlFor="register-phone-otp" className="text-sm">
              Enter the code from the SMS
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Sent to +91 {phone}.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                id="register-phone-otp"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyDown={(event) => {
                  // Enter here means "check this code", not "submit the form".
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleVerify();
                  }
                }}
                placeholder="481920"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-12 flex-1 rounded-xl text-center font-mono text-lg tracking-[0.4em]"
              />
              <Button
                type="button"
                disabled={code.length < 4 || isChecking}
                onClick={() => void handleVerify()}
                className="h-12 shrink-0 gap-2 rounded-xl px-6 font-semibold"
              >
                {isChecking && <LoaderCircle className="size-4 animate-spin" />}
                {isChecking ? "Checking..." : "Confirm"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {required
              ? "We send a code by SMS to make sure this number is yours."
              : "You can create the account without verifying, or send yourself a code to confirm the number now."}
          </p>
        ))}
    </div>
  );
}
