import {
  BadgeIndianRupee,
  Building2,
  ChartNoAxesColumn,
  Headset,
  LayoutDashboard,
  Phone,
  Settings,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import type { OwnerNavItem } from "@/components/owner/owner-nav";

/**
 * The Super Admin sidebar. Shares `OwnerNavItem` with the PG owner's nav so one
 * sidebar component renders both — `isPreview` marks the screens that are
 * designed but have no data source yet, and the sidebar already knows how to
 * badge those.
 */
export const ADMIN_NAV: OwnerNavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "The platform at a glance",
    isPreview: true,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: ChartNoAxesColumn,
    description: "Growth, occupancy and revenue",
    isPreview: true,
  },
  {
    label: "PG Details",
    href: "/admin/pg-details",
    icon: Building2,
    description: "Every listing on Pzee",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    description: "Every account on the platform",
  },
  {
    label: "Payment",
    href: "/admin/payment",
    icon: BadgeIndianRupee,
    description: "Listing fees and payouts",
  },
  {
    label: "Contact Details",
    href: "/admin/contact-details",
    icon: Phone,
    description: "Messages from the Contact Us page",
  },
  {
    label: "Customer Rating Details",
    href: "/admin/ratings",
    icon: Star,
    description: "Reviews residents leave",
    isPreview: true,
  },
  {
    label: "PG Support",
    href: "/admin/support",
    icon: Headset,
    description: "Queries raised by owners",
  },
  {
    label: "Subscribe",
    href: "/admin/subscribe",
    icon: Ticket,
    description: "Newsletter sign-ups",
  },
  {
    label: "Setting",
    href: "/admin/settings",
    icon: Settings,
    description: "Email and platform configuration",
  },
];
