import { timingSafeEqual } from "node:crypto";

import { findArtwork } from "@/lib/artwork";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ROW_ID = "now_playing";
const BUCKET = "now-playing";
const MAX_ARTWORK_BYTES = 5 * 1024 * 1024;

/** Bearer token check against NOW_PLAYING_TOKEN, in constant time. */
function authorized(request: Request) {
  const token = process.env.NOW_PLAYING_TOKEN;
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

const field = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim().slice(0, 200) : "");

const fail = (status: number, error: string) => Response.json({ error }, { status });

/**
 * Called by the "Get Current Song" shortcut with `Authorization: Bearer <NOW_PLAYING_TOKEN>` and a
 * multipart form: title, artist, album and, optionally, artwork (the cover image from the Music
 * library). A new track's cover goes to the public `now-playing` bucket; without an image it is
 * looked up in Apple's catalog. The same track again only refreshes `updated_at`, which the site
 * uses to tell "Listening now" from "Last played", so the shortcut can run every minute.
 */
export async function POST(request: Request) {
  if (!authorized(request)) return fail(401, "Unauthorized");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Expected a multipart/form-data body");
  }

  const title = field(form.get("title"));
  const artist = field(form.get("artist"));
  const album = field(form.get("album"));
  if (!title || !artist) return fail(400, "title and artist are required");

  const db = supabaseAdmin();
  const { data: current } = await db.from("now_playing").select("title, artist, artwork").eq("id", ROW_ID).maybeSingle();

  let artwork: string = current?.title === title && current?.artist === artist ? (current.artwork ?? "") : "";

  if (!artwork) {
    const file = form.get("artwork");
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) return fail(400, "artwork must be an image");
      if (file.size > MAX_ARTWORK_BYTES) return fail(413, "artwork is larger than 5 MB");
      const { error } = await db.storage
        .from(BUCKET)
        .upload("cover", file, { contentType: file.type, upsert: true, cacheControl: "60" });
      if (error) return fail(500, `Upload failed: ${error.message}`);
      // One file, overwritten per track; the version query keeps browsers and the CDN from serving the old one.
      artwork = `${db.storage.from(BUCKET).getPublicUrl("cover").data.publicUrl}?v=${Date.now()}`;
    } else {
      artwork = (await findArtwork({ title, artist, album })) ?? "";
    }
  }

  const { error } = await db
    .from("now_playing")
    .upsert({ id: ROW_ID, title, artist, album, artwork, updated_at: new Date().toISOString() });
  if (error) return fail(500, `Update failed: ${error.message}`);

  return Response.json({ ok: true, title, artist, artwork });
}
