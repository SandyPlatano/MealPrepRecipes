import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_verify_google_calendar_integration_and_oauth_token_handling():
    # Step 1: Simulate OAuth token exchange
    # Usually, this would require an auth_code obtained from Google's OAuth consent screen.
    # For test purposes, we simulate with a dummy auth_code.
    auth_code = "test_oauth_auth_code"
    exchange_token_url = f"{BASE_URL}/api/google-calendar/exchange-token"
    headers = {"Content-Type": "application/json"}
    exchange_payload = {"code": auth_code}

    try:
        exchange_resp = requests.post(exchange_token_url, json=exchange_payload, headers=headers, timeout=TIMEOUT)
        assert exchange_resp.status_code == 200, f"Token exchange failed: {exchange_resp.text}"
        token_data = exchange_resp.json()
        assert "access_token" in token_data and token_data["access_token"], "Access token missing in exchange response"

        access_token = token_data["access_token"]

        # Step 2: Create a Google Calendar event representing a meal plan sync
        create_events_url = f"{BASE_URL}/api/google-calendar/create-events"
        # Create a sample event
        event_id = str(uuid.uuid4())
        event_payload = {
            "events": [
                {
                    "id": event_id,
                    "summary": "Dinner with family",
                    "description": "Meal plan synced from Babe, What's for Dinner?",
                    "start": {"dateTime": "2025-12-10T18:00:00Z"},
                    "end": {"dateTime": "2025-12-10T19:00:00Z"},
                    "attendees": [{"email": "family@example.com"}]
                }
            ],
            "access_token": access_token
        }

        create_resp = requests.post(create_events_url, json=event_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 200, f"Event creation failed: {create_resp.text}"
        create_result = create_resp.json()
        assert isinstance(create_result, dict), "Event creation response is not a JSON object"

        # Step 3: Check Google Calendar sync status
        status_url = f"{BASE_URL}/api/google-calendar/status"
        status_headers = {"Authorization": f"Bearer {access_token}"}
        status_resp = requests.get(status_url, headers=status_headers, timeout=TIMEOUT)
        assert status_resp.status_code == 200, f"Status check failed: {status_resp.text}"
        status_data = status_resp.json()
        assert "connected" in status_data and isinstance(status_data["connected"], bool), "Invalid status response"

        # Step 4: Disconnect Google Calendar
        disconnect_url = f"{BASE_URL}/api/google-calendar/disconnect"
        disconnect_headers = {"Authorization": f"Bearer {access_token}"}
        disconnect_resp = requests.post(disconnect_url, headers=disconnect_headers, timeout=TIMEOUT)
        assert disconnect_resp.status_code == 200, f"Disconnect failed: {disconnect_resp.text}"
        disconnect_data = disconnect_resp.json()
        assert "success" in disconnect_data and disconnect_data["success"] is True, "Disconnect response invalid"

    except requests.RequestException as e:
        assert False, f"RequestException occurred: {str(e)}"

test_verify_google_calendar_integration_and_oauth_token_handling()