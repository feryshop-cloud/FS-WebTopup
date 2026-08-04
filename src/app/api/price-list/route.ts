import { NextResponse } from "next/server";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import { getLivePublicGames, getLivePublicProducts } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [liveGames, liveProducts] = await Promise.all([
      getLivePublicGames(),
      getLivePublicProducts(),
    ]);

    console.log(`[API /api/price-list] Fetched liveGames count: ${liveGames.length}, liveProducts count: ${liveProducts.length}`);

    let resultGames: any[] = [];

    if (liveGames.length > 0) {
      resultGames = liveGames.map((game) => {
        const gameProductsFromDb = liveProducts
          .filter((product) => product.game_slug === game.slug)
          .map((product) => ({
            id: product.id,
            title: product.title,
            brand: product.brand || game.title,
            selling_price: Number(product.selling_price),
            selling_price_gold: product.selling_price_gold ? Number(product.selling_price_gold) : Number(product.selling_price),
            selling_price_platinum: product.selling_price_platinum ? Number(product.selling_price_platinum) : Number(product.selling_price),
            status: product.is_gangguan ? 0 : (product.is_active ? 1 : 0),
            is_active: product.is_active,
            logo: product.logo || product.images || game.logo || game.image || null,
          }));

        const finalProducts = gameProductsFromDb.length > 0
          ? gameProductsFromDb
          : (seedProducts[game.slug] || []).map((product) => ({
              ...product,
              brand: game.title,
              status: product.is_active ? 1 : 0,
              logo: product.logo || product.images || game.logo || game.image || null,
            }));

        return {
          id: game.id,
          title: game.title,
          game_name: game.title,
          name: game.title,
          slug: game.slug,
          logo: game.logo || game.image,
          products: finalProducts,
        };
      });
    }

    if (resultGames.length === 0) {
      console.warn("[API /api/price-list] liveGames kosong! Fallback ke seedGames.");
      resultGames = seedGames.map((g) => {
        const gameProducts = (seedProducts[g.slug] || []).map((p) => ({
          ...p,
          brand: g.title,
          status: p.is_active ? 1 : 0,
        }));

        return {
          id: g.id,
          title: g.title,
          slug: g.slug,
          logo: g.logo || g.image,
          products: gameProducts,
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: resultGames,
    }, { status: 200 });
  } catch (err: any) {
    console.error("[API /api/price-list ERROR]:", err);
    return NextResponse.json({
      success: false,
      message: "Gagal memuat daftar harga",
      error: err?.message || String(err),
    }, { status: 500 });
  }
}
