# Copy Guide: Babe, What's for Dinner?

**Brand Voice:** Playful, self-aware, modern couple energy. We're here because *someone* kept forgetting whose turn it was to cook. Now you've got receipts.

**Tone Keywords:** Cheeky, supportive, redeemed, organized chaos, "told you so" energy

---

## 1. Application Header & Branding

**Location:** `src/App.jsx` (lines 90-91)

| Element | New Copy |
|---------|----------|
| **Main Title** | "Babe, What's for Dinner?" |
| **Tagline/Subtitle** | "Finally, an answer." |
| **Alt Taglines** | "No more 'I forgot' moments." / "Your redemption arc starts here." / "Proof you planned something." |
| **Footer Brand Name** | "Babe, What's for Dinner?" |
| **Footer Version** | "v1.0.0" |
| **Footer Tech Stack** | "Made with love (and mild guilt)" |

**HTML Title:** `index.html` (line 10)
| Element | New Copy |
|---------|----------|
| **Page Title** | "Babe, What's for Dinner? | Meal Planning for Couples" |

---

## 2. Navigation Tabs

**Location:** `src/App.jsx` (lines 118-137)

| Tab | New Copy | Icon |
|-----|----------|------|
| **Search Tab** | "Find Food" | SearchIcon |
| **Add Recipe Tab** | "Add Recipe" | Plus icon |
| **My Recipes Tab** | "The Vault" | BookOpen icon |
| **Stats Tab** | "Receipts" | BarChart3 icon |
| **Settings Tab** | "Settings" | SettingsIcon |

---

## 3. Search Page (`Search.jsx`)

**Card Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "What Are We Making?" |
| **Description** | "Search your recipes. Yes, you have recipes now." |

**Input Placeholders:**
| Element | New Copy |
|---------|----------|
| **Search Input** | "Search for that thing you loved last time..." |
| **Type Select** | "Type" / "All Types" |
| **Category Select** | "Protein" / "All Proteins" |

**Empty States:**
| Condition | New Copy |
|-----------|----------|
| **With Filters Active** | "Nothing matches. Try being less picky?" |
| **No Recipes** | "No recipes yet. Time to actually save one instead of bookmarking it and forgetting." |

**Recipe Type Options:**
- "Dinner", "Baking", "Breakfast", "Dessert", "Snack", "Side Dish"

---

## 4. Add Recipe Page (`AddRecipe.jsx`)

**Card Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "Save a Recipe" |
| **Description** | "Before you forget where you found it" |

**Tabs:**
| Tab | New Copy |
|-----|----------|
| **Tab 1** | "Paste It" |
| **Tab 2** | "Grab from URL" |

**Form Fields:**
| Element | New Copy |
|---------|----------|
| **Recipe Text Label** | "Recipe Text" |
| **Recipe Text Placeholder** | "Paste the recipe here before you close that tab and lose it forever.\n\nExample:\nGrilled Lemon Chicken\nIngredients: 2 lbs chicken breast, 2 tbsp honey, 1 lemon...\nInstructions: Marinate chicken, grill for 10 minutes..." |
| **URL Label** | "Recipe URL" |
| **URL Placeholder** | "https://that-recipe-you-found.com" |
| **URL Help Text** | "Works with most recipe sites. If it fails, just copy-paste the recipe text instead." |

**Buttons:**
| Element | New Copy |
|---------|----------|
| **Parse Button** | "Parse It" |
| **Parse Loading** | "Working..." |
| **Fetch Button** | "Grab Recipe" |
| **Fetch Loading** | "Fetching..." |

**Review Section:**
| Element | New Copy |
|---------|----------|
| **Title** | "Review Before Saving" |
| **Description** | "Make sure it looks right. You know how the internet is." |

**Form Labels:**
| Field | New Copy |
|-------|----------|
| Recipe Title | "Recipe Name" |
| Recipe Type | "Type" (placeholder: "Dinner, Breakfast, etc.") |
| Category | "Protein" (placeholder: "Chicken, Beef, Tofu, etc.") |
| Servings | "Servings" |
| Prep Time | "Prep Time" |
| Cook Time | "Cook Time" |
| Ingredients | "Ingredients (one per line)" |
| Instructions | "Instructions (one per line)" |
| Tags | "Tags (comma-separated)" |

