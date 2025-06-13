import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Activity logs schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // blog, user, firm, listing, system, etc.
  action: text("action").notNull(), // created, updated, deleted, etc.
  message: text("message").notNull(),
  user: text("user").notNull().default("System"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpires: text("verification_token_expires"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: text("reset_password_expires"),
  // Additional profile fields for the dashboard
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  firm: text("firm"),
  aum: text("aum"),
  revenue: text("revenue"),
  feeBasedPercentage: text("fee_based_percentage"),
  // Notification preferences
  notifyNewListings: boolean("notify_new_listings").default(true).notNull(),
  notifyMarketUpdates: boolean("notify_market_updates").default(true).notNull(),
  notifyApprovedListings: boolean("notify_approved_listings").default(true).notNull(),
  // Admin fields
  isAdmin: boolean("is_admin").default(false).notNull(),
  adminVerificationCode: text("admin_verification_code"),
  adminVerificationExpires: text("admin_verification_expires"),
  // Immediate auth token for session persistence
  immediateAuthToken: text("immediate_auth_token"),
  immediateAuthExpires: text("immediate_auth_expires"),
  // Two-factor authentication (TOTP)
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false),
  totpVerified: boolean("totp_verified").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
});

// Advisor info schema
export const advisorProfiles = pgTable("advisor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  aum: text("aum").notNull(),
  revenue: text("revenue").notNull(),
  feeBasedPercentage: text("fee_based_percentage").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  yearsInIndustry: text("years_in_industry"),
  clientRetentionRate: text("client_retention_rate"),
  currentPayout: text("current_payout"),
  transitionPreference: text("transition_preference"),
  retirementTimeline: text("retirement_timeline"),
  hasTeam: boolean("has_team").default(false),
  teamSize: text("team_size"),
});

export const insertAdvisorProfileSchema = createInsertSchema(advisorProfiles).pick({
  userId: true,
  aum: true,
  revenue: true,
  feeBasedPercentage: true,
  city: true,
  state: true,
  yearsInIndustry: true,
  clientRetentionRate: true,
  currentPayout: true,
  transitionPreference: true,
  retirementTimeline: true,
  hasTeam: true,
  teamSize: true,
});

// Saved calculations schema
export const savedCalculations = pgTable("saved_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  profileId: integer("profile_id").notNull(),
  calculationData: text("calculation_data").notNull(),
  createdAt: text("created_at").notNull(),
  name: text("name").notNull(),
});

export const insertSavedCalculationSchema = createInsertSchema(savedCalculations).pick({
  userId: true,
  profileId: true,
  calculationData: true,
  createdAt: true,
  name: true,
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stripePaymentId: text("stripe_payment_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  stripePaymentId: true,
  amount: true,
  status: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect & {
  // Additional properties that might be returned from API but not in the schema
  verificationSent?: boolean;
  message?: string;
  adminVerificationCode?: string | null;
  adminVerificationExpires?: string | null;
  immediateAuthToken?: string | null;
  immediateAuthExpires?: string | null;
  // TOTP fields
  totpSecret?: string | null;
  totpEnabled?: boolean | null;
  totpVerified?: boolean | null;
};

export type InsertAdvisorProfile = z.infer<typeof insertAdvisorProfileSchema>;
export type AdvisorProfile = typeof advisorProfiles.$inferSelect;

export type InsertSavedCalculation = z.infer<typeof insertSavedCalculationSchema>;
export type SavedCalculation = typeof savedCalculations.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Marketplace listings schema
export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  aum: text("aum").notNull(),
  revenue: text("revenue").notNull(),
  clients: integer("clients").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("Pending"), // Pending, Active, Sold
  description: text("description").notNull(),
  tags: text("tags").notNull(), // Stored as JSON string
  highlighted: boolean("highlighted").default(false).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  // Additional details
  established: text("established"),
  clientAvgAge: text("client_avg_age"),
  investmentStyle: text("investment_style"),
  feeStructure: text("fee_structure"),
  transitionPeriod: text("transition_period"),
  askingPrice: text("asking_price"),
  sellerMotivation: text("seller_motivation"),
  growthRate: text("growth_rate"),
  clientRetentionRate: text("client_retention_rate"),
  dealLength: text("deal_length"),
  // Contact info
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  status: true, // Default "Pending"
  highlighted: true, // Default false
  updatedAt: true, // Set automatically
});

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

// Interest submissions schema for marketplace listings
export const interestSubmissions = pgTable("interest_submissions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default("New"), // New, Contacted, Interested, Not Interested
  createdAt: text("created_at").notNull(),
});

