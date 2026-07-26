import type { RoomCategory } from "@/lib/types";

const u = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

export const roomCategories: RoomCategory[] = [
  {
    id: "room-single",
    name: "Single Room",
    tagline: "Privacy & comfort",
    price: 11000,
    image: u("photo-1505693416388-ac5ce068fe85"),
    amenities: ["Private room", "Study desk", "Wardrobe", "Attached bath"],
    availableBeds: 16,
    occupancy: "Single",
  },
  {
    id: "room-double",
    name: "Double Sharing",
    tagline: "Comfort with affordability",
    price: 7800,
    image: u("photo-1522771739844-6a9f6d5f14af"),
    amenities: ["2 beds", "Shared wardrobe", "Study corner", "Balcony access"],
    availableBeds: 42,
    occupancy: "Double",
  },
  {
    id: "room-triple",
    name: "Triple Sharing",
    tagline: "Best budget-friendly option",
    price: 4800,
    image: u("photo-1555854877-bab0e564b8d5"),
    amenities: ["3 beds", "Lockers", "Shared study hall", "Daily cleaning"],
    availableBeds: 58,
    occupancy: "Triple",
  },
  {
    id: "room-premium",
    name: "Premium Room",
    tagline: "Upgrade your everyday living",
    price: 16500,
    image: u("photo-1631049307264-da0ec9d70304"),
    amenities: ["King bed", "AC + smart TV", "Mini fridge", "Housekeeping"],
    availableBeds: 7,
    occupancy: "Premium",
  },
];
