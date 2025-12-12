# Advanced Nutrition Tracking & Macro Planning Guide

## Overview

The Advanced Nutrition Tracking & Macro Planning feature helps you monitor your nutritional intake, set macro goals, and track your progress over time. This guide covers all aspects of the nutrition tracking system.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Enabling Nutrition Tracking](#enabling-nutrition-tracking)
3. [Setting Macro Goals](#setting-macro-goals)
4. [Viewing Nutrition Data](#viewing-nutrition-data)
5. [AI-Powered Nutrition Extraction](#ai-powered-nutrition-extraction)
6. [Manual Nutrition Entry](#manual-nutrition-entry)
7. [Nutrition History & Trends](#nutrition-history--trends)
8. [Batch Processing Existing Recipes](#batch-processing-existing-recipes)
9. [Understanding Nutrition Data](#understanding-nutrition-data)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- Active account with nutrition tracking enabled
- At least one recipe in your vault
- Recipes with ingredient lists for AI extraction

### Quick Start
1. Go to **Settings** → Enable "Track Nutrition"
2. Set your macro goals (optional but recommended)
3. Create or import recipes - nutrition is auto-extracted
4. View nutrition data on recipe detail pages and meal plans
5. Track your progress on the Nutrition History page

---

## Enabling Nutrition Tracking

### How to Enable

1. Navigate to **Settings** from the main menu
2. Scroll to the **Nutrition Tracking** section
3. Toggle "Track Nutrition" to **ON**
4. Click **Save Settings**

### What Happens When Enabled

- ✅ New recipes automatically get nutrition data extracted
- ✅ Nutrition facts appear on recipe detail pages
- ✅ Meal plan shows daily macro totals
- ✅ Weekly nutrition dashboard becomes available
- ✅ Nutrition history tracking begins

---

## Setting Macro Goals

### Why Set Goals?

Macro goals help you:
- Track protein, carbs, and fat intake
- Monitor calorie consumption
- See progress toward daily targets
- Get visual feedback on your nutrition

### How to Set Goals

1. Go to **Settings** → **Nutrition Tracking**
2. Find the "Daily Macro Goals" section
3. Enter your target values:
   - **Calories** (kcal/day)
   - **Protein** (grams/day)
   - **Carbohydrates** (grams/day)
   - **Fat** (grams/day)
4. Click **Save Settings**

### Recommended Goals

| Goal Type | General Health | Weight Loss | Muscle Gain |
|-----------|---------------|-------------|-------------|
| Calories  | 2000-2500     | 1500-1800   | 2500-3000   |
| Protein   | 50-80g        | 100-150g    | 150-200g    |
| Carbs     | 225-325g      | 100-150g    | 300-400g    |
| Fat       | 44-78g        | 40-60g      | 70-100g     |

*Note: These are general guidelines. Consult a nutritionist for personalized recommendations.*

---

## Viewing Nutrition Data

### Recipe Detail Page

**Location:** Click any recipe → Nutrition Facts section

**What You'll See:**
- FDA-style nutrition label
- Per-serving breakdown
- Macronutrient percentages
- Confidence score (AI-extracted data)
- Data source indicator

**Actions Available:**
- ✏️ Edit nutrition values manually
- 🔄 Re-extract with AI
- 📊 View detailed breakdown

### Meal Plan Page

**Location:** Plan → Weekly Meal Planner

**What You'll See:**
- Nutrition badges on each meal (calories, protein)
- Daily total at bottom of each day
- Weekly summary card with:
  - Total calories for the week
  - Average daily macros
  - Progress toward goals (with colored rings)
  - Macro distribution chart

### Nutrition History Page

**Location:** Nutrition → History

**What You'll See:**
- Current week dashboard
- Weekly averages over time
- Trend graphs
- Goal achievement tracking
- Historical data (last 12 weeks)

---

## AI-Powered Nutrition Extraction

### Automatic Extraction

**When It Happens:**
- ✨ Creating a new recipe (paste, URL, or manual)
- ✨ Editing a recipe's ingredients
- ✨ Importing recipes from external sources

**How It Works:**
1. AI analyzes your ingredient list
2. Extracts nutritional values per ingredient
3. Calculates totals based on servings
4. Saves to database automatically
5. Shows results within seconds

**What Gets Extracted:**
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber (when available)
- Sodium (when available)
- Sugar (when available)

### Manual Extraction

**When to Use:**
- Recipe doesn't have auto-extracted data
- Want to refresh old extraction
- Ingredients were significantly changed

**How to Extract:**

1. **On Recipe Detail Page:**
   - If no nutrition data exists, you'll see "No Nutrition Data" card
   - Click **"Extract Nutrition with AI"** button
   - Wait for processing (usually 3-10 seconds)
   - Nutrition facts card appears with extracted data

2. **In Nutrition Facts Card:**
   - Click the **"Re-extract"** button (circular arrow icon)
   - Confirm the action
   - Updated nutrition replaces old data

---

## Manual Nutrition Entry

### When to Use Manual Entry

- AI extraction isn't accurate
- You have official nutrition data
- Recipe has special preparation methods
- Need to override calculated values

### How to Edit Nutrition

1. Navigate to recipe detail page
2. Find the Nutrition Facts card
3. Click the **Edit** button (pencil icon)
4. Update values:
   - Serving size
   - Calories
   - Macronutrients (protein, carbs, fat)
   - Micronutrients (fiber, sodium, sugar)
5. Set data source (e.g., "Official Label", "Manual Entry")
6. Click **Save**

### Tips for Manual Entry

- ✅ Use official nutrition labels when available
- ✅ Round to whole numbers for consistency
- ✅ Double-check serving sizes match recipe
- ✅ Note the data source for future reference
- ⚠️ Be aware this overrides AI extraction

---

## Nutrition History & Trends

### Accessing History

**Navigation:** Nutrition → History

### Dashboard Features

**Current Week Overview:**
- Weekly calorie total
- Daily macro averages
- Goal achievement percentage
- Macro distribution pie chart

**Trend Analysis:**
- Week-by-week comparison
- Average intake trends
- Goal consistency tracking
- Pattern identification

### Understanding the Data

**Progress Rings:**
- 🟢 Green: Meeting or exceeding goals
- 🟡 Yellow: Within 80-100% of goals
- 🔴 Red: Below 80% of goals

**Weekly Cards:**
- Shows each week's nutrition summary
- Displays date range
- Calculates averages
- Highlights goal achievement

---

## Batch Processing Existing Recipes

### Why Use Batch Processing?

- 📚 You have many existing recipes without nutrition data
- 🔄 You just enabled nutrition tracking
- 🧹 Cleaning up after failed extractions
- ⚡ Process multiple recipes efficiently

### How to Batch Extract

1. Navigate to **Nutrition → Batch Extract**
2. **Configure:**
   - Set batch size (recommended: 10-20 recipes)
   - Smaller batches = more reliable
   - Larger batches = faster but may hit rate limits
3. **Check Recipes:**
   - Click "Check Recipes" to see count
   - Reviews shows how many recipes need processing
4. **Process:**
   - Click "Extract Nutrition" button
   - Wait for completion (may take several minutes)
   - View results summary

### Understanding Results

**Processing Results Card:**
- ✅ **Processed:** Successfully extracted
- ❌ **Failed:** Extraction errors
- 📊 **Total:** Recipes in batch

**Error Log:**
- Shows which recipes failed
- Displays error messages
- Helps identify problematic recipes

### Best Practices

- Start with a small batch (5-10 recipes) to test
- Run during off-peak hours to avoid rate limits
- Review errors and retry failed recipes individually
- Process recipes in multiple batches if you have many

---

## Understanding Nutrition Data

### Data Sources

**AI Extracted:**
- Analyzed from ingredient lists
- Confidence score: 0.0 - 1.0 (higher = more confident)
- Based on USDA nutrition database
- Automatically calculated per serving

**Manual Entry:**
- User-provided values
- From official nutrition labels
- Custom calculations
- Override AI values

**Official Label:**
- From manufacturer packaging
- Most accurate for packaged foods
- Manually entered from source

### Confidence Scores

| Score Range | Meaning | Recommendation |
|-------------|---------|----------------|
| 0.9 - 1.0   | Very High | Trust the data |
| 0.7 - 0.9   | High | Generally reliable |
| 0.5 - 0.7   | Medium | Review and verify |
| 0.0 - 0.5   | Low | Consider manual entry |

### Serving Sizes

- Nutrition values are **per serving**
- Servings are based on recipe's `base_servings` field
- Scaling servings doesn't change nutrition per serving
- Total nutrition = per serving × number of servings

---

## Best Practices

### For Accurate Nutrition Data

1. **Use Specific Ingredients:**
   - ✅ "2 cups whole milk"
   - ❌ "Some milk"

2. **Include Quantities:**
   - ✅ "1 lb ground beef (85% lean)"
   - ❌ "Ground beef"

3. **Be Consistent:**
   - Use standard measurements (cups, tablespoons, grams)
   - Specify cooking methods when relevant
   - Note if ingredients are raw or cooked

4. **Review AI Extractions:**
   - Check that values seem reasonable
   - Compare to similar recipes
   - Look at confidence scores

### For Meal Planning

1. **Set Realistic Goals:**
   - Base on your actual needs
   - Consult healthcare provider for personalized goals
   - Adjust based on activity level

2. **Track Consistently:**
   - Plan meals weekly
   - Review nutrition regularly
   - Adjust as needed

3. **Use the Weekly View:**
   - Balance macros across the week
   - Don't stress about daily perfection
   - Look for overall trends

### For Data Quality

1. **Update Old Recipes:**
   - Use batch extraction for existing recipes
   - Re-extract when ingredients change significantly
   - Verify nutrition for frequently used recipes

2. **Maintain Your Library:**
   - Archive recipes you no longer use
   - Keep ingredient lists updated
   - Add notes about nutrition sources

---

## Troubleshooting

### Nutrition Not Auto-Extracting

**Problem:** New recipes aren't getting nutrition data

**Solutions:**
1. Check that nutrition tracking is enabled in Settings
2. Verify recipe has ingredient list
3. Check console logs for errors
4. Try manual extraction on recipe detail page

### Inaccurate Nutrition Values

**Problem:** AI-extracted values seem wrong

**Solutions:**
1. Review ingredient list for specificity
2. Check confidence score (low score = less reliable)
3. Use manual entry to override
4. Re-extract after improving ingredient descriptions

### Batch Extraction Failing

**Problem:** Batch extraction shows many failures

**Solutions:**
1. Reduce batch size (try 5 recipes)
2. Check individual recipe ingredient lists
3. Review error messages for patterns
4. Try processing failed recipes one by one

### Missing Nutrition on Meal Plan

**Problem:** Some meals don't show nutrition badges

**Solutions:**
1. Navigate to recipe detail page
2. Check if nutrition data exists
3. Click "Extract Nutrition with AI" if missing
4. Return to meal plan to see updated data

### Goals Not Showing Progress

**Problem:** Progress rings show no data

**Solutions:**
1. Ensure macro goals are set in Settings
2. Add recipes with nutrition data to meal plan
3. Check that current week has planned meals
4. Refresh the page to reload data

---

## Advanced Tips

### Optimizing AI Extraction

- Use standard ingredient names (e.g., "chicken breast" not "chicky")
- Include brand names for packaged items
- Specify fat content for meats and dairy
- Note if ingredients are cooked or raw

### Tracking Complex Recipes

- For recipes with many ingredients, AI extraction works best
- For simple recipes, manual entry may be faster
- For restaurant-style recipes, use official nutrition if available

### Integration with Meal Planning

- View nutrition while planning meals
- Balance high-protein meals with lighter options
- Use nutrition badges to make informed choices
- Track weekly totals, not just daily

---

## Privacy & Data

- Nutrition data is private to your account
- Shared recipes include shared nutrition data
- AI extraction happens on secure servers
- Data is not shared with third parties
- You can delete nutrition data anytime

---

## Feature Roadmap

**Coming Soon:**
- 🔄 Nutrition data versioning
- 📱 Mobile app nutrition widgets
- 🎯 Custom macro ratio presets
- 📊 Advanced analytics and insights
- 🍽️ Restaurant menu integration
- 🔔 Goal achievement notifications

---

## Support

### Need Help?

- Check this guide first
- Review troubleshooting section
- Contact support with specific questions
- Report bugs via GitHub issues

### Feedback

We'd love to hear from you!
- Feature requests
- Bug reports
- Usability improvements
- Documentation updates

---

## Changelog

### Version 1.0 (Current)
- ✅ AI-powered nutrition extraction
- ✅ Manual nutrition entry and editing
- ✅ Macro goal setting and tracking
- ✅ Weekly nutrition dashboard
- ✅ Nutrition history and trends
- ✅ Meal plan nutrition integration
- ✅ Batch processing for existing recipes
- ✅ FDA-style nutrition labels

---

*Last Updated: 2025-12-11*
