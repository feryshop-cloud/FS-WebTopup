"use client";

import dynamic from "next/dynamic";

const ProgressBar = dynamic(
  () =>
    import("@/components/progress-bar/progress-bar").then(
      (mod) => mod.ProgressBar
    ),
  { ssr: false }
);

export function ProgressBarWrapper({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <ProgressBar className={className}>
      {children}
    </ProgressBar>
  );
}