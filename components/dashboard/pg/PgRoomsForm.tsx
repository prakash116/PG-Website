"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { BedDouble } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BEDS_PER_ROOM,
  ROOM_TYPE_LABELS,
  type PgDetail,
  type RoomType,
  type RoomTypeInput,
} from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { EditorDialog } from "./EditorDialog";

interface PgRoomsFormProps {
  pg: PgDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoomRow {
  offered: boolean;
  roomCount: string;
  pricePerBed: string;
  availableBeds: string;
}

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];

function toRows(pg: PgDetail): Record<RoomType, RoomRow> {
  const rows = {} as Record<RoomType, RoomRow>;

  for (const type of ROOM_TYPES) {
    const existing = pg.roomTypes.find((room) => room.type === type);

    rows[type] = {
      offered: Boolean(existing),
      roomCount: existing ? String(existing.roomCount) : "",
      pricePerBed: existing ? String(existing.pricePerBed) : "",
      availableBeds: existing ? String(existing.availableBeds) : "",
    };
  }

  return rows;
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function PgRoomsForm({ pg, open, onOpenChange }: PgRoomsFormProps) {
  const [rows, setRows] = useState(() => toRows(pg));
  const isSaving = usePgStore((state) => state.isSaving);
  const saveRooms = usePgStore((state) => state.saveRooms);

  function setRow(type: RoomType, patch: Partial<RoomRow>) {
    setRows((previous) => ({
      ...previous,
      [type]: { ...previous[type], ...patch },
    }));
  }

  function handleOpenChange(next: boolean) {
    if (!next) setRows(toRows(pg));
    onOpenChange(next);
  }

  async function handleSave() {
    const offered = ROOM_TYPES.filter((type) => rows[type].offered);
    const payload: RoomTypeInput[] = [];

    for (const type of offered) {
      const row = rows[type];
      const roomCount = Number(row.roomCount || 0);
      const pricePerBed = Number(row.pricePerBed || 0);
      const availableBeds = Number(row.availableBeds || 0);
      const capacity = roomCount * BEDS_PER_ROOM[type];

      if (roomCount < 1) {
        toast.error(`${ROOM_TYPE_LABELS[type]}: enter how many rooms you have.`);
        return;
      }

      if (pricePerBed < 1) {
        toast.error(`${ROOM_TYPE_LABELS[type]}: enter the rent per bed.`);
        return;
      }

      if (availableBeds > capacity) {
        toast.error(
          `${ROOM_TYPE_LABELS[type]}: ${availableBeds} free beds is more than the ${capacity} these rooms hold.`
        );
        return;
      }

      payload.push({ type, roomCount, pricePerBed, availableBeds });
    }

    try {
      await saveRooms(payload);
      toast.success("Rooms saved.");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Rooms & pricing"
      description="Tick the room types you offer, then set the count, rent and free beds."
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid gap-3">
        {ROOM_TYPES.map((type) => {
          const row = rows[type];
          const capacity = Number(row.roomCount || 0) * BEDS_PER_ROOM[type];

          return (
            <section
              key={type}
              className={cn(
                "rounded-2xl border p-4 transition-colors",
                row.offered ? "border-primary/40 bg-accent/30" : "bg-card"
              )}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={row.offered}
                  onCheckedChange={(checked) =>
                    setRow(type, { offered: checked === true })
                  }
                />
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <BedDouble className="size-4 text-muted-foreground" />
                  {ROOM_TYPE_LABELS[type]}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {BEDS_PER_ROOM[type]} bed
                  {BEDS_PER_ROOM[type] > 1 ? "s" : ""} per room
                </span>
              </label>

              {row.offered && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`rooms-${type}`}
                      className="text-xs text-muted-foreground"
                    >
                      Rooms
                    </Label>
                    <Input
                      id={`rooms-${type}`}
                      inputMode="numeric"
                      value={row.roomCount}
                      onChange={(event) =>
                        setRow(type, { roomCount: digitsOnly(event.target.value) })
                      }
                      placeholder="6"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`price-${type}`}
                      className="text-xs text-muted-foreground"
                    >
                      ₹ per bed
                    </Label>
                    <Input
                      id={`price-${type}`}
                      inputMode="numeric"
                      value={row.pricePerBed}
                      onChange={(event) =>
                        setRow(type, {
                          pricePerBed: digitsOnly(event.target.value),
                        })
                      }
                      placeholder="9800"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`free-${type}`}
                      className="text-xs text-muted-foreground"
                    >
                      Free beds
                    </Label>
                    <Input
                      id={`free-${type}`}
                      inputMode="numeric"
                      value={row.availableBeds}
                      onChange={(event) =>
                        setRow(type, {
                          availableBeds: digitsOnly(event.target.value),
                        })
                      }
                      placeholder="4"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground sm:col-span-3">
                    {capacity > 0
                      ? `Holds ${capacity} bed${capacity > 1 ? "s" : ""} in total.`
                      : "Enter a room count to see the total beds."}
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </EditorDialog>
  );
}
