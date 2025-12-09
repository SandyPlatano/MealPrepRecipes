import requests

base_url = "http://localhost:3001"
auth_endpoint = "/api/test-auth"
disconnect_endpoint = "/api/google-calendar/disconnect"
timeout = 30

def test_google_calendar_disconnect_api():
    # Test unauthenticated request returns 401
    try:
        unauth_resp = requests.post(base_url + disconnect_endpoint, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Unauthenticated request exception: {e}"
    else:
        assert unauth_resp.status_code == 401, f"Expected 401 for unauthenticated request, got {unauth_resp.status_code}"

    # Authenticated flow
    session = requests.Session()
    try:
        auth_resp = session.post(base_url + auth_endpoint, json={"email": "test@testsprite.dev", "password": "TestSprite123!"}, timeout=timeout)
        assert auth_resp.status_code == 200, f"Authentication failed with status {auth_resp.status_code}"
        auth_json = auth_resp.json()
        # Basic check that authentication succeeded (presence of session cookie assumed from description)

        disconnect_resp = session.post(base_url + disconnect_endpoint, timeout=timeout)
        assert disconnect_resp.status_code == 200, f"Disconnect API returned {disconnect_resp.status_code}"
        try:
            resp_json = disconnect_resp.json()
        except Exception:
            assert False, "Disconnect API response is not valid JSON"
        assert 'message' in resp_json, "'message' not in disconnect response"
        # The success message content is not explicitly specified, just verify it is a non-empty string
        assert isinstance(resp_json['message'], str) and len(resp_json['message']) > 0, "Disconnect response message empty or not a string"
    finally:
        session.close()

test_google_calendar_disconnect_api()