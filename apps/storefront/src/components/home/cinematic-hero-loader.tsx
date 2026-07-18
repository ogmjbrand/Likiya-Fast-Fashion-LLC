"use client";

import dynamic from "next/dynamic";

/**
 * Three.js (~140kB gzipped) is only needed for this one hero, and only on
 * the client — pulling it into the homepage's server-rendered bundle would
 * tax every visitor's First Load JS. `ssr: false` isn't allowed on
 * `next/dynamic` inside a Server Component, hence this thin Client
 * Component wrapper the (still async/server) homepage imports instead.
 */
const CinematicHero = dynamic(() => import("./cinematic-hero").then((m) => m.CinematicHero), {
  ssr: false,
  loading: () => <div className="h-[92vh] min-h-[620px] w-full bg-black" />,
});

export function CinematicHeroLoader() {
  return <CinematicHero />;
}
