"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  fontFamily: "monospace",
});

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
      try {
        mermaid.render(id, chart).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        }).catch(err => {
            console.error("Mermaid rendering failed:", err);
        });
      } catch (err) {
        console.error("Mermaid sync error:", err);
      }
    }
  }, [chart]);

  return <div ref={ref} className="mermaid flex justify-center overflow-x-auto my-8 w-full" />;
}
