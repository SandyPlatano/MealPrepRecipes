import requests

def test_authentication_endpoint():
    base_url = "http://localhost:3001"
    session = requests.Session()
    timeout = 30

    # Step 1: Authenticate with email and password
    auth_payload = {
        "email": "test@testsprite.dev",
        "password": "TestSprite123!"
    }
    try:
        auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Authentication POST request failed: {e}"

    assert auth_response.status_code == 200, f"Expected status code 200 on auth, got {auth_response.status_code}"
    auth_json = auth_response.json()

    # Assert required fields in response
    expected_fields = {"success", "email", "user", "session", "token", "access_token"}
    missing_fields = expected_fields - auth_json.keys()
    assert not missing_fields, f"Missing fields in auth response: {missing_fields}"
    assert auth_json["success"] is True, "Authentication was not successful"
    assert auth_json["email"] == auth_payload["email"], "Returned email does not match request"

    # Step 2: Use token to GET authentication status
    headers = {}
    access_token = auth_json.get("access_token")
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    try:
        status_response = session.get(f"{base_url}/api/test-auth", headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Authentication status GET request failed: {e}"

    assert status_response.status_code == 200, f"Expected status code 200 on auth status GET, got {status_response.status_code}"

    status_json = status_response.json()
    # Expecting similar fields indicating user is authenticated
    assert status_json.get("success") is True, "Authentication status indicates not authenticated"
    assert status_json.get("email") == auth_payload["email"], "Auth status email does not match"

test_authentication_endpoint()
