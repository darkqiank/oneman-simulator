
import { HardwareModel, VPSPlan, Forum, AdPlatform, Influencer, Language, Milestone, GameState, ResearchItem } from './types';

export const INITIAL_CASH = 1500; // Increased from 800
export const INITIAL_REPUTATION = 50; // Increased from 50

// --- Translations ---
export const TRANSLATIONS = {
  zh: {
    title: "VPS大玩家",
    subtitle: "Oneman 模拟器",
    start: "开始运营",
    pause: "暂停",
    cash: "资金",
    reputation: "声望",
    day: "运营天数",
    reset: "重置存档",
    theme: "主题",
    themes: {
      cyber: "赛博朋克",
      scam: "灵车跑路"
    },
    tabs: {
      dashboard: "概览",
      market: "硬件市场",
      plans: "产品管理",
      tickets: "工单中心",
      ops: "营销运营",
      lab: "研发实验室",
      achievements: "成就里程碑"
    },
    dashboard: {
      dailyProfit: "每日净利润",
      activeUsers: "活跃量", 
      subscribers: "订阅用户", 
      activeVolume: "活跃量",
      rackView: "机房机架视图",
      noServers: "当前没有服务器，请前往市场购买。",
      deployFirst: "部署第一台母鸡",
      cpuLoad: "CPU 负载",
      ramAlloc: "内存分配",
      diskIo: "硬盘使用",
      bwLoad: "带宽占用",
      netIn: "入站带宽",
      netOut: "出站带宽",
      ddosAlert: "系统正在遭受攻击！",
      cleanTraffic: "清洗流量",
      tickets: "待处理工单",
      noTickets: "暂无待处理工单，暂且偷闲。",
      solve: "处理",
      ignore: "忽略",
      milestoneAchieved: "达成里程碑",
      liveFeed: "实时用户反馈"
    },
    ticketsPage: {
      title: "客户支持中心",
      desc: "处理用户投诉，维持声望。VIP用户优先级更高。",
      empty: "当前没有待处理的工单。",
      vip: "VIP客户",
      normal: "普通用户",
      expires: "剩余时间",
      actions: "操作",
      quickReply: "快速回复",
      fullRefund: "全额退款",
      banUser: "封禁用户",
      autoHandled: "系统自动处理了 {count} 个简单工单",
      types: {
        slow: "网速太慢",
        down: "无法连接",
        refund: "申请退款",
        question: "售前咨询",
        attack: "遭受攻击"
      }
    },
    lab: {
      title: "研发实验室",
      desc: "投入资金升级技术栈，获得永久被动加成。",
      unlock: "研发",
      unlocked: "已掌握",
      cost: "资金需求",
      effects: {
        upkeep_reduce: "降低硬件维护费",
        marketing_boost: "营销效果提升",
        auto_ticket: "自动处理简单工单",
        ddos_resist: "被动DDOS防御",
        churn_reduce: "降低用户流失率"
      }
    },
    market: {
      title: "服务器采购中心",
      balance: "可用资金",
      setupFee: "初装费",
      dailyCost: "日维护费",
      buy: "立即下单",
      noFunds: "资金不足",
      specs: {
        cpu: "CPU",
        ram: "内存",
        disk: "硬盘",
        bw: "带宽",
        region: "地区",
        route: "线路",
        ip: "IP类型"
      }
    },
    plans: {
      create: "发布新产品",
      name: "套餐名称",
      price: "月付价格",
      activeList: "在售产品列表",
      delete: "下架",
      users: "订阅用户",
      cantDelete: "仍有用户在使用，无法下架",
      noResources: "警告：当前没有可用服务器，新用户无法注册！",
      nameExists: "错误：套餐名称已存在，请更换名称。",
      selectNode: "选择母鸡(节点)",
      selectLevel: "产品等级",
      bandwidth: "流量带宽",
      autoGen: "自动生成"
    },
    ops: {
      forumTitle: "论坛发帖",
      forumDesc: "在各大社区推广，免费但有风险。",
      postContent: "选择发帖策略",
      selectTarget: "选择目标板块",
      contentTech: "技术干货分享",
      contentTechDesc: "低风险，涨粉慢但稳，适合长期运营。",
      contentAff: "AFF 硬广轰炸",
      contentAffDesc: "高风险，可能被封号，但能带来大量小白用户。",
      contentSad: "卖惨（学生创业）",
      contentSadDesc: "中等风险，博取同情分，容易被反噬。",
      adsTitle: "广告投放",
      adsDesc: "付费获取稳定的流量来源。",
      kolTitle: "网红评测",
      kolDesc: "找大V合作，流量爆发但价格昂贵。",
      riskCenter: "紧急响应中心",
      cleanDDOS: "高防清洗",
      back: "返回上一级",
      cancel: "取消操作"
    },
    achievements: {
      title: "运营里程碑",
      desc: "达成目标以获取高额资金奖励。",
      reward: "奖励",
      status: "状态",
      unlocked: "已达成",
      locked: "进行中"
    }
  }
};

