import { makeRouteHandler } from "@keystatic/next/route-handler";

import config from "@/keystatic.config";
import { keystaticEnabled } from "@/lib/keystatic";

// Created only when enabled: in GitHub mode without credentials Keystatic throws, which would fail the build.
const handler = keystaticEnabled ? makeRouteHandler({ config }) : null;
const notFound = async () => new Response("Not found", { status: 404 });

export const GET = handler?.GET ?? notFound;
export const POST = handler?.POST ?? notFound;
