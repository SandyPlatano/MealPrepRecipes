import requests

def test_scrape_url_validation():
    base_url = "http://localhost:3001"
    session = requests.Session()
    # Authenticate first
    auth_resp = session.post(
        base_url + "/api/test-auth",
        json={"email": "test@testsprite.dev", "password": "TestSprite123!"},
        timeout=30
    )
    assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
    auth_json = auth_resp.json()
    assert auth_json.get("success") is True, f"Auth success false: {auth_resp.text}"
    # 1) Empty body returns 400 with 'URL is required'
    empty_resp = session.post(
        base_url + "/api/scrape-url", json={}, timeout=30
    )
    assert empty_resp.status_code == 400, f"Expected 400 for empty body, got {empty_resp.status_code}"
    try:
        empty_json = empty_resp.json()
    except Exception:
        empty_json = {}
    err_msg_1 = empty_json.get("error") or empty_json.get("message") or ""
    assert "URL is required" in err_msg_1, f"Expected 'URL is required' in error message, got: {err_msg_1}"
    # 2) Invalid URL {"url": "not-a-url"} returns 400 with 'Invalid URL'
    invalid_resp = session.post(
        base_url + "/api/scrape-url", json={"url": "not-a-url"}, timeout=30
    )
    assert invalid_resp.status_code == 400, f"Expected 400 for invalid url, got {invalid_resp.status_code}"
    try:
        invalid_json = invalid_resp.json()
    except Exception:
        invalid_json = {}
    err_msg_2 = invalid_json.get("error") or invalid_json.get("message") or ""
    assert "Invalid URL" in err_msg_2, f"Expected 'Invalid URL' in error message, got: {err_msg_2}"
    # 3) Valid URL returns 200
    valid_resp = session.post(
        base_url + "/api/scrape-url",
        json={"url": "https://example.com/recipe"},
        timeout=30
    )
    assert valid_resp.status_code == 200, f"Expected 200 for valid url, got {valid_resp.status_code}"
    # Optionally check that response content has expected keys or content
    # But since schema not strictly defined here, just ensure json parse success
    try:
        valid_json = valid_resp.json()
    except Exception:
        assert False, "Response is not valid JSON for valid URL request"

test_scrape_url_validation()