export const PLAN_LEVELS = ['Intro', 'SE', 'Plus', 'Pro', 'Ultra', 'Max'];

// --- Hardware Catalog ---
export const HARDWARE_CATALOG: HardwareModel[] = [
  {
    id: 'starter-kvm',
    name: 'Starter KVM',
    cpuCores: 2,
    ramGB: 4,
    diskGB: 60,
    bandwidthMbps: 500,
    purchaseCost: 0, // Free starter
    dailyUpkeep: 0,  // Free starter
    reliability: 0.99,
    description: "A free starter server to get you going.",
    region: 'US',
    networkRoute: 'Cogent',
    ipType: 'Native',
    isPurchasable: false
  },
  {
    id: 'us-scrap',
    name: 'US Backyard E5',
    cpuCores: 8,
    ramGB: 16,
    diskGB: 500,
    bandwidthMbps: 1000,
    purchaseCost: 200, // Increased from 100
    dailyUpkeep: 1.0, // Reduced from 1.5
    reliability: 0.8,
    description: "Hosted in a garage in LA. Cheap, dirty, high bandwidth.",
    region: 'US',
    networkRoute: 'Cogent',
    ipType: 'Native'
  },
  {
    id: 'hk-lite',
    name: 'HK BGP Lite',
    cpuCores: 4,
    ramGB: 8,
    diskGB: 120,
    bandwidthMbps: 50,
    purchaseCost: 400,
    dailyUpkeep: 4,
    reliability: 0.9,
    description: "Entry level Hong Kong server. Low latency for mainland, but bandwidth is expensive.",
    region: 'HK',
    networkRoute: 'BGP',
    ipType: 'Broadcast'
  },
  {
    id: 'jp-sb',
    name: 'JP Softbank Line',
    cpuCores: 16,
    ramGB: 32,
    diskGB: 1000,
    bandwidthMbps: 500,
    purchaseCost: 800,
    dailyUpkeep: 8,
    reliability: 0.95,
    description: "Excellent Softbank line, great for connectivity.",
    region: 'JP',
    networkRoute: 'Softbank',
    ipType: 'Native'
  },
  {
    id: 'us-9929',
    name: 'US CU 9929 VIP',
    cpuCores: 24,
    ramGB: 64,
    diskGB: 2000,
    bandwidthMbps: 200,
    purchaseCost: 1500,
    dailyUpkeep: 12,
    reliability: 0.98,
    description: "Premium China Unicom 9929 route. Very stable.",
    region: 'US',
    networkRoute: 'AS9929',
    ipType: 'Native'
  },
  {
    id: 'hk-cn2',
    name: 'HK CN2 GIA Enterprise',
    cpuCores: 32,
    ramGB: 128,
    diskGB: 4000,
    bandwidthMbps: 20, // GIA is expensive!
    purchaseCost: 3000,
    dailyUpkeep: 25,
    reliability: 0.99,
    description: "The holy grail of routes. Extremely low latency, extremely low bandwidth.",
    region: 'HK',
    networkRoute: 'CN2 GIA',
    ipType: 'Native'
  },
  {
    id: 'sg-aws',
    name: 'SG High-Perf Node',
    cpuCores: 64,
    ramGB: 256,
    diskGB: 5000,
    bandwidthMbps: 5000,
    purchaseCost: 5000,
    dailyUpkeep: 40,
    reliability: 0.99,
    description: "Top tier hardware in Singapore. Great for SE Asia users.",
    region: 'SG',
    networkRoute: 'BGP',
    ipType: 'Broadcast'
  }
];

// --- Marketing Data ---

export const FORUMS: Forum[] = [
  { id: 'linuxdo', name: 'Linux.do', risk: 0.1, trafficPotential: 3, userQuality: 0.9 },
  { id: 'nodeseek', name: 'NodeSeek', risk: 0.3, trafficPotential: 5, userQuality: 0.7 },
  { id: 'v2ex', name: 'V2EX', risk: 0.5, trafficPotential: 4, userQuality: 0.8 },
  { id: 'hostloc', name: 'HostLoc', risk: 0.8, trafficPotential: 8, userQuality: 0.4 }, // High traffic, high risk (DDOS/Scammers)
];

