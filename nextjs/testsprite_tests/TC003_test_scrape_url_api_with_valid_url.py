import requests

def test_scrape_url_api_with_valid_url():
    base_url = "http://localhost:3001"
    scrape_endpoint = f"{base_url}/api/scrape-url"
    auth_endpoint = f"{base_url}/api/test-auth"
    test_url = "https://www.allrecipes.com/recipe/228285/teriyaki-salmon/"
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    headers = {"Content-Type": "application/json"}

    # Unauthenticated request test
    try:
        unauth_resp = requests.post(scrape_endpoint, json={"url": test_url}, timeout=30)
        assert unauth_resp.status_code == 401, f"Expected 401 for unauthenticated request but got {unauth_resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Unauthenticated request raised an exception: {e}"

    # Authenticated session
    session = requests.Session()
    try:
        auth_resp = session.post(auth_endpoint, json=auth_payload, timeout=30)
        assert auth_resp.status_code == 200, f"Authentication failed with status {auth_resp.status_code}"
        auth_json = auth_resp.json()
        assert auth_json.get("success") is True, "Authentication success flag missing or false"
        # Now authenticated; send scrape-url request
        scrape_resp = session.post(scrape_endpoint, json={"url": test_url}, timeout=30)
        assert scrape_resp.status_code == 200, f"Expected 200 for scrape-url but got {scrape_resp.status_code}"
        resp_json = scrape_resp.json()
        # Verify response has html and text content keys
        assert "html" in resp_json or "htmlContent" in resp_json, "Response JSON missing 'html' or 'htmlContent' key"
        assert "text" in resp_json or "textContent" in resp_json, "Response JSON missing 'text' or 'textContent' key"
        # Additional check that html and text content are non-empty strings
        html_content = resp_json.get("html") or resp_json.get("htmlContent") or ""
        text_content = resp_json.get("text") or resp_json.get("textContent") or ""
        assert isinstance(html_content, str) and len(html_content) > 0, "HTML content is empty or invalid"
        assert isinstance(text_content, str) and len(text_content) > 0, "Text content is empty or invalid"
    except requests.RequestException as e:
        assert False, f"Authenticated requests raised an exception: {e}"

test_scrape_url_api_with_valid_url()