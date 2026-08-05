const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trviikqvvujcibplqwud.supabase.co";
// We require the service role key to insert records safely
const SUPABASE_KEY_ENV = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY_ENV) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Refusing to seed without it.",
  );
  process.exit(1);
}

const SUPABASE_KEY: string = SUPABASE_KEY_ENV;

async function seedData() {
  console.log("Seeding storefront master data to Supabase...");

  // Hardcode data here to avoid dynamic import complexities for a simple seed script
  const seedCategories = [
    {
      id: 1,
      title: "Mobile Games",
      logo: "/images/ml.png",
      game_slug: "mobile-legends",
      sort_order: 1,
      is_active: true,
    },
    {
      id: 2,
      title: "PC Games",
      logo: "/images/val.png",
      game_slug: "valorant",
      sort_order: 2,
      is_active: true,
    },
    {
      id: 3,
      title: "Voucher",
      logo: "/images/steam.png",
      game_slug: "steam-wallet",
      sort_order: 3,
      is_active: true,
    },
    {
      id: 4,
      title: "Entertainment",
      logo: "/images/netflix.png",
      game_slug: "netflix",
      sort_order: 4,
      is_active: true,
    },
  ];

  const seedProducts = [
    {
      id: "ml_5_diamond",
      game_slug: "mobile-legends",
      category_id: 1,
      title: "5 Diamonds",
      selling_price: 1500,
      selling_price_gold: 1450,
      selling_price_platinum: 1400,
      cost_price: 1300,
      is_active: true,
      sort_order: 1,
    },
    {
      id: "ff_70_diamond",
      game_slug: "free-fire",
      category_id: 1,
      title: "70 Diamonds",
      selling_price: 10000,
      selling_price_gold: 9800,
      selling_price_platinum: 9600,
      cost_price: 9000,
      is_active: true,
      sort_order: 1,
    },
  ];

  const seedPaymentMethods = [
    {
      id: "qris",
      name: "QRIS",
      payment_id: "qris",
      type: "ewallet",
      group: "E-Wallet",
      fee: 0,
      fee_percent: 0.7,
      status: "active",
      is_outside_group: false,
      images: "[]",
      updated_at: new Date().toISOString(),
    },
  ];

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  };

  try {
    // 1. Seed Categories
    console.log("Inserting Categories...");
    const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify(seedCategories),
    });
    if (!catRes.ok) console.error("Categories error:", await catRes.text());

    // 2. Seed Products
    console.log("Inserting Products...");
    const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(seedProducts),
    });
    if (!prodRes.ok) console.error("Products error:", await prodRes.text());

    // 3. Seed Payment Methods
    console.log("Inserting Payment Methods...");
    const payRes = await fetch(`${SUPABASE_URL}/rest/v1/payment_methods`, {
      method: "POST",
      headers,
      body: JSON.stringify(seedPaymentMethods),
    });
    if (!payRes.ok) console.error("Payment Methods error:", await payRes.text());

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seedData();
