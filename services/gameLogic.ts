
import { GameState, GameMetrics, HardwareModel, ServerNode, Forum, AdPlatform, Influencer, SupportTicket, Milestone, UserReview } from '../types';
import { HARDWARE_CATALOG, MILESTONES, USER_NAMES, REVIEWS, RESEARCH_UPGRADES } from '../constants';

export const calculateMetrics = (state: GameState): GameMetrics => {
  let totalIncomeDaily = 0;
  let totalUpkeepDaily = 0;
  let totalUsers = 0;
  
  // Research Effects
  let upkeepReduction = 0;
  
  if (state.research) {
     state.research.forEach(rId => {
         const r = RESEARCH_UPGRADES.find(u => u.id === rId);
         if (r?.effectType === 'upkeep_reduce') upkeepReduction += r.effectValue;
     });
  }

  // Plan Revenue
  state.plans.forEach(plan => {
    totalIncomeDaily += (plan.priceMonthly / 30) * plan.activeUsers; // Daily income
    totalUsers += plan.activeUsers;
  });
  
  // Online Users (Simulated Concurrency)
  // Random fluctuation between 40% and 80% of total subscribers
  const onlineUsers = Math.floor(totalUsers * (0.4 + Math.random() * 0.4));

  // Server Upkeep & Capacity
  let totalCpuCapacity = 0;
  let totalRamCapacity = 0;
  let totalDiskCapacity = 0;
  let totalBandwidthCapacity = 0;

  state.servers.forEach(server => {
    const model = HARDWARE_CATALOG.find(h => h.id === server.modelId);
    if (model && server.isOnline) {
      let upkeep = model.dailyUpkeep;
      upkeep = upkeep * (1 - upkeepReduction); // Apply Research

      totalUpkeepDaily += upkeep;
      totalCpuCapacity += model.cpuCores;
      totalRamCapacity += model.ramGB;
      totalDiskCapacity += model.diskGB;
      totalBandwidthCapacity += model.bandwidthMbps;
    }
  });

  // Usage
  let totalCpuUsed = 0;
  let totalRamUsed = 0;
  let totalDiskUsed = 0;
  let totalBandwidthUsed = 0;

  state.plans.forEach(plan => {
    totalCpuUsed += plan.cpuCores * plan.activeUsers;
    totalRamUsed += plan.ramGB * plan.activeUsers;
    totalDiskUsed += plan.diskGB * plan.activeUsers;
    // Assume average active usage is 10% of allocated peak bandwidth per user, scaling with user count
    totalBandwidthUsed += (plan.bandwidthMbps * 0.1) * plan.activeUsers;
  });
  
  // DDOS Effect
  let ddosImpact = state.ddosSeverity;
  if (state.research) {
      const shield = RESEARCH_UPGRADES.find(r => r.id === 'ddos_shield_pro' && state.research.includes(r.id));
      if (shield) ddosImpact *= (1 - shield.effectValue);
  }

  if (ddosImpact > 0) {
    totalCpuUsed *= (1 + ddosImpact);
    totalRamUsed *= (1 + ddosImpact * 0.5);
    totalBandwidthUsed *= (1 + ddosImpact * 2.0); // DDOS hits bandwidth hard
  }

  // Overselling Calculation
  const cpuRatio = totalCpuCapacity > 0 ? totalCpuUsed / totalCpuCapacity : 0;
  const ramRatio = totalRamCapacity > 0 ? totalRamUsed / totalRamCapacity : 0;
  const bwRatio = totalBandwidthCapacity > 0 ? totalBandwidthUsed / totalBandwidthCapacity : 0;
  
  // If capacity is 0 but used > 0 (scamming mode), ratio is infinite (999)
  const oversellingRatio = (totalCpuCapacity === 0 && totalCpuUsed > 0) 
                           ? 999 
                           : Math.max(cpuRatio, ramRatio, bwRatio);

  return {
    totalIncomeDaily,
    totalUpkeepDaily,
    totalUsers,
    onlineUsers,
    totalCpuUsed,
    totalRamUsed,
    totalDiskUsed,
    totalBandwidthUsed,
    totalCpuCapacity,
    totalRamCapacity,
    totalDiskCapacity,
    totalBandwidthCapacity,
    oversellingRatio
  };
};

