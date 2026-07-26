"use client";

import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa6";
import { CalendarCheck, Clock, Phone, ShieldCheck } from "lucide-react";
import type { PG } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ContactCard({ pg }: { pg: PG }) {
  const whatsappHref = `https://wa.me/${pg.owner.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi, I found ${pg.name} (${pg.location}, ${pg.city}) on Pzzee and would like to know more.`
  )}`;

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-[0_8px_32px_rgb(2_6_23/0.06)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Starting from
          </p>
          <p className="font-display text-3xl font-extrabold text-foreground">
            {formatINR(pg.price)}
            <span className="text-sm font-medium text-muted-foreground">
              /month
            </span>
          </p>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          Deposit
          <span className="block text-sm font-semibold text-foreground">
            {formatINR(pg.deposit)}
          </span>
        </p>
      </div>

      <Separator className="my-5" />

      {/* Owner */}
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground">
          {pg.owner.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {pg.owner.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {pg.owner.role} · {pg.owner.responseTime}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <Button
          onClick={() =>
            toast.success(
              "Visit request sent! The property will confirm your slot shortly."
            )
          }
          className="h-12 w-full rounded-full text-[15px] font-semibold"
        >
          <CalendarCheck className="size-4.5" data-icon="inline-start" />
          Book a Visit
        </Button>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            render={<a href={`tel:${pg.owner.phone}`} />}
            className="h-11 rounded-full font-semibold"
          >
            <Phone className="size-4" data-icon="inline-start" />
            Call
          </Button>
          <Button
            render={
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="h-11 rounded-full bg-[#25D366] font-semibold text-white hover:bg-[#1fb457]"
          >
            <FaWhatsapp className="size-4.5" data-icon="inline-start" />
            WhatsApp
          </Button>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" />
        Zero brokerage · Free assistance · Verified owner
      </p>
    </div>
  );
}
