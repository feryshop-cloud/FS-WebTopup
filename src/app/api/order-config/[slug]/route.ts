import { NextResponse } from "next/server";
import { getLivePublicGames, getLivePublicProducts, getLivePublicPaymentMethods } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: any) {
  try {
    const params = await context?.params;
    const slug = params?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, message: "Slug tidak ditemukan" }, { status: 400 });
    }

    const [allLiveGames, allLiveProducts, allLivePaymentMethods] = await Promise.all([
      getLivePublicGames(),
      getLivePublicProducts(),
      getLivePublicPaymentMethods(),
    ]);

    const liveGame = allLiveGames.find((game) => game.slug === slug);
    if (!liveGame) {
      return NextResponse.json({ success: false, message: "Game tidak ditemukan di database" }, { status: 404 });
    }

    const liveProducts = allLiveProducts.filter((p) => p.game_slug === slug);
    const productsData = liveProducts.map((p) => ({
      ...p,
      brand: liveGame.title || slug,
      status: p.is_active ? 1 : 0,
    }));

    let instructionsObj: any = {};
    if (typeof liveGame.instructions === "string") {
      try {
        instructionsObj = JSON.parse(liveGame.instructions);
      } catch {
        instructionsObj = {};
      }
    } else if (typeof liveGame.instructions === "object" && liveGame.instructions) {
      instructionsObj = liveGame.instructions;
    }

    const requiredInputs = Array.isArray(instructionsObj.required_inputs) && instructionsObj.required_inputs.length > 0
      ? instructionsObj.required_inputs
      : ["id", "server"];

    const inputFields = Array.isArray(instructionsObj.input_fields) && instructionsObj.input_fields.length > 0
      ? instructionsObj.input_fields
      : [
          { name: "id", label: "User ID", placeholder: "Masukkan User ID", type: "text" },
          { name: "server", label: "Server ID", placeholder: "Masukkan Server ID", type: "text" },
        ];

    const gameConfiguration = {
      title: instructionsObj.title || `Cara Top Up ${liveGame.title}`,
      steps: Array.isArray(instructionsObj.steps) ? instructionsObj.steps : [],
      required_inputs: requiredInputs,
      input_fields: inputFields,
      options: instructionsObj.options || null,
      code_validation_nickname: instructionsObj.code_validation_nickname || null,
      status_validation_nickname: instructionsObj.status_validation_nickname || null,
      warning_text: instructionsObj.warning_text || null,
      guide_image: liveGame.banner || liveGame.image || null,
    };

    return NextResponse.json({
      success: true,
      game: {
        ...liveGame,
        products: productsData,
      },
      products: productsData,
      paymentMethod: allLivePaymentMethods,
      paymentMethods: allLivePaymentMethods,
      gameConfiguration,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan sistem",
      error: err?.message,
    }, { status: 500 });
  }
}
