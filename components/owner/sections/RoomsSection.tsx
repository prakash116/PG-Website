"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { BedDouble, Info, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BEDS_PER_ROOM,
  ROOM_IMAGE_SLOTS,
  ROOM_TYPE_LABELS,
  type PgDetail,
  type RoomImageSlot,
  type RoomType,
  type RoomTypeInput,
} from "@/lib/api/pg";
import { usePgStore } from "@/stores/pg-store";
import { PageHeader } from "../PageHeader";
import { RoomImageSlots } from "./RoomImageSlots";
import {
  NoPgState,
  PgErrorState,
  PgLoadingState,
  usePgOnce,
} from "./OverviewSection";

interface RoomRow {
  offered: boolean;
  roomCount: string;
  pricePerBed: string;
  /** Empty string means that photo slot is still open. */
  images: Record<RoomImageSlot, string>;
}

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];
const digitsOnly = (value: string) => value.replace(/\D/g, "");

function toRows(pg: PgDetail): Record<RoomType, RoomRow> {
  const rows = {} as Record<RoomType, RoomRow>;

  for (const type of ROOM_TYPES) {
    const existing = pg.roomTypes.find((room) => room.type === type);

    rows[type] = {
      offered: Boolean(existing),
      roomCount: existing ? String(existing.roomCount) : "",
      pricePerBed: existing ? String(existing.pricePerBed) : "",
      images: {
        roomImage1: existing?.roomImage1 ?? "",
        roomImage2: existing?.roomImage2 ?? "",
        bathroomImage: existing?.bathroomImage ?? "",
        otherImage: existing?.otherImage ?? "",
      },
    };
  }

  return rows;
}

/** Loads the PG, then hands it to the form as a prop. */
export function RoomsSection() {
  const { pg, isLoading, hasNoPg, error, load } = usePgOnce();

  if (isLoading && !pg) return <PgLoadingState />;
  if (hasNoPg) return <NoPgState />;
  if (error && !pg) return <PgErrorState message={error} onRetry={load} />;
  if (!pg) return null;

  // Keyed on updatedAt so a save remounts the form with fresh values,
  // rather than syncing state inside an effect.
  return <RoomsForm key={pg.updatedAt} pg={pg} />;
}

function RoomsForm({ pg }: { pg: PgDetail }) {
  const [rows, setRows] = useState<Record<RoomType, RoomRow>>(() => toRows(pg));
  const isSaving = usePgStore((state) => state.isSaving);
  const saveRooms = usePgStore((state) => state.saveRooms);

  function setRow(type: RoomType, patch: Partial<RoomRow>) {
    setRows((previous) => ({
      ...previous,
      [type]: { ...previous[type], ...patch },
    }));
  }

  const totals = ROOM_TYPES.reduce(
    (running, type) => {
      const row = rows[type];
      if (!row.offered) return running;

      const count = Number(row.roomCount || 0);
      return {
        rooms: running.rooms + count,
        beds: running.beds + count * BEDS_PER_ROOM[type],
      };
    },
    { rooms: 0, beds: 0 }
  );

  async function handleSave() {
    const payload: RoomTypeInput[] = [];

    for (const type of ROOM_TYPES) {
      const row = rows[type];
      if (!row.offered) continue;

      const roomCount = Number(row.roomCount || 0);
      const pricePerBed = Number(row.pricePerBed || 0);

      if (roomCount < 1) {
        toast.error(`${ROOM_TYPE_LABELS[type]}: enter how many rooms you have.`);
        return;
      }

      if (pricePerBed < 1) {
        toast.error(`${ROOM_TYPE_LABELS[type]}: enter the rent per bed.`);
        return;
      }

      // Named here rather than left to a server error, so the owner is told
      // which of the four photos is missing before the request goes out.
      const missing = ROOM_IMAGE_SLOTS.find((slot) => !row.images[slot.key]);

      if (missing) {
        toast.error(
          `${ROOM_TYPE_LABELS[type]}: add the ${missing.label.toLowerCase()} photo.`
        );
        return;
      }

      payload.push({ type, pricePerBed, ...row.images });
    }

    try {
      await saveRooms(payload);
      toast.success("Rooms saved.");
    } catch (saveError: unknown) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Could not save."
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Room management"
        description="Room types you offer, their rent, and how many beds are free."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
        className="grid gap-5 pb-24"
      >
        {/* Live totals, so the owner sees the effect before saving. */}
        <section className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Rooms", value: totals.rooms },
            { label: "Beds", value: totals.beds },
          ].map((tile) => (
            <article key={tile.label} className="rounded-2xl border bg-card p-5">
              <p className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </p>
              <p className="mt-1.5 font-display text-3xl font-extrabold">
                {tile.value}
              </p>
            </article>
          ))}
        </section>

        <div className="grid gap-3">
          {ROOM_TYPES.map((type) => {
            const row = rows[type];
            const capacity = Number(row.roomCount || 0) * BEDS_PER_ROOM[type];

            return (
              <section
                key={type}
                className={cn(
                  "rounded-2xl border p-5 transition-colors",
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
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                          setRow(type, {
                            roomCount: digitsOnly(event.target.value),
                          })
                        }
                        placeholder="6"
                        className="h-11 rounded-xl bg-card"
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
                        className="h-11 rounded-xl bg-card"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      {capacity > 0
                        ? `Holds ${capacity} bed${capacity > 1 ? "s" : ""} in total.`
                        : "Enter a room count to see the total beds."}
                    </p>
                  </div>
                )}

                {row.offered && (
                  <RoomImageSlots
                    idPrefix={type.toLowerCase()}
                    values={row.images}
                    onChange={(slot, url) =>
                      setRow(type, { images: { ...row.images, [slot]: url } })
                    }
                  />
                )}
              </section>
            );
          })}
        </div>

        <p className="flex gap-2 rounded-xl border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Free beds are worked out from the guests recorded in the CRM, so there
          is nothing to type here. Add or check out a guest to change them.
        </p>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-4 backdrop-blur-sm lg:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
            <p className="mr-auto hidden text-[13px] text-muted-foreground sm:block">
              Unticking a room type removes it when you save.
            </p>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-full px-7 font-semibold"
            >
              {isSaving && <LoaderCircle className="size-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save rooms"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
