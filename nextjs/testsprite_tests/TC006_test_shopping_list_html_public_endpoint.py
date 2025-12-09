import requests
import base64
import json

def test_shopping_list_html_public_endpoint():
    base_url = "http://localhost:3001"
    endpoint = "/api/shopping-list-html"
    timeout = 30

    # Test GET request without authentication returns HTML content
    try:
        resp = requests.get(base_url + endpoint, timeout=timeout)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "")
        # Assert content type is HTML
        assert "text/html" in content_type.lower(), f"Expected Content-Type text/html but got {content_type}"
        # Basic sanity check on content
        assert resp.text.strip().startswith("<!DOCTYPE html>") or resp.text.strip().startswith("<html"), "Response does not appear to be an HTML document"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Prepare a sample shopping list dictionary for encoding
    sample_shopping_list = {
        "weekRange": "2025-12-01 to 2025-12-07",
        "items": [
            {"name": "Eggs", "quantity": 12, "category": "Dairy"},
            {"name": "Tomatoes", "quantity": 6, "category": "Produce"}
        ]
    }

    encoded_data = base64.b64encode(json.dumps(sample_shopping_list).encode("utf-8")).decode("utf-8")

    # Test GET request with base64-encoded data parameter to render custom list
    params = {"data": encoded_data}
    try:
        resp_with_data = requests.get(base_url + endpoint, params=params, timeout=timeout)
        resp_with_data.raise_for_status()
        content_type_data = resp_with_data.headers.get("Content-Type", "")
        # Assert content type is HTML again
        assert "text/html" in content_type_data.lower(), f"Expected Content-Type text/html but got {content_type_data}"
        # Assert response body contains at least one item name from sample data as a substring (e.g. "Eggs" or "Tomatoes")
        text_lower = resp_with_data.text.lower()
        assert ("eggs" in text_lower or "tomatoes" in text_lower), "Custom shopping list HTML does not contain expected item names"
    except requests.RequestException as e:
        assert False, f"Request with data parameter failed: {e}"

test_shopping_list_html_public_endpoint()
