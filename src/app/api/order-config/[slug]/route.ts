import { NextResponse } from "next/server";
import { db, games, products, paymentMethods } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { seedGames, seedProducts, seedPaymentMethods } from "@/lib/db/seed-data";
import { getLivePublicGames, shouldQueryLegacyStorefrontSchema } from "@/lib/db/live-adapter";

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

    // 1. Coba ambil dari Supabase / Drizzle jika productsData masih kosong
    if (shouldQueryLegacyStorefrontSchema()) {
      try {
        if (!gameData) {
          const dbGame = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
          if (dbGame && dbGame[0]) {
            const g = dbGame[0];
            gameData = {
              id: g.id,
              title: g.title,
              slug: g.slug,
              image: g.image,
              banner: g.banner,
              logo: g.logo,
              developers: g.developers || "Game Developer",
              category_id: g.categoryId || 1,
              description: g.description,
              instructions: g.instructions,
              is_popular: g.isPopular,
            };
          }
        }

        const dbProducts = await db.select().from(products).where(eq(products.gameSlug, slug)).orderBy(asc(products.sortOrder));
        if (dbProducts && dbProducts.length > 0) {
          productsData = dbProducts.map((p) => ({
            id: p.id,
            title: p.title,
            brand: gameData?.title || slug,
            selling_price: Number(p.sellingPrice),
            selling_price_gold: Number(p.sellingPriceGold),
            selling_price_platinum: Number(p.sellingPricePlatinum),
            promo_price: p.promoPrice ? Number(p.promoPrice) : null,
            status: p.isActive ? 1 : 0,
            is_active: p.isActive,
            logo: p.logo || p.images || null,
          }));
        }

        const dbPayments = await db.select().from(paymentMethods).where(eq(paymentMethods.status, 'active')).orderBy(asc(paymentMethods.sortOrder));
        if (dbPayments && dbPayments.length > 0) {
          paymentMethodsData = dbPayments.map((pm) => ({
            id: pm.id,
            name: pm.name,
            images: pm.images,
            payment_id: pm.paymentId,
            minimum_amount: Number(pm.minimumAmount),
            maximum_amount: Number(pm.maximumAmount),
            fee: Number(pm.fee),
            fee_percent: Number(pm.feePercent),
            type: pm.type,
            status: pm.status,
            group: pm.group,
            is_outside_group: pm.isOutsideGroup,
            badge_text: pm.badgeText,
            outside_sort: pm.outsideSort,
            instructions: pm.instructions,
          }));
        }
      } catch (e) {
        console.warn(`Fallback order-config [${slug}] ke seed data:`, e);
      }
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

    return NextResponse.json({
      success: true,
      game: {
        ...gameData,
        products: productsData,
      },
      products: productsData,
      paymentMethod: paymentMethodsData,
      paymentMethods: paymentMethodsData,
      gameConfiguration: {
        guide_image: gameData.banner || gameData.image,
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan sistem",
      error: err?.message,
    }, { status: 500 });
  }
}
