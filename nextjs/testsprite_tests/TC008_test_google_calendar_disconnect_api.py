import requests

base_url = "http://localhost:3001"

def test_google_calendar_disconnect_api():
    try:
        # Create a session for authenticated requests
        session = requests.Session()

        # Authenticate first
        auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
        auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=30)
        assert auth_response.status_code == 200, f"Authentication failed with status {auth_response.status_code}"
        auth_json = auth_response.json()
        assert auth_json.get("success") is True, "Authentication response success is not True"
        assert "access_token" in auth_json or "token" in auth_json, "Authentication tokens missing"

        # Authenticated disconnect call
        disconnect_response = session.post(f"{base_url}/api/google-calendar/disconnect", timeout=30)
        assert disconnect_response.status_code == 200, f"Disconnect failed with status {disconnect_response.status_code}"
        disconnect_json = disconnect_response.json()
        assert isinstance(disconnect_json, dict), "Disconnect response is not a JSON object"
        assert disconnect_json.get("success") is True, "Disconnect response success is not True"
        assert isinstance(disconnect_json.get("message"), str) and disconnect_json["message"], "Disconnect response message is missing or empty"

        # Unauthenticated disconnect call (new session without auth)
        unauth_session = requests.Session()
        unauth_disconnect_response = unauth_session.post(f"{base_url}/api/google-calendar/disconnect", timeout=30)
        assert unauth_disconnect_response.status_code == 401, f"Unauthenticated disconnect did not return 401, got {unauth_disconnect_response.status_code}"

    except requests.RequestException as e:
        assert False, f"RequestException occurred: {e}"

test_google_calendar_disconnect_api()