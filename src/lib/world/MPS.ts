// lib/worlds.ts

export const EXP_LEVEL_CONFIG = [
  // ── Tier 0 — Initiation (L1-2) ───────────────────────
  { level: 1,   xpRequired: 0 },
  { level: 2,   xpRequired: 10 },

  // ── Tier 1 — First Steps (L3-7) ──────────────────────
  { level: 3,   xpRequired: 25 },
  { level: 4,   xpRequired: 50 },
  { level: 5,   xpRequired: 80 },
  { level: 6,   xpRequired: 120 },
  { level: 7,   xpRequired: 170 },

  // ── Tier 2 — Apprentice (L8-14) ──────────────────────
  { level: 8,   xpRequired: 230 },
  { level: 9,   xpRequired: 300 },
  { level: 10,  xpRequired: 380 },
  { level: 11,  xpRequired: 480 },
  { level: 12,  xpRequired: 600 },
  { level: 13,  xpRequired: 740 },
  { level: 14,  xpRequired: 900 },

  // ── Tier 3 — Adept (L15-24) ──────────────────────────
  { level: 15,  xpRequired: 1100 },
  { level: 16,  xpRequired: 1350 },
  { level: 17,  xpRequired: 1650 },
  { level: 18,  xpRequired: 2000 },
  { level: 19,  xpRequired: 2400 },
  { level: 20,  xpRequired: 2850 },
  { level: 21,  xpRequired: 3400 },
  { level: 22,  xpRequired: 4000 },
  { level: 23,  xpRequired: 4700 },
  { level: 24,  xpRequired: 5450 },

  // ── Tier 4 — Veteran (L25-37) ────────────────────────
  { level: 25,  xpRequired: 6300 },
  { level: 26,  xpRequired: 7200 },
  { level: 27,  xpRequired: 8200 },
  { level: 28,  xpRequired: 9300 },
  { level: 29,  xpRequired: 10500 },
  { level: 30,  xpRequired: 11800 },
  { level: 31,  xpRequired: 13200 },
  { level: 32,  xpRequired: 14700 },
  { level: 33,  xpRequired: 16300 },
  { level: 34,  xpRequired: 18000 },
  { level: 35,  xpRequired: 19800 },
  { level: 36,  xpRequired: 21700 },
  { level: 37,  xpRequired: 23700 },

  // ── Tier 5 — Master (L38-51) ─────────────────────────
  { level: 38,  xpRequired: 25800 },
  { level: 39,  xpRequired: 28000 },
  { level: 40,  xpRequired: 30300 },
  { level: 41,  xpRequired: 32700 },
  { level: 42,  xpRequired: 35200 },
  { level: 43,  xpRequired: 37800 },
  { level: 44,  xpRequired: 40500 },
  { level: 45,  xpRequired: 43300 },
  { level: 46,  xpRequired: 46200 },
  { level: 47,  xpRequired: 49200 },
  { level: 48,  xpRequired: 52300 },
  { level: 49,  xpRequired: 55500 },
  { level: 50,  xpRequired: 58800 },
  { level: 51,  xpRequired: 62200 },

  // ── Tier 6 — Grandmaster (L52-64) ────────────────────
  { level: 52,  xpRequired: 65700 },
  { level: 53,  xpRequired: 69300 },
  { level: 54,  xpRequired: 73000 },
  { level: 55,  xpRequired: 76800 },
  { level: 56,  xpRequired: 80700 },
  { level: 57,  xpRequired: 84700 },
  { level: 58,  xpRequired: 88800 },
  { level: 59,  xpRequired: 93000 },
  { level: 60,  xpRequired: 97300 },
  { level: 61,  xpRequired: 101700 },
  { level: 62,  xpRequired: 106200 },
  { level: 63,  xpRequired: 110800 },
  { level: 64,  xpRequired: 115500 },

  // ── Tier 7 — Champion (L65-75) ───────────────────────
  { level: 65,  xpRequired: 120300 },
  { level: 66,  xpRequired: 125200 },
  { level: 67,  xpRequired: 130200 },
  { level: 68,  xpRequired: 135300 },
  { level: 69,  xpRequired: 140500 },
  { level: 70,  xpRequired: 145800 },
  { level: 71,  xpRequired: 151200 },
  { level: 72,  xpRequired: 156700 },
  { level: 73,  xpRequired: 162300 },
  { level: 74,  xpRequired: 168000 },
  { level: 75,  xpRequired: 173800 },

  // ── Tier 8 — Legend (L76-86) ─────────────────────────
  { level: 76,  xpRequired: 179700 },
  { level: 77,  xpRequired: 185700 },
  { level: 78,  xpRequired: 191800 },
  { level: 79,  xpRequired: 198000 },
  { level: 80,  xpRequired: 204300 },
  { level: 81,  xpRequired: 210700 },
  { level: 82,  xpRequired: 217200 },
  { level: 83,  xpRequired: 223800 },
  { level: 84,  xpRequired: 230500 },
  { level: 85,  xpRequired: 237300 },
  { level: 86,  xpRequired: 244200 },

  // ── Tier 9 — Mythic (L87-95) ─────────────────────────
  { level: 87,  xpRequired: 251200 },
  { level: 88,  xpRequired: 258300 },
  { level: 89,  xpRequired: 265500 },
  { level: 90,  xpRequired: 272800 },
  { level: 91,  xpRequired: 280200 },
  { level: 92,  xpRequired: 287700 },
  { level: 93,  xpRequired: 295300 },
  { level: 94,  xpRequired: 303000 },
  { level: 95,  xpRequired: 310800 },

  // ── Tier 10 — Ultimate (L96-100) ─────────────────────
  { level: 96,  xpRequired: 318700 },
  { level: 97,  xpRequired: 326700 },
  { level: 98,  xpRequired: 334800 },
  { level: 99,  xpRequired: 343000 },
  { level: 100, xpRequired: 351300 },
] as const;

