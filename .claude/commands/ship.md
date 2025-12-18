# Ship Command - Full Repo Commit, Push & Deploy

You must check the ENTIRE repository for changes, not just files discussed in this conversation.

## Step 1: Full Repository Scan
Run these commands to get a complete picture of ALL changes:
```bash
git status --porcelain
git diff --stat
git diff --cached --stat
```

Review EVERY file listed - both staged and unstaged, tracked and untracked.

## Step 2: Analyze All Changes
For each changed file:
- Read the file if you haven't seen it in this conversation
- Understand what changed (use `git diff <file>` for modified files)
- Ensure no secrets, credentials, or .env files are included

## Step 3: Stage Everything Relevant
```bash
git add -A
```
Or selectively add files if some should be excluded.

## Step 4: Create Descriptive Commit
- Summarize ALL changes across the entire repo
- Don't just describe what was discussed in chat - describe what's actually changed
- Use conventional commit format when appropriate
- End with the Claude Code signature

## Step 5: Push to Remote
```bash
git push
```
If the branch has no upstream, use `git push -u origin <branch>`.

## Step 6: Verify Deployment
- Check if Vercel auto-deploys from this branch
- If not, run `vercel --prod` to deploy manually
- Report the deployment URL when complete

## Important
- Do NOT skip files just because they weren't mentioned in the conversation
- Do NOT assume you know what changed - actually check git status
- Do NOT proceed if you find secrets or sensitive files staged
