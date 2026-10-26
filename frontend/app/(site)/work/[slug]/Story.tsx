import Markdoc, { Tag, type Config, type Node } from "@markdoc/markdoc";
import React from "react";

import { isExternal } from "@/lib/projects";

import styles from "./CaseStudy.module.scss";

// Paragraphs and lists take the chapter styles; list items are lettered A, B, C.
const config: Config = {
  nodes: {
    paragraph: {
      transform: (node, config) => new Tag("p", { class: styles.chapterBody }, node.transformChildren(config)),
    },
    list: {
      transform: (node, config) =>
        new Tag(
          "ul",
          { class: styles.items },
          node.transformChildren(config).map((item, j) =>
            Tag.isTag(item) ? new Tag("li", {}, [new Tag("span", {}, [String.fromCharCode(65 + j)]), ...item.children]) : item,
          ),
        ),
    },
    link: {
      transform(node, config) {
        const href = String(node.attributes.href);
        const attributes = isExternal(href) ? { href, target: "_blank", rel: "noreferrer" } : { href };
        return new Tag("a", attributes, node.transformChildren(config));
      },
    },
    image: {
      transform: (node) =>
        new Tag("img", { src: node.attributes.src, alt: node.attributes.alt ?? "", class: styles.storyImage, loading: "lazy" }),
    },
  },
};

const plainText = (node: Node): string =>
  node.type === "text" ? String(node.attributes.content ?? "") : node.children.map(plainText).join("");

type Chapter = { number: number; title: string | null; nodes: Node[] };

/** Each ## heading starts a numbered chapter; anything before the first one is an untitled chapter. */
function chapters(body: Node) {
  const list: Chapter[] = [];
  for (const node of body.children) {
    if (node.type === "heading") {
      list.push({ number: list.filter((c) => c.title !== null).length + 1, title: plainText(node), nodes: [] });
    } else {
      if (list.length === 0) list.push({ number: 0, title: null, nodes: [] });
      list[list.length - 1].nodes.push(node);
    }
  }
  return list;
}

/** The case study's story, written in Keystatic (the entry's body). */
export function Story({ body }: { body: Node }) {
  return (
    <section className={styles.story} aria-label="Story">
      {chapters(body).map((chapter, i) => (
        <div key={i} className={styles.chapter} data-reveal="">
          {chapter.title !== null && (
            <h2 className={styles.chapterTitle}>
              {String(chapter.number).padStart(2, "0")} — {chapter.title}
            </h2>
          )}
          <div className={styles.chapterContent}>{Markdoc.renderers.react(Markdoc.transform(chapter.nodes, config), React)}</div>
        </div>
      ))}
    </section>
  );
}
