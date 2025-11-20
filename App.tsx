
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Server, Activity, Users, DollarSign, HardDrive, Cpu, Plus, Play, Pause, AlertTriangle,
  ShoppingCart, Trash2, Terminal as TerminalIcon, Zap, TrendingUp, Shield, Megaphone, Wrench,
  Globe, Wifi, Languages, MonitorPlay, Layout, MessageSquare, CheckCircle, XCircle, ArrowLeft,
  Award, Box, Hexagon, FlaskConical, Palette, Wand2, RotateCcw
} from 'lucide-react';
import { 
  GameState, HardwareModel, ServerNode, VPSPlan, GameEvent, Language, SupportTicket, Milestone, UserReview, Theme
} from './types';
import { 
  INITIAL_CASH, INITIAL_REPUTATION, HARDWARE_CATALOG, INITIAL_PLANS,
  TRANSLATIONS, FORUMS, ADS, KOLS, MILESTONES, RESEARCH_UPGRADES, PLAN_LEVELS
} from './constants';
import { 
  calculateMetrics, calculateNewSubscribers, calculateChurn, resolveForumPost, 
  generateTicket, checkMilestones, generateReview 
} from './services/gameLogic';
import { DashboardCard } from './components/DashboardCard';
import { ProgressBar } from './components/ProgressBar';
import { ServerRack } from './components/ServerRack';
import { Terminal } from './components/Terminal';
import { LiveFeed } from './components/LiveFeed';
import { TicketCenter } from './components/TicketCenter';
import { ResearchLab } from './components/ResearchLab';
import { Modal } from './components/Modal';

const DEFAULT_GAME_STATE: GameState = {
  day: 1,
  cash: INITIAL_CASH,
  reputation: INITIAL_REPUTATION,
  servers: [],
  plans: INITIAL_PLANS,
  events: [],
  tickets: [],
  milestones: MILESTONES,
  reviews: [],
  research: [],
  paused: true,
  gameSpeed: 1000,
  marketingBoost: 1.0,
  ddosSeverity: 0,
  language: 'zh',
  theme: 'cyber'
};

