import requests

def test_scrape_url_api_ssrf_protection():
    base_url = "http://localhost:3001"
    blocked_urls = [
        {"url": "http://localhost:3001"},
        {"url": "http://127.0.0.1"},
        {"url": "http://192.168.1.1"}
    ]

    session = requests.Session()
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}

    # Authenticate and establish session
    auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=30)
    try:
        auth_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Authentication failed: {e}"

    auth_json = auth_response.json()
    assert auth_json.get("success") is True, "Authentication did not succeed"

    headers = {"Content-Type": "application/json"}

    for url_data in blocked_urls:
        try:
            resp = session.post(f"{base_url}/api/scrape-url", json=url_data, headers=headers, timeout=30)
        except requests.RequestException as e:
            assert False, f"Request to scrape-url failed for {url_data['url']}: {e}"

        assert resp.status_code == 403, (
            f"Expected 403 Forbidden for URL {url_data['url']}, got {resp.status_code}"
        )

        try:
            resp_json = resp.json()
        except ValueError:
            assert False, f"Response for URL {url_data['url']} is not valid JSON"

        error_msg = resp_json.get("error") or resp_json.get("message") or ""
        assert "Access to this URL is not permitted" in error_msg, (
            f"Expected error message about access denial for URL {url_data['url']}, got: {error_msg}"
        )

test_scrape_url_api_ssrf_protection()