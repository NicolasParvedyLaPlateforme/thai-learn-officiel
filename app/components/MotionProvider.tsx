"use client";

import { LazyMotion } from "motion/react";

const loadFeatures = () => import("motion/react").then(res => res.domMax);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
