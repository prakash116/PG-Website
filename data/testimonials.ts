import type { Review, Testimonial } from "@/lib/types";

export const testimonials: Testimonial[] = [
  {
    id: "t-01",
    name: "Ananya Sharma",
    role: "Student, Delhi University",
    city: "Delhi",
    rating: 5,
    review:
      "I shifted cities for college and found my PG on Pzzee in two days. The photos matched exactly what I saw during the visit — that almost never happens.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    featured: true,
  },
  {
    id: "t-02",
    name: "Karthik Rao",
    role: "Software Engineer",
    city: "Bengaluru",
    rating: 5,
    review:
      "The budget filter is brilliant. I set my range, compared three verified PGs near my office and moved in the same week. Zero brokers, zero drama.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "t-03",
    name: "Sneha Patil",
    role: "Working Professional",
    city: "Pune",
    rating: 4,
    review:
      "As someone who's been burned by fake listings before, the Pzzee Verified badge is the reason I trust this platform. Details were checked and accurate.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "t-04",
    name: "Mohammed Faiz",
    role: "MBA Student",
    city: "Mumbai",
    rating: 5,
    review:
      "Connected with the PG owner directly through the app, booked a visit for the same evening, and finalised my room before dinner. Smoothest house-hunt ever.",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    featured: true,
  },
];

export const sampleReviews: Review[] = [
  {
    id: "r-01",
    name: "Aditya Verma",
    rating: 5,
    date: "March 2026",
    comment:
      "Clean rooms, on-time food and a very responsive manager. The room matched the listing photos exactly.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: "r-02",
    name: "Ritika Singh",
    rating: 4,
    date: "January 2026",
    comment:
      "Great location and the WiFi is genuinely fast. Weekend food menu could be better, but overall worth the rent.",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: "r-03",
    name: "Joel Mathew",
    rating: 5,
    date: "November 2025",
    comment:
      "Moved in within a week of my visit. Housekeeping is regular and the common areas are always tidy. Recommended.",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
  },
];
