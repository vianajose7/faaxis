import { users, type User, type InsertUser, advisorProfiles, type AdvisorProfile, 
  type InsertAdvisorProfile, savedCalculations, type SavedCalculation, 
  type InsertSavedCalculation, payments, type Payment, type InsertPayment,
  marketplaceListings, type MarketplaceListing, type InsertMarketplaceListing,
  interestSubmissions, type InterestSubmission, type InsertInterestSubmission,
  calculationParameters, type CalculationParameter, type InsertCalculationParameter,
  firmDeals, type FirmDeal, type InsertFirmDeal,
  blogPosts, type BlogPost, type InsertBlogPost,
  landingPages, type LandingPage, type InsertLandingPage,
  activityLogs, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByAdminVerificationCode(code: string): Promise<User | undefined>;
  getUserByImmediateAuthToken(token: string): Promise<User | undefined>;
  getAllUsers(): Map<number, User>;
  getAdminUsers(): Promise<User[]>;
  updateUser(userId: number, data: Partial<User>): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User>;
  updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserVerification(userId: number, data: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationTokenExpires?: string | null;
  }): Promise<User>;
  updateUserAdminVerification(userId: number, data: {
    adminVerificationCode?: string | null;
    adminVerificationExpires?: string | null;
  }): Promise<User>;
  updateUserImmediateAuth(userId: number, data: {
    immediateAuthToken?: string | null;
    immediateAuthExpires?: string | null;
  }): Promise<User>;
  
  // TOTP operations
  updateUserTOTP(userId: number, data: {
    totpSecret?: string | null;
    totpEnabled?: boolean;
    totpVerified?: boolean;
  }): Promise<User>;
  setupUserTOTP(userId: number, totpSecret: string): Promise<User>;
  verifyUserTOTP(userId: number): Promise<User>;
  disableUserTOTP(userId: number): Promise<User>;
  updateUserResetToken(userId: number, data: {
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
  }): Promise<User>;
  updateUserPassword(userId: number, password: string): Promise<User>;
  updateUserProfile(userId: number, profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    state?: string;
    firm?: string;
    aum?: string;
    revenue?: string;
    feeBasedPercentage?: string;
  }): Promise<User>;
  deleteUser(userId: number): Promise<void>;
  
  // Advisor profile operations
  getAdvisorProfile(id: number): Promise<AdvisorProfile | undefined>;
  getAdvisorProfileByUserId(userId: number): Promise<AdvisorProfile | undefined>;
  createAdvisorProfile(profile: InsertAdvisorProfile): Promise<AdvisorProfile>;
  updateAdvisorProfile(id: number, profile: Partial<InsertAdvisorProfile>): Promise<AdvisorProfile>;
  
  // Saved calculation operations
  getSavedCalculation(id: number): Promise<SavedCalculation | undefined>;
  getSavedCalculationsByUserId(userId: number): Promise<SavedCalculation[]>;
  createSavedCalculation(calculation: InsertSavedCalculation): Promise<SavedCalculation>;
  deleteSavedCalculation(id: number): Promise<void>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  
  // Payment session operations
  createPaymentSession(token: string, session: any): Promise<void>;
  getPaymentSession(token: string): Promise<any | undefined>;
  updatePaymentSession(token: string, session: any): Promise<void>;
  deletePaymentSession(token: string): Promise<void>;
  
  // Marketplace listing operations
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  getMarketplaceListingsByUserId(userId: number): Promise<MarketplaceListing[]>;
  getAllMarketplaceListings(status?: string): Promise<MarketplaceListing[]>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListingStatus(id: number, status: string): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: number, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing>;
  deleteMarketplaceListing(id: number): Promise<void>;
  
  // Interest submissions operations
  getInterestSubmission(id: number): Promise<InterestSubmission | undefined>;
  getInterestSubmissionsByListingId(listingId: number): Promise<InterestSubmission[]>;
  getInterestSubmissionsByUserId(userId: number): Promise<InterestSubmission[]>;
  createInterestSubmission(submission: InsertInterestSubmission): Promise<InterestSubmission>;
  updateInterestSubmissionStatus(id: number, status: string): Promise<InterestSubmission>;
  
  // User notification preferences
  updateUserNotificationPreferences(userId: number, preferences: {
    notifyNewListings?: boolean;
    notifyMarketUpdates?: boolean;
    notifyApprovedListings?: boolean;
  }): Promise<User>;
  getUsersWithNotificationPreference(preference: 'notifyNewListings' | 'notifyMarketUpdates' | 'notifyApprovedListings'): Promise<User[]>;
  
  // Calculation parameters operations
  getCalculationParameter(id: number): Promise<CalculationParameter | undefined>;
  getCalculationParametersByFirm(firm: string): Promise<CalculationParameter[]>;
  getAllCalculationParameters(): Promise<CalculationParameter[]>;
  createCalculationParameter(parameter: InsertCalculationParameter): Promise<CalculationParameter>;
  updateCalculationParameter(id: number, parameter: Partial<InsertCalculationParameter>): Promise<CalculationParameter>;
  deleteCalculationParameter(id: number): Promise<void>;
  
  // Firm deals operations
  getFirmDeal(id: number): Promise<FirmDeal | undefined>;
  getFirmDealByFirm(firm: string): Promise<FirmDeal | undefined>;
  getAllFirmDeals(): Promise<FirmDeal[]>;
  createFirmDeal(deal: InsertFirmDeal): Promise<FirmDeal>;
  updateFirmDeal(id: number, deal: Partial<InsertFirmDeal>): Promise<FirmDeal>;
  deleteFirmDeal(id: number): Promise<void>;
  syncFirmDealsFromAirtable(deals: any[]): Promise<number>;
  syncCalculationParametersFromAirtable(parameters: any[]): Promise<number>;
  
  // Blog post operations
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Landing page operations
  getLandingPage(id: number): Promise<LandingPage | undefined>;
  getLandingPageBySlug(slug: string): Promise<LandingPage | undefined>;
  getAllLandingPages(activeOnly?: boolean): Promise<LandingPage[]>;
  createLandingPage(page: InsertLandingPage): Promise<LandingPage>;
  updateLandingPage(id: number, page: Partial<InsertLandingPage>): Promise<LandingPage>;
  deleteLandingPage(id: number): Promise<void>;
  
  // Activity logs operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivityLogs(limit?: number): Promise<ActivityLog[]>;
  logActivity(log: {
    userId: number; 
    action: string; 
    entityType: string; 
    entityId?: string | number | null; 
    details?: string;
    timestamp?: Date;
  }): Promise<ActivityLog>;
  
  // Settings operations
  saveSettings(type: string, settings: any): Promise<void>;
  getSettings(type: string): Promise<any>;
  getAllSettings(): Promise<Record<string, any>>;
}