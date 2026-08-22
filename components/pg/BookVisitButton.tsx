"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CalendarCheck, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookVisit, type Visit } from "@/lib/api/visits";
import { useAuthStore } from "@/stores/auth-store";

interface BookVisitButtonProps {
  /** The PG being booked. Absent on demo listings that have no owner yet. */
  pgCode?: string;
  pgName: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function BookVisitButton({ pgCode, pgName }: BookVisitButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [booked, setBooked] = useState<Visit | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  function handleClick() {
    // Booking sends the customer's details to the owner, so an account is
    // required. Send them to sign in and back here afterwards.
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!pgCode) {
      toast.error(
        "This is a sample listing, so it cannot take bookings yet."
      );
      return;
    }

    setOpen(true);
  }

  async function handleBook() {
    if (!pgCode) return;

    setIsBooking(true);

    try {
      setBooked(
        await bookVisit({
          pgCode,
          ...(preferredDate && { preferredDate }),
          ...(message.trim() && { message: message.trim() }),
        })
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not book the visit."
      );
    } finally {
      setIsBooking(false);
    }
  }

  function close() {
    setOpen(false);
    // Reset only after closing, so the confirmation stays readable meanwhile.
    setTimeout(() => {
      setBooked(null);
      setPreferredDate("");
      setMessage("");
    }, 200);
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className="h-12 w-full rounded-full text-[15px] font-semibold"
      >
        <CalendarCheck className="size-4.5" data-icon="inline-start" />
        Book a Visit
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
          {booked ? (
            <div className="py-2 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/15">
                <CheckCircle2 className="size-8 text-success" />
              </span>
              <DialogTitle className="mt-4 font-display text-xl font-bold">
                Visit booked
              </DialogTitle>
              <DialogDescription className="mt-2">
                {booked.pgName} has your request. Your name and number have been
                sent to the owner, and they will confirm your slot.
              </DialogDescription>

              <dl className="mt-5 grid gap-2 rounded-xl bg-secondary/50 p-4 text-left text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">PG ID</dt>
                  <dd className="font-display font-extrabold tracking-wider text-brand-ink">
                    {booked.pgCode}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Booked as</dt>
                  <dd className="font-semibold">{booked.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="font-semibold">{booked.phone}</dd>
                </div>
                {booked.preferredDate && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Preferred date</dt>
                    <dd className="font-semibold">
                      {new Date(booked.preferredDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              <Button
                type="button"
                onClick={close}
                className="mt-5 h-11 w-full rounded-full font-semibold"
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-bold">
                  Book a visit
                </DialogTitle>
                <DialogDescription>
                  {pgName} will get your name and number so they can confirm.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {user && (
                  <p className="rounded-xl bg-secondary/50 px-4 py-3 text-[13px] text-muted-foreground">
                    Booking as{" "}
                    <span className="font-semibold text-foreground">
                      {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                    </span>{" "}
                    · {user.phone}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="visit-date">Preferred date</Label>
                  <Input
                    id="visit-date"
                    type="date"
                    min={today()}
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit-message">Anything to add</Label>
                  <Textarea
                    id="visit-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Weekend viewing would suit me better."
                    rows={3}
                    maxLength={500}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBooking}
                  onClick={close}
                  className="rounded-full font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isBooking}
                  onClick={handleBook}
                  className="rounded-full font-semibold"
                >
                  {isBooking && <LoaderCircle className="size-4 animate-spin" />}
                  {isBooking ? "Booking..." : "Confirm booking"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
