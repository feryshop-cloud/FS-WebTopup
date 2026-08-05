"use client";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface GuideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideImage?: string;
  guideText?: string;
  steps?: string[];
  title?: string;
}

const GuideDrawer: React.FC<GuideDrawerProps> = ({
  open,
  onOpenChange,
  guideImage,
  guideText,
  steps,
  title,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [guideImage, open]);

  const modalTitle = title || "Panduan Menemukan ID";

  const Content = (
    <div className="mx-auto w-full max-w-full space-y-4 overflow-y-auto p-4">
      {/* Gambar Panduan */}
      {guideImage && !imageError && (
        <div className="bg-muted border-border relative w-full overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guideImage}
            alt="Panduan"
            className="max-h-60 w-full rounded-lg object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Teks Panduan */}
      {guideText && <p className="text-foreground text-xs leading-relaxed">{guideText}</p>}

      {/* Langkah-langkah Panduan */}
      {steps && steps.length > 0 && (
        <div className="bg-muted/60 border-border space-y-2 rounded-lg border p-3.5">
          <h4 className="text-card-foreground text-xs font-semibold">Langkah-langkah:</h4>
          <ol className="text-muted-foreground list-inside list-decimal space-y-1.5 text-xs">
            {steps.map((stepItem, idx) => (
              <li key={idx} className="leading-relaxed">
                {stepItem}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-sm font-semibold">{modalTitle}</DrawerTitle>
        </DrawerHeader>
        {Content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-semibold">{modalTitle}</DialogTitle>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  );
};

export default GuideDrawer;
