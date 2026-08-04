import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-svh flex-col items-center justify-center py-32 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
        <Compass className="size-8" />
      </span>
      <p className="mt-6 font-display text-6xl font-extrabold tracking-tight text-brand-ink sm:text-7xl">
        404
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
        This room doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for has moved out. Let&apos;s get you back to a
        place that feels like home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          render={<Link href="/" />}
          className="h-12 rounded-full px-7 font-semibold"
        >
          Back to Home
        </Button>
        <Button
          variant="outline"
          render={<Link href="/pg" />}
          className="h-12 rounded-full px-7 font-semibold"
        >
          Browse PGs
        </Button>
      </div>
    </div>
  );
}
