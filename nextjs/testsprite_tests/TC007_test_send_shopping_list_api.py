import requests

base_url = "http://localhost:3001"

def test_send_shopping_list_api():
    session = requests.Session()
    timeout = 30

    # Authenticate first
    auth_resp = session.post(
        base_url + "/api/test-auth",
        json={"email": "test@testsprite.dev", "password": "TestSprite123!"},
        timeout=timeout,
    )
    assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"

    # Test sending a valid shopping list
    valid_payload = {
        "weekRange": "2024-06-10 to 2024-06-16",
        "items": [
            {"name": "Milk", "quantity": 2, "unit": "liters"},
            {"name": "Eggs", "quantity": 12, "unit": "pieces"},
        ],
    }
    resp = session.post(
        base_url + "/api/send-shopping-list",
        json=valid_payload,
        timeout=timeout,
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code} with body: {resp.text}"
    # Assuming success returns JSON with a success field
    json_resp = resp.json()
    assert isinstance(json_resp, dict), "Response is not JSON Dict"
    assert json_resp.get("success") is True or resp.text.lower().find("success") != -1, "Success indicator missing in response"

    # Test sending shopping list with empty items array - expect 400 error
    empty_items_payload = {
        "weekRange": "2024-06-10 to 2024-06-16",
        "items": [],
    }
    resp_empty = session.post(
        base_url + "/api/send-shopping-list",
        json=empty_items_payload,
        timeout=timeout,
    )
    assert resp_empty.status_code == 400, f"Expected 400 for empty items, got {resp_empty.status_code}: {resp_empty.text}"

    # Test unauthenticated request to POST /api/send-shopping-list
    unauth_session = requests.Session()
    resp_unauth = unauth_session.post(
        base_url + "/api/send-shopping-list",
        json=valid_payload,
        timeout=timeout,
    )
    assert resp_unauth.status_code == 401, f"Expected 401 for unauthenticated, got {resp_unauth.status_code}: {resp_unauth.text}"

test_send_shopping_list_api()
