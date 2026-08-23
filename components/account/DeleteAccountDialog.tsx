"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle, TriangleAlert } from "lucide-react";
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
import { ApiError } from "@/lib/api/client";
import { deleteOwnAccount } from "@/lib/api/account";
import { useAuthStore } from "@/stores/auth-store";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Typed back by the account holder to confirm they mean it. */
  email: string;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  email,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [typed, setTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deleting an account is not something to do by muscle memory, so the button
  // stays disabled until they have written out their own address.
  const confirmed = typed.trim().toLowerCase() === email.toLowerCase();

  function close(next: boolean) {
    if (isDeleting) return;
    if (!next) {
      setTyped("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleDelete() {
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await deleteOwnAccount();

      // The API has already cleared the cookie; this clears the local session.
      await logout();

      toast.success(response.message);
      router.replace("/");
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Could not delete your account. Try again.";

      setError(message);
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" />
          </span>
          <DialogTitle className="font-display text-lg font-bold">
            Delete your account?
          </DialogTitle>
          <DialogDescription>
            You will be signed out straight away and will not be able to sign
            back in. We keep your account for 30 days in case you change your
            mind — after that it is gone for good.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          Your PG owner keeps your guest record and payment history. Ask them to
          remove you if you are moving out.
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmEmail">
            Type <span className="font-semibold text-foreground">{email}</span>{" "}
            to confirm
          </Label>
          <Input
            id="confirmEmail"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            placeholder={email}
            className="h-11 rounded-xl"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => close(false)}
            className="rounded-full font-semibold"
          >
            Keep my account
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!confirmed || isDeleting}
            onClick={() => void handleDelete()}
            className="gap-2 rounded-full font-semibold"
          >
            {isDeleting && <LoaderCircle className="size-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