export const calculateNewSubscribers = (
    plan: any, 
    reputation: number, 
    oversellingRatio: number, 
    marketingBoost: number, 
    totalCapacity: number,
    unlockedResearch: string[] = []
) => {
  if (totalCapacity <= 0) return 0;

  // Research Boost
  let researchBoost = 1;
  unlockedResearch.forEach(id => {
      const r = RESEARCH_UPGRADES.find(u => u.id === id);
      if (r?.effectType === 'marketing_boost') researchBoost += r.effectValue;
  });

  // Value Score: Bandwidth is now a factor
  const valueScore = ((plan.cpuCores * 10) + (plan.ramGB * 5) + (plan.diskGB * 0.5) + (plan.bandwidthMbps * 0.1)) / (plan.priceMonthly + 0.1);
  
  const repFactor = Math.max(0, reputation) / 50;
  const loadPenalty = oversellingRatio > 1.5 ? 0.1 : (oversellingRatio > 1.0 ? 0.5 : 1);
  const marketingFactor = Math.max(1, marketingBoost);

  let chance = valueScore * repFactor * loadPenalty * marketingFactor * researchBoost * 0.005; 
  
  // NEWBIE BOOST: If users are very low, drastically increase chance to help start
  if (plan.activeUsers < 50) {
      chance *= 10; // Massive boost to get the ball rolling
  }

  const numNew = Math.random() < chance ? Math.floor(Math.random() * 3) + 1 : 0;
  return numNew;
};

export const calculateChurn = (
    activeUsers: number, 
    reputation: number, 
    oversellingRatio: number, 
    ddosSeverity: number, 
    unlockedResearch: string[] = [],
    currentDay: number
) => {
  if (activeUsers === 0) return 0;

  // 新手保护期：前 30 天没有流失
  if (currentDay < 30) return 0;

  // 订阅周期模型：每天约有 1/30 的用户到期需要续费
  // 统计学上，所有用户平均分布在 30 天的订阅周期内
  const expiringUsers = Math.ceil(activeUsers / 30);
  
  // 续费率计算（Renewal Rate，而非 Retention Rate）
  // 基础续费率：根据口碑，口碑越高续费率越高
  // 口碑 60 -> 70% 续费，口碑 80 -> 80% 续费，口碑 100 -> 90% 续费
  let renewalRate = 0.50 + (reputation / 100) * 0.40; 

  // 科研加成（提升续费率）
  unlockedResearch.forEach(id => {
      const r = RESEARCH_UPGRADES.find(u => u.id === id);
      if (r?.effectType === 'churn_reduce') renewalRate += r.effectValue;
  });

  // 服务质量惩罚（降低续费意愿）
  if (oversellingRatio > 1.2) renewalRate -= 0.08; 
  if (oversellingRatio > 1.5) renewalRate -= 0.15; 
  if (oversellingRatio > 2.0) renewalRate -= 0.25; 
  if (oversellingRatio > 3.0) renewalRate -= 0.35; 
  if (oversellingRatio > 5.0) renewalRate -= 0.50; 

  // DDOS 惩罚
  if (ddosSeverity > 0) renewalRate -= (0.15 * ddosSeverity);

  // 限制续费率范围 [0, 1]
  renewalRate = Math.max(0, Math.min(1, renewalRate));

  // 计算流失数量 = 到期用户数 × (1 - 续费率)
  let churnCount = Math.floor(expiringUsers * (1 - renewalRate));
  
  // 增加一些随机性，避免数字过于机械
  if (Math.random() < 0.15) {
      churnCount += Math.random() < 0.5 ? 1 : -1;
      churnCount = Math.max(0, churnCount);
  }

  // 愤怒退订（中途退订）
  // 只有在服务极差时才会发生，用户不等到期就直接退订
  let rageQuitChurn = 0;
  if (oversellingRatio > 6.0 || ddosSeverity > 2.5) {
      // 极端情况下，额外 5% 的用户会立即退订
      rageQuitChurn = Math.ceil(activeUsers * 0.05); 
  }

  return Math.min(churnCount + rageQuitChurn, activeUsers);
};

