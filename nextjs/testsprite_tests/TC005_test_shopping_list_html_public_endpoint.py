import requests

base_url = "http://localhost:3001"

def test_shopping_list_html_public_endpoint():
    try:
        response = requests.get(f"{base_url}/api/shopping-list-html", timeout=30)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        content_type = response.headers.get("Content-Type", "")
        assert "text/html" in content_type, f"Expected Content-Type to include 'text/html', got '{content_type}'"
        text = response.text
        assert "Shopping" in text, "Response HTML does not contain 'Shopping'"
        assert "<html" in text.lower() and "</html>" in text.lower(), "Response does not contain valid HTML tags"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_shopping_list_html_public_endpoint()