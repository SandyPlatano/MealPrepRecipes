import requests
import re

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_verify_gdpr_cookie_consent_and_accessible_ui_design():
    try:
        response = requests.get(BASE_URL, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected HTTP 200, got {response.status_code}"

        html_text = response.text

        # Broaden the search for cookie consent banner by id or class containing 'cookie' and 'consent' or 'banner'
        banner_match = re.search(r'<[^>]+(id=["\']cookie-consent["\']|class=["\'][^"\'>]*(cookie.*consent|cookie.*banner|cookie-consent|cookie-banner)[^"\'>]*["\'])[^>]*>', html_text, re.IGNORECASE)
        assert banner_match is not None, "Cookie consent banner not found on the page."

        banner_start = banner_match.start()

        # Extract the banner HTML block roughly from the tag start to the corresponding closing tag
        # Since this is complex to do precisely, we just look in a segment after the banner tag
        banner_segment = html_text[banner_start:banner_start+1000]

        # Check for role="dialog"
        role_match = re.search(r'role=["\']dialog["\']', banner_segment, re.IGNORECASE)
        assert role_match is not None, f"Cookie consent banner should have role='dialog'."

        # Check for aria-modal="true"
        aria_modal_match = re.search(r'aria-modal=["\']true["\']', banner_segment, re.IGNORECASE)
        assert aria_modal_match is not None, f"Cookie consent banner should have aria-modal='true'."

        # Check for tabindex attribute
        tabindex_match = re.search(r'tabindex=["\'][^"\']+["\']', banner_segment, re.IGNORECASE)
        assert tabindex_match is not None, "Cookie consent banner should have tabindex attribute set for keyboard navigation."

        # Check for buttons text containing Accept and Manage or Settings
        # Extract all buttons inside banner segment
        buttons = re.findall(r'<button[^>]*>(.*?)</button>', banner_segment, re.IGNORECASE | re.DOTALL)
        buttons_text = [btn.strip().lower() for btn in buttons]

        assert any('accept' in btn for btn in buttons_text), "No 'Accept' button found in cookie consent banner."
        assert any('manage' in btn or 'settings' in btn for btn in buttons_text), "No 'Manage' or 'Settings' button found in cookie consent banner."

        # Check for descriptive consent text containing 'cookie' and ('consent' or 'use')
        consent_text_found = re.search(r'cookie.*(consent|use)', banner_segment, re.IGNORECASE | re.DOTALL)
        assert consent_text_found is not None, "Cookie consent banner does not contain descriptive consent text."

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"


test_verify_gdpr_cookie_consent_and_accessible_ui_design()