export const resolveForumPost = (forum: Forum, contentType: string) => {
    let successRate = 0.5;
    let impact = 1;
    let message = "";
    let isDdos = false;
    let isBanned = false;

    // Content modifiers
    if (contentType === 'tech') {
        successRate += 0.2; // Tech posts are safer
        impact = 1.2; // Moderate growth
    } else if (contentType === 'aff') {
        successRate -= 0.3; // Spamming is risky
        impact = 3.0; // High reward if successful
    } else if (contentType === 'sad') {
        successRate += 0.1;
        impact = 1.5;
    }

    // Forum modifiers
    if (forum.id === 'hostloc') {
        impact *= 2; // High traffic
        if (Math.random() < forum.risk) isDdos = true; // Chaos
    } else if (forum.id === 'v2ex') {
        if (contentType === 'aff') {
            isBanned = true; // Strict moderation
        }
    }

    const roll = Math.random();
    const success = roll < successRate && !isBanned;

    return { success, impact: success ? forum.trafficPotential * impact : 0, isDdos, isBanned };
};

// --- Ticket Logic ---

export const generateTicket = (day: number, activeUsers: number, oversellingRatio: number, ddosSeverity: number): SupportTicket | null => {
  if (activeUsers < 5) return null; // Don't bother small hosts too much

  let probability = 0.005; // Base chance per tick (approx once per 200 ticks)
  
  if (oversellingRatio > 1.2) probability += 0.01;
  if (oversellingRatio > 1.5) probability += 0.02;
  if (ddosSeverity > 0) probability += 0.05;

  if (Math.random() < probability) {
    const types: SupportTicket['issueType'][] = ['question'];
    if (oversellingRatio > 1.2) types.push('slow');
    if (ddosSeverity > 0 || oversellingRatio > 2.0) types.push('down', 'refund');
    if (ddosSeverity > 0) types.push('attack');
    
    const type = types[Math.floor(Math.random() * types.length)];
    const isVip = Math.random() < 0.1; // 10% chance for VIP

    const id = Math.random().toString(36).substr(2, 9);
    
    return {
      id,
      userId: `${isVip ? 'VIP_' : 'User_'}${Math.floor(Math.random()*1000)}`,
      isVip,
      issueType: type,
      message: "", // Will be looked up in UI
      createdAtDay: day,
      expiresInTicks: isVip ? 30 : 60, // VIPs are impatient
      difficulty: Math.floor(Math.random() * 3) + 1
    };
  }
  return null;
};

export const checkMilestones = (state: GameState): { newMilestones: Milestone[], reward: number } => {
  const newMilestones: Milestone[] = [];
  let totalReward = 0;

  state.milestones.forEach(m => {
    if (!m.achieved && m.condition(state)) {
      const completed = { ...m, achieved: true };
      newMilestones.push(completed);
      totalReward += m.rewardCash;
    }
  });

  return { newMilestones, reward: totalReward };
};

export const generateReview = (reputation: number, oversellingRatio: number): UserReview | null => {
    // Generate a review occasionally (5% chance per tick)
    if (Math.random() > 0.05) return null;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    if (oversellingRatio > 2.0 || reputation < 30) {
        sentiment = 'negative';
    } else if (oversellingRatio < 1.0 && reputation > 70) {
        sentiment = 'positive';
    } else {
        // Random mix based on luck
        const roll = Math.random() * 100;
        if (roll < reputation) sentiment = 'positive';
        else sentiment = 'neutral';
    }

    const templates = REVIEWS[sentiment];
    const content = templates[Math.floor(Math.random() * templates.length)];
    const username = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];

    return {
        id: Math.random().toString(36).substr(2, 9),
        username,
        content,
        sentiment,
        timestamp: Date.now()
    };
};
