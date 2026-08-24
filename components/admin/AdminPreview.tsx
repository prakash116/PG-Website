"use client";

import {
  Building2,
  ChartNoAxesColumn,
  Headset,
  LayoutDashboard,
  Phone,
  Settings,
  Star,
  Ticket,
} from "lucide-react";
import { PageHeader } from "@/components/owner/PageHeader";
import { PreviewSection } from "@/components/owner/PreviewSection";

/**
 * Icons are looked up here rather than passed in.
 *
 * These screens are rendered as `children` of `OwnerShell`, which is a client
 * component, so everything the page hands down has to be serialisable — and a
 * lucide icon is a function. Naming it keeps the pages as server components,
 * which is what lets them export `metadata`.
 */
const ICONS = {
  analytics: ChartNoAxesColumn,
  contact: Phone,
  overview: LayoutDashboard,
  pg: Building2,
  ratings: Star,
  settings: Settings,
  subscribe: Ticket,
  support: Headset,
} as const;

interface AdminPreviewProps {
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  /** What the screen will show once it has a data source. */
  planned: string[];
  /** What has to exist before it can. */
  needs: string;
}

/** Title block plus the shared "designed, not connected yet" panel. */
export function AdminPreview({
  icon,
  title,
  description,
  planned,
  needs,
}: AdminPreviewProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <PreviewSection icon={ICONS[icon]} planned={planned} needs={needs} />
    </>
  );
}
