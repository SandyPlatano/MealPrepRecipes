# LinkedIn Job Scraper

This tool scrapes LinkedIn job postings to extract salary/OTE information and remote work status.

## Features

- Extracts OTE/salary information from job postings
- Determines if salary is >= $80,000
- Checks if position is fully remote
- Outputs results to CSV with certainty indicators

## Setup

1. Install Chrome or Chromium browser (if not already installed):

**Ubuntu/Debian:**
```bash
# Option 1: Install Chromium
sudo apt-get update
sudo apt-get install -y chromium-browser

# Option 2: Install Google Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb
```

**macOS:**
```bash
brew install --cask google-chrome
# or
brew install --cask chromium
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Prepare your input CSV file with the following columns:
   - `Company Name`: Name of the company
   - `LinkedIn URL`: Full LinkedIn job posting URL (e.g., https://www.linkedin.com/jobs/view/123456789)

See `linkedin_jobs_template.csv` for an example format.

## Usage

Basic usage:
```bash
python linkedin_scraper.py your_input_file.csv
```

With custom output file:
```bash
python linkedin_scraper.py your_input_file.csv -o results.csv
```

Run in headless mode (no browser window):
```bash
python linkedin_scraper.py your_input_file.csv --headless
```

## Output Format

The script creates a CSV with the following columns:

| Column | Description |
|--------|-------------|
| Company Name | Name of the company from input |
| LinkedIn URL | Job posting URL from input |
| OTE >= $80k? | "Yes", "No", or "Unsure" |
| Certain? | "Yes" if confident about the determination, "No" if uncertain |
| Salary Info | Extracted salary text or "Not found" |
| Fully Remote? | "Yes" if fully remote, "No" otherwise |

## Example

Input CSV (`jobs.csv`):
```csv
Company Name,LinkedIn URL
Acme Corp,https://www.linkedin.com/jobs/view/3812345678
Tech Startup,https://www.linkedin.com/jobs/view/3823456789
```

Command:
```bash
python linkedin_scraper.py jobs.csv -o results.csv
```

Output CSV (`results.csv`):
```csv
Company Name,LinkedIn URL,OTE >= $80k?,Certain?,Salary Info,Fully Remote?
Acme Corp,https://www.linkedin.com/jobs/view/3812345678,Yes,Yes,"$80,000-$120,000/year",Yes
Tech Startup,https://www.linkedin.com/jobs/view/3823456789,Unsure,No,Not found,No
```

## Notes

- The scraper adds a 2-second delay between requests to be respectful to LinkedIn's servers
- LinkedIn may rate limit or block automated requests; use responsibly
- Some job postings may not include salary information
- The script attempts to identify various salary formats including OTE, base salary, and compensation ranges
- "Fully Remote" detection looks for explicit mentions; hybrid positions are marked as "No"

## Troubleshooting

- **ChromeDriver issues**: The script uses `webdriver-manager` to automatically download the correct ChromeDriver version
- **Rate limiting**: If you get blocked, wait a few minutes before retrying
- **Missing data**: Not all job postings include salary information; these will be marked as "Unsure"
