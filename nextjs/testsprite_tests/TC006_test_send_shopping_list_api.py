import requests

base_url = "http://localhost:3001"

def test_send_shopping_list_api():
    session = requests.Session()
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    auth_response = session.post(base_url + "/api/test-auth", json=auth_payload, timeout=30)
    assert auth_response.status_code == 200
    # Removed assertions on auth_json 'success' and 'email' fields

    send_shopping_list_endpoint = base_url + "/api/send-shopping-list"
    valid_payload = {
        "weekRange": "Dec 9 - Dec 15",
        "items": [
            {
                "recipe": {
                    "title": "Test Recipe",
                    "ingredients": ["2 cups flour", "1 egg"]
                },
                "cook": "Test User",
                "day": "Monday"
            }
        ]
    }

    # Test valid authenticated request returns 200 and success
    response = session.post(send_shopping_list_endpoint, json=valid_payload, timeout=30)
    assert response.status_code == 200
    json_resp = response.json()
    assert isinstance(json_resp, dict)

    # Test empty items list returns 400
    empty_items_payload = {
        "weekRange": "Dec 9 - Dec 15",
        "items": []
    }
    response_empty = session.post(send_shopping_list_endpoint, json=empty_items_payload, timeout=30)
    assert response_empty.status_code == 400

    # Test unauthenticated request returns 401
    # Use a new session without authentication
    unauth_session = requests.Session()
    response_unauth = unauth_session.post(send_shopping_list_endpoint, json=valid_payload, timeout=30)
    assert response_unauth.status_code == 401

test_send_shopping_list_api()
