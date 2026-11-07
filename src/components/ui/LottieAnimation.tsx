"use client";

import dynamic from "next/dynamic";
import type { LottieProps } from "lottie-react";

const Lottie = dynamic<LottieProps>(
  () => import("lottie-react").then((mod) => mod.Lottie),
  { ssr: false }
);

interface LottieAnimationProps {
  src: string | object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export function LottieAnimation({
  src,
  className = "",
  loop = true,
  autoplay = true,
}: LottieAnimationProps) {
  return (
    <div className={className}>
      <Lottie src={src} loop={loop} autoplay={autoplay} className="w-full h-full" />
    </div>
  );
}