export const insertInterestSubmissionSchema = createInsertSchema(interestSubmissions).omit({
  id: true,
  status: true, // Default "New"
});

export type InsertInterestSubmission = z.infer<typeof insertInterestSubmissionSchema>;
export type InterestSubmission = typeof interestSubmissions.$inferSelect;

// Calculation parameters schema
export const calculationParameters = pgTable("calculation_parameters", {
  id: serial("id").primaryKey(),
  firm: text("firm").notNull(),
  paramName: text("param_name").notNull(),
  paramValue: text("param_value").notNull(),
  notes: text("notes"),
  updatedAt: text("updated_at").notNull(),
});

export const insertCalculationParameterSchema = createInsertSchema(calculationParameters).omit({
  id: true,
  updatedAt: true, // Set automatically
});

export type InsertCalculationParameter = z.infer<typeof insertCalculationParameterSchema>;
export type CalculationParameter = typeof calculationParameters.$inferSelect;

// Firm deals schema
export const firmDeals = pgTable("firm_deals", {
  id: serial("id").primaryKey(),
  firm: text("firm").notNull(),
  upfrontMin: text("upfront_min").notNull(),
  upfrontMax: text("upfront_max").notNull(),
  backendMin: text("backend_min").notNull(),
  backendMax: text("backend_max").notNull(),
  totalDealMin: text("total_deal_min").notNull(),
  totalDealMax: text("total_deal_max").notNull(),
  notes: text("notes"),
  updatedAt: text("updated_at").notNull(),
});

// Placeholder comment to maintain file structure

export const insertFirmDealSchema = createInsertSchema(firmDeals).omit({
  id: true,
  updatedAt: true, // Set automatically
});

export type InsertFirmDeal = z.infer<typeof insertFirmDealSchema>;
export type FirmDeal = typeof firmDeals.$inferSelect;

// Blog posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  tags: text("tags").notNull(), // Stored as JSON string
  featuredImage: text("featured_image"),
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  updatedAt: true, // Set automatically
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// News articles schema
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  date: text("date").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  published: boolean("published").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
});

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

// Landing Pages schema
export const landingPages = pgTable("landing_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  targetFirm: text("target_firm").notNull(),
  description: text("description").notNull(),
  logoUrl: text("logo_url"),
  heroColor: text("hero_color").notNull().default("#1d4ed8"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertLandingPageSchema = createInsertSchema(landingPages).omit({
  id: true,
  updatedAt: true, // Set automatically
});

export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;
export type LandingPage = typeof landingPages.$inferSelect;

// Firm profiles schema
export const firmProfiles = pgTable("firm_profiles", {
  id: serial("id").primaryKey(),
  firm: text("firm").notNull().unique(),
  ceo: text("ceo"),
  bio: text("bio"),
  logoUrl: text("logo_url"),
  founded: text("founded"),
  headquarters: text("headquarters"),
  category: text("category"),
  slug: text("slug"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFirmProfileSchema = createInsertSchema(firmProfiles).omit({
  id: true,
  updatedAt: true, // Set automatically
});

export type InsertFirmProfile = z.infer<typeof insertFirmProfileSchema>;
export type FirmProfile = typeof firmProfiles.$inferSelect;

// Advisor transition leads schema
export const advisorTransitionLeads = pgTable("advisor_transition_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  currentFirm: text("current_firm").notNull(),
  aum: text("aum"),
  message: text("message"),
  targetFirm: text("target_firm").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("New").notNull(),
});

export const insertAdvisorTransitionLeadSchema = createInsertSchema(advisorTransitionLeads).omit({
  id: true,
  createdAt: true, // Set automatically
  status: true, // Default "New"
});

export type InsertAdvisorTransitionLead = z.infer<typeof insertAdvisorTransitionLeadSchema>;
export type AdvisorTransitionLead = typeof advisorTransitionLeads.$inferSelect;

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().unique(), // ai, email, seo, system, etc.
  value: text("value").notNull(), // JSON string of settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true, // Set automatically
  updatedAt: true, // Set automatically
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