/* =========================================================
   2. LEVEL → TIER → POWER RANGE
   Boundaries match EXP_LEVEL_CONFIG comment blocks.
   ========================================================= */
export const POWER_TIERS = [
  { tier: 0,  minLevel: 1,   maxLevel: 2,    minPower: 10,        maxPower: 150 },
  { tier: 1,  minLevel: 3,   maxLevel: 7,    minPower: 150,       maxPower: 500 },
  { tier: 2,  minLevel: 8,   maxLevel: 14,   minPower: 500,       maxPower: 2_000 },
  { tier: 3,  minLevel: 15,  maxLevel: 24,   minPower: 2_000,     maxPower: 8_000 },
  { tier: 4,  minLevel: 25,  maxLevel: 37,   minPower: 8_000,     maxPower: 25_000 },
  { tier: 5,  minLevel: 38,  maxLevel: 51,   minPower: 25_000,    maxPower: 80_000 },
  { tier: 6,  minLevel: 52,  maxLevel: 64,   minPower: 80_000,    maxPower: 250_000 },
  { tier: 7,  minLevel: 65,  maxLevel: 75,   minPower: 250_000,   maxPower: 800_000 },
  { tier: 8,  minLevel: 76,  maxLevel: 86,   minPower: 800_000,   maxPower: 2_500_000 },
  { tier: 9,  minLevel: 87,  maxLevel: 95,   minPower: 2_500_000, maxPower: 8_000_000 },
  { tier: 10, minLevel: 96,  maxLevel: 100,  minPower: 8_000_000, maxPower: Infinity },
] as const;

/* =========================================================
   3. WORLDS + PATHS
   ========================================================= */
// lib/worlds.ts (top of file)

