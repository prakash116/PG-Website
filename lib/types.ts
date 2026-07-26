export type Gender = "Boys" | "Girls" | "Co-Living";

export type Occupancy = "Single" | "Double" | "Triple" | "Premium";

export interface RoomOption {
  type: Occupancy;
  price: number;
  availableBeds: number;
}

export interface Owner {
  name: string;
  role: "Owner" | "Manager";
  phone: string;
  responseTime: string;
}

export interface PG {
  id: string;
  slug: string;
  name: string;
  location: string;
  city: string;
  price: number;
  deposit: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  gender: Gender;
  distance: string;
  images: string[];
  amenities: string[];
  roomTypes: RoomOption[];
  availableBeds: number;
  description: string;
  foodIncluded: boolean;
  foodDetails: string;
  houseRules: string[];
  nearby: string[];
  coordinates: { lat: number; lng: number };
  owner: Owner;
}

export interface RoomCategory {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  amenities: string[];
  availableBeds: number;
  occupancy: Occupancy;
}

export interface CityLocation {
  id: string;
  name: string;
  image: string;
  pgCount: string;
  startingPrice: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: number;
  review: string;
  avatar: string;
  featured?: boolean;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}
