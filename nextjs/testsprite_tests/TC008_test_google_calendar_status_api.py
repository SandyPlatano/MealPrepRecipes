import requests

base_url = "http://localhost:3001"

def test_google_calendar_status_api():
    session = requests.Session()
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    try:
        # Authenticate to get session cookies
        auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=30)
        assert auth_response.status_code == 200, f"Authentication failed with status {auth_response.status_code}"
        auth_json = auth_response.json()
        assert "email" in auth_json or "user" in auth_json, "Auth response missing user info"

        # Authenticated GET /api/google-calendar/status
        status_response = session.get(f"{base_url}/api/google-calendar/status", timeout=30)
        assert status_response.status_code == 200, f"Expected 200 OK but got {status_response.status_code}"
        status_data = status_response.json()

        # Validate required fields and types
        assert "isConnected" in status_data, "'isConnected' not in response"
        assert isinstance(status_data["isConnected"], bool), "'isConnected' is not a boolean"
        # connectedAccount may be None if not connected
        assert "connectedAccount" in status_data, "'connectedAccount' not in response"
        # connectedAccount can be None or string (likely email or account identifier)
        assert (status_data["connectedAccount"] is None) or (isinstance(status_data["connectedAccount"], str)), \
            "'connectedAccount' is neither None nor a string"

        # Test unauthenticated request returns 401
        unauth_response = requests.get(f"{base_url}/api/google-calendar/status", timeout=30)
        assert unauth_response.status_code == 401, f"Expected 401 Unauthorized but got {unauth_response.status_code}"

    except requests.RequestException as e:
        assert False, f"Request exception occurred: {e}"

test_google_calendar_status_api()