// lib/world/MPS.ts
export const WORLD_CONFIG = {
  multiverse: {
    display: "Human Verse",
    tagline: "Pure human progression. No shortcuts.",
    color: "#C084FC",
    glow: "rgba(192,132,252,0.20)",
    border: "rgba(192,132,252,0.35)",
    icon: "✦",
    paths: [
      { id: "human", name: "Human Path", icon: "👤", tagline: "Master yourself. No powers." },
    ],
  },
  shinobi: {
    display: "Shinobi World",
    tagline: "Master chakra, stealth & ninjutsu.",
    color: "#03E4FF",
    glow: "rgba(3,228,255,0.22)",
    border: "rgba(3,228,255,0.35)",
    icon: "🥷",
    paths: [
      { id: "shinobi", name: "Shinobi Path", icon: "🌪️", tagline: "Rise from Academy Student to Kage." },
      { id: "ancient", name: "Ancient Clan Path", icon: "🌊", tagline: "Awaken your bloodline." },
    ],
  },
  hunter: {
    display: "Hunter World",
    tagline: "Awaken your Nen. Rise through the gates.",
    color: "#8A5CF5",
    glow: "rgba(138,92,245,0.25)",
    border: "rgba(138,92,245,0.42)",
    icon: "⚡",
    paths: [
      { id: "hunter", name: "Hunter Path", icon: "🗡️", tagline: "Climb from E-Rank to S-Rank." },
      { id: "monarch", name: "Monarch Path", icon: "👑", tagline: "Rise as a true Monarch." },
    ],
  },
  pirate: {
    display: "Grand Sea",
    tagline: "Sail the grand line. Forge a legend.",
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.20)",
    border: "rgba(56,189,248,0.32)",
    icon: "⚓",
    paths: [
      { id: "pirate", name: "Pirate Path", icon: "🏴‍☠️", tagline: "From Cabin Boy to Pirate King." },
      { id: "navy", name: "Navy Path", icon: "🎖️", tagline: "Recruit to Fleet Admiral." },
    ],
  },
  soul: {
    display: "Soul World",
    tagline: "Wield spiritual pressure.",
    color: "#F5A41E",
    glow: "rgba(245,164,30,0.20)",
    border: "rgba(245,164,30,0.35)",
    icon: "🌀",
    paths: [
      { id: "reaper", name: "Reaper Path", icon: "⚔️", tagline: "Soul Reaper. Master the blade." },
      { id: "lifebringer", name: "Lifebringer Path", icon: "✨", tagline: "Quincy heir. Bend light." },
    ],
  },
  demon: {
    display: "Demon World",
    tagline: "Breathe. Ascend. Consume or protect.",
    color: "#F87171",
    glow: "rgba(248,113,113,0.20)",
    border: "rgba(248,113,113,0.35)",
    icon: "🔥",
    paths: [
      { id: "demon", name: "Demon Path", icon: "😈", tagline: "From Lesser Demon to Demon King." },
      { id: "royal", name: "Royal Knight Path", icon: "🛡️", tagline: "Rise to Celestial King." },
    ],
  },
  game: {
    display: "Game World",
    tagline: "Compete. Dominate. Claim sovereign rank.",
    color: "#10B981",
    glow: "rgba(16,185,129,0.20)",
    border: "rgba(16,185,129,0.32)",
    icon: "🎮",
    paths: [
      { id: "ranked", name: "Ranked Ladder", icon: "🏆", tagline: "Bronze to Ultimate." },
    ],
  },
} as const;
export type WorldId = keyof typeof WORLD_CONFIG;
/* =========================================================
   4. WORLD + PATH + TIER → RANK NAME
   ========================================================= */