**Action Buttons:**
| Element | New Copy |
|---------|----------|
| **Save** | "Save Recipe" |
| **Cancel** | "Nevermind" |

**Toast Messages:**
| Condition | New Copy |
|-----------|----------|
| No text entered | "You gotta paste something first" |
| No API key | "Set up your Anthropic API key in Settings first" |
| Parse success | "Got it! Review and save when ready." |
| Parse fail | "Couldn't parse that: [error]" |
| No URL | "Need a URL to fetch" |
| Fetch success | "Grabbed it! Take a look and save." |
| Fetch fail | "Couldn't fetch that: [error]" |
| No recipe parsed | "Parse a recipe first" |
| Save success | "\"[title]\" saved! Look at you go." |

---

## 5. My Recipes Page (`MyRecipes.jsx`)

**Card Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "The Vault" |
| **Description** | "Your favorites and everything you've actually made" |

**Tabs:**
| Tab | New Copy |
|-----|----------|
| Tab 1 | "Favorites" |
| Tab 2 | "Recent Wins" |
| Tab 3 | "Full History" |

**Empty States:**
| Tab | New Copy |
|-----|----------|
| **Favorites** | "No favorites yet. Heart the ones you love so you can find them when babe asks." |
| **Recent Wins** | "Nothing cooked yet. Mark recipes as done to build your track record." |
| **Full History** | "No cooking history. Yet. Your redemption arc awaits." |

**Card Content:**
| Element | New Copy |
|---------|----------|
| **Date Format** | "Made on [MMM d, yyyy]" |
| **Rating Display** | "[rating]/5 ⭐" |
| **Make Again Button** | "Make It Again" |

**Toast Messages:**
| Condition | New Copy |
|-----------|----------|
| Added to plan | "Added to this week's plan!" |
| Already in plan | "Already on the menu" |

---

## 6. Stats Page (`Stats.jsx`)

**Card Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "The Receipts" |
| **Description** | "Proof you've been pulling your weight" |

**Stat Cards:**
| Stat | Title | Subtitle/Empty State |
|------|-------|---------------------|
| **Total Cooked** | "Meals Crushed" | "[count] this month" |
| **Most-Made** | "Go-To Recipe" | "Made [count] time(s)" / "No data yet" |
| **Average Rating** | "Average Rating" | "[rating]/5 ⭐" / "No ratings yet" |
| **Fave Category** | "Favorite Protein" | "[category]" / "TBD" |
| **By Type** | "What You've Been Making" | Chart or "No history yet" |

---

## 7. Settings Page (`Settings.jsx`)

**Card Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "Settings" |
| **Description** | "Set it up once, stop hearing 'you never plan anything'" |

### Appearance
| Element | New Copy |
|---------|----------|
| **Section Label** | "Appearance" |
| **Dark Mode Label** | "Dark Mode" |

### Cook Names
| Element | New Copy |
|---------|----------|
| **Section Label** | "Who's Cooking?" |
| **Input Placeholder** | "Name" |
| **Add Button** | "+ Add Another Cook" |
| **Help Text** | "Add everyone who cooks so you can assign meals fairly. No more 'I cooked last time' arguments." |

### Email Address
| Element | New Copy |
|---------|----------|
| **Section Label** | "Email Setup" |
| **Primary Email Label** | "Your Email" |
| **Primary Email Placeholder** | "you@email.com" |
| **Primary Email Help** | "Where we'll send shopping lists and calendar invites." |
| **Additional Recipients Label** | "Also Send To" |
| **Additional Recipients Placeholder** | "babe@email.com" |
| **Add Recipient Button** | "+ Add Another" |
| **Additional Recipients Help** | "Add your partner, roommate, or anyone else who needs the list." |

### Anthropic API Key
| Element | New Copy |
|---------|----------|
| **Section Label** | "Recipe Parsing (AI)" |
| **Placeholder** | "sk-ant-api03-..." |
| **Help Text** | "Powers the magic that turns messy recipe pages into clean data. Get yours at console.anthropic.com" |

### EmailJS Credentials
| Element | New Copy |
|---------|----------|
| **Section Label** | "Email Sending" |
| **Service ID Label** | "Service ID" |
| **Template ID Label** | "Template ID" |
| **Public Key Label** | "Public Key" |
| **Help Text** | "For sending shopping lists. Get these from emailjs.com" |

