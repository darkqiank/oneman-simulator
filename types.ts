
export enum ResourceType {
  CPU = 'CPU',
  RAM = 'RAM',
  DISK = 'DISK',
}

export type Language = 'zh' | 'en';
export type Theme = 'cyber' | 'scam';

export interface HardwareModel {
  id: string;
  name: string;
  cpuCores: number;
  ramGB: number;
  diskGB: number;
  bandwidthMbps: number;
  purchaseCost: number;
  dailyUpkeep: number;
  reliability: number; // 0-1
  description: string;
  // New attributes
  region: 'US' | 'HK' | 'JP' | 'SG' | 'DE';
  networkRoute: 'CN2 GIA' | 'AS4837' | 'AS9929' | 'BGP' | 'Softbank' | 'Cogent';
  ipType: 'Native' | 'Broadcast';
  isPurchasable?: boolean;
}

export interface ServerNode {
  id: string;
  modelId: string;
  name: string;
  purchaseDay: number;
  health: number;
  isOnline: boolean;
}

export interface VPSPlan {
  id: string;
  nodeId: string; // Link to specific server (Mother Hen)
  level: string; // Intro, SE, Plus, etc.
  name: string;
  cpuCores: number;
  ramGB: number;
  diskGB: number;
  bandwidthMbps: number; // New: Bandwidth limit
  priceMonthly: number;
  activeUsers: number;
  region: string; // Snapshot of the node's region for display
}

export interface GameEvent {
  id: string;
  day: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Enhanced Support Ticket System
export interface SupportTicket {
  id: string;
  userId: string;
  isVip: boolean; // New: VIP users
  issueType: 'slow' | 'down' | 'refund' | 'question' | 'attack';
  message: string; // Dynamic text
  createdAtDay: number;
  expiresInTicks: number; 
  difficulty: number; // 1-3, affects resolve cost/time (simulated)
}

// New: Milestone System
export interface Milestone {
  id: string;
  name: string;
  description: string;
  rewardCash: number;
  condition: (state: GameState) => boolean;
  achieved: boolean;
}

// New: User Reviews
export interface UserReview {
  id: string;
  username: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: number;
}

// New: Research System
export interface ResearchItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'upkeep_reduce' | 'marketing_boost' | 'auto_ticket' | 'ddos_resist' | 'churn_reduce';
  effectValue: number;
  icon: string; // Lucide icon name
  unlocked: boolean;
}

export interface GameState {
  day: number;
  cash: number;
  reputation: number;
  servers: ServerNode[];
  plans: VPSPlan[];
  events: GameEvent[];
  tickets: SupportTicket[];
  milestones: Milestone[];
  reviews: UserReview[]; 
  research: string[]; // List of unlocked research IDs
  paused: boolean;
  gameSpeed: number;
  marketingBoost: number;
  ddosSeverity: number;
  language: Language;
  theme: Theme;
}

export interface GameMetrics {
  totalIncomeDaily: number;
  totalUpkeepDaily: number;
  totalUsers: number;
  onlineUsers: number; // New: Active Volume (Concurrency)
  totalCpuUsed: number;
  totalRamUsed: number;
  totalDiskUsed: number;
  totalBandwidthUsed: number;
  totalCpuCapacity: number;
  totalRamCapacity: number;
  totalDiskCapacity: number;
  totalBandwidthCapacity: number;
  oversellingRatio: number;
}

// Marketing Types
export interface Forum {
  id: string;
  name: string;
  risk: number; // 0-1, chance of negative outcome
  trafficPotential: number;
  userQuality: number; // 0-1, affects churn rate (low quality = high churn)
}

export interface AdPlatform {
  id: string;
  name: string;
  cost: number;
  trafficBoost: number;
}

export interface Influencer {
  id: string;
  name: string;
  cost: number;
  trafficBoost: number;
  reputationImpact: number;
}
