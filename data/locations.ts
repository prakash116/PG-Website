import type { CityLocation } from "@/lib/types";

const u = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

export const locations: CityLocation[] = [
  {
    id: "loc-delhi",
    name: "Delhi",
    image: u("photo-1587474260584-136574528ed5"),
    pgCount: "220+ PGs",
    startingPrice: 5500,
  },
  {
    id: "loc-gurugram",
    name: "Gurugram",
    image: u("photo-1562979314-bee7453e911c"),
    pgCount: "120+ PGs",
    startingPrice: 6500,
  },
  {
    id: "loc-noida",
    name: "Noida",
    image: u("photo-1486406146926-c627a92ad1ab"),
    pgCount: "95+ PGs",
    startingPrice: 6000,
  },
  {
    id: "loc-bengaluru",
    name: "Bengaluru",
    image: u("photo-1596176530529-78163a4f7af2"),
    pgCount: "310+ PGs",
    startingPrice: 7000,
  },
  {
    id: "loc-pune",
    name: "Pune",
    image: u("photo-1449824913935-59a10b8d2000"),
    pgCount: "140+ PGs",
    startingPrice: 4800,
  },
  {
    id: "loc-mumbai",
    name: "Mumbai",
    image: u("photo-1529253355930-ddbe423a2ac7"),
    pgCount: "180+ PGs",
    startingPrice: 9000,
  },
];
