import requests

base_url = "http://localhost:3001"
timeout = 30

def test_google_calendar_status_api():
    session = requests.Session()
    auth_payload = {
        "email": "test@testsprite.dev",
        "password": "TestSprite123!"
    }
    # Authenticate first
    auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=timeout)
    assert auth_response.status_code == 200, f"Authentication failed with status code {auth_response.status_code}"
    auth_json = auth_response.json()
    assert auth_json.get("success") is True, "Authentication response did not indicate success"
    # Use authenticated session to GET calendar status
    status_response = session.get(f"{base_url}/api/google-calendar/status", timeout=timeout)
    assert status_response.status_code == 200, f"Expected 200 for authenticated calendar status but got {status_response.status_code}"
    status_json = status_response.json()
    assert isinstance(status_json, dict), "Calendar status response is not a JSON object"
    assert "isConnected" in status_json, "Response missing 'isConnected' field"
    assert isinstance(status_json["isConnected"], bool), "'isConnected' field is not boolean"
    assert "connectedAccount" in status_json, "Response missing 'connectedAccount' field"
    assert (status_json["connectedAccount"] is None) or isinstance(status_json["connectedAccount"], str), "'connectedAccount' is not string or null"
    # Test that unauthenticated request returns 401
    unauth_response = requests.get(f"{base_url}/api/google-calendar/status", timeout=timeout)
    assert unauth_response.status_code == 401, f"Expected 401 for unauthenticated request but got {unauth_response.status_code}"

test_google_calendar_status_api()