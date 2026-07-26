"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { BedDouble } from "lucide-react";
import type { RoomOption } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";

const ROOM_LABELS: Record<RoomOption["type"], string> = {
  Single: "Single Room",
  Double: "Double Sharing",
  Triple: "Triple Sharing",
  Premium: "Premium Room",
};

interface RoomCardProps {
  room: RoomOption;
  image: string;
  pgName: string;
}

export function RoomCard({ room, image, pgName }: RoomCardProps) {
  const soldOut = room.availableBeds === 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32">
        <Image
          src={image}
          alt={`${ROOM_LABELS[room.type]} at ${pgName}`}
          fill
          sizes="(max-width: 640px) 100vw, 128px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="font-display text-base font-bold text-foreground">
          {ROOM_LABELS[room.type]}
        </h4>
        <p
          className={
            soldOut
              ? "mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive"
              : "mt-1 flex items-center gap-1.5 text-xs font-medium text-success"
          }
        >
          <BedDouble className="size-3.5" />
          {soldOut ? "Currently full" : `${room.availableBeds} beds available`}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <p className="font-display text-lg font-extrabold text-foreground">
          {formatINR(room.price)}
          <span className="text-xs font-medium text-muted-foreground">
            /month
          </span>
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={soldOut}
          onClick={() =>
            toast.success(
              `${ROOM_LABELS[room.type]} shortlisted — book a visit to confirm availability.`
            )
          }
          className="h-9 rounded-full px-4 font-semibold"
        >
          {soldOut ? "Full" : "Shortlist"}
        </Button>
      </div>
    </div>
  );
}
