"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  GUEST_GENDER_LABELS,
  USER_TYPE_LABELS,
  type Resident,
} from "@/lib/api/crm";
import type { UserGender, UserType } from "@/lib/api/auth";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/api/pg";
import { useCrmStore } from "@/stores/crm-store";
import { EditorDialog } from "../EditorDialog";

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omitted when adding someone new. */
  guest?: Resident;
  /** Room types with at least one free bed, plus the guest's current one. */
  roomTypeOptions: Array<{ type: RoomType; availableBeds: number }>;
}

interface FormState {
  fullName: string;
  phone: string;
  address: string;
  gender: UserGender | "";
  userType: UserType | "";
  roomType: RoomType | "";
  monthlyRent: string;
  joinedAt: string;
  dueDate: string;
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const dateOnly = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

function toState(guest?: Resident): FormState {
  return {
    fullName: guest?.fullName ?? "",
    phone: guest?.phone ?? "",
    address: guest?.address ?? "",
    gender: guest?.gender ?? "",
    userType: guest?.userType ?? "",
    roomType: guest?.roomType ?? "",
    monthlyRent: guest ? String(guest.monthlyRent) : "",
    joinedAt: dateOnly(guest?.joinedAt ?? null),
    dueDate: dateOnly(guest?.dueDate ?? null),
  };
}

const fieldBox = "space-y-2";
const inputStyle = "h-11 rounded-xl";

export function GuestDialog({
  open,
  onOpenChange,
  guest,
  roomTypeOptions,
}: GuestDialogProps) {
  const [form, setForm] = useState<FormState>(() => toState(guest));
  const isSaving = useCrmStore((state) => state.isSaving);
  const addGuest = useCrmStore((state) => state.addGuest);
  const editGuest = useCrmStore((state) => state.editGuest);

  const isEditing = Boolean(guest);
  const set = (patch: Partial<FormState>) =>
    setForm((previous) => ({ ...previous, ...patch }));

  async function handleSave() {
    if (form.fullName.trim().length < 2) {
      toast.error("Please enter the guest's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!form.roomType) {
      toast.error("Please choose which room type they are staying in.");
      return;
    }

    if (Number(form.monthlyRent || 0) < 1) {
      toast.error("Please enter the rent they pay each month.");
      return;
    }

    const shared = {
      fullName: form.fullName.trim(),
      phone: form.phone,
      address: form.address.trim(),
      roomType: form.roomType,
      monthlyRent: Number(form.monthlyRent),
      ...(form.gender && { gender: form.gender }),
      ...(form.userType && { userType: form.userType }),
      ...(form.dueDate && { dueDate: form.dueDate }),
    };

    try {
      if (guest) {
        await editGuest(guest.id, shared);
        toast.success("Guest updated.");
      } else {
        await addGuest({
          ...shared,
          ...(form.joinedAt && { joinedAt: form.joinedAt }),
        });
        toast.success("Guest added.");
      }

      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit guest" : "Add a guest"}
      description={
        isEditing
          ? "Update their details or move them to another room type."
          : "Adding a guest takes a bed in the room type you choose."
      }
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={cn(fieldBox, "sm:col-span-2")}>
          <Label htmlFor="guest-name">Full name</Label>
          <Input
            id="guest-name"
            value={form.fullName}
            onChange={(event) => set({ fullName: event.target.value })}
            placeholder="Ananya Sharma"
            maxLength={100}
            className={inputStyle}
          />
        </div>

        <div className={fieldBox}>
          <Label htmlFor="guest-phone">Mobile number</Label>
          <Input
            id="guest-phone"
            inputMode="numeric"
            value={form.phone}
            onChange={(event) =>
              set({ phone: digitsOnly(event.target.value).slice(0, 10) })
            }
            placeholder="98765 43210"
            className={inputStyle}
          />
          <p className="text-xs text-muted-foreground">
            Links them to their Pzee account if they have one.
          </p>
        </div>

        <div className={fieldBox}>
          <Label htmlFor="guest-rent">Rent per month (₹)</Label>
          <Input
            id="guest-rent"
            inputMode="numeric"
            value={form.monthlyRent}
            onChange={(event) =>
              set({ monthlyRent: digitsOnly(event.target.value) })
            }
            placeholder="9800"
            className={inputStyle}
          />
        </div>

        <div className={fieldBox}>
          <Label htmlFor="guest-room">Room type</Label>
          <Select
            value={form.roomType || null}
            onValueChange={(value) =>
              set({ roomType: (value as RoomType | null) ?? "" })
            }
          >
            <SelectTrigger id="guest-room" className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {roomTypeOptions.map((option) => (
                <SelectItem key={option.type} value={option.type}>
                  {ROOM_TYPE_LABELS[option.type]} — {option.availableBeds} free
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={fieldBox}>
          <Label htmlFor="guest-userType">They are a</Label>
          <Select
            value={form.userType || null}
            onValueChange={(value) =>
              set({ userType: (value as UserType | null) ?? "" })
            }
          >
            <SelectTrigger
              id="guest-userType"
              className="h-11 w-full rounded-xl"
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(USER_TYPE_LABELS) as UserType[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {USER_TYPE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={fieldBox}>
          <Label htmlFor="guest-gender">Gender</Label>
          <Select
            value={form.gender || null}
            onValueChange={(value) =>
              set({ gender: (value as UserGender | null) ?? "" })
            }
          >
            <SelectTrigger id="guest-gender" className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(GUEST_GENDER_LABELS) as UserGender[]).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {GUEST_GENDER_LABELS[value]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {!isEditing && (
          <div className={fieldBox}>
            <Label htmlFor="guest-joined">Moved in</Label>
            <Input
              id="guest-joined"
              type="date"
              value={form.joinedAt}
              onChange={(event) => set({ joinedAt: event.target.value })}
              className={inputStyle}
            />
          </div>
        )}

        <div className={fieldBox}>
          <Label htmlFor="guest-due">Rent due on</Label>
          <Input
            id="guest-due"
            type="date"
            value={form.dueDate}
            onChange={(event) => set({ dueDate: event.target.value })}
            className={inputStyle}
          />
        </div>

        <div className={cn(fieldBox, "sm:col-span-2")}>
          <Label htmlFor="guest-address">Address</Label>
          <Textarea
            id="guest-address"
            value={form.address}
            onChange={(event) => set({ address: event.target.value })}
            placeholder="Home address"
            rows={2}
            maxLength={500}
            className="rounded-xl"
          />
        </div>
      </div>
    </EditorDialog>
  );
}