export const RANKS_CONFIG: Record<string, Record<string, string[]>> = {
  multiverse: {
    human: [
      "Average Human","Recruit","Apprentice","Trained","Veteran",
      "Master","Grandmaster","Champion","Legend","Mythical Being","Ultimate Being",
    ],
  },
  shinobi: {
    shinobi: [
      "Average Student","Academy Student","Genin","Chunin","Jonin",
      "Elite Jonin","Nightblade Captain","Sannin","Kage","Legendary Kage","Grand Sage",
    ],
    ancient: [
      "Average Clan Member","Clan Initiate","Clan Trainee","Clan Warrior","Bloodline Bearer",
      "Clan Elite","Clan Successor","Clan Head","Kekkei Master","Ancestral Sage","Clan Founder",
    ],
  },
  hunter: {
    hunter: [
      "Average Human","E-Rank Hunter","D-Rank Hunter","C-Rank Hunter","B-Rank Hunter",
      "A-Rank Hunter","S-Rank Hunter","National Level Hunter","Monarch Vessel","Ruler's Chosen","Shadow Emperor",
    ],
    monarch: [
      "Average Awakened","Awakened","Shadow Beast","Frost King","Plague King",
      "Iron King","Dragon Emperor","Ruler of Destruction","True Monarch","Monarch of Shadows","Absolute Being",
    ],
  },
  pirate: {
    pirate: [
      "Average Human","Cabin Boy","Rookie Pirate","Sea Veteran","Captain",
      "Rising Star","Warlord of the Sea","Fleet Captain","Yonko Commander","Yonko","Pirate King",
    ],
    navy: [
      "Average Human","Recruit","Seaman","Officer","Lieutenant",
      "Commander","Captain","Vice Admiral","Admiral","Grand Admiral","Fleet Admiral",
    ],
  },
  soul: {
    reaper: [
      "Average Soul","Academy Student","Unseated Officer","Lower Division Commander","Middle Division Commander",
      "Elite Division Commander","Lieutenant","Captain","Member of Special Squad","Special Squad Leader","Soul Emperor",
    ],
    lifebringer: [
      "Average Soul","Awakened","Light Trainee","Sacred Archer","Divine Warrior",
      "Divine Knight","Royal Guard","Grandmaster","Light Champion","Radiant King","Lord of Light",
    ],
  },
  demon: {
    demon: [
      "Average Demon","Lesser Demon","Demon Initiate","Demon Recruit","Demon Captain",
      "Demon Lord","Greater Demon","Elite Demon","Supreme Demon","Demon King's Vessel","Demon King",
    ],
    royal: [
      "Average Squire","Squire","Knight Trainee","Knight Warrior","Knight of the Crown",
      "Knight Commander","Paladin","Grand Master","Holy Champion","Lord of Knights","Celestial King",
    ],
  },
  game: {
    ranked: [
      "Unranked","Bronze","Silver","Gold","Platinum",
      "Diamond","Master","Grandmaster","Elite","Legend","Ultimate",
    ],
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (const entry of EXP_LEVEL_CONFIG) {
    if (xp >= entry.xpRequired) level = entry.level;
    else break;
  }
  return level;
}

export function getXpForLevel(level: number): number {
  const entry = EXP_LEVEL_CONFIG.find((e) => e.level === level);
  return entry?.xpRequired ?? 0;
}

export function getTierFromLevel(level: number): number {
  for (const t of POWER_TIERS) {
    if (level >= t.minLevel && level <= t.maxLevel) return t.tier;
  }
  return 0;
}

export function getTierConfig(tier: number) {
  return POWER_TIERS.find((t) => t.tier === tier) ?? POWER_TIERS[0];
}

export function getRankName(world: string, path: string, tier: number): string {
  return RANKS_CONFIG[world]?.[path]?.[tier] ?? "Unknown";
}

export function getUserRankState(xp: number, power: number, world: string, path: string) {
  const level = getLevelFromXp(xp);
  const tier = getTierFromLevel(level);
  const config = getTierConfig(tier);
  const rankName = getRankName(world, path, tier);

  const clampedPower = Math.max(config.minPower, Math.min(power, config.maxPower));

  const range =
    config.maxPower === Infinity
      ? config.minPower * 4 - config.minPower
      : config.maxPower - config.minPower;
  const tierProgress = Math.max(0, Math.min(1, (clampedPower - config.minPower) / range));

  return {
    xp,
    level,
    tier,
    rankName,
    power: clampedPower,
    minPower: config.minPower,
    maxPower: config.maxPower,
    tierProgress,
    xpForThisLevel: getXpForLevel(level),
    xpForNextLevel: getXpForLevel(level + 1),
  };
}

export function getAllWorlds() {
    return Object.entries(WORLD_CONFIG).map(([id, w]) => ({ id, ...w }));
}

export function getWorld(worldId: string) {
    return WORLD_CONFIG[worldId as keyof typeof WORLD_CONFIG] ?? null;
}

export function getWorldPaths(worldId: string) {
    const w = WORLD_CONFIG[worldId as keyof typeof WORLD_CONFIG];
    return w?.paths ?? [];
}
