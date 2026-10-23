"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import { Music } from "@/app/components/icons";
import { findArtwork } from "@/lib/artwork";
import { supabase } from "@/lib/supabase";
import { useBamakoClock } from "@/lib/useBamakoClock";

import styles from "./Card.module.scss";

type NowPlaying = { title: string; artist: string; album?: string; artwork?: string; updated_at?: string; live: boolean };

/** A track counts as "listening now" if it was reported in the last 15 minutes. */
const LIVE_WINDOW_MS = 15 * 60 * 1000;

const square = { "--ratio": "1 / 1" } as CSSProperties;
const landscape = { "--ratio": "387 / 290" } as CSSProperties;

/**
 * Last track played on Apple Music, from the `now_playing` row in Supabase. When the row has
 * no cover, it is looked up in Apple's public catalog from the title and artist.
 */
function useNowPlaying() {
  const [track, setTrack] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("now_playing")
      .select("title, artist, album, artwork, updated_at")
      .eq("id", "now_playing")
      .single()
      .then(async ({ data }) => {
        if (cancelled || !data?.title) return;
        const updated = data.updated_at ? Date.parse(data.updated_at) : 0;
        const row = { ...data, live: Date.now() - updated < LIVE_WINDOW_MS } as NowPlaying;
        setTrack(row);
        if (!row.artwork) {
          const artwork = await findArtwork(row);
          if (!cancelled && artwork) setTrack({ ...row, artwork });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return track;
}

const statusLabel = (track: NowPlaying | null) =>
  track?.live === false ? "LAST PLAYED · APPLE MUSIC" : "LISTENING NOW · APPLE MUSIC";

function Equalizer() {
  return (
    <span className={styles.eq} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function MusicCard() {
  const track = useNowPlaying();
  const label = track ? `${track.title} — ${track.artist}` : "Apple Music";

  return (
    <article className={styles.card} data-reveal="">
      <div className={styles.media} style={square}>
        <div className={styles.artwork}>
          {track?.artwork ? (
            <Image src={track.artwork} alt={`${track.title} by ${track.artist}`} fill sizes="400px" unoptimized />
          ) : (
            <Music size={44} strokeWidth={1.6} />
          )}
        </div>
      </div>
      <div className={styles.label}>
        <div className={styles.labelInner}>
          <div className={[styles.labelRow, styles.musicRow].join(" ")}>
            <div className={styles.musicText}>
              <h3 className={styles.title}>{label}</h3>
              <span className={styles.musicStatus}>{statusLabel(track)}</span>
            </div>
            {track?.live && <Equalizer />}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Compact "Listening now" row for the About page. */
export function NowPlayingRow() {
  const track = useNowPlaying();
  return (
    <div className={styles.row}>
      <div className={styles.rowArt}>
        {track?.artwork ? (
          <Image src={track.artwork} alt={`${track.title} by ${track.artist}`} fill sizes="52px" unoptimized />
        ) : (
          <Music size={22} strokeWidth={1.8} />
        )}
      </div>
      <div className={styles.rowText}>
        <span className={styles.rowOverline}>{statusLabel(track)}</span>
        <span>
          {track ? (
            <>
              {track.title} <span className={styles.rowArtist}>— {track.artist}</span>
            </>
          ) : (
            "Nothing playing right now"
          )}
        </span>
      </div>
      {track?.live && <Equalizer />}
    </div>
  );
}

export function TimeCard() {
  const clock = useBamakoClock();

  return (
    <article className={styles.card} data-reveal="">
      <div className={[styles.media, styles.timeStage].join(" ")} style={landscape}>
        <div className={styles.timeHead}>
          <span>LOCAL TIME</span>
          <span>UTC+0</span>
        </div>
        <p className={styles.clock}>
          {clock?.clock ?? "--:--"}
          <small>{clock?.period}</small>
        </p>
        <p className={styles.place}>
          <span className={styles.liveDot} aria-hidden="true" />
          {clock?.relative ?? "Bamako, Mali"}
        </p>
      </div>
      <div className={styles.label}>
        <div className={styles.labelInner}>
          <div className={styles.labelRow}>
            <h3 className={styles.title}>Based in Bamako, Mali · Open to remote</h3>
          </div>
        </div>
      </div>
    </article>
  );
}
