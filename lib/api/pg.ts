import { apiRequest } from "@/lib/api/client";

export type PgGender = "BOYS" | "GIRLS" | "CO_LIVING";
export type Cooling = "AC" | "NON_AC" | "BOTH";
export type RoomType = "SINGLE" | "DOUBLE" | "TRIPLE" | "PREMIUM";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface PgRoomTypeDetail {
  type: RoomType;
  roomCount: number;
  pricePerBed: number;
  /** Derived by the API from roomCount. */
  totalBeds: number;
  availableBeds: number;
  /** Four fixed photo slots. Null only on rows created before photos existed. */
  roomImage1: string | null;
  roomImage2: string | null;
  bathroomImage: string | null;
  otherImage: string | null;
}

export interface PgTotals {
  rooms: number;
  beds: number;
  availableBeds: number;
  isAvailable: boolean;
}

export interface PgCompletion {
  percent: number;
  /** Human-readable names of the sections still to fill in. */
  missing: string[];
}

export interface PgDetail {
  id: string;
  pgCode: string;
  name: string;
  location: string;
  city: string | null;
  description: string | null;
  price: number | null;
  deposit: number | null;
  gender: PgGender | null;
  cooling: Cooling | null;
  foodIncluded: boolean;
  foodDetails: string | null;
  /** Square brand mark for the PG. */
  logo: string | null;
  amenities: string[];
  images: string[];
  /** Set by a Super Admin; owners cannot change it. */
  verification: VerificationStatus;
  verified: boolean;
  rating: number;
  reviewCount: number;
  roomTypes: PgRoomTypeDetail[];
  totals: PgTotals;
  completion: PgCompletion;
  updatedAt: string;
}

export interface PgResponse {
  success: true;
  message: string;
  data: PgDetail;
}

/** Every field is optional: the dashboard saves one section at a time. */
export interface UpdatePgPayload {
  name?: string;
  location?: string;
  city?: string;
  description?: string;
  price?: number;
  deposit?: number;
  gender?: PgGender;
  cooling?: Cooling;
  foodIncluded?: boolean;
  foodDetails?: string;
  /** Send an empty string to remove the current logo. */
  logo?: string;
  amenities?: string[];
  images?: string[];
}

export interface RoomTypeInput {
  type: RoomType;
  roomCount: number;
  pricePerBed: number;
  availableBeds: number;
  roomImage1: string;
  roomImage2: string;
  bathroomImage: string;
  otherImage: string;
}

/** The four photo slots, in the order they are shown to the owner. */
export const ROOM_IMAGE_SLOTS = [
  { key: 'roomImage1', label: 'Room photo 1' },
  { key: 'roomImage2', label: 'Room photo 2' },
  { key: 'bathroomImage', label: 'Bathroom' },
  { key: 'otherImage', label: 'Kitchen or other' },
] as const;

export type RoomImageSlot = (typeof ROOM_IMAGE_SLOTS)[number]['key'];

/** How many beds each room type holds. Mirrors the API, for live previews. */
export const BEDS_PER_ROOM: Record<RoomType, number> = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  PREMIUM: 1,
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SINGLE: "Single sharing",
  DOUBLE: "Double sharing",
  TRIPLE: "Triple sharing",
  PREMIUM: "Premium",
};

export const PG_GENDER_LABELS: Record<PgGender, string> = {
  BOYS: "Boys",
  GIRLS: "Girls",
  CO_LIVING: "Co-living",
};

export const COOLING_LABELS: Record<Cooling, string> = {
  AC: "AC",
  NON_AC: "Non-AC",
  BOTH: "Both",
};

/** The amenities offered as quick picks; owners are not limited to these. */
export const AMENITY_OPTIONS = [
  "WiFi",
  "Laundry",
  "Parking",
  "Power Backup",
  "CCTV",
  "Housekeeping",
  "Attached Bathroom",
  "Hot Water",
  "Study Desk",
  "Common TV",
  "Gym",
  "Lift",
] as const;

/** The signed-in owner's PG. The API resolves the owner from the session. */
export function fetchMyPg(): Promise<PgResponse> {
  return apiRequest<PgResponse>("/v1/pg/me");
}

export function updateMyPg(payload: UpdatePgPayload): Promise<PgResponse> {
  return apiRequest<PgResponse>("/v1/pg/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** Sends the full set; a type left out is removed. */
export function replaceRooms(rooms: RoomTypeInput[]): Promise<PgResponse> {
  return apiRequest<PgResponse>("/v1/pg/me/rooms", {
    method: "PUT",
    body: JSON.stringify({ rooms }),
  });
}

export function updateAvailability(
  type: RoomType,
  availableBeds: number
): Promise<PgResponse> {
  return apiRequest<PgResponse>(`/v1/pg/me/rooms/${type}`, {
    method: "PATCH",
    body: JSON.stringify({ availableBeds }),
  });
}

/** Uploads one PG photo and returns its URL, to add to `images`. */
export async function uploadPgImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await apiRequest<{ data: { url: string } }>(
    "/v1/uploads/pg-image",
    { method: "POST", body }
  );

  return response.data.url;
}

/** Uploads one room-type photo and returns its URL. */
export async function uploadRoomImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await apiRequest<{ data: { url: string } }>(
    "/v1/uploads/room-image",
    { method: "POST", body }
  );

  return response.data.url;
}

/** Uploads a PG logo and returns its URL. */
export async function uploadPgLogo(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await apiRequest<{ data: { url: string } }>(
    "/v1/uploads/logo-image",
    { method: "POST", body }
  );

  return response.data.url;
}
