import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryLogo } from "@/components/home/category-icon";

interface Category {
  id: number | string;
  title: string;
  logo?: string | null;
}

interface GameCategoriesProps {
  dataCategories?: { data: Category[] };
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string) => void;
  scrollCategories: (direction: "left" | "right") => void;
  categoryRef: React.RefObject<HTMLDivElement | null>;
}

export function GameCategories({
  dataCategories,
  selectedCategory,
  setSelectedCategory,
  scrollCategories,
  categoryRef,
}: GameCategoriesProps) {
  const categoryContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const categoryItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      {dataCategories ? (
        <motion.div
          className="relative flex items-center"
          initial="hidden"
          animate="visible"
          variants={categoryContainerVariants}
        >
          <motion.button
            type="button"
            className="bg-primary hover:bg-primary/90 text-primary-foreground absolute left-0 z-10 hidden h-8 w-8 items-center justify-center rounded-full shadow-md transition-all md:flex"
            onClick={() => scrollCategories("left")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <motion.div
            ref={categoryRef}
            className="scrollbar-none mx-0 flex w-full items-center gap-2 overflow-x-auto py-1 scroll-smooth md:mx-11 md:gap-3"
            variants={categoryContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {dataCategories.data.map((category: any) => {
              const id = String(category.id ?? "");
              const active = String(selectedCategory ?? "") === id;

              return (
                <motion.button
                  type="button"
                  key={id || "semua"}
                  onClick={() => setSelectedCategory(id)}
                  className={`focus-visible:ring-primary focus-visible:ring-offset-background inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-95 ${
                    active
                      ? "border-primary/50 bg-primary/15 text-primary border font-bold shadow-sm"
                      : "border-border/70 bg-muted/60 text-muted-foreground hover:border-primary/30 hover:text-foreground border"
                  }`}
                  variants={categoryItemVariants}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <CategoryLogo logo={category.logo} className="h-4 w-4 shrink-0" />
                  {category.title}
                </motion.button>
              );
            })}
          </motion.div>

          <motion.button
            type="button"
            className="bg-primary hover:bg-primary/90 text-primary-foreground absolute right-0 z-10 hidden h-8 w-8 items-center justify-center rounded-full shadow-md transition-all md:flex"
            onClick={() => scrollCategories("right")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="relative flex items-center">
          <motion.div
            className="bg-muted absolute left-0 z-10 hidden h-8 w-8 rounded-full shadow-md md:flex"
          />
          <div className="scrollbar-none mx-0 flex w-full items-center gap-2 overflow-x-auto py-1 md:mx-11 md:gap-3">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                className="bg-muted/60 h-9 w-28 shrink-0 rounded-full"
              />
            ))}
          </div>
          <motion.div
            className="bg-muted absolute right-0 z-10 hidden h-8 w-8 rounded-full shadow-md md:flex"
          />
        </motion.div>
      )}
    </>
  );
}
