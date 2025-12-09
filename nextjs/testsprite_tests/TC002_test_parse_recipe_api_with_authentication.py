import requests

def test_parse_recipe_api_with_authentication():
    base_url = "http://localhost:3001"
    recipe_text = (
        "Chicken Stir Fry\n\nIngredients:\n- 1 lb chicken breast\n- 2 cups rice\n\n"
        "Instructions:\n1. Cook chicken\n2. Serve with rice"
    )
    parse_endpoint = base_url + "/api/parse-recipe"
    auth_endpoint = base_url + "/api/test-auth"

    session = requests.Session()
    try:
        # Authenticate first
        auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
        auth_resp = session.post(auth_endpoint, json=auth_payload, timeout=30)
        assert auth_resp.status_code == 200, f"Authentication failed with status {auth_resp.status_code}"
        auth_data = auth_resp.json()
        assert auth_data.get("success") is True, "Authentication response missing 'success': True"
        assert "token" in auth_data or "access_token" in auth_data, "Authentication tokens missing"
        assert "user" in auth_data and isinstance(auth_data["user"], dict), "User info missing or invalid"

        # Authenticated request to /api/parse-recipe
        parse_payload = {"text": recipe_text}
        parse_resp = session.post(parse_endpoint, json=parse_payload, timeout=30)
        assert parse_resp.status_code == 200, f"Parse recipe failed with status {parse_resp.status_code}"
        recipe_data = parse_resp.json()

        # Validate that structured recipe data keys exist
        assert isinstance(recipe_data, dict), "Parsed recipe response is not a JSON object"
        assert "title" in recipe_data and isinstance(recipe_data["title"], str) and recipe_data["title"], "Missing or invalid 'title'"
        assert "ingredients" in recipe_data and isinstance(recipe_data["ingredients"], list) and recipe_data["ingredients"], "Missing or invalid 'ingredients'"
        assert "instructions" in recipe_data and isinstance(recipe_data["instructions"], list) and recipe_data["instructions"], "Missing or invalid 'instructions'"
        assert "tags" in recipe_data and isinstance(recipe_data["tags"], list), "Missing or invalid 'tags'"

    finally:
        session.close()

    # Test unauthenticated request to /api/parse-recipe returns 401
    unauth_payload = {"text": recipe_text}
    unauth_resp = requests.post(parse_endpoint, json=unauth_payload, timeout=30)
    assert unauth_resp.status_code == 401, f"Unauthenticated request did not return 401, got {unauth_resp.status_code}"

test_parse_recipe_api_with_authentication()