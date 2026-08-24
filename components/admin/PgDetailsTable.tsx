"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeIndianRupee,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { PgDetailPanel } from "@/components/admin/PgDetailPanel";
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
import { ApiError } from "@/lib/api/client";
import {
  deleteAdminPg,
  fetchAdminPgs,
  updateAdminPg,
  type AdminPgSummary,
} from "@/lib/api/admin-pg";
import { useCachedResource } from "@/stores/resource-cache";
import { cn } from "@/lib/utils";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type StatusFilter = "ALL" | "LIVE" | "HIDDEN" | "UNVERIFIED" | "DUE";

const TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "DUE", label: "Fee due" },
];

function matches(pg: AdminPgSummary, filter: StatusFilter): boolean {
  switch (filter) {
    case "LIVE":
      return pg.isPublished;
    case "HIDDEN":
      return !pg.isPublished;
    case "UNVERIFIED":
      return pg.verification !== "VERIFIED";
    case "DUE":
      return pg.membership !== "PAID";
    default:
      return true;
  }
}

/** Every PG on the platform, and one of them in full. */
export function PgDetailsTable() {
  const [openPg, setOpenPg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminPgSummary | null>(
    null,
  );

  const {
    data: pgs,
    error,
    set: setPgs,
  } = useCachedResource("admin/pgs", async () => (await fetchAdminPgs()).data);

  async function act(
    pgCode: string,
    run: () => Promise<{ message: string }>,
  ) {
    setBusyCode(pgCode);

    try {
      const result = await run();
      toast.success(result.message);
      setPgs((await fetchAdminPgs()).data);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "That did not work. Try again.",
      );
    } finally {
      setBusyCode(null);
      setPendingDelete(null);
    }
  }

  if (openPg) {
    return <PgDetailPanel pgCode={openPg} onBack={() => setOpenPg(null)} />;
  }

  if (error && !pgs) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!pgs) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-3xl border bg-card">
        <LoaderCircle className="size-6 animate-spin text-brand-ink" />
        <span className="sr-only">Loading PGs</span>
      </div>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = pgs.filter((pg) => {
    if (!matches(pg, filter)) return false;
    if (!needle) return true;

    return [pg.name, pg.pgCode, pg.address, pg.ownerName, pg.ownerPhone]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  // Rent collected across every PG on the platform.
  const platformRevenue = pgs.reduce((total, pg) => total + pg.revenue, 0);

  const tiles = [
    { label: "PGs listed", value: String(pgs.length) },
    {
      label: "Live on the site",
      value: String(pgs.filter((pg) => pg.isPublished).length),
    },
    {
      label: "Verified",
      value: String(pgs.filter((pg) => pg.verification === "VERIFIED").length),
    },
    { label: "Rent collected", value: rupees.format(platformRevenue) },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">
              {tile.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div className="flex w-fit flex-wrap gap-1 rounded-full border bg-background p-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                aria-pressed={filter === tab.value}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  filter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">
                  {pgs.filter((pg) => matches(pg, tab.value)).length}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search PG, code, owner or number"
              aria-label="Search PGs"
              className="h-11 rounded-full pl-10"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No PG matches these filters.
          </p>
        ) : (
          <ul className="divide-y">
            {visible.map((pg) => {
              const isBusy = busyCode === pg.pgCode;
              const isVerified = pg.verification === "VERIFIED";

              return (
                <li key={pg.pgCode} className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    {pg.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pg.logo}
                        alt=""
                        className="size-11 shrink-0 rounded-xl border object-cover"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <Building2 className="size-5" />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setOpenPg(pg.pgCode)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="truncate">{pg.name}</span>
                        <span className="font-mono text-xs font-medium text-muted-foreground">
                          {pg.pgCode}
                        </span>
                        {isVerified && (
                          <ShieldCheck className="size-3.5 text-success" />
                        )}
                        {!pg.isPublished && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                            Hidden
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {pg.address}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {pg.ownerName} · {pg.ownerPhone}
                      </p>
                    </button>

                    <div className="hidden w-36 shrink-0 lg:block">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <BadgeIndianRupee className="size-3.5" />
                        {pg.membership === "PAID"
                          ? "Membership paid"
                          : pg.membership === "PENDING"
                            ? "Fee due"
                            : "Not started"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pg.membershipPaidAt
                          ? formatDate(pg.membershipPaidAt)
                          : `Registered ${formatDate(pg.registeredAt)}`}
                      </p>
                    </div>

                    <div className="hidden w-28 shrink-0 sm:block">
                      <p className="text-xs font-medium text-foreground">
                        {rupees.format(pg.revenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pg.rooms} rooms · {pg.residents} in
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      aria-label={`Open ${pg.name}`}
                      onClick={() => setOpenPg(pg.pgCode)}
                      className="size-10 shrink-0 rounded-full p-0 text-muted-foreground"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={isBusy}
                      onClick={() =>
                        void act(pg.pgCode, () =>
                          updateAdminPg(pg.pgCode, {
                            verification: isVerified ? "PENDING" : "VERIFIED",
                          }),
                        )
                      }
                      className={cn(
                        "h-10 gap-2 rounded-full font-semibold",
                        isVerified &&
                          "border-success/40 text-success hover:bg-success/5 hover:text-success",
                      )}
                    >
                      {isBusy ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="size-4" />
                      )}
                      {isVerified ? "Verified" : "Verify"}
                    </Button>

                    <Button
                      variant="outline"
                      disabled={isBusy}
                      onClick={() =>
                        void act(pg.pgCode, () =>
                          updateAdminPg(pg.pgCode, {
                            isPublished: !pg.isPublished,
                          }),
                        )
                      }
                      className="h-10 gap-2 rounded-full font-semibold"
                    >
                      {pg.isPublished ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      {pg.isPublished ? "Block" : "Unblock"}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setOpenPg(pg.pgCode)}
                      className="h-10 rounded-full px-4 font-semibold text-muted-foreground"
                    >
                      View all detail
                    </Button>

                    <Button
                      variant="ghost"
                      aria-label={`Delete ${pg.name}`}
                      disabled={isBusy}
                      onClick={() => setPendingDelete(pg)}
                      className="ml-auto size-10 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next && busyCode === null) setPendingDelete(null);
        }}
      >
        <DialogContent className="gap-5 rounded-2xl sm:max-w-md">
          <DialogHeader>
            <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" />
            </span>
            <DialogTitle className="font-display text-lg font-bold">
              Delete {pendingDelete?.name}?
            </DialogTitle>
            <DialogDescription>
              This removes the listing along with its rooms, residents,
              services, payments and support queries. It cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {pendingDelete && (
            <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">
                {pendingDelete.rooms} rooms · {pendingDelete.residents}{" "}
                residents · {rupees.format(pendingDelete.revenue)} collected
              </p>
              <p className="mt-2 text-muted-foreground">
                {pendingDelete.ownerName} keeps their account and can register a
                PG again. To stop the listing being found instead, use{" "}
                <span className="font-semibold text-foreground">Block</span>.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={busyCode !== null}
              onClick={() => setPendingDelete(null)}
              className="rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busyCode !== null}
              onClick={() => {
                if (!pendingDelete) return;
                const target = pendingDelete;
                void act(target.pgCode, () => deleteAdminPg(target.pgCode));
              }}
              className="gap-2 rounded-full font-semibold"
            >
              <Trash2 className="size-4" />
              Delete PG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