### Google Calendar
| Element | New Copy |
|---------|----------|
| **Section Label** | "Google Calendar" |
| **Client ID Label** | "Client ID" |
| **Client Secret Label** | "Client Secret" |
| **Connected Account Label** | "Connected Account" |
| **Help Text** | "Connect to add meals to your calendar automatically. Set up OAuth in Google Cloud Console." |

### Supabase Configuration
| Element | New Copy |
|---------|----------|
| **Section Label** | "Cloud Sync" |
| **Description** | "Sync recipes between devices so you and babe are always on the same page." |
| **Project URL Label** | "Supabase URL" |
| **Anon Key Label** | "Anon Key" |
| **Help Text** | "Get these from your Supabase Dashboard → Project Settings → API" |
| **Migrate Button** | "Migrate My Data" |
| **Migrate Help** | "One-time sync: uploads all your local recipes, favorites, and history to the cloud." |

### Backup & Restore
| Element | New Copy |
|---------|----------|
| **Section Label** | "Backup & Restore" |
| **Description** | "Export your settings to keep them safe. You know, just in case." |
| **Export Button** | "Export Settings" |
| **Import Button** | "Import Settings" |
| **Help Text** | "Creates a JSON file with all your config. Keep it somewhere safe!" |

**Action Button:**
| Element | New Copy |
|---------|----------|
| **Save Button** | "Save Settings" |

**Toast Messages:**
| Condition | New Copy |
|-----------|----------|
| Save success | "Settings saved!" |
| Save warning | "Saved, but something looks off. Check your browser storage." |
| Save fail | "Couldn't save. Check the console." |
| Export success | "Settings exported!" |
| Export fail | "Export failed" |
| Import success | "Settings imported!" |
| Import fail | "Couldn't import. Is that the right file?" |
| No Supabase config | "Set up Supabase URL and Key first" |
| Migration start | "Migrating your data..." |
| Migration success | "All synced up!" |
| Migration fail | "Migration failed. Check the console." |

---

## 8. Cart/Meal Plan (`Cart.jsx`)

**Sheet Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "This Week's Plan" |
| **Description** | "Assign meals, generate the shopping list, and finally have an answer when babe asks." |

**Templates Section:**
| Element | New Copy |
|---------|----------|
| **Title** | "Saved Plans" |
| **Description** | "Reuse a plan from before" |

**Week Selector:**
| Element | New Copy |
|---------|----------|
| **Title** | "Week" |

**Meal Assignment:**
| Element | New Copy |
|---------|----------|
| **Title** | "Who's Making What" |
| **Description** | "Assign each meal to a cook and day. No ambiguity. No excuses." |
| **View Buttons** | "List" / "Calendar" |

**Shopping List:**
| Element | New Copy |
|---------|----------|
| **Title** | "Shopping List" |
| **Description** | "[count] items, sorted by aisle so you're not wandering around like a lost puppy" |

**Save Template Dialog:**
| Element | New Copy |
|---------|----------|
| **Title** | "Save This Plan" |
| **Description** | "Name it something you'll remember" |
| **Input Label** | "Plan Name" |
| **Input Placeholder** | "e.g., Lazy Week, Healthy-ish, The Classics" |
| **Buttons** | "Save" / "Cancel" |

**Action Buttons:**
| Element | New Copy |
|---------|----------|
| **Save Template** | "Save as Template" |
| **Send Email** | "Send the Plan" |
| **Send Loading** | "Sending..." |
| **Clear Cart** | "Start Over" |

**Toast Messages:**
| Condition | New Copy |
|-----------|----------|
| Missing assignments | "Assign everyone first. No free rides." |
| No email | "Add your email in Settings first" |
| No EmailJS | "Set up EmailJS in Settings to send emails" |
| Email success | "Sent to [count] people!" |
| Email partial | "Sent to [count], but [count] failed. Check console." |
| Email all fail | "Couldn't send to anyone. Check console." |
| Email error | "Failed: [error]" |
| Calendar success | "Added [count] events to calendar!" |
| Calendar partial | "[count] events failed. Check console." |
| Calendar fail | "Calendar events failed: [error]" |
| Calendar expired | "Google Calendar disconnected. Reconnect in Settings." |
| Calendar denied | "Calendar permission denied. Check your OAuth setup." |
| No calendar | "Email sent! Connect Google Calendar in Settings to also add to your calendar." |
| Full success | "Boom. Plan sent!" |
| Full fail | "Something went wrong: [error]" |
| No template name | "Give it a name" |
| No days assigned | "Assign meals to days first" |
| Template saved | "\"[name]\" saved!" |
| Template loaded | "\"[name]\" loaded!" |
| Template deleted | "Template deleted" |
| Cart cleared | "Starting fresh" |

