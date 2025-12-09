import requests

base_url = "http://localhost:3001"

def test_parse_recipe_validation():
    session = requests.Session()
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    auth_response = session.post(base_url + "/api/test-auth", json=auth_payload, timeout=30)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
    auth_data = auth_response.json()
    assert auth_data.get("success") is True, "Authentication did not return success true"

    url = base_url + "/api/parse-recipe"

    # 1) Empty body should return 400
    response_empty = session.post(url, json={}, timeout=30)
    assert response_empty.status_code == 400, f"Expected 400 for empty body, got {response_empty.status_code}"

    # 2) Body with neither text nor htmlContent returns 400
    response_neither = session.post(url, json={"someKey": "someValue"}, timeout=30)
    assert response_neither.status_code == 400, f"Expected 400 for body with neither text nor htmlContent, got {response_neither.status_code}"

    # 3) Valid body with {"text": "Simple recipe"} returns 200
    response_valid = session.post(url, json={"text": "Simple recipe"}, timeout=30)
    assert response_valid.status_code == 200, f"Expected 200 for valid body, got {response_valid.status_code}"
    # Optionally check if response contains expected keys or structure
    try:
        data = response_valid.json()
        assert isinstance(data, dict), "Response is not a JSON object"
    except Exception as e:
        assert False, f"Response is not valid JSON: {e}"

test_parse_recipe_validation()