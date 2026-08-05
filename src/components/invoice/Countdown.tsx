import { motion } from "framer-motion";

interface InvoiceCountdownProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function InvoiceCountdown({ timeLeft }: InvoiceCountdownProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <motion.div
        className="flex gap-2 rounded-lg md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="border-destructive bg-destructive/80 flex items-center gap-2 rounded-lg border px-4 py-1.5">
          <div className="text-destructive-foreground flex gap-1 text-sm font-semibold md:text-base">
            <span>{timeLeft.hours}</span>
            <span>Jam</span>
          </div>
          <div className="text-destructive-foreground flex gap-1 text-sm font-semibold md:text-base">
            <span>{timeLeft.minutes}</span>
            <span>Menit</span>
          </div>
          <div className="text-destructive-foreground flex gap-1 text-sm font-semibold md:text-base">
            <span>{timeLeft.seconds}</span>
            <span>Detik</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