export const ADS: AdPlatform[] = [
  { id: 'google', name: 'Google Ads', cost: 250, trafficBoost: 2.0 },
  { id: 'telegram', name: 'Telegram 频道', cost: 150, trafficBoost: 1.5 },
  { id: 'adult', name: '成人网站广告', cost: 350, trafficBoost: 2.5 },
];

export const KOLS: Influencer[] = [
  { id: 'small', name: '野生技术博主', cost: 250, trafficBoost: 1.8, reputationImpact: 3 },
  { id: 'medium', name: 'Affiliate Man', cost: 400, trafficBoost: 3.5, reputationImpact: -3 }, // High traffic but people hate AFF man
  { id: 'large', name: '顶流测评师', cost: 1500, trafficBoost: 5.0, reputationImpact: 8 },
];

// --- Research Tree ---
export const RESEARCH_UPGRADES: ResearchItem[] = [
    {
        id: 'auto_bot_v1',
        name: '自动客服机器人',
        description: '使用简单脚本自动回复 30% 的基础问题，节省人力成本。',
        cost: 500,
        effectType: 'auto_ticket',
        effectValue: 0.3,
        icon: 'Bot',
        unlocked: false
    },
    {
        id: 'liquid_cooling',
        name: '优化散热系统',
        description: '改善机房散热，降低服务器维护成本 15%。',
        cost: 800,
        effectType: 'upkeep_reduce',
        effectValue: 0.15,
        icon: 'Fan',
        unlocked: false
    },
    {
        id: 'seo_mastery',
        name: 'SEO 优化大师',
        description: '搜索引擎排名提升，营销效果增强 20%。',
        cost: 1200,
        effectType: 'marketing_boost',
        effectValue: 0.2,
        icon: 'Search',
        unlocked: false
    },
    {
        id: 'churn_algo',
        name: '用户忠诚计划',
        description: '提升用户满意度和粘性，降低流失率 10%。',
        cost: 1500,
        effectType: 'churn_reduce',
        effectValue: 0.1,
        icon: 'Heart',
        unlocked: false
    },
    {
        id: 'anycast_dns',
        name: 'Anycast DNS',
        description: '全球加速解析，显著减少"速度慢"工单。',
        cost: 2000,
        effectType: 'churn_reduce',
        effectValue: 0.15,
        icon: 'Globe',
        unlocked: false
    },
    {
        id: 'ddos_shield_pro',
        name: 'DDoS Shield Pro',
        description: 'Passive filtering that mitigates 30% of attack impact.',
        cost: 3000,
        effectType: 'ddos_resist',
        effectValue: 0.3,
        icon: 'Shield',
        unlocked: false
    }
];

export const INITIAL_PLANS: VPSPlan[] = [];

