import { collection, config, fields, singleton } from "@keystatic/core";

// Admin at /keystatic. Locally it edits the files in content/ directly; in production it commits
// them to GitHub (the app lives in frontend/), and Vercel redeploys. NEXT_PUBLIC_KEYSTATIC_STORAGE=github
// runs GitHub mode locally, for the one-time GitHub App setup.
const storage =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github"
    ? ({ kind: "local" } as const)
    : ({ kind: "github", repo: "mandjou-dama/mandjoudama-v2", pathPrefix: "frontend" } as const);

const hex = /^#[0-9A-Fa-f]{6}$/;
const colour = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: true, pattern: { regex: hex, message: "A hex colour, like #121C30" } } });
const optionalColour = (label: string, description?: string) =>
  fields.text({
    label,
    description,
    validation: { pattern: { regex: /^(#[0-9A-Fa-f]{6})?$/, message: "A hex colour, like #121C30, or empty" } },
  });

const projects = collection({
  label: "Projects",
  path: "content/projects/*",
  slugField: "title",
  format: { contentField: "body" },
  columns: ["title", "kind", "year"],
  schema: {
    title: fields.slug({
      name: { label: "Title", validation: { isRequired: true } },
      slug: { label: "Slug", description: "The case study URL (/work/<slug>). Two projects can share a title, not a slug." },
    }),
    kind: fields.select({
      label: "Category",
      description: "The Mobile / Web filter.",
      options: [
        { label: "Mobile", value: "mobile" },
        { label: "Web", value: "web" },
      ],
      defaultValue: "mobile",
    }),
    device: fields.select({
      label: "Mockup",
      options: [
        { label: "Phone", value: "phone" },
        { label: "Browser", value: "browser" },
      ],
      defaultValue: "phone",
    }),
    meta: fields.text({ label: "Meta", description: "The short line under the title, e.g. Fintech · iOS & Android.", validation: { isRequired: true } }),
    year: fields.text({ label: "Year", validation: { isRequired: true, pattern: { regex: /^\d{4}$/, message: "A year, like 2025" } } }),
    shipped: fields.text({ label: "Shipped", description: "Shown on the case study, e.g. October 2024 or In progress." }),
    soon: fields.checkbox({ label: "Coming soon", description: "Shows a Coming soon pill instead of the preview and the button." }),
    cta: fields.object(
      {
        label: fields.text({ label: "Label", validation: { isRequired: true } }),
        href: fields.text({ label: "Link", description: "A page of this site (/work/kori-pay) or a full URL.", validation: { isRequired: true } }),
      },
      { label: "Button" },
    ),
    url: fields.text({ label: "Address bar", description: "Browser mockups only: the domain shown in the address bar." }),
    preview: fields.conditional(
      fields.select({
        label: "Card preview",
        options: [
          { label: "Still: a static mockup and the button", value: "still" },
          { label: "Video: a play button that scrolls the page", value: "video" },
          { label: "Carousel: a stepper through several screens", value: "carousel" },
          { label: "Compare: a before / after slider", value: "compare" },
        ],
        defaultValue: "still",
      }),
      {
        still: fields.empty(),
        video: fields.empty(),
        carousel: fields.array(
          fields.object({
            ink: optionalColour("Accent", "Empty: the palette's accent."),
            hero: fields.integer({ label: "Hero height", description: "In px at the 185px base width. Empty: the default." }),
          }),
          { label: "Screens", itemLabel: (props) => `Screen${props.fields.ink.value ? ` · ${props.fields.ink.value}` : ""}` },
        ),
        compare: fields.object(
          {
            screen: colour("Screen"),
            ink: colour("Accent"),
            line: colour("Lines"),
            text: colour("Text"),
          },
          { label: "Before palette", description: "Colours of the old design, under the slider." },
        ),
      },
    ),
    ratio: fields.text({
      label: "Picture ratio",
      description: "Width / height of the card's picture, e.g. 9 / 16. Empty: 9 / 16 for phones, 387 / 290 for browsers.",
      validation: { pattern: { regex: /^(\d+ \/ \d+)?$/, message: "Like 9 / 16, or empty" } },
    }),
    maxHeight: fields.integer({ label: "Max picture height", description: "In px; caps a tall card. Empty: no cap." }),
    palette: fields.object(
      {
        bg: colour("Background", "The card's picture area."),
        screen: colour("Screen"),
        ink: colour("Accent"),
        line: colour("Lines"),
        text: colour("Text"),
        chrome: optionalColour("Browser bar", "Browser mockups only."),
        muted: optionalColour("Muted text", "Browser mockups only."),
      },
      { label: "Palette" },
    ),
    media: fields.conditional(
      fields.select({
        label: "Real media",
        description: "A screenshot or recording that replaces the mockup.",
        options: [
          { label: "None (mockup)", value: "none" },
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
        ],
        defaultValue: "none",
      }),
      {
        none: fields.empty(),
        image: fields.object({
          src: fields.image({ label: "Image", directory: "public/work", publicPath: "/work/", validation: { isRequired: true } }),
          alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
          width: fields.integer({ label: "Width (px)", validation: { isRequired: true } }),
          height: fields.integer({ label: "Height (px)", validation: { isRequired: true } }),
        }),
        video: fields.object({
          src: fields.file({ label: "Video", directory: "public/work", publicPath: "/work/", validation: { isRequired: true } }),
          poster: fields.image({ label: "Poster", directory: "public/work", publicPath: "/work/" }),
        }),
      },
    ),
    caseStudy: fields.conditional(fields.checkbox({ label: "Has a case study", description: "Publishes /work/<slug>." }), {
      true: fields.object(
        {
          summary: fields.text({ label: "Summary", multiline: true, validation: { isRequired: true } }),
          role: fields.text({ label: "Role", validation: { isRequired: true } }),
          platforms: fields.text({ label: "Platforms", validation: { isRequired: true } }),
          stack: fields.array(fields.text({ label: "Tool" }), { label: "Stack", itemLabel: (props) => props.value }),
          links: fields.array(
            fields.object({
              label: fields.text({ label: "Label", validation: { isRequired: true } }),
              href: fields.url({ label: "URL", validation: { isRequired: true } }),
            }),
            { label: "Links", itemLabel: (props) => props.fields.label.value },
          ),
          figures: fields.array(fields.text({ label: "Caption" }), {
            label: "Figures",
            description: "Captions of the mockups under the story.",
            itemLabel: (props) => props.value,
          }),
        },
        { label: "Case study" },
      ),
      false: fields.empty(),
    }),
    body: fields.markdoc({
      label: "Case study story",
      description: "Each ## heading starts a numbered chapter; paragraphs and lists follow it (lists show as A, B, C).",
      options: {
        heading: [2],
        image: { directory: "public/images/work", publicPath: "/images/work/" },
        blockquote: false,
        code: false,
        codeBlock: false,
        divider: false,
        strikethrough: false,
        table: false,
      },
    }),
  },
});

const grid = singleton({
  label: "Home grid",
  path: "content/grid",
  schema: {
    items: fields.array(
      fields.conditional(
        fields.select({
          label: "Card",
          options: [
            { label: "Project", value: "project" },
            { label: "Music widget", value: "music" },
            { label: "Time widget", value: "time" },
          ],
          defaultValue: "project",
        }),
        {
          project: fields.relationship({ label: "Project", collection: "projects", validation: { isRequired: true } }),
          music: fields.empty(),
          time: fields.empty(),
        },
      ),
      {
        label: "Cards",
        description: "In reading order; the grid fills its columns from this list.",
        itemLabel: (props) =>
          props.discriminant === "project" ? (props.value.value ?? "Project") : `${props.discriminant === "music" ? "Music" : "Time"} widget`,
      },
    ),
  },
});

export default config({
  storage,
  ui: { brand: { name: "Mandjou Dama" } },
  collections: { projects },
  singletons: { grid },
});
