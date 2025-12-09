import requests

def test_parse_recipe_api_with_html_content():
    base_url = "http://localhost:3001"
    session = requests.Session()
    timeout = 30

    # Authenticate first
    auth_payload = {"email": "test@testsprite.dev", "password": "TestSprite123!"}
    auth_response = session.post(f"{base_url}/api/test-auth", json=auth_payload, timeout=timeout)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"

    # Sample recipe HTML content
    sample_html = """
    <html>
      <head><title>Test Recipe</title></head>
      <body>
        <h1>Chocolate Chip Cookies</h1>
        <div class="ingredients">
          <ul>
            <li>1 cup sugar</li>
            <li>2 cups flour</li>
            <li>1 cup chocolate chips</li>
            <li>1/2 cup butter</li>
            <li>2 eggs</li>
          </ul>
        </div>
        <div class="instructions">
          <ol>
            <li>Preheat oven to 350 degrees F (175 degrees C).</li>
            <li>Cream together the sugar and butter.</li>
            <li>Beat in the eggs one at a time.</li>
            <li>Stir in the flour and chocolate chips.</li>
            <li>Drop by spoonfuls onto ungreased cookie sheets.</li>
            <li>Bake for 10-12 minutes or until edges are nicely browned.</li>
          </ol>
        </div>
        <div class="cook-times">
          <p>Prep Time: 15 mins</p>
          <p>Cook Time: 12 mins</p>
          <p>Total Time: 27 mins</p>
        </div>
      </body>
    </html>
    """
    source_url = "http://example.com/test-recipe"

    parse_payload = {"htmlContent": sample_html, "sourceUrl": source_url}
    response = session.post(f"{base_url}/api/parse-recipe", json=parse_payload, timeout=timeout)

    assert response.status_code == 200, f"Parse recipe API failed: {response.status_code} {response.text}"

    json_data = response.json()
    # Check for expected keys in the returned structure
    # The exact response schema is not fully given, but per the requirement, expect ingredients, instructions, cook times
    assert isinstance(json_data, dict), "Response is not a JSON object"
    assert "ingredients" in json_data, "Response missing 'ingredients'"
    assert "instructions" in json_data, "Response missing 'instructions'"
    assert "cookTimes" in json_data or "cook_times" in json_data, "Response missing 'cookTimes' or 'cook_times'"
    
    ingredients = json_data.get("ingredients")
    instructions = json_data.get("instructions")
    cook_times = json_data.get("cookTimes") or json_data.get("cook_times")

    assert isinstance(ingredients, list) and len(ingredients) > 0, "Ingredients list is empty or invalid"
    assert isinstance(instructions, list) and len(instructions) > 0, "Instructions list is empty or invalid"
    assert isinstance(cook_times, dict) or isinstance(cook_times, list), "Cook times format unexpected or empty"

    # Verify some known ingredients and steps appear in parsed results (case insensitive)
    ingredients_text = " ".join(str(i).lower() for i in ingredients)
    instructions_text = " ".join(str(i).lower() for i in instructions)

    assert "sugar" in ingredients_text, "Parsed ingredients missing expected 'sugar'"
    assert "flour" in ingredients_text, "Parsed ingredients missing expected 'flour'"
    assert "chocolate" in ingredients_text, "Parsed ingredients missing expected 'chocolate'"
    assert any("preheat" in step.lower() for step in instructions), "Parsed instructions missing expected 'preheat'"
    assert any("bake" in step.lower() for step in instructions), "Parsed instructions missing expected 'bake'"

    # Check cook times content if dict
    if isinstance(cook_times, dict):
        times_values = " ".join(str(v).lower() for v in cook_times.values())
        assert any(x in times_values for x in ["prep", "cook", "total"]), "Cook times missing 'prep', 'cook' or 'total'"

# Call the test function
test_parse_recipe_api_with_html_content()