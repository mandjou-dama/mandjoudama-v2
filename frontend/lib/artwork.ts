/** Lower-case, no accents, no "(feat. …)" or "[…]", punctuation folded to single spaces. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type ItunesResult = { trackName?: string; collectionName?: string; artistName?: string; artworkUrl100?: string };

async function search(params: Record<string, string>): Promise<ItunesResult[]> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?${new URLSearchParams(params)}`);
    if (!res.ok) return [];
    return ((await res.json()) as { results?: ItunesResult[] }).results ?? [];
  } catch {
    return [];
  }
}

/**
 * Finds a song's cover in Apple's public catalog (iTunes Search API, no key).
 * Only an exact title (or album) and artist match counts, so a wrong cover is never shown.
 */
export async function findArtwork({ title, artist, album }: { title: string; artist: string; album?: string }) {
  const wantTitle = normalize(title);
  const wantArtist = normalize(artist);
  const wantAlbum = album ? normalize(album) : "";
  const byArtist = (r: ItunesResult) => normalize(r.artistName ?? "").includes(wantArtist);

  for (const country of ["fr", "us"]) {
    const songs = await search({ term: `${artist} ${title}`, entity: "song", limit: "25", country });
    let hit = songs.find((r) => normalize(r.trackName ?? "") === wantTitle && byArtist(r));
    if (!hit && wantAlbum) {
      const albums = await search({ term: `${artist} ${album}`, entity: "album", limit: "25", country });
      hit = albums.find((r) => normalize(r.collectionName ?? "") === wantAlbum && byArtist(r));
    }
    if (hit?.artworkUrl100) return hit.artworkUrl100.replace("100x100bb", "600x600bb");
  }
  return null;
}
