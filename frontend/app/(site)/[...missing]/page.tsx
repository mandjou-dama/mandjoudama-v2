import { notFound } from "next/navigation";

// The app has two root layouts (the site and /keystatic), so an unmatched URL would get Next's bare 404.
// Catching it here renders the 404 inside the site's layout instead.
export default function Missing() {
  notFound();
}
