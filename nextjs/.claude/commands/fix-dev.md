---
description: Kill port 3001 and restart the Next.js dev server
---

Fix the localhost:3001 dev server by:

1. Kill any existing process on port 3001:
   ```bash
   lsof -ti :3001 | xargs kill -9 2>/dev/null || true
   ```

2. Start the dev server in the background:
   ```bash
   npm run dev
   ```

3. Wait a few seconds and verify the server started by checking output.

4. Tell me localhost:3001 is ready.
