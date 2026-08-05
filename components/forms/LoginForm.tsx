"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoleDestination } from "@/lib/auth/roles";
import { useAuthStore } from "@/stores/auth-store";

type LoginMode = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);

  function clearLoginError() {
    if (error) clearError();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const identifier = mode === "email" ? email.trim().toLowerCase() : phone;

    if (
      mode === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    ) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (mode === "phone" && !/^[6-9]\d{9}$/.test(identifier)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      const response = await login({ identifier, password });
      toast.success(response.message);
      router.replace(getRoleDestination(response.data.user.role));
    } catch (requestError: unknown) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Login failed. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-5">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as LoginMode);
          clearLoginError();
        }}
        className="w-full"
      >
        <TabsList className="h-12 w-full rounded-full bg-secondary p-1.5">
          <TabsTrigger
            value="email"
            className="h-full flex-1 rounded-full text-sm"
          >
            <Mail className="size-4" />
            Email
          </TabsTrigger>
          <TabsTrigger
            value="phone"
            className="h-full flex-1 rounded-full text-sm"
          >
            <Smartphone className="size-4" />
            Phone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearLoginError();
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 rounded-xl"
            />
          </div>
        </TabsContent>

        <TabsContent value="phone" className="mt-6">
          <div className="space-y-2">
            <Label htmlFor="login-phone">Mobile Number</Label>
            <div className="flex overflow-hidden rounded-xl border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="flex items-center border-r bg-secondary px-3.5 text-sm font-semibold text-secondary-foreground">
                +91
              </span>
              <Input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => {
                  setPhone(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  );
                  clearLoginError();
                }}
                placeholder="98765 43210"
                autoComplete="tel-national"
                className="h-12 flex-1 rounded-none border-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearLoginError();
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-12 rounded-xl px-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoggingIn}
        className="h-12 w-full rounded-full text-[15px] font-semibold"
      >
        {isLoggingIn && <LoaderCircle className="size-4 animate-spin" />}
        {isLoggingIn ? "Signing in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to Pzzee?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-ink hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
