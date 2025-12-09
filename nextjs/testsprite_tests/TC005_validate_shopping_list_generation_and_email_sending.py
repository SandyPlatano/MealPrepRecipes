import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def create_recipe():
    url = f"{BASE_URL}/api/recipes/new"
    payload = {
        "title": f"Test Recipe {uuid.uuid4()}",
        "ingredients": [
            {"name": "Tomato", "quantity": 2, "unit": "pieces", "category": "Vegetables"},
            {"name": "Cheese", "quantity": 200, "unit": "grams", "category": "Dairy"}
        ],
        "instructions": ["Cut tomatoes", "Add cheese"],
        "cook_time_minutes": 20,
        "servings": 2
    }
    response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()['id']

def create_meal_plan(recipe_id):
    url = f"{BASE_URL}/api/meal-plans"
    payload = {
        "week_start_date": "2025-12-07",
        "meals": [
            {
                "day": "Monday",
                "meal_time": "Dinner",
                "recipe_id": recipe_id,
                "servings": 2,
                "assigned_cook": "Test User"
            }
        ]
    }
    response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()['id']

def get_shopping_list(meal_plan_id):
    url = f"{BASE_URL}/api/shopping-lists/generated"
    params = {"meal_plan_id": meal_plan_id}
    response = requests.get(url, params=params, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()

def send_shopping_list_email(shopping_list_id):
    url = f"{BASE_URL}/api/send-shopping-list"
    payload = {
        "shopping_list_id": shopping_list_id,
        "email": "testuser@example.com"
    }
    response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    return response

def delete_meal_plan(meal_plan_id):
    url = f"{BASE_URL}/api/meal-plans/{meal_plan_id}"
    response = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()

def delete_recipe(recipe_id):
    url = f"{BASE_URL}/api/recipes/{recipe_id}"
    response = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()

def test_validate_shopping_list_generation_and_email_sending():
    recipe_id = None
    meal_plan_id = None
    try:
        # Step 1: Create a recipe resource
        recipe_id = create_recipe()
        assert recipe_id, "Recipe creation failed: no id returned"

        # Step 2: Create a meal plan using the recipe
        meal_plan_id = create_meal_plan(recipe_id)
        assert meal_plan_id, "Meal plan creation failed: no id returned"

        # Step 3: Get auto-generated shopping list for the meal plan
        shopping_list = get_shopping_list(meal_plan_id)
        assert shopping_list, "No shopping list generated"
        assert "items" in shopping_list and isinstance(shopping_list["items"], list), "Shopping list items missing or invalid"

        # Validate categorization of items
        categories = set()
        items = shopping_list["items"]
        assert len(items) > 0, "Shopping list contains no items"
        for item in items:
            assert "category" in item and item["category"], f"Item {item.get('name')} missing category"
            categories.add(item["category"])
            assert "name" in item and item["name"], "Shopping list item missing name"
            assert "quantity" in item and item["quantity"], "Shopping list item missing quantity"

        assert len(categories) > 0, "Shopping list items have no categories"

        # Step 4: Send shopping list email
        shopping_list_id = shopping_list.get("id")
        assert shopping_list_id, "Shopping list id missing for email sending"

        email_response = send_shopping_list_email(shopping_list_id)
        assert email_response.status_code == 200, f"Failed to send shopping list email: {email_response.status_code} {email_response.text}"
        email_result = email_response.json()
        assert email_result.get("success") is True, "Shopping list email sending was not successful"

    finally:
        # Cleanup resources
        if meal_plan_id:
            try:
                delete_meal_plan(meal_plan_id)
            except Exception:
                pass
        if recipe_id:
            try:
                delete_recipe(recipe_id)
            except Exception:
                pass

test_validate_shopping_list_generation_and_email_sending()
