import {
  BedDouble,
  Building2,
  ChartNoAxesColumn,
  CreditCard,
  LayoutDashboard,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface OwnerNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** Sections whose data source is not built yet. */
  isPreview?: boolean;
}

export const OWNER_NAV: OwnerNavItem[] = [
  {
    label: "Overview",
    href: "/pg-owner/dashboard",
    icon: LayoutDashboard,
    description: "Your PG at a glance",
  },
  {
    label: "Analytics",
    href: "/pg-owner/analytics",
    icon: ChartNoAxesColumn,
    description: "Occupancy and earnings",
    isPreview: true,
  },
  {
    label: "PG Info",
    href: "/pg-owner/pg-info",
    icon: Building2,
    description: "Property details and photos",
  },
  {
    label: "Room management",
    href: "/pg-owner/rooms",
    icon: BedDouble,
    description: "Room types, rent and beds",
  },
  {
    label: "CRM",
    href: "/pg-owner/crm",
    icon: UsersRound,
    description: "Guests, dues and collections",
    isPreview: true,
  },
  {
    label: "Payments",
    href: "/pg-owner/payments",
    icon: CreditCard,
    description: "Payment gateway and payouts",
    isPreview: true,
  },
  {
    label: "Customers",
    href: "/pg-owner/customers",
    icon: Users,
    description: "Visits, ratings and queries",
    isPreview: true,
  },
  {
    label: "Settings",
    href: "/pg-owner/settings",
    icon: Settings,
    description: "Account and preferences",
  },
];