export const MILESTONES: Milestone[] = [
  // 初级成就
  {
    id: 'first_user',
    name: 'Hello World',
    description: '获得第 1 个用户',
    rewardCash: 50,
    condition: (state: GameState) => state.plans.some(p => p.activeUsers > 0),
    achieved: false
  },
  {
    id: 'first_server',
    name: '机房初建',
    description: '购买第一台服务器',
    rewardCash: 100,
    condition: (state: GameState) => state.servers.length >= 2,
    achieved: false
  },
  {
    id: 'first_plan',
    name: '产品经理',
    description: '创建第一个 VPS 套餐',
    rewardCash: 80,
    condition: (state: GameState) => state.plans.length >= 2,
    achieved: false
  },
  {
    id: 'cash_1k',
    name: '资本萌芽',
    description: '累积现金达到 $1,000',
    rewardCash: 200,
    condition: (state: GameState) => state.cash >= 1000,
    achieved: false
  },
  
  // 中级成就
  {
    id: 'users_10',
    name: '十人团',
    description: '总用户数达到 10 人',
    rewardCash: 150,
    condition: (state: GameState) => state.plans.reduce((acc, p) => acc + p.activeUsers, 0) >= 10,
    achieved: false
  },
  {
    id: 'users_50',
    name: 'Traffic Master',
    description: '总用户数达到 50 人',
    rewardCash: 500,
    condition: (state: GameState) => state.plans.reduce((acc, p) => acc + p.activeUsers, 0) >= 50,
    achieved: false
  },
  {
    id: 'users_100',
    name: '百人俱乐部',
    description: '总用户数达到 100 人',
    rewardCash: 1000,
    condition: (state: GameState) => state.plans.reduce((acc, p) => acc + p.activeUsers, 0) >= 100,
    achieved: false
  },
  {
    id: 'server_3',
    name: 'Cluster Admin',
    description: '拥有 3 台服务器',
    rewardCash: 300,
    condition: (state: GameState) => state.servers.length >= 3,
    achieved: false
  },
  {
    id: 'reputation_70',
    name: '口碑不错',
    description: '声望达到 70',
    rewardCash: 400,
    condition: (state: GameState) => state.reputation >= 70,
    achieved: false
  },
  {
    id: 'reputation_90',
    name: 'Legendary Host',
    description: '声望达到 90',
    rewardCash: 1000,
    condition: (state: GameState) => state.reputation >= 90,
    achieved: false
  },
  
  // 高级成就
  {
    id: 'cash_10k',
    name: '小康生活',
    description: '累积现金达到 $10,000',
    rewardCash: 1500,
    condition: (state: GameState) => state.cash >= 10000,
    achieved: false
  },
  {
    id: 'users_200',
    name: '双百目标',
    description: '总用户数达到 200 人',
    rewardCash: 2000,
    condition: (state: GameState) => state.plans.reduce((acc, p) => acc + p.activeUsers, 0) >= 200,
    achieved: false
  },
  {
    id: 'server_5',
    name: '机房扩建',
    description: '拥有 5 台服务器',
    rewardCash: 800,
    condition: (state: GameState) => state.servers.length >= 5,
    achieved: false
  },
  {
    id: 'reputation_100',
    name: '五星好评',
    description: '声望达到满分 100',
    rewardCash: 2000,
    condition: (state: GameState) => state.reputation >= 100,
    achieved: false
  },
  {
    id: 'plans_5',
    name: '产品矩阵',
    description: '同时在售 5 款产品',
    rewardCash: 600,
    condition: (state: GameState) => state.plans.length >= 5,
    achieved: false
  },
  
  // 专家成就
  {
    id: 'overselling_master',
    name: '超售大师',
    description: '超售率达到 8.0x',
    rewardCash: 1500,
    condition: (state: GameState) => {
      const metrics = state.plans.reduce((acc, p) => {
        acc.totalCpuUsed += p.cpuCores * p.activeUsers;
        return acc;
      }, { totalCpuUsed: 0 });
      const totalCpuCapacity = state.servers.reduce((acc, s) => {
        const hw = HARDWARE_CATALOG.find(h => h.id === s.modelId);
        return acc + (hw?.cpuCores || 0);
      }, 0);
      const ratio = totalCpuCapacity > 0 ? metrics.totalCpuUsed / totalCpuCapacity : 0;
      return ratio >= 8.0;
    },
    achieved: false
  },
  {
    id: 'day_30',
    name: '一周年庆典',
    description: '存活 365 天',
    rewardCash: 300,
    condition: (state: GameState) => state.day >= 365,
    achieved: false
  },
  {
    id: 'day_3650',
    name: '十年老店',
    description: '存活 3650 天',
    rewardCash: 2000,
    condition: (state: GameState) => state.day >= 3650,
    achieved: false
  },
  {
    id: 'research_3',
    name: '科技先锋',
    description: '解锁 3 项研究',
    rewardCash: 1000,
    condition: (state: GameState) => state.research.length >= 3,
    achieved: false
  },
  {
    id: 'multi_region',
    name: '全球布局',
    description: '在 3 个不同地区部署服务器',
    rewardCash: 1200,
    condition: (state: GameState) => {
      const regions = new Set();
      state.servers.forEach(s => {
        const hw = HARDWARE_CATALOG.find(h => h.id === s.modelId);
        if (hw) regions.add(hw.region);
      });
      return regions.size >= 3;
    },
    achieved: false
  }
];

// --- User Feedback Data ---
export const USER_NAMES = [
    "mjj_king", "host_lover", "linux_fan", "py_coder", "node_master", 
    "cheap_vps", "server_hunter", "uptime_robot", "cloud_native", "docker_boy",
    "zhuji_player", "404_not_found", "admin_root", "sudo_user"
];

export const REVIEWS = {
    positive: [
        "速度起飞！",
        "性价比无敌。",
        "秒开通，爱了。",
        "上海延迟很低。",
        "客服态度不错。",
        "稳如老狗。"
    ],
    neutral: [
        "价格对得起配置。",
        "中规中矩。",
        "晚高峰有点抖。",
        "等补货。",
        "面板有点丑但能用。"
    ],
    negative: [
        "垃圾商家！",
        "又炸了？",
        "RNM退钱！",
        "硬盘I/O慢得像软盘。",
        "24小时炸线。",
        "工单三天没回。",
        "超售狂魔。"
    ]
};
