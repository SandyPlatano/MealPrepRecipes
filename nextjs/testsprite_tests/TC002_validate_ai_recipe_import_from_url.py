import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_validate_ai_recipe_import_from_url():
    url_to_import = "https://www.example.com/recipe/chocolate-cake"

    endpoint = f"{BASE_URL}/api/parse-recipe"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test_access_token"  # Use valid token here in real scenario
    }
    payload = {"url": url_to_import}

    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request to parse recipe failed: {e}"

    data = response.json()

    # Validate top-level keys presence
    assert "ingredients" in data, "Response missing 'ingredients'"
    assert "instructions" in data, "Response missing 'instructions'"
    assert "cook_time" in data, "Response missing 'cook_time'"

    # Validate ingredients is a non-empty list with strings
    ingredients = data["ingredients"]
    assert isinstance(ingredients, list), "'ingredients' should be a list"
    assert len(ingredients) > 0, "'ingredients' list is empty"
    for ingredient in ingredients:
        assert isinstance(ingredient, str), "Each ingredient should be a string"

    # Validate instructions is a non-empty list with strings
    instructions = data["instructions"]
    assert isinstance(instructions, list), "'instructions' should be a list"
    assert len(instructions) > 0, "'instructions' list is empty"
    for step in instructions:
        assert isinstance(step, str), "Each instruction step should be a string"

    # Validate cook_time is a positive integer or a non-empty string representing time
    cook_time = data["cook_time"]
    assert (isinstance(cook_time, int) and cook_time > 0) or (isinstance(cook_time, str) and cook_time.strip()), \
        "'cook_time' should be a positive integer or a non-empty string"


test_validate_ai_recipe_import_from_url()
