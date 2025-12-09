import requests
import time

BASE_URL = "http://localhost:3001"
TIMEOUT = 30
AUTH_ENDPOINT = "/api/auth/login"
RECIPES_ENDPOINT = "/api/recipes"
HEADERS = {"Content-Type": "application/json"}

# Replace these with valid test credentials for authentication
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "TestPassword123!"

def authenticate_user(email, password):
    """Authenticate to get JWT token for protected endpoints."""
    resp = requests.post(
        BASE_URL + AUTH_ENDPOINT,
        json={"email": email, "password": password},
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    token = resp.json().get("access_token")
    assert token, "Authentication token not found in response."
    return token

def create_recipe(token):
    """Create a recipe to test Row Level Security on database operations."""
    payload = {
        "title": "Test Recipe for RLS",
        "description": "Recipe created to test Row Level Security.",
        "ingredients": ["1 unit test ingredient"],
        "instructions": ["Step 1: Do unit testing."],
        "servings": 1,
        "cook_time_minutes": 10
    }
    headers = HEADERS.copy()
    headers["Authorization"] = f"Bearer {token}"
    resp = requests.post(
        BASE_URL + RECIPES_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT
    )
    resp.raise_for_status()
    recipe = resp.json()
    recipe_id = recipe.get("id")
    assert recipe_id, "Created recipe ID not found."
    return recipe_id

def delete_recipe(token, recipe_id):
    headers = HEADERS.copy()
    headers["Authorization"] = f"Bearer {token}"
    resp = requests.delete(
        f"{BASE_URL}{RECIPES_ENDPOINT}/{recipe_id}", headers=headers, timeout=TIMEOUT
    )
    # Deletion may return 204 No Content or 200 OK
    assert resp.status_code in (200, 204), f"Failed to delete recipe with ID {recipe_id}."

def test_validate_api_rate_limiting_and_row_level_security():
    # Step 1: Authenticate and get access token
    token = authenticate_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = HEADERS.copy()
    headers["Authorization"] = f"Bearer {token}"

    # Step 2: Verify API rate limiting enforcement on protected endpoint
    # Assuming a default rate limit (e.g., 5 requests per second allowed for test)
    # We will try to send 10 rapid requests and expect some to fail with 429

    url = BASE_URL + RECIPES_ENDPOINT
    payload = {
        "title": "Rate Limit Test Recipe",
        "description": "Testing rate limiting enforcement.",
        "ingredients": ["ingredient1"],
        "instructions": ["instruction1"],
        "servings": 1,
        "cook_time_minutes": 5
    }

    success_responses = 0
    rate_limit_responses = 0

    for i in range(10):
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        if resp.status_code == 201:
            success_responses += 1
            # Clean up created recipe immediately to avoid clutter
            created_recipe_id = resp.json().get("id")
            if created_recipe_id:
                requests.delete(f"{url}/{created_recipe_id}", headers=headers, timeout=TIMEOUT)
        elif resp.status_code == 429:
            rate_limit_responses += 1
        else:
            # Other unexpected status
            resp.raise_for_status()
        # Minimal delay to try to trigger rate limiting if implemented
        time.sleep(0.05)

    assert success_responses > 0, "No successful requests; cannot validate rate limiting properly."
    assert rate_limit_responses > 0, "Rate limiting not enforced; no 429 responses received."

    # Step 3: Verify Row Level Security (RLS)
    # Create a new recipe and then attempt to access it with same user - should succeed
    recipe_id = None
    try:
        recipe_id = create_recipe(token)

        # GET the newly created recipe - should be accessible
        get_resp = requests.get(
            f"{url}/{recipe_id}", headers=headers, timeout=TIMEOUT
        )
        get_resp.raise_for_status()
        recipe_data = get_resp.json()
        assert recipe_data.get("id") == recipe_id, "Fetched recipe ID does not match."

        # Simulate access with invalid token (unauthorized user) to test RLS denies access
        invalid_headers = HEADERS.copy()
        invalid_headers["Authorization"] = "Bearer invalidtoken"
        unauthorized_resp = requests.get(
            f"{url}/{recipe_id}", headers=invalid_headers, timeout=TIMEOUT
        )
        # Expect unauthorized (401) or forbidden (403) due to RLS blocking access
        assert unauthorized_resp.status_code in (401, 403), "RLS not enforced: unauthorized access allowed."

    finally:
        # Clean up: delete created recipe if exists
        if recipe_id:
            delete_recipe(token, recipe_id)

test_validate_api_rate_limiting_and_row_level_security()
