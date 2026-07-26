"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Lock, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handlePhoneSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    toast.success(`OTP sent to +91 ${phone}. (Demo — authentication coming soon!)`);
  }

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    toast.success("Welcome back! (Demo — authentication coming soon!)");
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="phone" className="w-full">
        <TabsList className="h-12 w-full rounded-full bg-secondary p-1.5">
          <TabsTrigger value="phone" className="h-full flex-1 rounded-full text-sm">
            <Smartphone className="size-4" />
            Phone
          </TabsTrigger>
          <TabsTrigger value="email" className="h-full flex-1 rounded-full text-sm">
            <Mail className="size-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone" className="mt-6">
          <form onSubmit={handlePhoneSubmit} noValidate className="space-y-4">
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
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="98100 12345"
                  autoComplete="tel-national"
                  className="h-12 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" className="h-12 w-full rounded-full text-[15px] font-semibold">
              Send OTP
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="current-password"
                  className="h-12 rounded-xl px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
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
            <Button type="submit" className="h-12 w-full rounded-full text-[15px] font-semibold">
              Continue
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative my-6">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs font-medium text-muted-foreground">
          or continue with
        </span>
      </div>

      <Button
        variant="outline"
        onClick={() => toast("Google sign-in coming soon!", { icon: "🚀" })}
        className="h-12 w-full rounded-full text-[15px] font-semibold"
      >
        <FcGoogle className="size-5" data-icon="inline-start" />
        Google
      </Button>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to Pzzee&apos;s Terms of Service and Privacy
        Policy. New here? An account is created automatically on first login.
      </p>
    </div>
  );
}
