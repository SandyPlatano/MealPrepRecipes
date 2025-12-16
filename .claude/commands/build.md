Kill all running dev servers and run a fresh production build.

Instructions:
1. Kill any processes running on common dev ports (3000, 3001, 5173)
   - Use `lsof -ti :PORT | xargs kill -9` for each port
   - It's okay if no processes are found
2. Navigate to the nextjs directory
3. Run `npm run build`
4. Report the build results:
   - If successful: summarize what was built
   - If failed: show the errors clearly so they can be fixed
