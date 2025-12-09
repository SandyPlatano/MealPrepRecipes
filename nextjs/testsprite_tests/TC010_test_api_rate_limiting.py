import requests
import time

base_url = "http://localhost:3001"

headers = {"Content-Type": "application/json"}

def test_api_rate_limiting():
    session = requests.Session()

    # Authenticate
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    auth_response = session.post(base_url + "/api/test-auth", json=auth_payload, headers=headers, timeout=30)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"

    exceeded_limit = False
    retry_after = None
    success_count = 0
    rate_limit_threshold = 20
    total_requests = 25  # Make 25 requests to exceed 20 limit

    for i in range(total_requests):
        try:
            payload = {"url": f"http://example.com/recipe-{i}"}
            response = session.post(base_url + "/api/parse-recipe", json=payload, headers=headers, timeout=30)
            if response.status_code == 429:
                exceeded_limit = True
                retry_after = response.headers.get("Retry-After")
                assert retry_after is not None, "429 response missing Retry-After header"
                break
            else:
                # Should be 200 for valid request
                assert response.status_code == 200, f"Unexpected status at request {i}: {response.status_code}"
                success_count += 1
        except requests.RequestException as e:
            assert False, f"Request failed at iteration {i}: {str(e)}"

    assert exceeded_limit, "Rate limiting was not enforced after exceeding request limit"
    assert success_count <= rate_limit_threshold, f"Success count {success_count} exceeds rate limit threshold"

test_api_rate_limiting()
