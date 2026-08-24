"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { sendEmailCode, verifyEmailCode } from "@/lib/api/email";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface EmailVerifyFieldProps {
  email: string;
  onEmailChange: (email: string) => void;
  /** True once the address has been proven. Registration is blocked until then. */
  isVerified: boolean;
  onVerified: (verified: boolean) => void;
  /** Used only to greet them in the email. */
  name?: string;
  /**
   * Whether a code has to be entered. Defaults to true, which is what every
   * caller wanted before a Super Admin could switch it off — and matches the
   * API's own default, so a form that cannot read the setting still asks.
   */
  required?: boolean;
  inputClassName?: string;
}

/**
 * Email plus the code that proves it belongs to them.
 *
 * The address is locked once verified: changing it afterwards would leave the
 * form claiming a verification that belongs to a different inbox. Editing it
 * clears the verification instead, which is the honest behaviour.
 */
export function EmailVerifyField({
  email,
  onEmailChange,
  isVerified,
  onVerified,
  name,
  required = true,
  inputClassName,
}: EmailVerifyFieldProps) {
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

  const looksLikeEmail = EMAIL_PATTERN.test(email.trim());

  function handleEmailChange(next: string) {
    onEmailChange(next);

    // A verification belongs to one address, so it cannot survive an edit.
    if (isVerified || codeSent) {
      onVerified(false);
      setCodeSent(false);
      setCode("");
    }
  }

  async function handleSend() {
    if (!looksLikeEmail) {
      toast.error("Enter a valid email address first.");
      return;
    }

    setIsSending(true);

    try {
      const response = await sendEmailCode(email.trim().toLowerCase(), name);
      setCodeSent(true);
      setCode("");
      setSecondsLeft(response.data.resendAfterSeconds);
      toast.success(response.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not send the code. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) return;

    setIsChecking(true);

    try {
      await verifyEmailCode(email.trim().toLowerCase(), code);
      onVerified(true);
      toast.success("Email verified.");
    } catch (error: unknown) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not check the code. Please try again."
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="register-email">
        Email <span className="text-destructive">*</span>
        {!required && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (verification optional)
          </span>
        )}
      </Label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            readOnly={isVerified}
            className={cn(
              inputClassName,
              "pl-10",
              isVerified && "border-success/40 bg-success/5"
            )}
          />
          {isVerified && (
            <BadgeCheck className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-success" />
          )}
        </div>

        {!isVerified && (
          <Button
            type="button"
            variant="outline"
            disabled={!looksLikeEmail || isSending || secondsLeft > 0}
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
                  : "Verify email"}
          </Button>
        )}
      </div>

      {isVerified ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-success">
          <BadgeCheck className="size-3.5" />
          Verified. Edit the address if you need to change it.
        </p>
      ) : codeSent ? (
        <div className="mt-1 rounded-2xl border bg-card p-4">
          <Label htmlFor="register-otp" className="text-sm">
            Enter the 6-digit code
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Sent to {email.trim().toLowerCase()}. It expires in 10 minutes.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              id="register-otp"
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
              disabled={code.length !== 6 || isChecking}
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
            ? "We send a 6-digit code to make sure this address is yours."
            : "You can create the account without verifying, or send yourself a code to confirm the address now."}
        </p>
      )}
    </div>
  );
}
