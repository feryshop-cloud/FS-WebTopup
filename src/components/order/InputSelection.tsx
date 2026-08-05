import InputFields from "@/components/order/InputFields";
import { Info } from "lucide-react";

interface InputSelectionProps {
  gameConfig: any;
  inputs: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  inputRefs?: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  idRef?: React.RefObject<HTMLDivElement | null>;
  serverRef?: React.RefObject<HTMLDivElement | null>;
  openGuideDrawer: () => void;
}

export default function InputSelection({
  gameConfig,
  inputs,
  handleInputChange,
  inputRefs,
  idRef,
  serverRef,
  openGuideDrawer,
}: InputSelectionProps) {
  return (
    <section
      className="bg-background ring-border relative scroll-mt-20 rounded-xl shadow-sm ring-1 md:scroll-mt-[7.5rem]"
      id="2"
    >
      <div className="bg-muted flex items-center rounded-t-xl px-4 py-2">
        <div className="bg-my-color flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white">
          1
        </div>
        <h2 className="text-card-foreground ml-3 text-sm font-semibold">Masukkan Data Akun</h2>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <InputFields
            gameConfig={gameConfig}
            inputs={inputs}
            handleInputChange={handleInputChange}
            inputRefs={inputRefs}
            idRef={idRef}
            serverRef={serverRef}
          />
        </div>

        {(gameConfig?.guide_text || gameConfig?.guide_image) && (
          <div
            onClick={openGuideDrawer}
            className="border-border bg-muted/40 text-card-foreground hover:bg-my-color/10 flex w-fit cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-xs transition hover:shadow-sm"
          >
            <Info className="h-4 w-4" />
            <span className="italic">Cara Menemukan ID</span>
          </div>
        )}
      </div>
    </section>
  );
}
