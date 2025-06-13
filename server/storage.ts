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
  
  // Activity log operations
  getRecentActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  logActivity(type: string, action: string, message: string, user?: string): Promise<ActivityLog>;
  
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
  logActivity(type: string, action: string, message: string, user?: string): Promise<ActivityLog>;
  
  // Settings operations
  saveSettings(type: string, settings: any): Promise<void>;
  getSettings(type: string): Promise<any>;
  getAllSettings(): Promise<Record<string, any>>;
}

// In-memory storage implementation

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private advisorProfilesMap: Map<number, AdvisorProfile>;
  private savedCalculationsMap: Map<number, SavedCalculation>;
  private paymentsMap: Map<number, Payment>;
  private paymentSessionsMap: Map<string, any>;
  private marketplaceListingsMap: Map<number, MarketplaceListing>;
  private interestSubmissionsMap: Map<number, InterestSubmission>;
  private calculationParametersMap: Map<number, CalculationParameter>;
  private firmDealsMap: Map<number, FirmDeal>;
  private blogPostsMap: Map<number, BlogPost>;
  private landingPagesMap: Map<number, LandingPage>;
  private activityLogsMap: Map<number, ActivityLog>;
  private settingsMap: Map<string, any>;
  
  currentUserId: number;
  currentAdvisorProfileId: number;
  currentSavedCalculationId: number;
  currentPaymentId: number;
  currentMarketplaceListingId: number;
  currentInterestSubmissionId: number;
  currentCalculationParameterId: number;
  currentFirmDealId: number;
  currentBlogPostId: number;
  currentLandingPageId: number;
  currentActivityLogId: number;
  sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.advisorProfilesMap = new Map();
    this.savedCalculationsMap = new Map();
    this.paymentsMap = new Map();
    this.paymentSessionsMap = new Map<string, any>();
    this.marketplaceListingsMap = new Map();
    this.interestSubmissionsMap = new Map();
    this.calculationParametersMap = new Map();
    this.firmDealsMap = new Map();
    this.blogPostsMap = new Map();
    this.landingPagesMap = new Map();
    this.activityLogsMap = new Map();
    this.settingsMap = new Map<string, any>();
    
    // Initialize default settings
    this.settingsMap.set('ai', {
      defaultBlogInstructions: "Completely rewrite it. Unique. Search Google for more backstory. Format properly for rich-text editor. Make it a tad longer. Open and informative tone.",
      autoGenerateTags: true,
      defaultCategory: "industry-trends",
      publishByDefault: false,
      maxGeneratedLength: 1000
    });
    
    this.currentUserId = 1;
    this.currentAdvisorProfileId = 1;
    this.currentSavedCalculationId = 1;
    this.currentPaymentId = 1;
    this.currentMarketplaceListingId = 1;
    this.currentInterestSubmissionId = 1;
    this.currentCalculationParameterId = 1;
    this.currentFirmDealId = 1;
    this.currentBlogPostId = 1;
    this.currentLandingPageId = 1;
    this.currentActivityLogId = 1;
    
    // Initialize the session store with improved settings
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      stale: false, // Don't allow stale sessions
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days matching cookie max age
      noDisposeOnSet: false, // Clean up on set
      dispose: (sid) => { console.log(`Session ${sid} disposed`) }
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.verificationToken === token
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.resetPasswordToken === token
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    
    const isAdmin = false; // Prevent automatic admin elevation
    
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: false, 
      stripeCustomerId: null,
      emailVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      // Add the new profile fields with default values
      firstName: null,
      lastName: null,
      phone: null,
      city: null,
      state: null,
      firm: null,
      aum: null,
      revenue: null,
      feeBasedPercentage: null,
      // Notification preferences (default to true)
      notifyNewListings: true,
      notifyMarketUpdates: true,
      notifyApprovedListings: true,
      // Admin fields
      isAdmin, // Add admin status
      adminVerificationCode: null,
      adminVerificationExpires: null,
      // Immediate auth fields
      immediateAuthToken: null,
      immediateAuthExpires: null,
      // TOTP fields
      totpSecret: null,
      totpEnabled: false,
      totpVerified: false
    };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUserVerification(userId: number, data: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationTokenExpires?: string | null;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserAdminVerification(userId: number, data: {
    adminVerificationCode?: string | null;
    adminVerificationExpires?: string | null;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      ...data
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserImmediateAuth(userId: number, data: {
    immediateAuthToken?: string | null;
    immediateAuthExpires?: string | null;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Add the immediateAuthToken fields if they don't exist
    const updatedUser = {
      ...user,
      immediateAuthToken: user.immediateAuthToken || null,
      immediateAuthExpires: user.immediateAuthExpires || null,
      ...data
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  // TOTP operations
  async updateUserTOTP(userId: number, data: {
    totpSecret?: string | null;
    totpEnabled?: boolean;
    totpVerified?: boolean;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      ...data
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async setupUserTOTP(userId: number, totpSecret: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      totpSecret,
      totpEnabled: true,
      totpVerified: false // Requires verification after setup
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async verifyUserTOTP(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Mark TOTP as verified
    const updatedUser = {
      ...user,
      totpVerified: true
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async disableUserTOTP(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Reset TOTP settings
    const updatedUser = {
      ...user,
      totpSecret: null,
      totpEnabled: false,
      totpVerified: false
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserByAdminVerificationCode(code: string): Promise<User | undefined> {
    // Convert the map values to an array first and then iterate
    const users = Array.from(this.usersMap.values());
    for (const user of users) {
      if (user.adminVerificationCode === code && user.isAdmin) {
        // Check if code is expired
        if (user.adminVerificationExpires) {
          const expires = new Date(user.adminVerificationExpires);
          if (expires < new Date()) {
            return undefined; // Code expired
          }
        }
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByImmediateAuthToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.immediateAuthToken, token));
    
    if (user && user.immediateAuthExpires) {
      const expires = new Date(user.immediateAuthExpires);
      if (expires < new Date()) {
        console.log(`Immediate auth token for user ${user.username} has expired`);
        return undefined; // Token expired
      }
    }
    
    if (user) {
      console.log(`Found valid immediate auth token for user ${user.username}`);
    } else {
      console.log(`No user found with immediate auth token: ${token ? token.substring(0, 8) + '...' : 'undefined'}`);
    }
    
    return user;
  }
  
  async updateUserResetToken(userId: number, data: {
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
  }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }

  async updateUserPassword(userId: number, password: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ password })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ isPremium })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  async updateUserProfile(userId: number, profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    state?: string;
    firm?: string;
    aum?: string;
    revenue?: string;
    feeBasedPercentage?: string;
  }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  // Get all users
  getAllUsers(): Map<number, User> {
    return this.usersMap;
  }
  
  // Get all admin users
  async getAdminUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(user => user.isAdmin);
  }
  
  // Update any user field
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Delete user
  async deleteUser(userId: number): Promise<void> {
    // Check if user exists
    if (!this.usersMap.has(userId)) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Delete the user
    this.usersMap.delete(userId);
    
    // Also delete associated data
    
    // Delete advisor profile if exists
    const profile = await this.getAdvisorProfileByUserId(userId);
    if (profile) {
      this.advisorProfilesMap.delete(profile.id);
    }
    
    // Delete saved calculations
    const calculations = await this.getSavedCalculationsByUserId(userId);
    for (const calculation of calculations) {
      this.savedCalculationsMap.delete(calculation.id);
    }
    
    // Delete payments
    const payments = await this.getPaymentsByUserId(userId);
    for (const payment of payments) {
      this.paymentsMap.delete(payment.id);
    }
  }
  
  // Advisor profile operations
  async getAdvisorProfile(id: number): Promise<AdvisorProfile | undefined> {
    return this.advisorProfilesMap.get(id);
  }
  
  async getAdvisorProfileByUserId(userId: number): Promise<AdvisorProfile | undefined> {
    return Array.from(this.advisorProfilesMap.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createAdvisorProfile(insertProfile: InsertAdvisorProfile): Promise<AdvisorProfile> {
    const id = this.currentAdvisorProfileId++;
    // Make sure all optional fields are at least null if not provided
    const profileData = {
      ...insertProfile,
      yearsInIndustry: insertProfile.yearsInIndustry ?? null,
      clientRetentionRate: insertProfile.clientRetentionRate ?? null,
      currentPayout: insertProfile.currentPayout ?? null,
      transitionPreference: insertProfile.transitionPreference ?? null,
      retirementTimeline: insertProfile.retirementTimeline ?? null,
      hasTeam: insertProfile.hasTeam ?? false,
      teamSize: insertProfile.teamSize ?? null,
    };
    const profile: AdvisorProfile = { ...profileData, id };
    this.advisorProfilesMap.set(id, profile);
    return profile;
  }
  
  async updateAdvisorProfile(id: number, partialProfile: Partial<InsertAdvisorProfile>): Promise<AdvisorProfile> {
    const profile = await this.getAdvisorProfile(id);
    if (!profile) {
      throw new Error(`Advisor profile with ID ${id} not found`);
    }
    
    const updatedProfile = { ...profile, ...partialProfile };
    this.advisorProfilesMap.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Saved calculation operations
  async getSavedCalculation(id: number): Promise<SavedCalculation | undefined> {
    return this.savedCalculationsMap.get(id);
  }
  
  async getSavedCalculationsByUserId(userId: number): Promise<SavedCalculation[]> {
    return Array.from(this.savedCalculationsMap.values()).filter(
      (calculation) => calculation.userId === userId
    );
  }
  
  async createSavedCalculation(insertCalculation: InsertSavedCalculation): Promise<SavedCalculation> {
    const id = this.currentSavedCalculationId++;
    const calculation: SavedCalculation = { ...insertCalculation, id };
    this.savedCalculationsMap.set(id, calculation);
    return calculation;
  }
  
  async deleteSavedCalculation(id: number): Promise<void> {
    this.savedCalculationsMap.delete(id);
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentsMap.get(id);
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values()).filter(
      (payment) => payment.userId === userId
    );
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { ...insertPayment, id };
    this.paymentsMap.set(id, payment);
    return payment;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    const updatedPayment = { ...payment, status };
    this.paymentsMap.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Payment session operations
  async createPaymentSession(token: string, session: any): Promise<void> {
    if (!token) {
      throw new Error('Payment token is required');
    }
    
    // Add created timestamp if not provided
    const sessionWithTimestamp = {
      ...session,
      createdAt: session.createdAt || new Date().toISOString()
    };
    
    this.paymentSessionsMap.set(token, sessionWithTimestamp);
    console.log(`Created payment session for token: ${token}`);
  }
  
  async getPaymentSession(token: string): Promise<any | undefined> {
    if (!token) {
      return undefined;
    }
    
    const session = this.paymentSessionsMap.get(token);
    console.log(`Retrieved payment session for token: ${token} - ${session ? 'Found' : 'Not found'}`);
    return session;
  }
  
  async updatePaymentSession(token: string, session: any): Promise<void> {
    if (!token) {
      throw new Error('Payment token is required');
    }
    
    const existingSession = this.paymentSessionsMap.get(token);
    if (!existingSession) {
      throw new Error(`Payment session with token ${token} not found`);
    }
    
    // Add updated timestamp
    const updatedSession = {
      ...existingSession,
      ...session,
      updatedAt: new Date().toISOString()
    };
    
    this.paymentSessionsMap.set(token, updatedSession);
    console.log(`Updated payment session for token: ${token}`);
  }
  
  async deletePaymentSession(token: string): Promise<void> {
    if (!token) {
      throw new Error('Payment token is required');
    }
    
    if (!this.paymentSessionsMap.has(token)) {
      throw new Error(`Payment session with token ${token} not found`);
    }
    
    this.paymentSessionsMap.delete(token);
    console.log(`Deleted payment session for token: ${token}`);
  }
  
  // Marketplace listing operations
  async getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined> {
    return this.marketplaceListingsMap.get(id);
  }
  
  async getMarketplaceListingsByUserId(userId: number): Promise<MarketplaceListing[]> {
    return Array.from(this.marketplaceListingsMap.values()).filter(
      (listing) => listing.userId === userId
    );
  }
  
  async getAllMarketplaceListings(status?: string): Promise<MarketplaceListing[]> {
    const listings = Array.from(this.marketplaceListingsMap.values());
    if (status) {
      return listings.filter(listing => listing.status === status);
    }
    return listings;
  }
  
  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const id = this.currentMarketplaceListingId++;
    const now = new Date().toISOString();
    
    // Create the newListing with required structure
    // Ensure all required fields are explicitly set to prevent TypeScript errors
    const newListing: MarketplaceListing = {
      id,
      userId: listing.userId,
      title: listing.title,
      location: listing.location,
      type: listing.type,
      aum: listing.aum,
      revenue: listing.revenue,
      clients: listing.clients,
      status: "Pending", // All new listings start as Pending
      description: listing.description,
      tags: listing.tags,
      highlighted: false, // Default to not highlighted
      createdAt: listing.createdAt || now,
      updatedAt: now,
      contactName: listing.contactName,
      contactEmail: listing.contactEmail,
      // Handle optional fields with null fallback
      contactPhone: listing.contactPhone || null,
      established: listing.established || null,
      clientAvgAge: listing.clientAvgAge || null, 
      investmentStyle: listing.investmentStyle || null,
      feeStructure: listing.feeStructure || null,
      transitionPeriod: listing.transitionPeriod || null,
      askingPrice: listing.askingPrice || null,
      sellerMotivation: listing.sellerMotivation || null,
      growthRate: listing.growthRate || null,
      clientRetentionRate: listing.clientRetentionRate || null,
      dealLength: listing.dealLength || null
    };
    
    this.marketplaceListingsMap.set(id, newListing);
    return newListing;
  }
  
  async updateMarketplaceListingStatus(id: number, status: string): Promise<MarketplaceListing> {
    const listing = await this.getMarketplaceListing(id);
    if (!listing) {
      throw new Error(`Marketplace listing with ID ${id} not found`);
    }
    
    const now = new Date().toISOString();
    const updatedListing = { 
      ...listing, 
      status, 
      updatedAt: now 
    };
    
    this.marketplaceListingsMap.set(id, updatedListing);
    return updatedListing;
  }
  
  async updateMarketplaceListing(id: number, partialListing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing> {
    const listing = await this.getMarketplaceListing(id);
    if (!listing) {
      throw new Error(`Marketplace listing with ID ${id} not found`);
    }
    
    const now = new Date().toISOString();
    const updatedListing = { 
      ...listing, 
      ...partialListing, 
      updatedAt: now 
    };
    
    this.marketplaceListingsMap.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteMarketplaceListing(id: number): Promise<void> {
    if (!this.marketplaceListingsMap.has(id)) {
      throw new Error(`Marketplace listing with ID ${id} not found`);
    }
    
    // Delete the listing
    this.marketplaceListingsMap.delete(id);
    
    // Also delete associated interest submissions
    const submissions = await this.getInterestSubmissionsByListingId(id);
    for (const submission of submissions) {
      this.interestSubmissionsMap.delete(submission.id);
    }
  }
  
  // Interest submissions operations
  async getInterestSubmission(id: number): Promise<InterestSubmission | undefined> {
    return this.interestSubmissionsMap.get(id);
  }
  
  async getInterestSubmissionsByListingId(listingId: number): Promise<InterestSubmission[]> {
    return Array.from(this.interestSubmissionsMap.values()).filter(
      (submission) => submission.listingId === listingId
    );
  }
  
  async getInterestSubmissionsByUserId(userId: number): Promise<InterestSubmission[]> {
    return Array.from(this.interestSubmissionsMap.values()).filter(
      (submission) => submission.userId === userId
    );
  }
  
  async createInterestSubmission(submission: InsertInterestSubmission): Promise<InterestSubmission> {
    const id = this.currentInterestSubmissionId++;
    const now = new Date().toISOString();
    
    // Create the newSubmission with required structure
    // Ensure all required fields are explicitly set to prevent TypeScript errors
    const newSubmission: InterestSubmission = {
      id,
      listingId: submission.listingId,
      userId: submission.userId,
      name: submission.name,
      email: submission.email,
      message: submission.message,
      status: "New", // Default status for new submissions
      createdAt: submission.createdAt || now,
      // Handle optional fields with null fallback
      phone: submission.phone || null
    };
    
    this.interestSubmissionsMap.set(id, newSubmission);
    return newSubmission;
  }
  
  async updateInterestSubmissionStatus(id: number, status: string): Promise<InterestSubmission> {
    const submission = await this.getInterestSubmission(id);
    if (!submission) {
      throw new Error(`Interest submission with ID ${id} not found`);
    }
    
    const updatedSubmission = { ...submission, status };
    this.interestSubmissionsMap.set(id, updatedSubmission);
    return updatedSubmission;
  }
  
  // User notification preferences
  async updateUserNotificationPreferences(userId: number, preferences: {
    notifyNewListings?: boolean;
    notifyMarketUpdates?: boolean;
    notifyApprovedListings?: boolean;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, ...preferences };
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUsersWithNotificationPreference(preference: 'notifyNewListings' | 'notifyMarketUpdates' | 'notifyApprovedListings'): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(
      (user) => user[preference] === true
    );
  }
  
  // Calculation parameters operations
  async getCalculationParameter(id: number): Promise<CalculationParameter | undefined> {
    return this.calculationParametersMap.get(id);
  }
  
  async getCalculationParametersByFirm(firm: string): Promise<CalculationParameter[]> {
    return Array.from(this.calculationParametersMap.values()).filter(
      (param) => param.firm.toLowerCase() === firm.toLowerCase()
    );
  }
  
  async getAllCalculationParameters(): Promise<CalculationParameter[]> {
    return Array.from(this.calculationParametersMap.values());
  }
  
  async createCalculationParameter(parameter: InsertCalculationParameter): Promise<CalculationParameter> {
    const id = this.currentCalculationParameterId++;
    const now = new Date().toISOString();
    
    const newParameter: CalculationParameter = {
      ...parameter,
      id,
      updatedAt: now,
      notes: parameter.notes || null
    };
    
    this.calculationParametersMap.set(id, newParameter);
    return newParameter;
  }
  
  async updateCalculationParameter(id: number, parameter: Partial<InsertCalculationParameter>): Promise<CalculationParameter> {
    const existingParameter = await this.getCalculationParameter(id);
    if (!existingParameter) {
      throw new Error(`Calculation parameter with ID ${id} not found`);
    }
    
    const now = new Date().toISOString();
    const updatedParameter = {
      ...existingParameter,
      ...parameter,
      updatedAt: now
    };
    
    this.calculationParametersMap.set(id, updatedParameter);
    return updatedParameter;
  }
  
  async deleteCalculationParameter(id: number): Promise<void> {
    if (!this.calculationParametersMap.has(id)) {
      throw new Error(`Calculation parameter with ID ${id} not found`);
    }
    
    this.calculationParametersMap.delete(id);
  }
  
  // Firm deals operations
  async getFirmDeal(id: number): Promise<FirmDeal | undefined> {
    return this.firmDealsMap.get(id);
  }
  
  async getFirmDealByFirm(firm: string): Promise<FirmDeal | undefined> {
    return Array.from(this.firmDealsMap.values()).find(
      (deal) => deal.firm.toLowerCase() === firm.toLowerCase()
    );
  }
  
  async getAllFirmDeals(): Promise<FirmDeal[]> {
    return Array.from(this.firmDealsMap.values());
  }
  
  async createFirmDeal(deal: InsertFirmDeal): Promise<FirmDeal> {
    const id = this.currentFirmDealId++;
    const now = new Date().toISOString();
    
    const newDeal: FirmDeal = {
      ...deal,
      id,
      updatedAt: now,
      notes: deal.notes || null
    };
    
    this.firmDealsMap.set(id, newDeal);
    return newDeal;
  }
  
  async updateFirmDeal(id: number, deal: Partial<InsertFirmDeal>): Promise<FirmDeal> {
    const existingDeal = await this.getFirmDeal(id);
    if (!existingDeal) {
      throw new Error(`Firm deal with ID ${id} not found`);
    }
    
    const now = new Date().toISOString();
    const updatedDeal = {
      ...existingDeal,
      ...deal,
      updatedAt: now
    };
    
    this.firmDealsMap.set(id, updatedDeal);
    return updatedDeal;
  }
  
  async deleteFirmDeal(id: number): Promise<void> {
    if (!this.firmDealsMap.has(id)) {
      throw new Error(`Firm deal with ID ${id} not found`);
    }
    
    this.firmDealsMap.delete(id);
  }
  
  // Synchronization functions for Airtable data
  async syncFirmDealsFromAirtable(deals: any[]): Promise<number> {
    let syncCount = 0;
    
    // Clear existing deals first
    this.firmDealsMap = new Map();
    this.currentFirmDealId = 1;
    
    for (const deal of deals) {
      try {
        // Create a new firm deal with the Airtable data
        // Convert values to appropriate types and ensure required fields are present
        const firmName = deal.firm || '';
        const upfrontMin = typeof deal.upfrontMin === 'number' ? String(deal.upfrontMin) : '0';
        const upfrontMax = typeof deal.upfrontMax === 'number' ? String(deal.upfrontMax) : '0';
        const backendMin = typeof deal.backendMin === 'number' ? String(deal.backendMin) : '0';
        const backendMax = typeof deal.backendMax === 'number' ? String(deal.backendMax) : '0';
        const totalDealMin = typeof deal.totalDealMin === 'number' ? String(deal.totalDealMin) : '0';
        const totalDealMax = typeof deal.totalDealMax === 'number' ? String(deal.totalDealMax) : '0';
        
        await this.createFirmDeal({
          firm: firmName,
          upfrontMin,
          upfrontMax,
          backendMin,
          backendMax,
          totalDealMin,
          totalDealMax,
          notes: deal.notes || '',
        });
        
        syncCount++;
      } catch (error) {
        console.error(`Error syncing firm deal for ${deal.firm || 'Unknown firm'}:`, error);
      }
    }
    
    return syncCount;
  }
  
  async syncCalculationParametersFromAirtable(parameters: any[]): Promise<number> {
    let syncCount = 0;
    
    // Clear existing parameters first
    this.calculationParametersMap = new Map();
    this.currentCalculationParameterId = 1;
    
    for (const param of parameters) {
      try {
        // Create a new calculation parameter with the Airtable data
        // Convert values to appropriate types and ensure required fields are present
        const firmName = param.firm || '';
        const paramName = param.paramName || '';
        const paramValue = typeof param.paramValue === 'number' ? String(param.paramValue) : '0';
        
        await this.createCalculationParameter({
          firm: firmName,
          paramName,
          paramValue,
          notes: param.notes || '',
        });
        
        syncCount++;
      } catch (error) {
        console.error(`Error syncing calculation parameter for ${param.firm || 'Unknown firm'}:`, error);
      }
    }
    
    return syncCount;
  }
  
  // Blog post operations
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPostsMap.get(id);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPostsMap.values()).find(
      (post) => post.slug === slug
    );
  }
  
  async getAllBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPostsMap.values());
    
    if (publishedOnly) {
      posts = posts.filter(post => post.published);
    }
    
    // Sort by created date, newest first
    return posts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const now = new Date().toISOString();
    
    const newPost: BlogPost = {
      ...post,
      id,
      updatedAt: now,
      // Ensure all required properties have default values if not provided
      featuredImage: post.featuredImage || null,
      published: post.published !== undefined ? post.published : false,
      featured: post.featured !== undefined ? post.featured : false
    };
    this.blogPostsMap.set(id, newPost);
    return newPost;
  }
  
  async updateBlogPost(id: number, partialPost: Partial<InsertBlogPost>): Promise<BlogPost> {
    const post = await this.getBlogPost(id);
    if (!post) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    
    const updatedPost = { 
      ...post, 
      ...partialPost,
      updatedAt: new Date().toISOString() 
    };
    this.blogPostsMap.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<void> {
    this.blogPostsMap.delete(id);
  }
  
  // Landing page operations
  async getLandingPage(id: number): Promise<LandingPage | undefined> {
    return this.landingPagesMap.get(id);
  }
  
  async getLandingPageBySlug(slug: string): Promise<LandingPage | undefined> {
    return Array.from(this.landingPagesMap.values()).find(
      (page) => page.slug === slug
    );
  }
  
  async getAllLandingPages(activeOnly?: boolean): Promise<LandingPage[]> {
    let pages = Array.from(this.landingPagesMap.values());
    
    if (activeOnly) {
      pages = pages.filter(page => page.isActive);
    }
    
    // Sort by created date, newest first
    return pages.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }
  
  async createLandingPage(page: InsertLandingPage): Promise<LandingPage> {
    const id = this.currentLandingPageId++;
    const now = new Date().toISOString();
    
    const newPage: LandingPage = {
      ...page,
      id,
      createdAt: now,
      updatedAt: now,
      // Ensure all required properties have default values if not provided
      logoUrl: page.logoUrl || null,
      heroColor: page.heroColor || "#1d4ed8",
      isActive: page.isActive !== undefined ? page.isActive : true
    };
    this.landingPagesMap.set(id, newPage);
    return newPage;
  }
  
  async updateLandingPage(id: number, partialPage: Partial<InsertLandingPage>): Promise<LandingPage> {
    const page = await this.getLandingPage(id);
    if (!page) {
      throw new Error(`Landing page with ID ${id} not found`);
    }
    
    const updatedPage = { 
      ...page, 
      ...partialPage,
      updatedAt: new Date().toISOString() 
    };
    this.landingPagesMap.set(id, updatedPage);
    return updatedPage;
  }
  
  async deleteLandingPage(id: number): Promise<void> {
    // Check if the landing page exists
    if (!this.landingPagesMap.has(id)) {
      throw new Error(`Landing page with ID ${id} not found`);
    }
    
    // Delete the landing page
    this.landingPagesMap.delete(id);
  }
  
  // Settings operations for MemStorage
  async saveSettings(type: string, settings: any): Promise<void> {
    // Merge with existing settings if they exist
    if (this.settingsMap.has(type)) {
      const existingSettings = this.settingsMap.get(type);
      this.settingsMap.set(type, { ...existingSettings, ...settings });
    } else {
      this.settingsMap.set(type, settings);
    }
    
    console.log(`Settings saved for type: ${type}`);
  }

  async getSettings(type: string): Promise<any> {
    return this.settingsMap.get(type) || null;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings: Record<string, any> = {};
    for (const [key, value] of this.settingsMap.entries()) {
      settings[key] = value;
    }
    return settings;
  }
  
  // Activity logs operations for MemStorage
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const activityLog: ActivityLog = {
      id,
      type: log.type,
      action: log.action,
      message: log.message,
      user: log.user || "system",
      timestamp: log.timestamp || new Date()
    };
    
    this.activityLogsMap.set(id, activityLog);
    return activityLog;
  }
  
  async getRecentActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogsMap.values());
    
    // Sort by timestamp in descending order (newest first)
    const sortedLogs = logs.sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Return only the requested number of logs
    return sortedLogs.slice(0, limit);
  }
  
  async logActivity(type: string, action: string, message: string, user?: string): Promise<ActivityLog> {
    return this.createActivityLog({
      type,
      action,
      message,
      user: user || "system",
      timestamp: new Date()
    });
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session',
      pruneSessionInterval: 60, // Prune expired sessions every 60 seconds
      disableTouch: false, // Ensure session TTL is extended on each request
      errorLog: (err) => console.error('Session store error:', err)
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error(`Error retrieving user with ID ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token));
    return user;
  }

  async getUserByAdminVerificationCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.adminVerificationCode, code),
        eq(users.isAdmin, true)
      )
    );
    
    if (user && user.adminVerificationExpires) {
      const expires = new Date(user.adminVerificationExpires);
      if (expires < new Date()) {
        return undefined; // Code expired
      }
    }
    
    return user;
  }

  async getUserByImmediateAuthToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.immediateAuthToken, token));
    
    if (user && user.immediateAuthExpires) {
      const expires = new Date(user.immediateAuthExpires);
      if (expires < new Date()) {
        return undefined; // Token expired
      }
    }
    
    return user;
  }

  async getAllUsers(): Map<number, User> {
    const allUsers = await db.select().from(users);
    const usersMap = new Map<number, User>();
    
    for (const user of allUsers) {
      usersMap.set(user.id, user);
    }
    
    return usersMap;
  }

  async getAdminUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.isAdmin, true));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Set default values for user
    const userToInsert = {
      ...insertUser,
      isPremium: false,
      emailVerified: false,
      notifyNewListings: true,
      notifyMarketUpdates: true,
      notifyApprovedListings: true,
      isAdmin: false,
      totpEnabled: false,
      totpVerified: false
    };
    
    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
      
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user;
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User> {
    return this.updateUser(userId, { isPremium });
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    return this.updateUser(userId, { stripeCustomerId });
  }

  async updateUserVerification(userId: number, data: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationTokenExpires?: string | null;
  }): Promise<User> {
    return this.updateUser(userId, data);
  }

  async updateUserAdminVerification(userId: number, data: {
    adminVerificationCode?: string | null;
    adminVerificationExpires?: string | null;
  }): Promise<User> {
    return this.updateUser(userId, data);
  }

  async updateUserImmediateAuth(userId: number, data: {
    immediateAuthToken?: string | null;
    immediateAuthExpires?: string | null;
  }): Promise<User> {
    return this.updateUser(userId, data);
  }

  // TOTP operations
  async updateUserTOTP(userId: number, data: {
    totpSecret?: string | null;
    totpEnabled?: boolean;
    totpVerified?: boolean;
  }): Promise<User> {
    return this.updateUser(userId, data);
  }

  async setupUserTOTP(userId: number, totpSecret: string): Promise<User> {
    return this.updateUser(userId, {
      totpSecret,
      totpEnabled: true,
      totpVerified: false
    });
  }

  async verifyUserTOTP(userId: number): Promise<User> {
    return this.updateUser(userId, { totpVerified: true });
  }

  async disableUserTOTP(userId: number): Promise<User> {
    return this.updateUser(userId, {
      totpSecret: null,
      totpEnabled: false,
      totpVerified: false
    });
  }

  async updateUserResetToken(userId: number, data: {
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
  }): Promise<User> {
    return this.updateUser(userId, data);
  }

  async updateUserPassword(userId: number, password: string): Promise<User> {
    return this.updateUser(userId, { password });
  }

  async updateUserProfile(userId: number, profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    state?: string;
    firm?: string;
    aum?: string;
    revenue?: string;
    feeBasedPercentage?: string;
  }): Promise<User> {
    return this.updateUser(userId, profileData);
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  // Advisor profile operations
  async getAdvisorProfile(id: number): Promise<AdvisorProfile | undefined> {
    const [profile] = await db.select().from(advisorProfiles).where(eq(advisorProfiles.id, id));
    return profile;
  }

  async getAdvisorProfileByUserId(userId: number): Promise<AdvisorProfile | undefined> {
    const [profile] = await db.select().from(advisorProfiles).where(eq(advisorProfiles.userId, userId));
    return profile;
  }

  async createAdvisorProfile(profile: InsertAdvisorProfile): Promise<AdvisorProfile> {
    const [newProfile] = await db.insert(advisorProfiles).values(profile).returning();
    return newProfile;
  }

  async updateAdvisorProfile(id: number, profile: Partial<InsertAdvisorProfile>): Promise<AdvisorProfile> {
    const [updatedProfile] = await db
      .update(advisorProfiles)
      .set(profile)
      .where(eq(advisorProfiles.id, id))
      .returning();
      
    if (!updatedProfile) {
      throw new Error(`Advisor profile with ID ${id} not found`);
    }
    
    return updatedProfile;
  }

  // Saved calculation operations
  async getSavedCalculation(id: number): Promise<SavedCalculation | undefined> {
    const [calculation] = await db.select().from(savedCalculations).where(eq(savedCalculations.id, id));
    return calculation;
  }

  async getSavedCalculationsByUserId(userId: number): Promise<SavedCalculation[]> {
    return db.select().from(savedCalculations).where(eq(savedCalculations.userId, userId));
  }

  async createSavedCalculation(calculation: InsertSavedCalculation): Promise<SavedCalculation> {
    const [newCalculation] = await db.insert(savedCalculations).values(calculation).returning();
    return newCalculation;
  }

  async deleteSavedCalculation(id: number): Promise<void> {
    await db.delete(savedCalculations).where(eq(savedCalculations.id, id));
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
      
    if (!updatedPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    return updatedPayment;
  }

  // Payment session operations
  // Note: These will need a different approach for persistence in database
  async createPaymentSession(token: string, sessionData: any): Promise<void> {
    // In a real implementation, you'd create a payment_sessions table
    // For now, we'll store them in memory
    console.log(`Creating payment session for token: ${token}`);
  }

  async getPaymentSession(token: string): Promise<any | undefined> {
    // In a real implementation, you'd query from payment_sessions table
    console.log(`Getting payment session for token: ${token}`);
    return undefined;
  }

  async updatePaymentSession(token: string, sessionData: any): Promise<void> {
    // In a real implementation, you'd update payment_sessions table
    console.log(`Updating payment session for token: ${token}`);
  }

  async deletePaymentSession(token: string): Promise<void> {
    // In a real implementation, you'd delete from payment_sessions table
    console.log(`Deleting payment session for token: ${token}`);
  }

  // Marketplace listing operations
  async getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id));
    return listing;
  }

  async getMarketplaceListingsByUserId(userId: number): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings).where(eq(marketplaceListings.userId, userId));
  }

  async getAllMarketplaceListings(status?: string): Promise<MarketplaceListing[]> {
    if (status) {
      return db.select().from(marketplaceListings).where(eq(marketplaceListings.status, status));
    }
    return db.select().from(marketplaceListings);
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const [newListing] = await db.insert(marketplaceListings).values({
      ...listing,
      status: "Pending", // Default status
      highlighted: false, // Default highlighted
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return newListing;
  }

  async updateMarketplaceListingStatus(id: number, status: string): Promise<MarketplaceListing> {
    const [updatedListing] = await db
      .update(marketplaceListings)
      .set({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(marketplaceListings.id, id))
      .returning();
      
    if (!updatedListing) {
      throw new Error(`Listing with ID ${id} not found`);
    }
    
    return updatedListing;
  }

  async updateMarketplaceListing(id: number, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing> {
    const [updatedListing] = await db
      .update(marketplaceListings)
      .set({ 
        ...listing,
        updatedAt: new Date().toISOString()
      })
      .where(eq(marketplaceListings.id, id))
      .returning();
      
    if (!updatedListing) {
      throw new Error(`Listing with ID ${id} not found`);
    }
    
    return updatedListing;
  }

  async deleteMarketplaceListing(id: number): Promise<void> {
    await db.delete(marketplaceListings).where(eq(marketplaceListings.id, id));
  }

  // Interest submissions operations
  async getInterestSubmission(id: number): Promise<InterestSubmission | undefined> {
    const [submission] = await db.select().from(interestSubmissions).where(eq(interestSubmissions.id, id));
    return submission;
  }

  async getInterestSubmissionsByListingId(listingId: number): Promise<InterestSubmission[]> {
    return db.select().from(interestSubmissions).where(eq(interestSubmissions.listingId, listingId));
  }

  async getInterestSubmissionsByUserId(userId: number): Promise<InterestSubmission[]> {
    return db.select().from(interestSubmissions).where(eq(interestSubmissions.userId, userId));
  }

  async createInterestSubmission(submission: InsertInterestSubmission): Promise<InterestSubmission> {
    const [newSubmission] = await db.insert(interestSubmissions).values({
      ...submission,
      status: "New", // Default status
    }).returning();
    
    return newSubmission;
  }

  async updateInterestSubmissionStatus(id: number, status: string): Promise<InterestSubmission> {
    const [updatedSubmission] = await db
      .update(interestSubmissions)
      .set({ status })
      .where(eq(interestSubmissions.id, id))
      .returning();
      
    if (!updatedSubmission) {
      throw new Error(`Submission with ID ${id} not found`);
    }
    
    return updatedSubmission;
  }

  // User notification preferences
  async updateUserNotificationPreferences(userId: number, preferences: {
    notifyNewListings?: boolean;
    notifyMarketUpdates?: boolean;
    notifyApprovedListings?: boolean;
  }): Promise<User> {
    return this.updateUser(userId, preferences);
  }

  async getUsersWithNotificationPreference(preference: 'notifyNewListings' | 'notifyMarketUpdates' | 'notifyApprovedListings'): Promise<User[]> {
    return db.select().from(users).where(eq(users[preference], true));
  }

  // Calculation parameters operations
  async getCalculationParameter(id: number): Promise<CalculationParameter | undefined> {
    const [parameter] = await db.select().from(calculationParameters).where(eq(calculationParameters.id, id));
    return parameter;
  }

  async getCalculationParametersByFirm(firm: string): Promise<CalculationParameter[]> {
    return db.select().from(calculationParameters).where(eq(calculationParameters.firm, firm));
  }

  async getAllCalculationParameters(): Promise<CalculationParameter[]> {
    return db.select().from(calculationParameters);
  }

  async createCalculationParameter(parameter: InsertCalculationParameter): Promise<CalculationParameter> {
    const [newParameter] = await db.insert(calculationParameters).values({
      ...parameter,
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return newParameter;
  }

  async updateCalculationParameter(id: number, parameter: Partial<InsertCalculationParameter>): Promise<CalculationParameter> {
    const [updatedParameter] = await db
      .update(calculationParameters)
      .set({ 
        ...parameter,
        updatedAt: new Date().toISOString()
      })
      .where(eq(calculationParameters.id, id))
      .returning();
      
    if (!updatedParameter) {
      throw new Error(`Parameter with ID ${id} not found`);
    }
    
    return updatedParameter;
  }

  async deleteCalculationParameter(id: number): Promise<void> {
    await db.delete(calculationParameters).where(eq(calculationParameters.id, id));
  }

  // Firm deals operations
  async getFirmDeal(id: number): Promise<FirmDeal | undefined> {
    const [deal] = await db.select().from(firmDeals).where(eq(firmDeals.id, id));
    return deal;
  }

  async getFirmDealByFirm(firm: string): Promise<FirmDeal | undefined> {
    const [deal] = await db.select().from(firmDeals).where(eq(firmDeals.firm, firm));
    return deal;
  }

  async getAllFirmDeals(): Promise<FirmDeal[]> {
    return db.select().from(firmDeals);
  }

  async createFirmDeal(deal: InsertFirmDeal): Promise<FirmDeal> {
    const [newDeal] = await db.insert(firmDeals).values({
      ...deal,
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return newDeal;
  }

  async updateFirmDeal(id: number, deal: Partial<InsertFirmDeal>): Promise<FirmDeal> {
    const [updatedDeal] = await db
      .update(firmDeals)
      .set({ 
        ...deal,
        updatedAt: new Date().toISOString()
      })
      .where(eq(firmDeals.id, id))
      .returning();
      
    if (!updatedDeal) {
      throw new Error(`Deal with ID ${id} not found`);
    }
    
    return updatedDeal;
  }

  async deleteFirmDeal(id: number): Promise<void> {
    await db.delete(firmDeals).where(eq(firmDeals.id, id));
  }

  async syncFirmDealsFromAirtable(deals: any[]): Promise<number> {
    let successCount = 0;
    
    for (const deal of deals) {
      try {
        // Check if deal already exists
        const existingDeal = await this.getFirmDealByFirm(deal.firm);
        
        if (existingDeal) {
          // Update existing deal
          await this.updateFirmDeal(existingDeal.id, {
            upfrontMin: deal.upfrontMin,
            upfrontMax: deal.upfrontMax,
            backendMin: deal.backendMin,
            backendMax: deal.backendMax,
            totalDealMin: deal.totalDealMin,
            totalDealMax: deal.totalDealMax,
            notes: deal.notes
          });
        } else {
          // Create new deal
          await this.createFirmDeal({
            firm: deal.firm,
            upfrontMin: deal.upfrontMin,
            upfrontMax: deal.upfrontMax,
            backendMin: deal.backendMin,
            backendMax: deal.backendMax,
            totalDealMin: deal.totalDealMin,
            totalDealMax: deal.totalDealMax,
            notes: deal.notes,
            updatedAt: new Date().toISOString()
          });
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error syncing firm deal: ${error}`);
      }
    }
    
    return successCount;
  }

  async syncCalculationParametersFromAirtable(parameters: any[]): Promise<number> {
    let successCount = 0;
    
    for (const param of parameters) {
      try {
        // Check if parameter already exists by firm and name
        const existingParams = await this.getCalculationParametersByFirm(param.firm);
        const existingParam = existingParams.find(p => p.paramName === param.paramName);
        
        if (existingParam) {
          // Update existing parameter
          await this.updateCalculationParameter(existingParam.id, {
            paramValue: param.paramValue,
            notes: param.notes
          });
        } else {
          // Create new parameter
          await this.createCalculationParameter({
            firm: param.firm,
            paramName: param.paramName,
            paramValue: param.paramValue,
            notes: param.notes,
            updatedAt: new Date().toISOString()
          });
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error syncing calculation parameter: ${error}`);
      }
    }
    
    return successCount;
  }

  // Blog post operations
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getAllBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]> {
    // Get all blog posts
    let posts;
    
    if (publishedOnly) {
      posts = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.published, true));
    } else {
      posts = await db.select()
        .from(blogPosts);
    }
    
    // Sort posts manually - this enables us to use custom sorting logic
    // for handling backdated posts and publication dates
    return posts.sort((a, b) => {
      // Extract publishDate from content if available (we store it as a special HTML comment)
      let publishDateA = null;
      let publishDateB = null;
      
      // Check for publishDate in content
      if (a.content && a.content.startsWith('<!--publishDate:')) {
        const match = a.content.match(/<!--publishDate:([^>]*)-->/);
        if (match && match[1]) {
          publishDateA = new Date(match[1]).getTime();
        }
      }
      
      if (b.content && b.content.startsWith('<!--publishDate:')) {
        const match = b.content.match(/<!--publishDate:([^>]*)-->/);
        if (match && match[1]) {
          publishDateB = new Date(match[1]).getTime();
        }
      }
      
      // Use publishDate if found, otherwise fall back to createdAt
      const dateA = publishDateA || new Date(a.createdAt).getTime();
      const dateB = publishDateB || new Date(b.createdAt).getTime();
      
      // Sort in descending order (newest first)
      return dateB - dateA;
    });
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values({
      ...post,
      updatedAt: new Date().toISOString(),
      published: post.published || false,
      featured: post.featured || false
    }).returning();
    
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ 
        ...post,
        updatedAt: new Date().toISOString()
      })
      .where(eq(blogPosts.id, id))
      .returning();
      
    if (!updatedPost) {
      throw new Error(`Blog post with ID ${id} not found`);
    }
    
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
  
  async initializeBlogPostsIfNeeded(): Promise<void> {
    // Check if we already have blog posts
    const existingPosts = await this.getAllBlogPosts();
    
    if (existingPosts.length === 0) {
      console.log("No blog posts found in database. Initializing with seed data...");
      
      // Homepage blog content
      const blogSeedData = [
        {
          title: "The Complete Guide to Maximizing Your Practice's Valuation",
          slug: "maximize-practice-valuation-guide",
          excerpt: "Learn the key factors that drive higher valuations for financial advisor practices and how to implement strategic improvements before selling.",
          content: `
# The Complete Guide to Maximizing Your Practice's Valuation

Financial advisors who are considering selling their practice want to ensure they receive the highest possible valuation. This comprehensive guide explores the key factors that drive practice value and provides actionable strategies to maximize your valuation before going to market.

## Understanding Valuation Multiples

Most financial advisor practices are valued based on a multiple of revenue or earnings. The specific multiple applied to your practice depends on several factors:

- **Revenue Type**: Recurring revenue (fee-based) is valued higher than transactional revenue
- **Client Demographics**: Younger clients with longer potential relationships are more valuable
- **Growth Trajectory**: Practices with consistent growth command higher multiples
- **Profitability**: Higher profit margins lead to higher valuations
- **Client Retention**: Stronger client retention rates reduce perceived risk

## Strategic Improvements to Boost Valuation

### 1. Convert to Fee-Based Revenue

Buyers strongly prefer practices with recurring, fee-based revenue over commission-based models. If possible, shift more clients to fee-based accounts before selling. This provides more predictable cash flow and is typically valued at higher multiples.

### 2. Document Your Client Relationships

Ensure all client relationships are well-documented with:
- Comprehensive financial plans
- Investment policy statements
- Regular review meeting notes
- Relationship history

This demonstrates that client relationships are with the firm, not just with you personally, making the transition to a new owner smoother.

### 3. Strengthen Your Team

A practice that relies entirely on the selling advisor is less valuable than one with a strong support team. Consider:
- Hiring and training junior advisors
- Documenting all processes and procedures
- Creating clear roles and responsibilities

### 4. Optimize Client Demographics

If possible, focus on acquiring clients in their 50s or younger in the years leading up to a sale. Younger clients represent longer future revenue streams for buyers.

### 5. Demonstrate Growth Potential

Buyers pay premiums for practices with clear growth opportunities:
- Document referral systems
- Show marketing initiatives and results
- Identify untapped revenue opportunities within existing clients

## Implementation Timeline

To maximize value, begin these improvements 2-3 years before your planned sale date. This provides enough time to show results while ensuring the improvements are recent enough to be relevant to buyers.

## Conclusion

By strategically addressing these key valuation drivers, financial advisors can significantly increase their practice value before going to market. The investment in these improvements typically yields returns many times over in the final sale price.
          `,
          author: "Financial Advisor Strategy Team",
          category: "Practice Management",
          tags: JSON.stringify(["Practice Valuation", "Succession Planning", "Practice Growth"]),
          featuredImage: "/images/practice-valuation.jpg",
          published: true,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          title: "Transitioning to Independence: Pros, Cons, and Best Practices",
          slug: "transitioning-to-independence",
          excerpt: "A detailed analysis of what advisors should consider when transitioning from wirehouses to independence, including financial implications and client retention strategies.",
          content: `
# Transitioning to Independence: Pros, Cons, and Best Practices

The move from a wirehouse to independence represents one of the most significant career decisions a financial advisor can make. This guide explores the advantages, challenges, and critical success factors for advisors considering this transition.

## The Independence Spectrum

It's important to understand that "independence" isn't a single destination but a spectrum of options:

- **Independent Broker-Dealer (IBD)**: Maintain commission business while gaining more autonomy
- **Hybrid RIA**: Operate your own RIA while affiliating with a broker-dealer for commission business
- **Pure RIA**: Complete independence with a fiduciary standard and fee-only compensation
- **Supported Independence**: Join an existing RIA platform that provides infrastructure

## Financial Considerations

### Transition Packages
Unlike wirehouse recruiting deals, independence typically doesn't offer large upfront bonuses. Instead, advisors benefit from:

- Higher payout rates (typically 80-100% vs. 40-50% at wirehouses)
- Equity in their business (a significant long-term asset)
- Tax advantages of business ownership

### Startup Costs
Initial investment varies based on the independence model chosen:
- Technology: $10,000-$50,000
- Office space: $5,000-$20,000 monthly
- Staff: $15,000-$30,000 monthly
- Legal and compliance: $10,000-$30,000 annually

## Client Retention Strategies

The most critical factor in a successful transition is client retention. Best practices include:

1. **Pre-Transition Communication Planning**: Develop a careful strategy for initial client announcements
2. **Focused Outreach**: Contact top clients personally within the first 48 hours
3. **Clear Value Proposition**: Clearly articulate how independence benefits clients
4. **Paperwork Efficiency**: Streamline the repapering process to minimize client friction
5. **Transition Team**: Consider hiring temporary help specifically for the transition period

## Technology Considerations

Independent advisors must select and integrate their own technology stack:

- **CRM**: Redtail, Salesforce, Wealthbox
- **Portfolio Management**: Orion, Black Diamond, Tamarac
- **Financial Planning**: eMoney, MoneyGuidePro, RightCapital
- **Trading/Rebalancing**: iRebal, Tamarac, RedBlack
- **Document Management**: Laser App, DocuSign

## Timeline for Success

A typical successful transition follows this timeline:

- **12-18 months before**: Begin research and due diligence
- **6-12 months before**: Select partners and platforms
- **3-6 months before**: Establish legal entity and secure office space
- **1-3 months before**: Finalize technology and operations
- **Transition period**: 90-day intensive client transition phase
- **3-6 months after**: Stabilization and process refinement

## Conclusion

Independence offers significant benefits in autonomy, economics, and client service capabilities, but requires careful planning and execution. For advisors who value business ownership and creating their own vision, the rewards often outweigh the challenges.
          `,
          author: "Independence Transition Team",
          category: "Career Strategies",
          tags: JSON.stringify(["Independence", "RIA", "Wirehouse", "Transition"]),
          featuredImage: "/images/independence-transition.jpg",
          published: true,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          title: "Understanding Financial Advisor Deal Structures: Upfront vs. Backend",
          slug: "advisor-deal-structures",
          excerpt: "An in-depth analysis of various deal structures offered to financial advisors when changing firms, including the trade-offs between upfront and backend compensation.",
          content: `
# Understanding Financial Advisor Deal Structures: Upfront vs. Backend

When financial advisors transition between firms, the compensation packages they're offered can be complex and vary significantly across different types of institutions. This comprehensive guide helps advisors understand and evaluate the various deal structures they may encounter.

## The Basic Components of Transition Deals

Most transition packages for financial advisors include some combination of:

1. **Upfront Bonuses**: Cash paid immediately upon joining
2. **Backend Bonuses**: Performance-based incentives paid over time
3. **Expense Assistance**: Funds for transition costs and client acquisition
4. **Equity/Ownership**: Stakes in the business itself
5. **Payout Enhancements**: Higher grid rates for a specified period

## Comparing Deal Structures Across Channels

### Wirehouse Deals
- **Upfront**: Typically 150-250% of trailing 12-month production
- **Backend**: Additional 50-100% based on asset transfer and growth targets
- **Structure**: Structured as forgivable loans over 7-10 years
- **Terms**: Require production minimums and full-term employment

### Regional Broker-Dealer Deals
- **Upfront**: Generally 100-175% of trailing 12-month production
- **Backend**: Similar to wirehouses but with more achievable targets
- **Structure**: Combination of upfront bonuses and forgivable loans
- **Terms**: Typically 5-7 year commitments

### Independent Broker-Dealer Transition Packages
- **Upfront**: Usually 25-75% of trailing 12-month production
- **Backend**: Minimal backend components compared to wirehouses
- **Structure**: Transition assistance and higher payouts
- **Terms**: Shorter commitments (3-5 years) with higher ongoing payout rates

### RIA Platform Deals
- **Upfront**: Minimal or no upfront money (0-50%)
- **Backend**: Equity opportunities in lieu of cash incentives
- **Structure**: Higher payout percentages and business equity
- **Terms**: Requires business building mindset and longer-term horizon

## Evaluating the True Value of a Deal

To properly compare offers, advisors should consider:

### 1. Net Present Value (NPV) Analysis
Calculate the present value of all payments over time, accounting for:
- Taxes on upfront and backend components
- The time value of money
- Probability of achieving backend targets

### 2. After-Tax Take-Home Calculations
Consider the total after-tax earnings over the life of the deal:
- Upfront money (minus taxes)
- Backend incentives (probability-adjusted)
- Ongoing payout on projected production
- Sunset/equity value at the end of the agreement

### 3. Non-Monetary Factors
Beyond the financial components, evaluate:
- Platform capabilities for serving clients
- Long-term career growth opportunities
- Quality of life and autonomy
- Cultural alignment

## Common Pitfalls in Deal Evaluation

### The Upfront Money Trap
Many advisors overvalue upfront money without fully understanding:
- Its true cost in terms of long-term compensation
- The restrictions it places on future flexibility
- The impact of failing to meet backend targets

### The Payout Percentage Illusion
Higher payout percentages can be misleading if:
- Product availability is restricted
- Platform fees offset the higher payout
- Support services are limited

## Conclusion

The optimal deal structure depends on each advisor's individual circumstances, including career stage, client base, and long-term goals. By understanding the complete picture and conducting thorough due diligence, advisors can make transitions that enhance both their client service capabilities and long-term financial success.
          `,
          author: "Advisor Compensation Analyst",
          category: "Compensation",
          tags: JSON.stringify(["Recruiting", "Compensation", "Deal Structure", "Transition"]),
          featuredImage: "/images/deal-structure.jpg",
          published: true,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          title: "5 Critical KPIs to Monitor When Growing Your Advisory Practice",
          slug: "critical-advisory-practice-kpis",
          excerpt: "Key performance indicators that financial advisors should track to measure practice health and growth, with actionable benchmarks and improvement strategies.",
          content: `
# 5 Critical KPIs to Monitor When Growing Your Advisory Practice

Financial advisors looking to scale their practices need reliable metrics to track progress and identify improvement opportunities. This article outlines the five most important key performance indicators (KPIs) for practice management, along with industry benchmarks and actionable strategies.

## 1. Client Acquisition Cost (CAC)

**Definition**: The total sales and marketing cost required to acquire a new client.

**Formula**: Total marketing and business development expenses ÷ Number of new clients acquired

**Industry Benchmarks**:
- Elite practices: $1,500-3,000 per client
- Average practices: $4,000-7,000 per client
- Struggling practices: $10,000+ per client

**Improvement Strategies**:
- Implement a systematic referral process
- Focus marketing on specific client niches
- Track marketing channel performance and ROI
- Optimize your prospect-to-client conversion process

## 2. Client Lifetime Value (CLV)

**Definition**: The projected revenue a client will generate over their entire relationship with your firm.

**Formula**: Average annual client revenue × Average client retention period (years)

**Industry Benchmarks**:
- Mass affluent clients: $20,000-50,000
- High-net-worth clients: $100,000-300,000
- Ultra-high-net-worth clients: $500,000+

**Improvement Strategies**:
- Increase share of wallet through additional services
- Implement client segmentation and tier-appropriate service models
- Develop multi-generational relationships to extend client longevity
- Create a consistent client experience that builds loyalty

## 3. Revenue Per Client

**Definition**: The average annual revenue generated per client relationship.

**Formula**: Total annual revenue ÷ Number of active clients

**Industry Benchmarks**:
- Elite practices: $8,000+ per client
- Average practices: $3,000-8,000 per client
- Struggling practices: Under $3,000 per client

**Improvement Strategies**:
- Implement minimum client revenue thresholds
- Transition smaller clients to more appropriate service models
- Add value-added services that justify fee increases
- Focus on ideal client profiles in business development efforts

## 4. Client Retention Rate

**Definition**: The percentage of clients who remain with your firm over a specified period.

**Formula**: (End of period clients - New clients) ÷ Beginning of period clients

**Industry Benchmarks**:
- Elite practices: 98%+ annual retention
- Average practices: 92-97% annual retention
- Struggling practices: Below 92% annual retention

**Improvement Strategies**:
- Implement proactive client communication protocols
- Create a consistent review meeting process
- Develop an early warning system for at-risk clients
- Survey clients regularly about satisfaction and needs

## 5. Advisor Capacity Utilization

**Definition**: The percentage of an advisor's maximum client capacity currently being utilized.

**Formula**: Current number of client relationships ÷ Maximum sustainable client capacity

**Industry Benchmarks**:
- Optimal utilization: 70-85% of capacity
- Overutilized: >90% of capacity (burnout risk)
- Underutilized: <60% of capacity (revenue opportunity)

**Improvement Strategies**:
- Implement capacity planning in your growth strategy
- Optimize client service models to increase capacity
- Develop advisor teams to distribute workload
- Use technology to automate routine tasks

## Implementing a KPI Monitoring System

To effectively track these metrics:
1. Establish a baseline for each KPI
2. Set realistic improvement targets
3. Review metrics quarterly
4. Identify the drivers behind changes
5. Develop action plans for underperforming areas

## Conclusion

By regularly monitoring these five critical KPIs, financial advisors can make data-driven decisions to accelerate practice growth, increase profitability, and enhance client satisfaction. Successful practices typically focus on incremental improvements across all metrics rather than dramatic changes in a single area.
          `,
          author: "Practice Management Team",
          category: "Practice Management",
          tags: JSON.stringify(["KPIs", "Practice Management", "Growth Strategies", "Analytics"]),
          featuredImage: "/images/practice-kpis.jpg",
          published: true,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Create each blog post
      for (const post of blogSeedData) {
        try {
          await this.createBlogPost(post);
          console.log(`Created blog post: ${post.title}`);
        } catch (error) {
          console.error(`Error creating blog post "${post.title}":`, error);
        }
      }
      
      console.log(`Successfully initialized database with ${blogSeedData.length} blog posts`);
    } else {
      console.log(`Database already contains ${existingPosts.length} blog posts. No initialization needed.`);
    }
  }

  // Landing page operations
  async getLandingPage(id: number): Promise<LandingPage | undefined> {
    const [page] = await db.select().from(landingPages).where(eq(landingPages.id, id));
    return page;
  }

  async getLandingPageBySlug(slug: string): Promise<LandingPage | undefined> {
    const [page] = await db.select().from(landingPages).where(eq(landingPages.slug, slug));
    return page;
  }

  async getAllLandingPages(activeOnly?: boolean): Promise<LandingPage[]> {
    if (activeOnly) {
      return db.select().from(landingPages).where(eq(landingPages.isActive, true));
    }
    
    return db.select().from(landingPages);
  }

  async createLandingPage(page: InsertLandingPage): Promise<LandingPage> {
    const now = new Date().toISOString();
    
    const [newPage] = await db.insert(landingPages).values({
      ...page,
      createdAt: now,
      updatedAt: now,
      logoUrl: page.logoUrl || null,
      heroColor: page.heroColor || "#1d4ed8",
      isActive: page.isActive !== undefined ? page.isActive : true
    }).returning();
    
    return newPage;
  }

  async updateLandingPage(id: number, page: Partial<InsertLandingPage>): Promise<LandingPage> {
    const [updatedPage] = await db
      .update(landingPages)
      .set({ 
        ...page,
        updatedAt: new Date().toISOString()
      })
      .where(eq(landingPages.id, id))
      .returning();
      
    if (!updatedPage) {
      throw new Error(`Landing page with ID ${id} not found`);
    }
    
    return updatedPage;
  }

  async deleteLandingPage(id: number): Promise<void> {
    await db.delete(landingPages).where(eq(landingPages.id, id));
  }
  
  // Activity logs operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values({
      ...log,
      timestamp: new Date()
    }).returning();
    return newLog;
  }
  
  async getRecentActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    return db.select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }
  
  async logActivity(type: string, action: string, message: string, user?: string): Promise<ActivityLog> {
    return this.createActivityLog({
      type,
      action,
      message,
      user: user || "system",
      timestamp: new Date()
    });
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();
