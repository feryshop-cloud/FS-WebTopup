import { NextResponse } from "next/server";
import { seedGames, seedProducts, seedPaymentMethods } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: any) {
  try {
    const params = await context?.params;
    const slug = params?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, message: "Slug tidak ditemukan" }, { status: 400 });
    }

    let gameData: any = null;
    let productsData: any[] = [];
    let paymentMethodsData: any[] = [];

    const liveGame = (await getLivePublicGames()).find((game) => game.slug === slug);
    if (liveGame) {
      gameData = liveGame;
    }

    // 2. Fallback ke seed data
    if (!gameData || productsData.length === 0) {
      const foundSeed = seedGames.find((g) => g.slug === slug);
      if (foundSeed) {
        if (!gameData) {
          gameData = {
            id: foundSeed.id,
            title: foundSeed.title,
            slug: foundSeed.slug,
            image: foundSeed.image,
            banner: foundSeed.banner,
            logo: foundSeed.logo,
            developers: foundSeed.developers,
            category_id: foundSeed.categoryId,
            description: foundSeed.description,
            instructions: foundSeed.instructions,
            is_popular: foundSeed.isPopular,
          };
        }

        if (productsData.length === 0) {
          const foundProducts = seedProducts[slug] || [];
          productsData = foundProducts.map((p) => ({
            ...p,
            brand: foundSeed.title,
            status: p.is_active ? 1 : 0,
          }));
        }
      }
    }

    if (paymentMethodsData.length === 0) {
      paymentMethodsData = seedPaymentMethods.filter((pm) => pm.status === "active");
    }

    if (!gameData) {
      return NextResponse.json({ success: false, message: "Game tidak ditemukan" }, { status: 404 });
    }

    const foundSeed = seedGames.find((g) => g.slug === slug);

    let instructionsObj: any = {};
    if (typeof gameData?.instructions === "string") {
      try {
        instructionsObj = JSON.parse(gameData.instructions);
      } catch {
        instructionsObj = {};
      }
    } else if (typeof gameData?.instructions === "object" && gameData?.instructions) {
      instructionsObj = gameData.instructions;
    }

    if (!instructionsObj.required_inputs && Array.isArray(instructionsObj.fields)) {
      instructionsObj.required_inputs = instructionsObj.fields.map((f: any) => f.name);
      instructionsObj.input_fields = instructionsObj.fields;
    }

    const seedInstructions = (foundSeed?.instructions as any) || {};

    // If DB instructions is empty ({}) or has only 1 generic 'id' field while seed has detailed fields (e.g. Roblox, Genshin)
    const dbHasMultiFields = Array.isArray(instructionsObj.required_inputs) && instructionsObj.required_inputs.length > 1;

    const mergedConfiguration = {
      ...seedInstructions,
      ...instructionsObj,
      required_inputs: (dbHasMultiFields ? instructionsObj.required_inputs : null) || seedInstructions.required_inputs || instructionsObj.required_inputs || ["id", "server"],
      input_fields: (dbHasMultiFields ? instructionsObj.input_fields : null) || seedInstructions.input_fields || instructionsObj.input_fields,
      options: instructionsObj.options || seedInstructions.options,
      code_validation_nickname: instructionsObj.code_validation_nickname || seedInstructions.code_validation_nickname,
      status_validation_nickname: instructionsObj.status_validation_nickname || seedInstructions.status_validation_nickname,
      warning_text: instructionsObj.warning_text || seedInstructions.warning_text,
      guide_image: gameData?.banner || gameData?.image || seedInstructions.guide_image,
    };

    return NextResponse.json({
      success: true,
      game: {
        ...gameData,
        products: productsData,
      },
      products: productsData,
      paymentMethod: paymentMethodsData,
      paymentMethods: paymentMethodsData,
      gameConfiguration: mergedConfiguration,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan sistem",
      error: err?.message,
    }, { status: 500 });
  }
}