---

## 9. Recipe Card (`RecipeCard.jsx`)

**Card Content:**
| Element | New Copy |
|---------|----------|
| **Key Ingredients Label** | "Key Ingredients:" |
| **Add to Plan Button** | "Add to Plan" |
| **Remove from Plan Button** | "Remove" |

**Delete Dialog:**
| Element | New Copy |
|---------|----------|
| **Title** | "Delete This Recipe?" |
| **Description** | "You're about to delete \"[recipe title]\" forever. Gone from your collection, favorites, and any meal plans. No take-backs." |
| **Buttons** | "Keep It" / "Delete" |

**Toast Messages:**
| Condition | New Copy |
|-----------|----------|
| Added to plan | "Added to the plan" |
| Already in plan | "Already on there" |
| Removed from plan | "Removed" |
| Favorite toggled | "Removed from favorites" / "Added to favorites ❤️" |
| Export MD | "Exported as Markdown" |
| Export PDF | "Opening PDF..." |
| Deleted | "Recipe deleted" |

**Badge Text:**
| Element | New Copy |
|---------|----------|
| **Recency Badge** | "Made [time ago]" |

---

## 10. Recipe Detail Dialog (`RecipeDetailDialog.jsx`)

**Dialog Content:**
| Element | New Copy |
|---------|----------|
| **Scale Label** | "Servings:" |
| **Scale Buttons** | "½x", "1x", "1½x", "2x", "3x" |
| **Servings Display** | "([count] servings)" |

**Section Headers:**
| Section | New Copy |
|---------|----------|
| Ingredients | "Ingredients" |
| Instructions | "Instructions" |
| Rating | "How Was It?" |
| Notes | "Notes" |

**Form Fields:**
| Element | New Copy |
|---------|----------|
| **Notes Label** | "Notes" |
| **Notes Placeholder** | "Add notes for next time (e.g., 'Babe loved this', 'Needs more garlic', 'Never again')" |

**Action Buttons:**
| Element | New Copy |
|---------|----------|
| **Mark Cooked** | "I Made This" |
| **Help Text** | "Mark it done to rate and add notes" |
| **Add to Plan** | "Add to Plan" |
| **Remove from Plan** | "Remove from Plan" |

**Toast Messages:**
| Condition | New Copy |
|-----------|----------|
| Marked cooked | "Nice! Now rate it." |
| Rated | "Rated [rating] stars!" |
| Added to plan | "Added!" |
| Already in plan | "Already there" |
| Removed | "Removed" |

---

## 11. Loading States

| Component | New Copy |
|-----------|----------|
| **General Spinner** | (no text, just spinner) |
| **Parse Loading** | "Parsing..." |
| **Fetch Loading** | "Grabbing..." |
| **Send Loading** | "Sending..." |
| **Migration Loading** | "Syncing..." |

---

## 12. Empty States & Placeholders

| Location | New Copy |
|----------|----------|
| **Search (with filters)** | "Nothing matches. Try different filters?" |
| **Search (no recipes)** | "No recipes yet. Save one before you forget where you found it." |
| **Favorites (empty)** | "No favorites yet. Heart the good ones." |
| **History (empty)** | "No cooking history yet. Your journey begins now." |
| **Stats (no data)** | "No data yet. Start cooking!" |

---

## 13. Error Messages

**General Errors:**
| Condition | New Copy |
|-----------|----------|
| Parse fail | "Couldn't parse that: [error]" |
| Fetch fail | "Couldn't grab that: [error]" |
| Settings fail | "Couldn't save: [error]" |
| Export fail | "Export failed" |
| Import fail | "Invalid file. Try again?" |
| Migration fail | "Sync failed. Check console." |
| Email fail | "Email failed: [error]" |
| Send fail | "Couldn't send: [error]" |

