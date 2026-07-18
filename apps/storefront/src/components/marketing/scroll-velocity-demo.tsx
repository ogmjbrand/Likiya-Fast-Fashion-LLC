"use client";

import Image from "next/image";

import { ScrollVelocity } from "@likiya/ui";

const images = [
  {
    title: "Moonbeam",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=40&w=640",
  },
  {
    title: "Cursor",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=40&w=640",
  },
  {
    title: "Rogue",
    thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=40&w=640",
  },
  {
    title: "Editorially",
    thumbnail: "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=640",
  },
  {
    title: "Editrix AI",
    thumbnail: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=640",
  },
];

const velocity = [3, -3];

/**
 * Reference usage for `@likiya/ui`'s ScrollVelocity — not wired into a
 * live route. Kept here as the integration's demo/proof, mirroring how
 * the component would be dropped into a real page (e.g. a homepage
 * "shop the edit" image strip, in place of or alongside `Marquee`).
 */
export function ScrollVelocityDemo() {
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-5 py-10">
        {velocity.map((v, index) => (
          <ScrollVelocity key={index} velocity={v}>
            {images.map(({ title, thumbnail }) => (
              <div
                key={title}
                className="relative h-[6rem] w-[9rem] md:h-[8rem] md:w-[12rem] xl:h-[12rem] xl:w-[18rem]"
              >
                <Image src={thumbnail} alt={title} fill className="h-full w-full object-cover object-center" />
              </div>
            ))}
          </ScrollVelocity>
        ))}
        <ScrollVelocity velocity={5}>You can also use a text!</ScrollVelocity>
      </div>
    </div>
  );
}
