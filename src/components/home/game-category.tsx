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
            className="bg-my-color absolute left-0 rounded-full p-2 text-white shadow-md"
            onClick={() => scrollCategories("left")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </motion.button>

          <motion.div
            ref={categoryRef}
            className="hide-scrollbar mx-11 flex transform items-center gap-2 overflow-auto duration-300 ease-in-out md:gap-3"
            variants={categoryContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {dataCategories.data.map((category: any) => {
              const id = String(category.id);
              const active = String(selectedCategory || "") === id;

              return (
                <motion.button
                  type="button"
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`focus-visible:ring-my-color focus-visible:ring-offset-background inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    active
                      ? "border-my-color/40 bg-my-color/10 text-my-color border font-bold shadow-sm"
                      : "border-border bg-muted text-muted-foreground hover:border-my-color/30 hover:text-foreground border"
                  }`}
                  variants={categoryItemVariants}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CategoryLogo logo={category.logo} className="h-4 w-4 shrink-0" />
                  {category.title}
                </motion.button>
              );
            })}
          </motion.div>

          <motion.button
            type="button"
            className="bg-my-color absolute right-0 rounded-full p-2 text-white shadow-md"
            onClick={() => scrollCategories("right")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="relative flex items-center">
          <motion.div
            className="bg-muted absolute left-0 z-10 rounded-full shadow-md"
            style={{ width: 40, height: 40 }}
          />
          <div className="hide-scrollbar mx-11 flex transform items-center gap-2 overflow-auto duration-300 ease-in-out md:gap-3">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="bg-muted h-9 w-28 whitespace-nowrap rounded-full"
              />
            ))}
          </div>
          <motion.div
            className="bg-muted absolute right-0 z-10 rounded-full shadow-md"
            style={{ width: 40, height: 40 }}
          />
        </motion.div>
      )}
    </>
  );
}
