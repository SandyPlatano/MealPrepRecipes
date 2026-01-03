# Rate Limiting Implementation

## Current Implementation

The app uses an improved in-memory rate limiting solution that works with serverless environments.

## Upgrading to Production (Recommended)

For production at scale, consider upgrading to **Upstash Redis** for distributed rate limiting:

### 1. Sign up for Upstash
- Go to https://upstash.com
- Create a free Redis database
- Copy your REST URL and token

### 2. Install dependencies
```bash
npm install @upstash/ratelimit @upstash/redis
```

### 3. Add environment variables
```
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 4. Replace `src/lib/rate-limit.ts`
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});
```

### Benefits of Upstash
- ✅ Works across all serverless instances
- ✅ Persistent rate limiting
- ✅ Free tier: 10,000 commands/day
- ✅ Built-in analytics
- ✅ Global edge caching

## Current Solution
The current in-memory solution works well for:
- Development
- Small to medium traffic
- Quick deployments

It may be less effective for:
- High traffic (each serverless instance has its own memory)
- Strict rate limiting requirements

