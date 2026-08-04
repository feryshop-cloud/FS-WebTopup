import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  uuid,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

// 1. Users & Profiles (Matches live DB: public.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id'),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Categories (e.g. Mobile Legends, Free Fire, PUBG, Voucher)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  logo: text('logo'),
  gameSlug: varchar('game_slug', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Games / Catalog (Matches live DB: public.games with UUID primary key)
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  slug: text('slug').notNull().unique(),
  title: text('title'),
  imageUrl: text('image_url'),
  banner: text('banner'),
  logo: text('logo'),
  developers: text('developers'),
  categoryId: integer('category_id'),
  description: text('description'),
  instructions: jsonb('instructions'),
  isPopular: boolean('is_popular').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Products / Nominal Vouchers (Matches live DB: public.products)
export const products = pgTable('products', {
  id: varchar('id', { length: 100 }).primaryKey(), // SKU / Provider Product ID
  gameSlug: varchar('game_slug', { length: 255 }).notNull(),
  categoryId: integer('category_id'),
  title: varchar('title', { length: 255 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 15, scale: 2 }).notNull(),
  sellingPriceGold: numeric('selling_price_gold', { precision: 15, scale: 2 }).notNull(),
  sellingPricePlatinum: numeric('selling_price_platinum', { precision: 15, scale: 2 }).notNull(),
  promoPrice: numeric('promo_price', { precision: 15, scale: 2 }),
  costPrice: numeric('cost_price', { precision: 15, scale: 2 }).default('0'),
  sku: varchar('sku', { length: 100 }),
  images: text('images'),
  logo: text('logo'),
  isActive: boolean('is_active').default(true),
  isGangguan: boolean('is_gangguan').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Payment Methods (Matches live DB: public.payment_methods)
export const paymentMethods = pgTable('payment_methods', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  images: text('images').notNull(),
  paymentId: varchar('payment_id', { length: 100 }).notNull(),
  minimumAmount: numeric('minimum_amount', { precision: 15, scale: 2 }).default('1000').notNull(),
  maximumAmount: numeric('maximum_amount', { precision: 15, scale: 2 }).default('10000000').notNull(),
  fee: numeric('fee', { precision: 15, scale: 2 }).default('0').notNull(),
  feePercent: numeric('fee_percent', { precision: 5, scale: 2 }).default('0').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  group: varchar('group', { length: 100 }).default('E-Wallet').notNull(),
  isOutsideGroup: boolean('is_outside_group').default(false),
  badgeText: varchar('badge_text', { length: 100 }),
  outsideSort: integer('outside_sort').default(0),
  instructions: jsonb('instructions'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Orders / Transactions (Matches live DB: public.orders)
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: varchar('order_id', { length: 100 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  gameSlug: varchar('game_slug', { length: 255 }).notNull(),
  productId: varchar('product_id', { length: 100 }).notNull(),
  productTitle: varchar('product_title', { length: 255 }).notNull(),
  idGames: varchar('id_games', { length: 255 }).notNull(),
  serverGames: varchar('server_games', { length: 100 }),
  nickname: varchar('nickname', { length: 255 }),
  quantity: integer('quantity').default(1).notNull(),
  price: numeric('price', { precision: 15, scale: 2 }).notNull(),
  fee: numeric('fee', { precision: 15, scale: 2 }).default('0').notNull(),
  discountPrice: numeric('discount_price', { precision: 15, scale: 2 }).default('0'),
  promoPrice: numeric('promo_price', { precision: 15, scale: 2 }).default('0'),
  promoCode: varchar('promo_code', { length: 100 }),
  promoDiscount: numeric('promo_discount', { precision: 15, scale: 2 }).default('0'),
  totalPrice: numeric('total_price', { precision: 15, scale: 2 }).notNull(),
  paymentMethodId: varchar('payment_method_id', { length: 100 }),
  paymentName: varchar('payment_name', { length: 255 }).notNull(),
  paymentCode: varchar('payment_code', { length: 100 }).notNull(),
  paymentCodeDisplay: varchar('payment_code_display', { length: 255 }),
  qrString: text('qr_string'),
  qrImageUrl: text('qr_image_url'),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending').notNull(),
  buyStatus: varchar('buy_status', { length: 50 }).default('pending').notNull(),
  serialNumber: text('serial_number').default(''),
  whatsapp: varchar('whatsapp', { length: 50 }),
  email: varchar('email', { length: 255 }),
  expiredTime: integer('expired_time'),
  accountData: jsonb('account_data'),
  pricingJson: jsonb('pricing_json'),
  gatewayResponse: jsonb('gateway_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Promo Codes
export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  discountType: varchar('discount_type', { length: 50 }).default('percent').notNull(),
  discountValue: numeric('discount_value', { precision: 15, scale: 2 }).notNull(),
  minOrder: numeric('min_order', { precision: 15, scale: 2 }).default('0'),
  maxDiscount: numeric('max_discount', { precision: 15, scale: 2 }).default('0'),
  quota: integer('quota').default(100),
  usedCount: integer('used_count').default(0),
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 100 }).references(() => orders.orderId, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  gameSlug: varchar('game_slug', { length: 255 }),
  productTitle: varchar('product_title', { length: 255 }),
  rating: integer('rating').default(5).notNull(),
  comment: text('comment'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Articles / Blog
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  thumbnail: text('thumbnail'),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  author: varchar('author', { length: 100 }).default('Admin'),
  views: integer('views').default(0),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. Settings / Configuration (Matches live DB: public.settings)
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Types export
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Setting = typeof settings.$inferSelect;