**Validation Errors:**
| Condition | New Copy |
|-----------|----------|
| No recipe text | "Paste something first" |
| No API key | "Need your Anthropic API key (Settings)" |
| No URL | "Need a URL" |
| No parsed recipe | "Parse a recipe first" |
| No assignments | "Assign cooks and days to everything first" |
| No email | "Add your email in Settings" |
| No EmailJS | "Set up EmailJS in Settings" |
| No template name | "Give it a name" |
| No days assigned | "Assign days first" |
| No Supabase | "Set up Supabase first" |

---

## 14. Success Messages

| Action | New Copy |
|--------|----------|
| Recipe parsed | "Got it! Review and save." |
| Recipe fetched | "Grabbed it! Take a look." |
| Recipe saved | "\"[title]\" saved!" |
| Settings saved | "Settings saved!" |
| Settings exported | "Exported!" |
| Settings imported | "Imported!" |
| Data migrated | "All synced!" |
| Email sent | "Sent to [count] people!" |
| Calendar added | "[count] events added!" |
| Plan sent | "Plan sent! 🎉" |
| Template saved | "\"[name]\" saved!" |
| Template loaded | "\"[name]\" loaded!" |
| Template deleted | "Deleted" |
| Cart cleared | "Cleared" |
| Added to plan | "Added!" |
| Removed from plan | "Removed" |
| Favorite added | "Favorited ❤️" |
| Favorite removed | "Unfavorited" |
| Exported MD | "Exported!" |
| Recipe deleted | "Deleted" |
| Marked cooked | "Marked as done! Rate it?" |
| Rated | "[rating] stars!" |

---

## 15. Informational Messages

| Condition | New Copy |
|-----------|----------|
| Already in plan | "Already on the plan" |
| Calendar not connected | "Email sent! Connect Google Calendar to also add events." |
| Partial email | "Sent to some, but [count] failed." |
| Partial calendar | "Some events failed." |
| Settings save warning | "Saved, but verification failed. Check browser storage." |

---

## 16. Shopping List Page (`public/shopping-list.html`)

**Meta Tags:**
| Element | New Copy |
|---------|----------|
| **Description** | "Shopping List | Babe, What's for Dinner?" |
| **Page Title** | "Shopping List | Babe, What's for Dinner?" |

**Header:**
| Element | New Copy |
|---------|----------|
| **Title** | "🛒 The List" |
| **Subtitle** | "Loading..." → "[Week Range]" |

**Progress Indicator:**
| Element | New Copy |
|---------|----------|
| **Progress Text** | "[count] of [total] grabbed" |

**Loading States:**
| Condition | New Copy |
|-----------|----------|
| **Loading** | "Loading your list..." |
| **No Items** | "Nothing on the list yet" |

**Buttons:**
| Element | New Copy |
|---------|----------|
| **Add Item** | "+ Add" |
| **Share** | "Share" |

**Add Item Dialog:**
| Element | New Copy |
|---------|----------|
| **Title** | "Add Item" |
| **Input Placeholder** | "e.g., Milk (1 gallon)" |
| **Category Select** | "Aisle..." |
| **Buttons** | "Cancel" / "Add" |

**Offline Indicator:**
| Element | New Copy |
|---------|----------|
| **Message** | "📴 Offline – changes saved locally" |

**Share Dialog:**
| Element | New Copy |
|---------|----------|
| **Share Title** | "Shopping List – [week]" |
| **Share Text** | "Here's what we need!" |

**Error Messages:**
| Condition | New Copy |
|-----------|----------|
| **No ID** | "No list found" / "Use a valid link from your email." |
| **Not Found** | "List not found" / "It may have expired or been deleted." |
| **Load Error** | "Couldn't load list" / "[error]" |

**Success Messages:**
| Action | New Copy |
|--------|----------|
| **Link Copied** | "Link copied!" |

**Footer:**
| Element | New Copy |
|---------|----------|
| **Brand** | "Babe, What's for Dinner?" |
| **Version** | "v1.0.0" |

---

## 17. Chrome Extension (`chrome-extension/`)

