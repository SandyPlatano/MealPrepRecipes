#!/usr/bin/env python3
"""
LinkedIn Job Scraper
Scrapes LinkedIn job postings to extract OTE/salary and remote status information.
"""

import csv
import time
import re
from typing import Dict, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class LinkedInJobScraper:
    """Scrapes LinkedIn job postings for salary and remote information."""

    def __init__(self, headless: bool = False):
        """Initialize the scraper with Chrome driver.

        Args:
            headless: Run browser in headless mode (no GUI)
        """
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        self.wait = WebDriverWait(self.driver, 10)

    def extract_salary_info(self, page_text: str) -> Tuple[str, str, str]:
        """Extract salary information from page text.

        Args:
            page_text: Full text content of the job posting

        Returns:
            Tuple of (above_80k, certainty, salary_info)
            - above_80k: "Yes", "No", or "Unsure"
            - certainty: "Yes" or "No" (if we're sure about the determination)
            - salary_info: Extracted salary text or "Not found"
        """
        # Patterns to match salary information
        salary_patterns = [
            r'\$[\d,]+(?:\s*-\s*\$?[\d,]+)?\s*(?:per year|/year|annually|/yr|yr)',
            r'[\d,]+k?\s*-\s*[\d,]+k?\s*(?:per year|/year|annually|USD|usd)',
            r'\$[\d,]+k?\s*-\s*\$?[\d,]+k?',
            r'salary:?\s*\$?[\d,]+k?\s*-\s*\$?[\d,]+k?',
            r'compensation:?\s*\$?[\d,]+k?\s*-\s*\$?[\d,]+k?',
            r'OTE:?\s*\$?[\d,]+k?\s*-\s*\$?[\d,]+k?',
            r'base salary:?\s*\$?[\d,]+k?\s*-\s*\$?[\d,]+k?',
        ]

        salary_info = "Not found"
        found_salaries = []

        for pattern in salary_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            if matches:
                found_salaries.extend(matches)

        if found_salaries:
            salary_info = "; ".join(set(found_salaries))

            # Extract numeric values to check if >= 80k
            numbers = re.findall(r'[\d,]+', salary_info)
            max_salary = 0

            for num_str in numbers:
                num_str = num_str.replace(',', '')
                num = float(num_str)

                # Check if it's in 'k' format
                if 'k' in salary_info.lower() and num < 1000:
                    num *= 1000

                max_salary = max(max_salary, num)

            if max_salary >= 80000:
                return "Yes", "Yes", salary_info
            elif max_salary > 0:
                return "No", "Yes", salary_info
            else:
                return "Unsure", "No", salary_info

        return "Unsure", "No", salary_info

    def extract_remote_status(self, page_text: str) -> str:
        """Extract remote work status from page text.

        Args:
            page_text: Full text content of the job posting

        Returns:
            "Yes" if fully remote, "No" otherwise
        """
        page_text_lower = page_text.lower()

        # Patterns indicating fully remote
        fully_remote_patterns = [
            r'\bfully remote\b',
            r'\b100%\s*remote\b',
            r'\bremote\s*-\s*worldwide\b',
            r'\bremote\s*-\s*anywhere\b',
            r'\bremote work\b',
            r'\bwork from home\b',
            r'\bremote position\b',
        ]

        # Patterns indicating NOT fully remote
        not_remote_patterns = [
            r'\bhybrid\b',
            r'\bon-?site\b',
            r'\bin-?office\b',
            r'\bremote\s*-\s*[a-z\s]+\s+only\b',  # e.g., "Remote - US only" might be remote
        ]

        for pattern in fully_remote_patterns:
            if re.search(pattern, page_text_lower):
                # Double-check it's not hybrid
                for neg_pattern in not_remote_patterns:
                    if re.search(neg_pattern, page_text_lower):
                        if 'hybrid' in page_text_lower:
                            return "No"
                return "Yes"

        return "No"

    def scrape_job(self, url: str, company_name: str) -> Dict[str, str]:
        """Scrape a single job posting.

        Args:
            url: LinkedIn job posting URL
            company_name: Name of the company

        Returns:
            Dictionary with scraped information
        """
        result = {
            'Company Name': company_name,
            'LinkedIn URL': url,
            'OTE >= $80k?': 'Unsure',
            'Certain?': 'No',
            'Salary Info': 'Error',
            'Fully Remote?': 'Unknown'
        }

        try:
            print(f"Scraping: {company_name} - {url}")
            self.driver.get(url)

            # Wait for page to load
            time.sleep(3)

            # Try to find and click "Show more" button if exists
            try:
                show_more = self.driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Show more')]")
                show_more.click()
                time.sleep(1)
            except:
                pass

            # Get the full page text
            page_text = self.driver.find_element(By.TAG_NAME, 'body').text

            # Extract salary information
            above_80k, certain, salary_info = self.extract_salary_info(page_text)
            result['OTE >= $80k?'] = above_80k
            result['Certain?'] = certain
            result['Salary Info'] = salary_info

            # Extract remote status
            remote_status = self.extract_remote_status(page_text)
            result['Fully Remote?'] = remote_status

            print(f"  OTE >= $80k: {above_80k} (Certain: {certain})")
            print(f"  Remote: {remote_status}")
            print(f"  Salary: {salary_info}")

        except Exception as e:
            print(f"  Error scraping {url}: {str(e)}")
            result['Salary Info'] = f"Error: {str(e)}"

        return result

    def process_csv(self, input_file: str, output_file: str):
        """Process input CSV and create output CSV with results.

        Args:
            input_file: Path to input CSV with company name and LinkedIn URL
            output_file: Path to output CSV with results
        """
        results = []

        # Read input CSV
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            jobs = list(reader)

        print(f"\nProcessing {len(jobs)} job postings...\n")

        # Process each job
        for idx, job in enumerate(jobs, 1):
            print(f"\n[{idx}/{len(jobs)}]")

            # Get company name and URL from CSV (handle different possible column names)
            company_name = (job.get('Company Name') or
                          job.get('company_name') or
                          job.get('Company') or
                          job.get('company') or
                          'Unknown')

            url = (job.get('LinkedIn URL') or
                  job.get('linkedin_url') or
                  job.get('URL') or
                  job.get('url') or
                  job.get('Job Link') or
                  job.get('job_link') or
                  '')

            if not url:
                print(f"  Warning: No URL found for {company_name}")
                continue

            result = self.scrape_job(url, company_name)
            results.append(result)

            # Be respectful with rate limiting
            time.sleep(2)

        # Write output CSV
        if results:
            fieldnames = ['Company Name', 'LinkedIn URL', 'OTE >= $80k?',
                         'Certain?', 'Salary Info', 'Fully Remote?']

            with open(output_file, 'w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(results)

            print(f"\n\nResults saved to: {output_file}")
            print(f"Total jobs processed: {len(results)}")

            # Print summary
            above_80k = sum(1 for r in results if r['OTE >= $80k?'] == 'Yes')
            fully_remote = sum(1 for r in results if r['Fully Remote?'] == 'Yes')
            print(f"Jobs with OTE >= $80k: {above_80k}")
            print(f"Fully remote jobs: {fully_remote}")
        else:
            print("\nNo results to save.")

    def close(self):
        """Close the browser."""
        self.driver.quit()


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape LinkedIn job postings')
    parser.add_argument('input_csv', help='Input CSV file with Company Name and LinkedIn URL columns')
    parser.add_argument('-o', '--output', default='linkedin_results.csv',
                       help='Output CSV file (default: linkedin_results.csv)')
    parser.add_argument('--headless', action='store_true',
                       help='Run browser in headless mode')

    args = parser.parse_args()

    scraper = LinkedInJobScraper(headless=args.headless)

    try:
        scraper.process_csv(args.input_csv, args.output)
    finally:
        scraper.close()


if __name__ == '__main__':
    main()
