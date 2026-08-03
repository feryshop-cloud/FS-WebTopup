'use client'
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
    <div className="p-4 space-y-4 mx-auto w-full max-w-full overflow-y-auto">
      {/* Gambar Panduan */}
      {guideImage && !imageError && (
        <div className="relative w-full rounded-lg overflow-hidden bg-muted border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guideImage}
            alt="Panduan"
            className="w-full max-h-60 object-contain rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Teks Panduan */}
      {guideText && <p className="text-xs text-foreground leading-relaxed">{guideText}</p>}

      {/* Langkah-langkah Panduan */}
      {steps && steps.length > 0 && (
        <div className="space-y-2 rounded-lg bg-muted/60 p-3.5 border border-border">
          <h4 className="text-xs font-semibold text-card-foreground">Langkah-langkah:</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
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