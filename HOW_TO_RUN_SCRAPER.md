# How to Run the LinkedIn Scraper - Super Simple Guide! 🚀

## What You Need First

### Step 1: Install Chrome Browser
Before anything, you need Google Chrome installed on your computer.

**On Linux/Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
```

**On Mac:**
```bash
brew install --cask google-chrome
```

**On Windows:**
Download from: https://www.google.com/chrome/

---

## Prepare Your CSV File

Your CSV file needs to look like this:

```
Company Name,LinkedIn URL
Google,https://www.linkedin.com/jobs/view/1234567890
Microsoft,https://www.linkedin.com/jobs/view/0987654321
```

**Important:**
- First column = Company name
- Second column = Full LinkedIn job link (the web address)
- The first row MUST be exactly: `Company Name,LinkedIn URL`

---

## How to Run the Scraper

### Option 1: If your CSV is named "Jobs December 1st.csv"

Open your terminal (command line) and type:

```bash
cd /home/user/MealPrepRecipes
python linkedin_scraper.py "Jobs December 1st.csv"
```

That's it! The scraper will:
1. Open Chrome automatically
2. Visit each LinkedIn job link
3. Read the salary and remote info
4. Save everything to a file called `linkedin_results.csv`

### Option 2: Choose your own output file name

```bash
python linkedin_scraper.py "Jobs December 1st.csv" -o "My Results.csv"
```

This saves the results with YOUR chosen name instead of the default.

---

## What Happens When It Runs?

1. **Chrome will open** - You'll see a browser window pop up (don't close it!)
2. **It visits each job** - You'll see it automatically going to each LinkedIn page
3. **It takes about 2-3 seconds per job** - This is normal! It's being polite to LinkedIn
4. **You'll see progress in the terminal** - It shows you what it's doing

Example of what you'll see:
```
Processing 10 job postings...

[1/10]
Scraping: Google - https://www.linkedin.com/jobs/view/1234567890
  OTE >= $80k: Yes (Certain: Yes)
  Remote: Yes
  Salary: $100,000-$150,000/year

[2/10]
Scraping: Microsoft - https://www.linkedin.com/jobs/view/0987654321
  OTE >= $80k: No (Certain: Yes)
  Remote: No
  Salary: $60,000-$75,000
```

---

## Understanding Your Results

When it's done, you'll have a CSV file with these columns:

| What It Means | What You'll See |
|---------------|-----------------|
| **Company Name** | The company from your input file |
| **LinkedIn URL** | The job link you provided |
| **OTE >= $80k?** | "Yes" = salary is $80k or more<br>"No" = salary is less than $80k<br>"Unsure" = couldn't find salary info |
| **Certain?** | "Yes" = confident about the answer<br>"No" = not sure |
| **Salary Info** | The actual salary text it found (or "Not found") |
| **Fully Remote?** | "Yes" = you can work from anywhere<br>"No" = hybrid or office-based |

---

## Common Issues & Fixes

### "No such file or directory: Jobs December 1st.csv"
- Make sure your CSV file is in the `/home/user/MealPrepRecipes` folder
- Or provide the full path: `/path/to/your/Jobs December 1st.csv`

### "Chrome not found" error
- You need to install Chrome/Chromium (see Step 1 above)

### Some jobs show "Unsure" for salary
- That's normal! Not all LinkedIn jobs list the salary publicly
- The scraper can only find what's visible on the page

### LinkedIn blocks the scraper
- If you try to scrape hundreds of jobs at once, LinkedIn might temporarily block you
- Solution: Wait 10-15 minutes and try again with fewer jobs
- Keep batches to 20-30 jobs at a time

---

## Quick Reference

**Basic command:**
```bash
python linkedin_scraper.py "Jobs December 1st.csv"
```

**With custom output name:**
```bash
python linkedin_scraper.py "Jobs December 1st.csv" -o "December Results.csv"
```

**Run without seeing the browser (faster):**
```bash
python linkedin_scraper.py "Jobs December 1st.csv" --headless
```

---

## Example - Full Walkthrough

Let's say you have a file called "Jobs December 1st.csv" with this:

```csv
Company Name,LinkedIn URL
Apple,https://www.linkedin.com/jobs/view/1111111111
Tesla,https://www.linkedin.com/jobs/view/2222222222
```

**You run:**
```bash
python linkedin_scraper.py "Jobs December 1st.csv"
```

**You get a file called `linkedin_results.csv` with:**
```csv
Company Name,LinkedIn URL,OTE >= $80k?,Certain?,Salary Info,Fully Remote?
Apple,https://www.linkedin.com/jobs/view/1111111111,Yes,Yes,"$120,000-$180,000",No
Tesla,https://www.linkedin.com/jobs/view/2222222222,Yes,Yes,"$85,000-$110,000",Yes
```

Now you can open this in Excel or Google Sheets and see all the info organized!

---

## Need Help?

If something doesn't work:
1. Make sure you're in the right folder: `cd /home/user/MealPrepRecipes`
2. Make sure Chrome is installed
3. Check that your CSV file name is spelled exactly right (including spaces!)
4. Make sure your CSV has the headers: `Company Name,LinkedIn URL`

Happy scraping! 🎉
