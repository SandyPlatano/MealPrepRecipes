import requests

def test_scrape_url_api_ssrf_protection():
    base_url = "http://localhost:3001"
    session = requests.Session()

    # Authenticate first
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=30)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"

    ssrf_test_urls = [
        "http://localhost",
        "http://127.0.0.1",
        "http://192.168.1.1",
        "http://10.0.0.1",
        # Non-HTTP protocols to test as well, e.g., ftp, file, etc.
        "ftp://example.com",
        "file:///etc/passwd"
    ]

    for url in ssrf_test_urls:
        response = session.post(
            f"{base_url}/api/scrape-url",
            json={"url": url},
            timeout=30
        )
        # Validate that SSRF protection blocks these requests with 403 Forbidden.
        assert response.status_code == 403, (
            f"SSRF protection failed for URL '{url}', expected 403 but got {response.status_code}. Response: {response.text}"
        )

test_scrape_url_api_ssrf_protection()