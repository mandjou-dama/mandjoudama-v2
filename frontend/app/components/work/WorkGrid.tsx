"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Expand } from "@/app/components/icons";
import { ease, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { gridItems, mediaRatio, parseFilter, projectCount, type Filter, type GridItem, type Project } from "@/lib/projects";

import { Lightbox } from "./Lightbox";
import { ProjectCard, type OpenRequest } from "./ProjectCard";
import { MusicCard, TimeCard } from "./Widgets";
import styles from "./WorkGrid.module.scss";

const GAP = 8;

const columnsFor = (width: number) => (width >= 1200 ? 4 : width >= 860 ? 3 : width >= 540 ? 2 : 1);

/** A card's height in px at a given card width (padding 12 + picture + gap 10 + padding 12), to keep the columns even. */
function cardHeight(item: GridItem, cardWidth: number) {
  const ratio = item.type === "widget" ? (item.widget === "music" ? "1 / 1" : "387 / 290") : mediaRatio(item.project);
  const [w, h] = ratio.split("/").map(Number);
  const mediaWidth = cardWidth - 24;
  const cap = item.type === "project" ? (item.project.maxHeight ?? Infinity) : Infinity;
  return Math.min((mediaWidth * h) / w, cap) + 34;
}

/** Phones show the first few projects and a button that browses the rest in the lightbox. */
const PHONE_PREVIEW = 3;

function itemKey(item: GridItem) {
  return item.type === "project" ? item.project.slug : item.widget;
}

function GridCard({ item, onOpen }: { item: GridItem; onOpen: (request: OpenRequest) => void }) {
  if (item.type === "widget") return item.widget === "music" ? <MusicCard /> : <TimeCard />;
  return (
    <div data-slug={item.project.slug}>
      <ProjectCard project={item.project} onOpen={onOpen} />
    </div>
  );
}

/** The grid for the current ?filter=. Reads the query, so it needs a Suspense boundary. */
export function WorkGridFromQuery() {
  return <WorkGrid filter={parseFilter(useSearchParams().get("filter"))} />;
}

export function WorkGrid({ filter }: { filter: Filter }) {
  const items = useMemo(() => gridItems(filter), [filter]);
  const openable = useMemo(
    () => items.flatMap((item) => (item.type === "project" && !item.project.soon ? [item.project] : [])),
    [items],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  // Column count and card width (rounded, so small resizes don't reshuffle the grid).
  const [layout, setLayout] = useState<{ count: number; width: number } | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const count = columnsFor(entry.contentRect.width);
      const width = Math.round((entry.contentRect.width - (count - 1) * GAP) / count / 40) * 40;
      setLayout((prev) => (prev?.count === count && prev.width === width ? prev : { count, width }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Greedy masonry: each item goes to the currently shortest column, keeping the curated order row by row.
  const columns = useMemo(() => {
    if (!layout) return null;
    const visible =
      layout.count === 1 ? items.filter((item) => item.type === "project").slice(0, PHONE_PREVIEW) : items;
    const cols = Array.from({ length: layout.count }, () => ({ items: [] as GridItem[], height: 0 }));
    for (const item of visible) {
      const shortest = cols.reduce((a, b) => (b.height < a.height - 1 ? b : a));
      shortest.items.push(item);
      shortest.height += cardHeight(item, layout.width) + GAP;
    }
    return cols;
  }, [items, layout]);

  // Only a real change of arrangement replays the entrance.
  const arrangement = columns?.map((c) => c.items.map(itemKey).join(",")).join("|");

  // Cards rise in as they enter the viewport, in small staggered batches; again when the filter changes.
  useGSAP(
    () => {
      if (!columns || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: ease.expo, stagger: 0.07, overwrite: true }),
      });
    },
    { scope: sectionRef, dependencies: [arrangement], revertOnUpdate: true },
  );

  function open({ trigger: button }: OpenRequest, project: Project) {
    trigger.current = button;
    setLightbox(openable.indexOf(project));
  }

  function close() {
    setLightbox(null);
    trigger.current?.focus({ preventScroll: true });
  }

  const getOrigin = (slug: string) =>
    sectionRef.current?.querySelector<HTMLElement>(`[data-slug="${slug}"] [data-media]`) ?? null;

  const card = (item: GridItem) => (
    <GridCard
      key={itemKey(item)}
      item={item}
      onOpen={(request) => item.type === "project" && open(request, item.project)}
    />
  );

  return (
    <section ref={sectionRef} id="work" className={styles.section} aria-labelledby="work-heading">
      <div className={styles.head}>
        <h2 id="work-heading" className={styles.heading}>
          Selected work
        </h2>
        <span className={styles.count}>{projectCount(filter)} projects · 2023 — 2026</span>
      </div>

      {columns ? (
        <div className={styles.columns}>
          {columns.map((column, i) => (
            <div key={i} className={styles.column}>
              {column.items.map(card)}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.fallback}>{items.map(card)}</div>
      )}

      {layout?.count === 1 && openable.length > 0 && (
        <button
          type="button"
          className={styles.browse}
          onClick={(e) => {
            trigger.current = e.currentTarget;
            setLightbox(0);
          }}
        >
          Browse all projects
          <Expand size={16} />
        </button>
      )}

      {lightbox !== null && openable[lightbox] && (
        <Lightbox projects={openable} index={lightbox} onIndexChange={setLightbox} getOrigin={getOrigin} onClose={close} />
      )}
    </section>
  );
}
