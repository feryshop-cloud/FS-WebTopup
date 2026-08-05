"use client";

import { motion } from "framer-motion";
import Lottie from "react-lottie-player";
import { Transaction } from "@/types";
import LottiePlayerClient from "@/components/LottiePlayerClient";

interface InvoiceHeaderProps {
  order: Transaction | null;
  getLottieAnimation: () => any;
  getPayStatusMessage: () => string;
  getBuyStatusMessage: () => string;
  getBackgroundColor: () => string;
}

export function InvoiceHeader({
  order,
  getLottieAnimation,
  getPayStatusMessage,
  getBuyStatusMessage,
  getBackgroundColor,
}: InvoiceHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`text-warning-foreground -mx-4 -my-8 flex min-h-[300px] flex-col items-center justify-center p-8 md:-mx-8 ${getBackgroundColor()}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-40 md:w-64 lg:w-80">
          <LottiePlayerClient loop animationData={getLottieAnimation()} play />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
          {getPayStatusMessage()}
        </h2>
        <p className="mt-2 text-sm font-medium text-white md:text-lg">{getBuyStatusMessage()}</p>
      </motion.div>
    </motion.div>
  );
}