export default function App() {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('vps_tycoon_save_v1');
      if (saved) {
         const parsed = JSON.parse(saved);
         // Restore milestones with logic functions (which are lost in JSON)
         const mergedMilestones = MILESTONES.map(m => {
             const savedM = parsed.milestones?.find((sm: any) => sm.id === m.id);
             return savedM ? { ...m, achieved: savedM.achieved } : m;
         });
         
         // Merge parsed state with default state to ensure new fields (if any) are present
         return { 
             ...DEFAULT_GAME_STATE, 
             ...parsed, 
             milestones: mergedMilestones,
             paused: true // Always start paused on load
         };
      }
    } catch (e) {
      console.error("Failed to load save:", e);
    }

    // --- NEW GAME SETUP ---
    // Auto-deploy a starter server and plan to make the game easier to start
    const starterModel = HARDWARE_CATALOG.find(h => h.id === 'starter-kvm') || HARDWARE_CATALOG[0];
    const starterServerId = Math.random().toString(36).substr(2, 9);
    
    const starterServer: ServerNode = {
        id: starterServerId,
        modelId: starterModel.id,
        name: 'STARTER-NODE-01',
        purchaseDay: 1,
        health: 100,
        isOnline: true
    };

    const starterPlan: VPSPlan = {
        id: Math.random().toString(36).substr(2, 9),
        nodeId: starterServerId,
        level: 'Intro',
        name: 'STARTER KVM 1G',
        cpuCores: 1,
        ramGB: 1,
        diskGB: 10,
        bandwidthMbps: 100,
        priceMonthly: 1.99,
        activeUsers: 0,
        region: starterModel.region
    };

    return {
        ...DEFAULT_GAME_STATE,
        servers: [starterServer],
        plans: [starterPlan],
        events: [{ 
            id: 'init-gift', 
            day: 1, 
            message: "Welcome! A Free Starter Node has been deployed for you.", 
            type: 'success' 
        }]
    };
  });

  const t = TRANSLATIONS[gameState.language];

  // 确保页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-save Effect
  useEffect(() => {
    try {
      // We create a shallow copy. JSON.stringify automatically ignores functions (like milestone conditions)
      // so we don't need to strip them manually.
      localStorage.setItem('vps_tycoon_save_v1', JSON.stringify(gameState));
    } catch (e) {
      console.error("Failed to save game:", e);
    }
  }, [gameState]);

  const resetGame = () => {
    if (window.confirm(gameState.language === 'zh' ? "确定要重置游戏吗？所有进度将丢失。" : "Are you sure you want to reset? All progress will be lost.")) {
      localStorage.removeItem('vps_tycoon_save_v1');
      // Hard reload to clear state completely
      window.location.reload();
    }
  };

  // Apply Theme Effect
  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-scam');
    if (gameState.theme !== 'cyber') {
      body.classList.add(`theme-${gameState.theme}`);
    }
  }, [gameState.theme]);

  // Initialize event only once
  useEffect(() => {
    // Only add init message if event list is extremely short (new game)
    if (gameState.events.length === 1 && gameState.events[0].id === 'init-gift') {
       setGameState(prev => ({
         ...prev,
         events: [
            ...prev.events,
            { id: 'init', day: 1, message: prev.language === 'zh' ? "系统初始化完成。新手保护期已激活（30天免流失）。" : "System initialized. Newbie Shield Active (30 Days No Churn).", type: 'info' }
         ]
       }));
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'market' | 'plans' | 'ops' | 'achievements' | 'tickets' | 'lab'>('dashboard');
  const [newPlan, setNewPlan] = useState({ name: '', cpu: 1, ram: 1, disk: 20, bandwidth: 100, price: 0, nodeId: '', level: 'Intro' });
  
  // Ops Sub-state
  const [opsStep, setOpsStep] = useState<'menu' | 'forum_select' | 'ad_select' | 'kol_select'>('menu');
  const [selectedForumId, setSelectedForumId] = useState<string | null>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // Modal state
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEvent = useCallback((msg: string, type: GameEvent['type'] = 'info') => {
    setGameState(prev => ({
      ...prev,
      events: [
        ...prev.events, 
        { id: Math.random().toString(36).substr(2, 9), day: prev.day, message: msg, type },
      ].slice(-50)
    }));
  }, []);

  const getRegionFlag = (region?: string) => {
    switch(region) {
      case 'US': return '🇺🇸';
      case 'HK': return '🇭🇰';
      case 'JP': return '🇯🇵';
      case 'SG': return '🇸🇬';
      case 'DE': return '🇩🇪';
      default: return '🌐';
    }
  };

  const buyServer = (model: HardwareModel) => {
    if (gameState.cash >= model.purchaseCost) {
      const newServer: ServerNode = {
        id: Math.random().toString(36).substr(2, 9),
        modelId: model.id,
        name: `${model.region}-${gameState.servers.length + 1}`.toUpperCase(),
        purchaseDay: gameState.day,
        health: 100,
        isOnline: true
      };

      setGameState(prev => ({
        ...prev,
        cash: prev.cash - model.purchaseCost,
        servers: [...prev.servers, newServer]
      }));
      addEvent(
        gameState.language === 'zh' 
        ? `购买成功: ${model.name} (${model.region}) 已上线` 
        : `Purchased: ${model.name} (${model.region}) online`, 
        'success'
      );
    } else {
      addEvent(gameState.language === 'zh' ? "资金不足" : "Insufficient Funds", 'error');
    }
  };

  const repairServer = (serverId: string) => {
    const cost = 100;
    if (gameState.cash >= cost) {
       setGameState(prev => ({
         ...prev,
         cash: prev.cash - cost,
         servers: prev.servers.map(s => s.id === serverId ? { ...s, isOnline: true, health: 100 } : s)
       }));
       addEvent(gameState.language === 'zh' ? "服务器维修完成" : "Server Repaired", 'success');
    }
  };

  const mitigateDDOS = () => {
    const cost = 200;
    if (gameState.cash >= cost) {
       setGameState(prev => ({
         ...prev,
         cash: prev.cash - cost,
         ddosSeverity: 0
       }));
       addEvent(t.ops.cleanDDOS, 'success');
    }
  };

  // Enhanced Ticket Resolution
  const resolveTicket = (ticketId: string, action: 'solve' | 'refund' | 'ban') => {
      setGameState(prev => {
          const ticket = prev.tickets.find(t => t.id === ticketId);
          if (!ticket) return prev;

          let newRep = prev.reputation;
          let newCash = prev.cash;
          // Create copy of plans to modify user counts
          let newPlans = prev.plans.map(p => ({...p}));

          if (action === 'solve') {
              newRep += ticket.isVip ? 3 : 1;
          } else if (action === 'refund') {
              newCash -= 15; 
              newRep += 2;
              // Manual Unsubscribe Logic: Decrease user count
              // Since ticket doesn't know exact plan, remove from the most populated plan
              if (newPlans.length > 0) {
                  const targetPlan = newPlans.reduce((prev, curr) => prev.activeUsers > curr.activeUsers ? prev : curr);
                  if (targetPlan.activeUsers > 0) {
                      targetPlan.activeUsers -= 1;
                  }
              }
          } else if (action === 'ban') {
              newRep -= 5;
              // Manual Ban Logic: Decrease user count
              if (newPlans.length > 0) {
                  const targetPlan = newPlans.reduce((prev, curr) => prev.activeUsers > curr.activeUsers ? prev : curr);
                  if (targetPlan.activeUsers > 0) {
                      targetPlan.activeUsers -= 1;
                  }
              }
          }

          return {
              ...prev,
              tickets: prev.tickets.filter(t => t.id !== ticketId),
              reputation: Math.min(100, Math.max(0, newRep)),
              cash: newCash,
              plans: newPlans
          };
      });
  };

  // Research Unlock
  const unlockResearch = (id: string) => {
      const item = RESEARCH_UPGRADES.find(r => r.id === id);
      if (!item) return;
      
      if (gameState.cash >= item.cost) {
          setGameState(prev => ({
              ...prev,
              cash: prev.cash - item.cost,
              research: [...prev.research, id]
          }));
          addEvent(`Research Unlocked: ${item.name}`, 'success');
      } else {
          addEvent(t.market.noFunds, 'error');
      }
  };

  // --- Marketing Actions ---

  const handleForumPost = (content: 'tech' | 'aff' | 'sad') => {
    const forum = FORUMS.find(f => f.id === selectedForumId);
    if (!forum) return;

    const result = resolveForumPost(forum, content);
    
    if (result.isBanned) {
       addEvent(gameState.language === 'zh' ? `被封号: 在 ${forum.name} 发帖导致账号被封禁！` : `Banned on ${forum.name}!`, 'error');
       setGameState(prev => ({ ...prev, reputation: Math.max(0, prev.reputation - 10) }));
    } else if (result.isDdos) {
       addEvent(gameState.language === 'zh' ? `灾难: ${forum.name} 的小学生对你发起了 DDOS！` : `DDOS Attack triggered from ${forum.name}`, 'error');
       setGameState(prev => ({ ...prev, ddosSeverity: prev.ddosSeverity + 1.5 }));
    } else if (result.success) {
       addEvent(gameState.language === 'zh' ? `营销成功: 帖子在 ${forum.name} 火了！` : `Viral post on ${forum.name}`, 'success');
       setGameState(prev => ({ ...prev, marketingBoost: prev.marketingBoost + (result.impact * 0.1) }));
    } else {
       addEvent(gameState.language === 'zh' ? `营销失败: 帖子沉了。` : `Post ignored on ${forum.name}`, 'warning');
    }
    setOpsStep('menu');
    setSelectedForumId(null);
  };

  const handleBuyAd = (adId: string) => {
    const ad = ADS.find(a => a.id === adId);
    if (!ad) return;
    if (gameState.cash < ad.cost) return addEvent(t.market.noFunds, 'error');

    setGameState(prev => ({
      ...prev,
      cash: prev.cash - ad.cost,
      marketingBoost: prev.marketingBoost + ad.trafficBoost
    }));
    addEvent(gameState.language === 'zh' ? `广告投放: ${ad.name} 生效中` : `Ad running: ${ad.name}`, 'success');
    setOpsStep('menu');
  };

  const handleHireKol = (kolId: string) => {
    const kol = KOLS.find(k => k.id === kolId);
    if (!kol) return;
    if (gameState.cash < kol.cost) return addEvent(t.market.noFunds, 'error');

    setGameState(prev => ({
      ...prev,
      cash: prev.cash - kol.cost,
      marketingBoost: prev.marketingBoost + kol.trafficBoost,
      reputation: Math.min(100, prev.reputation + kol.reputationImpact)
    }));
    addEvent(gameState.language === 'zh' ? `评测发布: ${kol.name} 的视频已上传` : `Review published by ${kol.name}`, 'success');
    setOpsStep('menu');
  };

  // Auto-generate Plan Logic
  const autoGeneratePlan = () => {
      const { nodeId, level, cpu, ram, disk, bandwidth } = newPlan;
      
      if (!nodeId) {
         addEvent(gameState.language === 'zh' ? "请先选择母鸡(节点)" : "Please select a node first", 'error');
         return;
      }

      const server = gameState.servers.find(s => s.id === nodeId);
      const model = server ? HARDWARE_CATALOG.find(h => h.id === server.modelId) : null;
      const region = model?.region || 'US';

      // Name Generation
      const name = `${region} ${level} ${cpu}C${ram}G`.toUpperCase();
      
      // Price Calculation
      // Base: $2/C, $1/G RAM, $0.1/G Disk, $0.01/Mbps BW
      let basePrice = (cpu * 2) + (ram * 1) + (disk * 0.1) + (bandwidth * 0.01);
      
      // Region Multipliers
      const multipliers: Record<string, number> = {
          'HK': 2.5,
          'JP': 1.5,
          'SG': 1.8,
          'US': 1.0,
          'DE': 1.0
      };
      
      const multiplier = multipliers[region] || 1.0;
      const finalPrice = Math.ceil((basePrice * multiplier) * 100) / 100; // Round to 2 decimals
      
      setNewPlan({ ...newPlan, name, price: finalPrice });
  };

  const createPlan = () => {
    if (gameState.servers.length === 0) {
        addEvent(t.plans.noResources, 'error');
        return;
    }

    if (!newPlan.name) {
        addEvent(gameState.language === 'zh' ? "请输入套餐名称" : "Please enter a plan name", 'error');
        return;
    }
    
    if (!newPlan.nodeId) {
        addEvent(gameState.language === 'zh' ? "请选择母鸡(节点)" : "Please select a node", 'error');
        return;
    }

    // Check for duplicate names
    if (gameState.plans.some(p => p.name === newPlan.name)) {
        addEvent(t.plans.nameExists, 'error');
        return;
    }

    const server = gameState.servers.find(s => s.id === newPlan.nodeId);
    const model = server ? HARDWARE_CATALOG.find(h => h.id === server.modelId) : null;
    const region = model?.region || 'US';

    const plan: VPSPlan = {
      id: Math.random().toString(36).substr(2, 9),
      nodeId: newPlan.nodeId,
      level: newPlan.level,
      name: newPlan.name,
      cpuCores: newPlan.cpu,
      ramGB: newPlan.ram,
      diskGB: newPlan.disk,
      bandwidthMbps: newPlan.bandwidth,
      priceMonthly: newPlan.price,
      activeUsers: 0,
      region: region
    };
    setGameState(prev => ({ ...prev, plans: [...prev.plans, plan] }));
    addEvent(gameState.language === 'zh' ? `新产品上线: ${plan.name}` : `New Plan: ${plan.name}`, 'info');
    
    // 关闭 modal 并重置表单
    setIsCreatePlanModalOpen(false);
    setNewPlan({ name: '', cpu: 1, ram: 1, disk: 20, bandwidth: 100, price: 0, nodeId: '', level: 'Intro' });
  };

  const deletePlan = (id: string) => {
    const plan = gameState.plans.find(p => p.id === id);
    if (plan && plan.activeUsers > 0) {
      addEvent(t.plans.cantDelete, 'warning');
      return;
    }
    setGameState(prev => ({ ...prev, plans: prev.plans.filter(p => p.id !== id) }));
  };

  // --- Game Loop ---
  const tick = useCallback(() => {
    setGameState(prev => {
      if (prev.paused) return prev;

      const metrics = calculateMetrics(prev);
      let newCash = prev.cash;
      let newMarketingBoost = Math.max(1.0, prev.marketingBoost - 0.05); 
      let newDdosSeverity = Math.max(0, prev.ddosSeverity - 0.1);
      
      newCash += metrics.totalIncomeDaily;
      newCash -= metrics.totalUpkeepDaily;

      // Milestones
      const { newMilestones, reward } = checkMilestones(prev);
      if (reward > 0) {
         newCash += reward;
      }
      const updatedMilestones = prev.milestones.map(m => {
          const achieved = newMilestones.find(nm => nm.id === m.id);
          return achieved ? achieved : m;
      });

      // Subscribers (Now using Research param)
      const newPlans = prev.plans.map(plan => {
        const newSubs = calculateNewSubscribers(plan, prev.reputation, metrics.oversellingRatio, prev.marketingBoost, metrics.totalCpuCapacity, prev.research);
        // Pass currentDay to calculateChurn to enable Newbie Shield
        const churned = calculateChurn(plan.activeUsers, prev.reputation, metrics.oversellingRatio, prev.ddosSeverity, prev.research, prev.day);
        return { ...plan, activeUsers: Math.max(0, plan.activeUsers + newSubs - churned) };
      });

      // Tickets
      let currentTickets = [...prev.tickets];
      
      // Auto-solve Logic (Research)
      if (prev.research.includes('auto_bot_v1')) {
          const autoSolvable = currentTickets.filter(t => t.issueType === 'question' && t.difficulty === 1);
          if (autoSolvable.length > 0) {
               // Solve 30% of them per tick (simulated speed)
               const toSolve = autoSolvable.filter(() => Math.random() < 0.3);
               currentTickets = currentTickets.filter(t => !toSolve.includes(t));
               // Small rep gain for auto solve
               prev.reputation = Math.min(100, prev.reputation + (toSolve.length * 0.1));
          }
      }

      currentTickets = currentTickets.map(t => ({...t, expiresInTicks: t.expiresInTicks - 1}));
      const expiredCount = currentTickets.filter(t => t.expiresInTicks <= 0).length;
      if (expiredCount > 0) {
         prev.reputation = Math.max(0, prev.reputation - (expiredCount * 2));
         // Expired VIP tickets hurt more
         const vipExpired = currentTickets.filter(t => t.expiresInTicks <= 0 && t.isVip).length;
         if (vipExpired > 0) prev.reputation -= (vipExpired * 3);
      }
      currentTickets = currentTickets.filter(t => t.expiresInTicks > 0);
      const newTicket = generateTicket(prev.day, metrics.totalUsers, metrics.oversellingRatio, prev.ddosSeverity);
      if (newTicket) currentTickets.push(newTicket);

      // Reviews (Live Feed)
      let currentReviews = [...prev.reviews];
      const newReview = generateReview(prev.reputation, metrics.oversellingRatio);
      if (newReview && metrics.totalUsers > 0) {
          currentReviews = [newReview, ...currentReviews].slice(0, 20);
      }

      return {
        ...prev,
        day: prev.day + 1,
        cash: newCash,
        plans: newPlans,
        marketingBoost: newMarketingBoost,
        ddosSeverity: newDdosSeverity,
        tickets: currentTickets,
        milestones: updatedMilestones,
        reviews: currentReviews,
        events: prev.events 
      };
    });
  }, []);

  useEffect(() => {
    if (!gameState.paused) {
      tickRef.current = setInterval(tick, gameState.gameSpeed);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [gameState.paused, gameState.gameSpeed, tick]);

  const metrics = calculateMetrics(gameState);

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-cyber-primary/30 pb-12 relative overflow-x-hidden transition-colors duration-500">
      
      {/* HUD Header */}
      <header className="sticky top-0 z-40 bg-cyber-dark/90 backdrop-blur-md border-b border-slate-800 px-2 md:px-6 py-2 md:py-3 flex items-center justify-between shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block group cursor-pointer">
               <div className="relative">
                <div className="absolute -inset-1 bg-cyber-primary rounded-full blur opacity-25 animate-pulse group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black rounded-lg p-2 flex items-center justify-center overflow-hidden border border-cyber-primary/50">
                  <TerminalIcon className="text-cyber-primary" size={24} />
                </div>
               </div>
          </div>
          <div className="block">
            <h1 className="font-bold text-sm md:text-xl tracking-tight text-cyber-black font-mono uppercase flex items-center gap-2" style={{color: 'var(--color-text-main)'}}>
              <span className="text-white">{t.title}</span> <span className="hidden md:inline text-cyber-primary text-[10px] border border-cyber-primary px-1 rounded-sm tracking-widest">SIM v2.3</span>
            </h1>
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-slate-500 font-mono">
               <span className={`w-2 h-2 rounded-sm rotate-45 ${gameState.paused ? 'bg-yellow-500' : 'bg-cyber-success animate-pulse'}`}></span>
               {gameState.paused ? "PAUSED" : "ONLINE"}
            </div>
          </div>
        </div>

        {/* Stats Strip - Optimized for Mobile */}
        <div className="flex items-center gap-2 md:gap-6 font-mono bg-cyber-panel/90 px-2 md:px-6 py-1 md:py-2 clip-slope border-b-2 border-cyber-primary/30 backdrop-blur-md stats-panel flex-1 justify-center md:flex-none md:justify-end mx-2 md:mx-0">
          <div className="flex flex-col items-end border-r border-slate-700 pr-2 md:pr-4">
             <span className="text-slate-500 text-[8px] md:text-[9px] uppercase tracking-widest">{t.cash}</span>
             <span className={`font-bold text-sm md:text-xl leading-none ${gameState.cash < 0 ? 'text-cyber-danger animate-pulse' : 'text-white'}`}>
               ${gameState.cash.toFixed(0)}
             </span>
          </div>
          <div className="flex flex-col items-end border-r border-slate-700 pr-2 md:pr-4">
             <span className="text-slate-500 text-[8px] md:text-[9px] uppercase tracking-widest">{t.dashboard.subscribers}</span>
             <span className="font-bold text-sm md:text-xl leading-none text-cyber-primary">
               {metrics.totalUsers}
             </span>
          </div>
          {/* Show Rep on mobile but simpler */}
          <div className="flex flex-col items-end border-r border-slate-700 pr-2 md:pr-4">
             <span className="text-slate-500 text-[8px] md:text-[9px] uppercase tracking-widest">REP</span>
             <span className={`font-bold text-sm md:text-xl leading-none ${gameState.reputation > 80 ? 'text-cyber-primary' : 'text-cyber-warning'}`}>
               {gameState.reputation.toFixed(0)}
             </span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-slate-500 text-[8px] md:text-[9px] uppercase tracking-widest">{t.day}</span>
             <span className="font-bold text-sm md:text-xl leading-none text-white">{gameState.day}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-3">
           <button 
              onClick={resetGame}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded border border-transparent hover:border-red-500 transition-colors text-slate-400 hover:text-red-500 clip-btn hidden sm:block"
              title={t.reset}
           >
              <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
           </button>
           
           <div className="relative hidden sm:block">
             <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-1.5 md:p-2 hover:bg-white/10 rounded border border-transparent hover:border-slate-700 transition-colors text-slate-400 hover:text-white clip-btn bg-cyber-black text-cyber-black"
             >
                <Palette size={16} className="md:w-[18px] md:h-[18px] text-slate-400 hover:text-white" />
             </button>
             
             {showThemeMenu && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-cyber-panel border border-slate-700 shadow-xl z-50 animate-fade-in rounded-md">
                  <div className="p-2 grid gap-1">
                     {(['cyber', 'scam'] as Theme[]).map(theme => (
                        <button
                          key={theme}
                          onClick={() => {
                             setGameState(p => ({...p, theme}));
                             setShowThemeMenu(false);
                          }}
                          className={`text-left px-3 py-2 text-xs font-mono uppercase hover:bg-white/5 transition-colors rounded-sm ${gameState.theme === theme ? 'text-cyber-primary bg-white/10' : 'text-slate-400'}`}
                        >
                           {t.themes[theme]}
                        </button>
                     ))}
                  </div>
               </div>
             )}
           </div>

           <button 
            onClick={() => setGameState(p => ({...p, paused: !p.paused}))}
            className={`relative group overflow-hidden flex items-center gap-2 px-3 md:px-6 py-1 md:py-2 font-bold font-mono border uppercase tracking-wider text-[10px] md:text-sm transition-all shadow-lg active:scale-95 clip-btn ${
              gameState.paused 
              ? 'bg-cyber-primary text-cyber-black border-cyber-primary hover:bg-cyan-300' 
              : 'bg-transparent border-cyber-warning text-cyber-warning hover:bg-cyber-warning/10'
            }`}
           >
             {gameState.paused ? <Play size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" /> : <Pause size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" />}
             {gameState.paused ? "RESUME" : "PAUSE"}
           </button>
        </div>
      </header>

      <div className="container mx-auto p-2 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mt-2 md:mt-4">
        
        {/* Left Nav - Transformed to horizontal scroll on mobile */}
        <div className="lg:col-span-2 flex flex-col gap-4 order-1">
           <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar snap-x">
             {[
               { id: 'dashboard', icon: Layout, label: t.tabs.dashboard },
               { id: 'market', icon: ShoppingCart, label: t.tabs.market },
               { id: 'plans', icon: Users, label: t.tabs.plans },
               { id: 'tickets', icon: MessageSquare, label: t.tabs.tickets },
               { id: 'lab', icon: FlaskConical, label: t.tabs.lab },
               { id: 'ops', icon: Megaphone, label: t.tabs.ops },
               { id: 'achievements', icon: Award, label: t.tabs.achievements },
             ].map((item) => (
               <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`p-2 md:p-4 text-left flex items-center justify-center lg:justify-start gap-2 md:gap-3 transition-all font-mono text-xs md:text-sm group relative overflow-hidden clip-slope min-w-[90px] lg:min-w-0 snap-start flex-shrink-0 ${
                  activeTab === item.id 
                  ? 'bg-cyber-panel border-b-2 lg:border-b-0 lg:border-l-4 border-cyber-primary text-white shadow-[5px_0_15px_rgba(0,240,255,0.1)]' 
                  : 'bg-cyber-panel/30 border-b-2 lg:border-b-0 lg:border-l-4 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-white/5 hover:border-slate-600'
                }`}
               >
                 <item.icon size={16} className={`md:w-[18px] md:h-[18px] transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-cyber-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : ''}`} /> 
                 <span className="z-10 tracking-tight font-bold truncate">{item.label}</span>
                 
                 {item.id === 'tickets' && gameState.tickets.length > 0 && (
                     <span className="absolute right-1 top-1 lg:right-2 lg:top-1/2 lg:-translate-y-1/2 w-3 h-3 md:w-5 md:h-5 bg-red-600 text-white text-[8px] md:text-[10px] flex items-center justify-center rounded-full">
                         {gameState.tickets.length}
                     </span>
                 )}
               </button>
             ))}
           </nav>
           
           {/* Live Feed Widget - Keep hidden on very small screens to save space, visible on large */}
           <div className="hidden lg:block flex-1 min-h-[200px]">
               <LiveFeed reviews={gameState.reviews} title={t.dashboard.liveFeed} />
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6 order-2">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
               {/* Milestones Section */}
               {gameState.milestones.some(m => !m.achieved) && (
                   <div className="grid grid-cols-1 gap-2">
                      {gameState.milestones.filter(m => !m.achieved).slice(0, 1).map(m => (
                          <div key={m.id} className="bg-gradient-to-r from-cyber-warning/10 to-transparent border-l-4 border-cyber-warning p-3 flex justify-between items-center backdrop-blur-sm relative overflow-hidden">
                              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(252,238,10,0.05)_10px,rgba(252,238,10,0.05)_20px)]"></div>
                              <div className="flex items-center gap-3 relative z-10">
                                  <Award className="text-cyber-warning" size={20}/>
                                  <div className="overflow-hidden">
                                      <div className="text-[9px] md:text-[10px] text-cyber-warning uppercase tracking-wider font-bold">NEXT MILESTONE</div>
                                      <div className="font-bold text-white text-xs md:text-sm truncate">{m.name}: {m.description}</div>
                                  </div>
                              </div>
                              <div className="font-mono text-cyber-warning font-bold bg-black/40 px-2 py-1 rounded-sm border border-cyber-warning/30 relative z-10 text-xs md:text-base">+${m.rewardCash}</div>
                          </div>
                      ))}
                   </div>
               )}

               {/* Dashboard Cards - 2 Columns on Mobile */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <DashboardCard 
                    title={t.dashboard.dailyProfit} 
                    value={`$${(metrics.totalIncomeDaily - metrics.totalUpkeepDaily).toFixed(0)}`} 
                    icon={<DollarSign />}
                    colorClass="text-cyber-success"
                    className="col-span-1"
                  />
                  <DashboardCard 
                    title={t.dashboard.subscribers}
                    value={metrics.totalUsers} 
                    icon={<Users />} 
                    colorClass="text-cyber-primary"
                    className="col-span-1"
                  />
                  <DashboardCard 
                    title={t.dashboard.activeVolume}
                    value={metrics.onlineUsers} 
                    icon={<Activity />} 
                    colorClass="text-cyber-warning"
                    subtext="LIVE"
                    className="col-span-2 md:col-span-1"
                  />
               </div>

               {gameState.tickets.length > 0 && (
                 <div className="bg-red-900/10 border border-red-500/30 p-2 md:p-3 flex justify-between items-center cursor-pointer hover:bg-red-900/20 transition-colors" onClick={() => setActiveTab('tickets')}>
                     <div className="flex items-center gap-2 text-red-400">
                         <AlertTriangle size={16} className="animate-pulse"/>
                         <span className="text-xs md:text-sm font-mono">{gameState.tickets.length} Pending Tickets</span>
                     </div>
                     <span className="text-[10px] md:text-xs text-slate-400 font-mono">GO &gt;</span>
                 </div>
               )}

               {gameState.ddosSeverity > 0 && (
                 <div className="bg-red-900/20 border border-red-500 p-3 md:p-4 flex items-center justify-between animate-pulse rounded relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse-slow"></div>
                    <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
                    
                    <div className="flex items-center gap-3 text-red-500 relative z-10">
                       <AlertTriangle size={24} />
                       <div>
                          <h3 className="font-bold text-sm md:text-lg">{t.dashboard.ddosAlert}</h3>
                       </div>
                    </div>
                    <button 
                      onClick={mitigateDDOS}
                      className="relative z-10 px-2 md:px-4 py-1 md:py-2 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-[10px] md:text-xs uppercase shadow-[0_0_15px_red] clip-btn"
                    >
                      CLEAN ($200)
                    </button>
                 </div>
               )}

               <div className="bg-cyber-panel/60 backdrop-blur-lg border-t border-slate-800 relative">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-secondary to-transparent"></div>
                  <div className="bg-black/30 p-2 md:p-3 flex justify-between items-center">
                    <h2 className="text-xs md:text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
                      <HardDrive size={14} className="text-cyber-secondary"/> {t.dashboard.rackView}
                    </h2>
                    <span className="text-[10px] md:text-xs text-slate-500 font-mono bg-black/60 px-2 py-0.5 border border-slate-800">{gameState.servers.length} NODES</span>
                  </div>
                  <div className="p-2 md:p-4">
                    {gameState.servers.length === 0 ? (
                      <div className="text-center py-10 md:py-16 border border-dashed border-slate-700 bg-black/40 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <Server size={24} className="md:w-[32px] md:h-[32px] text-slate-500" />
                        </div>
                        <p className="text-cyber-warning font-mono mb-4 max-w-md text-xs md:text-sm px-4">{t.dashboard.noServers}</p>
                        <button onClick={() => setActiveTab('market')} className="px-4 py-2 md:px-6 md:py-3 bg-cyber-primary text-cyber-black font-bold font-mono uppercase hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] clip-btn text-xs md:text-sm">
                          {t.dashboard.deployFirst}
                        </button>
                      </div>
                    ) : (
                      <>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6 bg-black/20 p-2 md:p-4 border border-slate-800">
                            <ProgressBar label={t.dashboard.cpuLoad} used={metrics.totalCpuUsed} total={metrics.totalCpuCapacity} unit="C" color="bg-cyber-primary"/>
                            <ProgressBar label={t.dashboard.ramAlloc} used={metrics.totalRamUsed} total={metrics.totalRamCapacity} unit="GB" color="bg-cyber-secondary"/>
                            <ProgressBar label={t.dashboard.diskIo} used={metrics.totalDiskUsed} total={metrics.totalDiskCapacity} unit="GB" color="bg-cyber-warning"/>
                            <ProgressBar label={t.dashboard.bwLoad} used={metrics.totalBandwidthUsed} total={metrics.totalBandwidthCapacity} unit="M" color="bg-cyan-400"/>
                         </div>
                         <div className="space-y-2 md:space-y-3">
                           {gameState.servers.map(server => (
                              <ServerRack 
                                key={server.id} 
                                server={server} 
                                model={HARDWARE_CATALOG.find(h => h.id === server.modelId)} 
                                onRepair={repairServer}
                              />
                           ))}
                         </div>
                      </>
                    )}
                  </div>
               </div>
            </>
          )}

          {/* NEW: TICKET CENTER */}
          {activeTab === 'tickets' && (
              <TicketCenter 
                tickets={gameState.tickets} 
                onResolve={resolveTicket} 
                language={gameState.language} 
              />
          )}

          {/* NEW: RESEARCH LAB */}
          {activeTab === 'lab' && (
              <ResearchLab 
                upgrades={RESEARCH_UPGRADES} 
                unlockedIds={gameState.research} 
                onUnlock={unlockResearch} 
                cash={gameState.cash} 
                language={gameState.language} 
              />
          )}

          {/* MARKET TAB */}
          {activeTab === 'market' && (
             <div className="space-y-3 animate-fade-in">
               <div className="flex justify-between items-center bg-cyber-panel/40 p-3 border-l-4 border-cyber-success clip-card">
                 <div>
                   <h2 className="text-base md:text-lg font-bold font-mono text-white flex items-center gap-2">
                       <ShoppingCart className="text-cyber-success" size={18} /> {t.market.title}
                   </h2>
                   <p className="text-[10px] text-slate-500 font-mono mt-0.5">{HARDWARE_CATALOG.filter(h => h.isPurchasable !== false).length} 款可选</p>
                 </div>
                 <div className="text-xs text-slate-400 font-mono bg-black/40 px-3 py-1.5 border border-slate-700">
                    {t.market.balance}: <span className="text-cyber-success text-base font-bold ml-1">${gameState.cash.toFixed(0)}</span>
                 </div>
               </div>
               
               {/* Compact Hardware List */}
               <div className="space-y-2">
                  {HARDWARE_CATALOG.filter(h => h.isPurchasable !== false).map(hw => (
                    <div key={hw.id} className="bg-cyber-panel/30 border border-slate-700/50 hover:border-cyber-primary/50 transition-all group relative">
                       <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyber-success opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       
                       <div className="p-2.5 md:p-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            {/* Left: Name & Region */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="px-1.5 py-0.5 bg-slate-800/80 text-white text-[9px] font-mono border border-slate-600/50 flex items-center gap-1 flex-shrink-0">
                                    {getRegionFlag(hw.region)} {hw.region}
                                </span>
                                <h3 className="text-sm md:text-base font-bold text-white font-mono group-hover:text-cyber-primary truncate">{hw.name}</h3>
                            </div>
                            
                            {/* Middle: Quick Tags & Specs */}
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <div className="flex gap-1.5 text-[9px] font-mono text-slate-400">
                                    <span className="bg-black/60 px-1.5 py-0.5 border border-slate-800/50 flex items-center gap-0.5"><MonitorPlay size={8}/> {hw.networkRoute}</span>
                                    <span className="bg-black/60 px-1.5 py-0.5 border border-slate-800/50 flex items-center gap-0.5"><Globe size={8}/> {hw.ipType}</span>
                                </div>
                                
                                <div className="flex gap-2 text-[10px] font-mono">
                                    <span className="text-cyber-primary flex items-center gap-0.5"><Cpu size={10}/> {hw.cpuCores}C</span>
                                    <span className="text-cyber-secondary flex items-center gap-0.5"><Box size={10}/> {hw.ramGB}G</span>
                                    <span className="text-cyber-warning flex items-center gap-0.5"><HardDrive size={10}/> {hw.diskGB}G</span>
                                </div>
                            </div>
                            
                            {/* Right: Price & Action */}
                            <div className="flex items-center gap-3 md:gap-4 justify-between md:justify-end">
                                <div className="text-left md:text-right">
                                    <div className="text-base md:text-lg font-bold text-cyber-success font-mono">${hw.purchaseCost}</div>
                                    <div className="text-[9px] text-slate-500">-${hw.dailyUpkeep}/天</div>
                                </div>
                                <button 
                                onClick={() => buyServer(hw)}
                                disabled={gameState.cash < hw.purchaseCost}
                                className={`px-3 py-1.5 font-bold font-mono uppercase text-[10px] transition-all border clip-btn flex-shrink-0 ${
                                    gameState.cash >= hw.purchaseCost 
                                    ? 'bg-cyber-primary text-cyber-black border-cyber-primary hover:bg-white hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]' 
                                    : 'bg-transparent text-slate-600 border-slate-800 cursor-not-allowed'
                                }`}
                                >
                                {gameState.cash >= hw.purchaseCost ? '购买' : '余额不足'}
                                </button>
                            </div>
                        </div>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          )}

          {/* PLANS TAB */}
          {activeTab === 'plans' && (
             <div className="space-y-3 animate-fade-in">
                {/* Header with Create Button */}
                <div className="flex justify-between items-center bg-cyber-panel/40 backdrop-blur border border-slate-700 p-3 clip-card">
                   <div>
                      <h3 className="text-white font-bold font-mono uppercase flex items-center gap-2 tracking-wider text-sm md:text-base">
                          <Users size={16} className="text-cyber-primary"/> {t.plans.activeList}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{gameState.plans.length} 个产品在售</p>
                   </div>
                   <button 
                     onClick={() => setIsCreatePlanModalOpen(true)}
                     className="flex items-center gap-2 px-3 md:px-4 py-2 bg-cyber-success text-cyber-black font-bold font-mono uppercase hover:bg-emerald-300 transition-all text-xs clip-btn shadow-[0_0_10px_rgba(0,255,159,0.3)]"
                   >
                     <Plus size={14} /> 新产品
                   </button>
                </div>

                {/* Compact Product List */}
                <div className="space-y-1.5">
                   {gameState.plans.length === 0 ? (
                     <div className="bg-cyber-panel/20 border border-dashed border-slate-700 p-8 text-center">
                        <Users size={32} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-500 text-sm font-mono mb-4">暂无产品，点击上方按钮创建</p>
                     </div>
                   ) : (
                     gameState.plans.map(p => (
                      <div key={p.id} className="bg-cyber-panel/30 border border-slate-700/50 hover:border-slate-600 transition-all relative group">
                         <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyber-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         
                         <div className="flex items-center justify-between p-2 md:p-2.5">
                            {/* Left: Name & Specs */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                               <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] bg-slate-800/80 px-1.5 py-0.5 text-slate-400 border border-slate-700/50">
                                      {getRegionFlag(p.region)} {p.region}
                                  </span>
                                  <span className="text-[9px] bg-cyber-secondary/10 px-1.5 py-0.5 text-cyber-secondary border border-cyber-secondary/30">{p.level}</span>
                               </div>
                               <div className="font-bold text-white font-mono text-xs md:text-sm tracking-tight truncate">{p.name}</div>
                            </div>
                            
                            {/* Middle: Specs in compact format */}
                            <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 font-mono mx-4">
                                <span className="flex items-center gap-1"><Cpu size={10} className="text-cyber-primary"/> {p.cpuCores}C</span>
                                <span className="flex items-center gap-1"><Box size={10} className="text-cyber-secondary"/> {p.ramGB}G</span>
                                <span className="flex items-center gap-1"><HardDrive size={10} className="text-cyber-warning"/> {p.diskGB}G</span>
                            </div>
                            
                            {/* Right: Price, Users, Actions */}
                            <div className="flex items-center gap-3 md:gap-4">
                               <div className="text-cyber-success font-mono font-bold text-sm border border-cyber-success/20 px-2 py-0.5 bg-cyber-success/5">
                                   ${p.priceMonthly}<span className="text-[9px] opacity-60">/m</span>
                               </div>
                               <div className="text-center min-w-[40px]">
                                  <div className="text-base md:text-lg font-bold text-white font-mono leading-none">{p.activeUsers}</div>
                                  <div className="text-[8px] text-slate-500 uppercase">{t.plans.users}</div>
                               </div>
                               <button 
                                 onClick={() => deletePlan(p.id)} 
                                 className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
                                 title="删除"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      </div>
                   )))}
                </div>
             </div>
          )}

          {/* OPS (Marketing) TAB */}
          {activeTab === 'ops' && (
            <div className="space-y-6 min-h-[400px] animate-fade-in">
               
               {/* MENU VIEW */}
               {opsStep === 'menu' && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div onClick={() => setOpsStep('forum_select')} className="bg-cyber-panel/60 border border-slate-700 p-6 md:p-8 hover:border-cyber-primary cursor-pointer group relative overflow-hidden hover:-translate-y-1 transition-all shadow-lg clip-card">
                       <div className="absolute top-0 left-0 w-1 bg-slate-800 group-hover:bg-cyber-primary transition-colors"></div>
                       <div className="w-12 h-12 md:w-14 md:h-14 bg-black border border-slate-700 flex items-center justify-center mb-4 md:mb-6 group-hover:border-cyber-primary group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                           <Megaphone className="text-slate-400 group-hover:text-cyber-primary transition-colors md:w-[28px] md:h-[28px]" size={24} />
                       </div>
                       <h3 className="text-white font-bold font-mono mb-2 text-base md:text-lg">{t.ops.forumTitle}</h3>
                       <p className="text-xs text-slate-400 leading-relaxed">{t.ops.forumDesc}</p>
                    </div>
                    <div onClick={() => setOpsStep('ad_select')} className="bg-cyber-panel/60 border border-slate-700 p-6 md:p-8 hover:border-cyber-warning cursor-pointer group relative overflow-hidden hover:-translate-y-1 transition-all shadow-lg clip-card">
                       <div className="absolute top-0 left-0 w-1 bg-slate-800 group-hover:bg-cyber-warning transition-colors"></div>
                       <div className="w-12 h-12 md:w-14 md:h-14 bg-black border border-slate-700 flex items-center justify-center mb-4 md:mb-6 group-hover:border-cyber-warning group-hover:shadow-[0_0_15px_rgba(252,238,10,0.3)] transition-all">
                           <TrendingUp className="text-slate-400 group-hover:text-cyber-warning transition-colors md:w-[28px] md:h-[28px]" size={24} />
                       </div>
                       <h3 className="text-white font-bold font-mono mb-2 text-base md:text-lg">{t.ops.adsTitle}</h3>
                       <p className="text-xs text-slate-400 leading-relaxed">{t.ops.adsDesc}</p>
                    </div>
                    <div onClick={() => setOpsStep('kol_select')} className="bg-cyber-panel/60 border border-slate-700 p-6 md:p-8 hover:border-cyber-danger cursor-pointer group relative overflow-hidden hover:-translate-y-1 transition-all shadow-lg clip-card">
                       <div className="absolute top-0 left-0 w-1 bg-slate-800 group-hover:bg-cyber-danger transition-colors"></div>
                       <div className="w-12 h-12 md:w-14 md:h-14 bg-black border border-slate-700 flex items-center justify-center mb-4 md:mb-6 group-hover:border-cyber-danger group-hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] transition-all">
                           <Zap className="text-slate-400 group-hover:text-cyber-danger transition-colors md:w-[28px] md:h-[28px]" size={24} />
                       </div>
                       <h3 className="text-white font-bold font-mono mb-2 text-base md:text-lg">{t.ops.kolTitle}</h3>
                       <p className="text-xs text-slate-400 leading-relaxed">{t.ops.kolDesc}</p>
                    </div>
                 </div>
               )}

               {/* ... Sub menus logic remains similar, just check responsiveness of inner grids ... */}
               {/* Assuming sub menus use standard grid-cols-1 and flex layouts which are generally responsive. */}
               {/* Just ensure padding/text sizes are adaptable. */}
               
               {/* Example for Forum Select adjustment */}
               {opsStep === 'forum_select' && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <button onClick={() => {setOpsStep('menu'); setSelectedForumId(null);}} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs md:text-sm font-mono bg-slate-800/50 px-3 py-2 hover:bg-slate-800 transition-colors clip-btn">
                            <ArrowLeft size={14} className="md:w-[16px] md:h-[16px]"/> {t.ops.back}
                        </button>
                        <h3 className="font-bold text-white uppercase font-mono tracking-widest text-base md:text-xl">{t.ops.forumTitle}</h3>
                        <div className="w-10 md:w-20"></div>
                    </div>
                    
                    {/* ... Rest of forum logic (grids are usually col-1 on mobile which is fine) ... */}
                    {!selectedForumId ? (
                       <div className="space-y-3">
                          <p className="text-xs text-cyber-primary font-mono uppercase tracking-widest mb-2">{t.ops.selectTarget}:</p>
                          <div className="grid grid-cols-1 gap-3">
                             {FORUMS.map(f => (
                                <div key={f.id} onClick={() => setSelectedForumId(f.id)} className="bg-black/40 border border-slate-700 p-4 md:p-5 hover:border-cyber-primary cursor-pointer flex justify-between items-center transition-all hover:bg-slate-900 group clip-card">
                                   <div>
                                       <span className="font-bold text-white text-lg md:text-xl block mb-1 group-hover:text-cyber-primary transition-colors">{f.name}</span>
                                       <span className="text-[10px] md:text-xs text-slate-500 font-mono">Risk: <span className="text-red-400">{(f.risk * 100).toFixed(0)}%</span> | Traffic: <span className="text-cyber-success">{f.trafficPotential}</span></span>
                                   </div>
                                   <span className="text-slate-600 font-mono text-[10px] md:text-xs group-hover:text-cyber-primary transition-colors group-hover:translate-x-2 transform duration-300">INITIATE &gt;</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-6">
                          <div className="bg-cyber-primary/5 border border-cyber-primary/30 p-3 md:p-4 text-center clip-slope">
                              <span className="text-cyber-primary font-mono tracking-widest text-sm md:text-lg">TARGET: {FORUMS.find(f => f.id === selectedForumId)?.name.toUpperCase()}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {/* Tech Content */}
                             <button onClick={() => handleForumPost('tech')} className="bg-black/40 p-4 md:p-6 text-center hover:bg-cyber-primary hover:text-black transition-all border border-slate-700 group flex flex-col items-center gap-2 md:gap-3 h-full relative overflow-hidden clip-card">
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyber-primary/50"></div>
                                <HardDrive size={28} className="md:w-[32px] md:h-[32px] text-slate-500 group-hover:text-black mb-1 md:mb-2"/>
                                <div className="font-bold text-sm md:text-base">{t.ops.contentTech}</div>
                                <div className="text-[9px] md:text-[10px] opacity-70 leading-tight font-mono">{t.ops.contentTechDesc}</div>
                             </button>
                             
                             {/* ... Aff/Sad buttons ... */}
                             <button onClick={() => handleForumPost('aff')} className="bg-black/40 p-4 md:p-6 text-center hover:bg-cyber-warning hover:text-black transition-all border border-slate-700 group flex flex-col items-center gap-2 md:gap-3 h-full relative overflow-hidden clip-card">
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyber-warning/50"></div>
                                <DollarSign size={28} className="md:w-[32px] md:h-[32px] text-slate-500 group-hover:text-black mb-1 md:mb-2"/>
                                <div className="font-bold text-sm md:text-base">{t.ops.contentAff}</div>
                                <div className="text-[9px] md:text-[10px] opacity-70 leading-tight font-mono">{t.ops.contentAffDesc}</div>
                             </button>

                             <button onClick={() => handleForumPost('sad')} className="bg-black/40 p-4 md:p-6 text-center hover:bg-cyber-secondary hover:text-white transition-all border border-slate-700 group flex flex-col items-center gap-2 md:gap-3 h-full relative overflow-hidden clip-card">
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyber-secondary/50"></div>
                                <Users size={28} className="md:w-[32px] md:h-[32px] text-slate-500 group-hover:text-white mb-1 md:mb-2"/>
                                <div className="font-bold text-sm md:text-base">{t.ops.contentSad}</div>
                                <div className="text-[9px] md:text-[10px] opacity-70 leading-tight font-mono">{t.ops.contentSadDesc}</div>
                             </button>
                          </div>
                          
                          <button onClick={() => setSelectedForumId(null)} className="w-full py-3 mt-4 text-slate-500 text-xs hover:text-white border border-slate-800 hover:border-slate-600 bg-transparent uppercase tracking-widest font-mono clip-btn">
                              {t.ops.cancel}
                          </button>
                       </div>
                    )}

                 </div>
               )}

               {/* ... Other submenus ... */}
               {opsStep === 'ad_select' && (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <button onClick={() => setOpsStep('menu')} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs md:text-sm font-mono bg-slate-800/50 px-3 py-2 hover:bg-slate-800 transition-colors clip-btn">
                            <ArrowLeft size={14} className="md:w-[16px] md:h-[16px]"/> {t.ops.back}
                        </button>
                        <h3 className="font-bold text-white uppercase font-mono tracking-widest text-base md:text-xl">{t.ops.adsTitle}</h3>
                        <div className="w-10 md:w-20"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {ADS.map(ad => (
                          <div key={ad.id} onClick={() => handleBuyAd(ad.id)} className="bg-black/40 border border-slate-700 p-4 md:p-5 hover:border-cyber-warning cursor-pointer flex justify-between items-center group transition-transform hover:translate-x-1 clip-card">
                             <div>
                                <div className="font-bold text-white text-base md:text-lg group-hover:text-cyber-warning transition-colors">{ad.name}</div>
                                <div className="text-[10px] md:text-xs text-slate-500 font-mono">Traffic Boost: <span className="text-white">{ad.trafficBoost}x</span></div>
                             </div>
                             <div className="font-mono text-cyber-warning font-bold text-lg md:text-xl border border-cyber-warning/30 px-3 py-1 bg-cyber-warning/5 clip-slope">${ad.cost}</div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {opsStep === 'kol_select' && (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <button onClick={() => setOpsStep('menu')} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs md:text-sm font-mono bg-slate-800/50 px-3 py-2 hover:bg-slate-800 transition-colors clip-btn">
                            <ArrowLeft size={14} className="md:w-[16px] md:h-[16px]"/> {t.ops.back}
                        </button>
                        <h3 className="font-bold text-white uppercase font-mono tracking-widest text-base md:text-xl">{t.ops.kolTitle}</h3>
                        <div className="w-10 md:w-20"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {KOLS.map(kol => (
                          <div key={kol.id} onClick={() => handleHireKol(kol.id)} className="bg-black/40 border border-slate-700 p-4 md:p-5 hover:border-cyber-danger cursor-pointer flex justify-between items-center group transition-transform hover:translate-x-1 clip-card">
                             <div>
                                <div className="font-bold text-white text-base md:text-lg group-hover:text-cyber-danger transition-colors">{kol.name}</div>
                                <div className="text-[10px] md:text-xs text-slate-500 font-mono">Reputation Impact: <span className={kol.reputationImpact > 0 ? 'text-green-400' : 'text-red-400'}>{kol.reputationImpact > 0 ? '+' : ''}{kol.reputationImpact}</span></div>
                             </div>
                             <div className="font-mono text-cyber-danger font-bold text-lg md:text-xl border border-cyber-danger/30 px-3 py-1 bg-cyber-danger/5 clip-slope">${kol.cost}</div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Risk Center */}
               <div className="mt-6 md:mt-8 border-t border-slate-800 pt-4 md:pt-6">
                  <h3 className="text-red-500 font-bold font-mono mb-3 md:mb-4 flex items-center gap-2 uppercase tracking-widest text-xs md:text-sm"><Shield size={16}/> {t.ops.riskCenter}</h3>
                  <div className="bg-red-900/5 border border-red-900/30 p-4 md:p-5 flex justify-between items-center relative overflow-hidden clip-card">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-900/50"></div>
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.02)_10px,rgba(255,0,0,0.02)_20px)]"></div>
                      <span className="text-slate-300 text-xs md:text-sm font-mono relative z-10">{t.ops.cleanDDOS} PROTOCOL</span>
                      <button 
                        onClick={mitigateDDOS}
                        disabled={gameState.ddosSeverity === 0}
                        className={`relative z-10 px-4 md:px-6 py-2 text-[10px] md:text-xs font-mono border font-bold uppercase tracking-widest transition-all clip-btn ${gameState.ddosSeverity > 0 ? 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-[0_0_10px_red]' : 'border-slate-800 text-slate-700 bg-black cursor-not-allowed'}`}
                      >
                        ACTIVATE ($200)
                      </button>
                  </div>
               </div>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-cyber-panel/40 backdrop-blur border border-slate-800 p-4 md:p-8 mb-6 relative overflow-hidden clip-card">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-cyber-warning/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="flex items-center gap-4 md:gap-6 relative z-10">
                        <div className="p-3 md:p-4 bg-black border border-cyber-warning/30 rounded-full shadow-[0_0_15px_rgba(252,238,10,0.2)]">
                            <Award size={32} className="md:w-[40px] md:h-[40px] text-cyber-warning" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold text-white font-mono uppercase tracking-tight">{t.achievements.title}</h2>
                            <p className="text-slate-400 text-xs md:text-sm font-mono mt-1 border-l-2 border-slate-700 pl-3">{t.achievements.desc}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.milestones.map(m => (
                        <div key={m.id} className={`relative group overflow-hidden border transition-all duration-500 p-4 md:p-6 clip-card ${
                            m.achieved 
                            ? 'bg-cyber-panel border-cyber-warning shadow-[0_0_15px_rgba(252,238,10,0.1)]' 
                            : 'bg-black/40 border-slate-800 opacity-80'
                        }`}>
                            {/* Diagonal Cut Overlay */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 transform rotate-45 translate-x-8 -translate-y-8"></div>

                            <div className="flex justify-between items-start h-full relative z-10">
                                <div className="flex flex-col justify-between h-full gap-4">
                                    <div>
                                        <h3 className={`font-bold font-mono text-sm md:text-lg mb-2 flex items-center gap-2 uppercase ${m.achieved ? 'text-white' : 'text-slate-500'}`}>
                                            {m.name} 
                                        </h3>
                                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{m.description}</p>
                                    </div>
                                    
                                    <div className="mt-auto pt-4">
                                        <span className={`px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-[10px] font-mono uppercase border tracking-widest ${
                                            m.achieved 
                                            ? 'bg-cyber-warning/20 text-cyber-warning border-cyber-warning' 
                                            : 'bg-slate-900 text-slate-600 border-slate-800'
                                        }`}>
                                            {m.achieved ? t.achievements.unlocked : t.achievements.locked}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right flex flex-col items-end">
                                    {m.achieved ? <CheckCircle className="text-cyber-warning mb-2" size={20} /> : <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-slate-700 border-dashed mb-2"></div>}
                                    <div className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-wider mb-1">{t.achievements.reward}</div>
                                    <div className={`font-mono text-lg md:text-2xl font-bold ${m.achieved ? 'text-cyber-warning drop-shadow-[0_0_5px_rgba(252,238,10,0.5)]' : 'text-slate-700'}`}>
                                        ${m.rewardCash}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

        </div>

        {/* Right Log - On Mobile, this is at bottom. Keep it but reduce height/priority */}
        <div className="lg:col-span-3 space-y-6 order-3">
          {/* Sticky terminal only on large screens */}
          <div className="h-[250px] md:h-[300px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 flex flex-col">
             <div className="h-full flex flex-col shadow-2xl border border-slate-800">
                <Terminal events={gameState.events} />
             </div>
             
             {/* Extra Stats - Hidden on small mobile to save space, or kept if useful */}
             <div className="bg-cyber-panel/40 backdrop-blur border border-slate-800 p-4 md:p-6 rounded-none flex-none flex flex-col justify-center relative overflow-hidden clip-slope mt-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05),transparent)] pointer-events-none"></div>
                
                <div className="text-[10px] md:text-xs font-bold text-slate-500 font-mono uppercase mb-2 md:mb-4 text-center tracking-widest flex items-center justify-center gap-2">
                    <Activity size={12}/> Overselling Ratio
                </div>
                
                <div className="relative z-10 text-center">
                   <div className={`text-4xl md:text-6xl font-bold font-mono mb-2 text-center transition-colors duration-500 ${metrics.oversellingRatio > 1.5 ? 'text-cyber-danger drop-shadow-[0_0_10px_red]' : 'text-cyber-success drop-shadow-[0_0_10px_rgba(0,255,159,0.5)]'}`}>
                       {metrics.oversellingRatio > 100 ? '∞' : metrics.oversellingRatio.toFixed(2)}<span className="text-lg md:text-2xl text-slate-600">x</span>
                   </div>
                </div>
                
                <div className="w-full bg-slate-900 h-1 mt-4 md:mt-6 overflow-hidden relative">
                   <div className={`h-full transition-all duration-1000 ease-out ${
                       metrics.oversellingRatio > 1.5 ? 'bg-gradient-to-r from-orange-500 to-red-600 animate-pulse' : 'bg-gradient-to-r from-cyber-success to-emerald-600'
                   }`} style={{width: `${Math.min(metrics.oversellingRatio * 50, 100)}%`}}></div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Create Plan Modal */}
      <Modal 
        isOpen={isCreatePlanModalOpen} 
        onClose={() => setIsCreatePlanModalOpen(false)}
        title={t.plans.create}
      >
        {gameState.servers.length === 0 && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-4 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle size={16}/> {t.plans.noResources}
          </div>
        )}

        <div className="space-y-5">
          {/* Node Selector & Level Selector & Auto-Gen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
                 <label className="text-xs text-slate-400 font-mono uppercase tracking-widest flex items-center gap-2"><Server size={10}/> {t.plans.selectNode}</label>
                 <select 
                    value={newPlan.nodeId} 
                    onChange={e => setNewPlan({...newPlan, nodeId: e.target.value})} 
                    className="w-full bg-black/80 border border-slate-700 p-2 text-white font-mono text-xs focus:border-cyber-primary outline-none transition-all appearance-none"
                 >
                     <option value="">-- Choose Node --</option>
                     {gameState.servers.map(s => (
                         <option key={s.id} value={s.id}>{getRegionFlag(HARDWARE_CATALOG.find(h => h.id === s.modelId)?.region)} {s.name} (Online)</option>
                     ))}
                 </select>
             </div>
             <div className="space-y-2">
                 <label className="text-xs text-slate-400 font-mono uppercase tracking-widest flex items-center gap-2"><Award size={10}/> {t.plans.selectLevel}</label>
                 <select 
                    value={newPlan.level} 
                    onChange={e => setNewPlan({...newPlan, level: e.target.value})} 
                    className="w-full bg-black/80 border border-slate-700 p-2 text-white font-mono text-xs focus:border-cyber-primary outline-none transition-all appearance-none"
                 >
                     {PLAN_LEVELS.map(l => (
                         <option key={l} value={l}>{l}</option>
                     ))}
                 </select>
             </div>
             <div className="flex items-end">
                 <button 
                   onClick={autoGeneratePlan}
                   className="flex items-center gap-2 px-3 py-2 bg-cyber-secondary/20 text-cyber-secondary border border-cyber-secondary/50 hover:bg-cyber-secondary hover:text-white transition-all text-xs font-mono uppercase w-full justify-center clip-btn"
                 >
                     <Wand2 size={14} /> {t.plans.autoGen}
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                 <label className="text-xs text-cyber-primary font-mono uppercase tracking-widest flex items-center gap-2"><TerminalIcon size={10}/> {t.plans.name}</label>
                 <input type="text" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="w-full bg-black/80 border border-slate-700 p-2 text-white font-mono text-xs focus:border-cyber-primary outline-none focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all" placeholder="e.g. HK PRO-1"/>
             </div>
             <div className="space-y-2">
                 <label className="text-xs text-cyber-success font-mono uppercase tracking-widest flex items-center gap-2"><DollarSign size={10}/> {t.plans.price}</label>
                 <input type="number" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})} className="w-full bg-black/80 border border-slate-700 p-2 text-white font-mono text-xs focus:border-cyber-success outline-none focus:shadow-[0_0_15px_rgba(0,255,159,0.1)] transition-all" placeholder="5.00"/>
             </div>
          </div>

          <div className="space-y-3 p-4 bg-black/40 border border-slate-800 relative">
             <div className="absolute -top-2 left-4 bg-cyber-panel px-2 text-[10px] text-slate-500 uppercase">规格配置</div>
             <div>
                 <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono"><span>CPU Cores</span> <span className="text-cyber-primary">{newPlan.cpu} C</span></div>
                 <input type="range" min="1" max="16" value={newPlan.cpu} onChange={e => setNewPlan({...newPlan, cpu: Number(e.target.value)})} className="w-full accent-cyber-primary h-1.5 bg-slate-700 appearance-none cursor-pointer hover:bg-slate-600"/>
             </div>
             <div>
                 <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono"><span>RAM</span> <span className="text-cyber-secondary">{newPlan.ram} GB</span></div>
                 <input type="range" min="0.5" max="32" step="0.5" value={newPlan.ram} onChange={e => setNewPlan({...newPlan, ram: Number(e.target.value)})} className="w-full accent-cyber-secondary h-1.5 bg-slate-700 appearance-none cursor-pointer hover:bg-slate-600"/>
             </div>
             <div>
                 <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono"><span>Disk</span> <span className="text-cyber-warning">{newPlan.disk} GB</span></div>
                 <input type="range" min="5" max="500" step="5" value={newPlan.disk} onChange={e => setNewPlan({...newPlan, disk: Number(e.target.value)})} className="w-full accent-cyber-warning h-1.5 bg-slate-700 appearance-none cursor-pointer hover:bg-slate-600"/>
             </div>
             <div>
                 <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono"><span>{t.plans.bandwidth}</span> <span className="text-cyan-400">{newPlan.bandwidth} Mbps</span></div>
                 <input type="range" min="10" max="2000" step="10" value={newPlan.bandwidth} onChange={e => setNewPlan({...newPlan, bandwidth: Number(e.target.value)})} className="w-full accent-cyan-400 h-1.5 bg-slate-700 appearance-none cursor-pointer hover:bg-slate-600"/>
             </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsCreatePlanModalOpen(false)} 
              className="flex-1 py-3 bg-transparent border border-slate-700 text-slate-400 font-bold font-mono uppercase hover:bg-slate-800 transition-all text-sm"
            >
              取消
            </button>
            <button 
              onClick={createPlan} 
              className="flex-1 py-3 bg-cyber-success text-cyber-black font-bold font-mono uppercase hover:bg-emerald-300 shadow-[0_0_15px_rgba(0,255,159,0.3)] active:scale-[0.99] transition-all clip-btn tracking-widest text-sm"
            >
              {t.plans.create}
            </button>
          </div>
        </div>
      </Modal>
   </div>
  );
}
