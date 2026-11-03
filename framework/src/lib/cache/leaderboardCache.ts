import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_L_URL,
  token: process.env.UPSTASH_REDIS_L_SECRET
})

interface L_CACHE_FORMAT { 
  userId: string;
  userXp: number;
  userPower: number;
  name: string;
  username: string;
}

async function getLeaderBoardCache(): Promise<L_CACHE_FORMAT[]> {  
  // 1. Get the top 100 user IDs from the sorted set (indexed 0 to 99)
  const topIds = await redis.zrange("users:by_xp", 0, 99, { rev: true });
  
  // If the leaderboard is empty, return early to avoid an empty mget call
  if (topIds.length === 0) return [];

  // 2. Map the IDs to their corresponding profile string keys
  const profileKeys = topIds.map(id => `user:${id}`);
  
  // 3. Batch fetch all 100 profiles in a single network request
  const profiles = await redis.mget<L_CACHE_FORMAT[]>(...profileKeys);
  
  // 4. Filter out any null entries to ensure type safety against missing profiles
  return profiles.filter((profile): profile is L_CACHE_FORMAT => profile !== null);
}