**Popup HTML (`popup.html`):**
| Element | New Copy |
|---------|----------|
| **Page Title** | "Babe, What's for Dinner?" |
| **Header Title** | "Save Recipe" |
| **Loading Message** | "Grabbing recipe..." |
| **Initial State** | "Found a recipe? Grab it before you forget." |
| **Capture Button** | "Capture Recipe" |
| **Error Retry** | "Try Again" |

**Form Labels:**
| Field | New Copy |
|-------|----------|
| Recipe Title | "Name" |
| Type | "Type" (placeholder: "Dinner") |
| Category | "Protein" (placeholder: "Chicken") |
| Prep Time | "Prep" (placeholder: "15 min") |
| Cook Time | "Cook" (placeholder: "30 min") |
| Servings | "Serves" (placeholder: "4") |
| Ingredients | "Ingredients" (placeholder: "2 lbs chicken\n1 cup flour") |
| Instructions | "Instructions" (placeholder: "1. Preheat oven\n2. Mix stuff") |
| Tags | "Tags" (placeholder: "quick, healthy, meal-prep") |

**Form Buttons:**
| Element | New Copy |
|---------|----------|
| **Add** | "Save Recipe" |
| **Cancel** | "Cancel" |

**Success State:**
| Element | New Copy |
|---------|----------|
| **Success Icon** | "✓" |
| **Success Message** | "\"[title]\" saved!" |
| **Open App Button** | "Open App" |
| **New Recipe Button** | "Save Another" |

**Footer:**
| Element | New Copy |
|---------|----------|
| **Settings Link** | "Settings" |

**Error Messages:**
| Condition | New Copy |
|-----------|----------|
| Capture fail | "Couldn't capture. Try again?" |
| Save fail | "Couldn't save. Try again?" |
| No title | "Give it a name first" |

**Options Page:**
| Element | New Copy |
|---------|----------|
| **Connection fail** | "Couldn't connect: [error]. Is your app URL right?" |
| **Test Button** | "Test Connection" / "Testing..." |

---

## 18. Marketing Copy & Microcopy Ideas

**Tagline Options:**
- "Finally, an answer."
- "No more 'I forgot' moments."
- "Your redemption arc starts here."
- "Proof you planned something."
- "Because 'I dunno, what do YOU want?' isn't a meal plan."

**Onboarding Headlines:**
- "Let's get you set up so you never hear 'you never plan anything' again."
- "Welcome. Let's make sure babe never has to ask twice."
- "Time to prove you can adult."

**Feature Descriptions:**
| Feature | Cheeky Description |
|---------|-------------------|
| **Recipe Import** | "Save recipes before you lose that tab forever" |
| **Meal Assignment** | "Assign cooks. No more 'I thought YOU were making dinner'" |
| **Shopping List** | "Sorted by aisle so you don't wander around lost" |
| **Calendar Sync** | "It's literally on the calendar. No excuses." |
| **Cooking History** | "Receipts. For when you need to prove you cooked last week." |
| **Favorites** | "Heart the good ones so you remember them" |

**Button Hover/Tooltips:**
| Button | Tooltip |
|--------|---------|
| Add to Plan | "Add this to the week" |
| Mark as Cooked | "I actually made this" |
| Send Plan | "Email the plan to everyone" |
| Clear Cart | "Start over (are you sure?)" |

---

## 19. 404 / Error Page Ideas

**404 Page:**
- **Headline:** "This page is as empty as the fridge on Thursday."
- **Subtext:** "Let's get you back to planning."
- **Button:** "Back to Recipes"

**General Error:**
- **Headline:** "Something broke."
- **Subtext:** "Don't worry, dinner's not ruined. Try again?"
- **Button:** "Refresh"

---

## Summary

**Brand Voice Checklist:**
- [x] Playful and self-aware
- [x] Modern couple energy ("babe" not "honey")
- [x] Light teasing about forgetting/not planning
- [x] Redemption arc framing (you're fixing past mistakes)
- [x] Short, punchy copy
- [x] Avoids corporate/generic language
- [x] Supportive but cheeky

**Consistency Notes:**
- Always "babe" not "honey" or "dear"
- "Plan" not "cart" or "meal plan" (shorter)
- "Grab" for fetching/importing (casual)
- Use contractions (you're, can't, don't)
- OK to use light emoji in success messages (🎉 ❤️)
- Keep error messages helpful, not just funny

---

*"Babe, What's for Dinner?" — Because you finally have an answer.*
