import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="container-luxury max-w-2xl py-16">
      <Reveal>
        <p className="eyebrow-pink">Legal</p>
        <h1 className="text-display-2 mt-2 font-display font-black uppercase">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {lastUpdated}</p>
      </Reveal>
      <Reveal delay={0.1} className="mt-10 space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h2]:uppercase [&_h2]:text-foreground [&_p]:mt-3 [&_a]:text-foreground [&_a]:underline [&_a]:hover:text-brand-pink [&_ul]:mt-3 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1">
        {children}
      </Reveal>
    </div>
  );
}
