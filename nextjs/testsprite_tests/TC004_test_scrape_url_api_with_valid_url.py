import requests

base_url = "http://localhost:3001"

def test_scrape_url_api_with_valid_url():
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    scrape_url_payload = {"url": "https://www.allrecipes.com"}
    timeout = 30

    session = requests.Session()
    # Authenticate first
    auth_response = session.post(base_url + "/api/test-auth", json=auth_payload, timeout=timeout)
    assert auth_response.status_code == 200, f"Authentication failed with status {auth_response.status_code}"

    # Authenticated request to /api/scrape-url with valid URL
    scrape_response = session.post(base_url + "/api/scrape-url", json=scrape_url_payload, timeout=timeout)
    assert scrape_response.status_code == 200, f"Authenticated scrape-url request failed with status {scrape_response.status_code}"

    json_data = None
    try:
        json_data = scrape_response.json()
    except Exception as e:
        assert False, f"Response is not valid JSON: {e}"

    # Verify html and text content are present in response
    assert isinstance(json_data, dict), "Response JSON is not an object"
    assert "html" in json_data, "'html' key missing in response"
    assert "text" in json_data, "'text' key missing in response"
    assert isinstance(json_data["html"], str) and len(json_data["html"]) > 0, "'html' content is empty or not a string"
    assert isinstance(json_data["text"], str) and len(json_data["text"]) > 0, "'text' content is empty or not a string"

    # Test unauthenticated request returns 401
    unauth_response = requests.post(base_url + "/api/scrape-url", json=scrape_url_payload, timeout=timeout)
    assert unauth_response.status_code == 401, f"Unauthenticated request did not return 401 but {unauth_response.status_code}"

test_scrape_url_api_with_valid_url()