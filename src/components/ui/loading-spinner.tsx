"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({ size = 32, className }: LoadingSpinnerProps) => {
  return (
    <div
      className={cn("border-muted border-t-primary animate-spin rounded-full border-4", className)}
      style={{ width: size, height: size }}
    />
  );
};
