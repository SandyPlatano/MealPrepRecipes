import requests
import time

BASE_URL = "http://localhost:3001"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_cooking_history_tracking_and_recipe_rating_update():
    # Step 1: Create a new recipe to test cooking and rating update
    recipe_payload = {
        "title": "Test Recipe for Cooking History",
        "description": "A recipe used for testing cooking history and rating update",
        "ingredients": [
            {"name": "Ingredient A", "quantity": "1 cup"},
            {"name": "Ingredient B", "quantity": "2 tbsp"}
        ],
        "instructions": [
            "Step 1: Do something",
            "Step 2: Do something else"
        ],
        "servings": 2,
        "cook_time_minutes": 15
    }
    recipe_id = None

    try:
        # Create recipe
        response = requests.post(
            f"{BASE_URL}/api/recipes",
            json=recipe_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        created_recipe = response.json()
        recipe_id = created_recipe.get("id")
        assert recipe_id is not None, "Recipe ID should be returned after creation"

        # Step 2: Start cooking the created recipe (log cooking event)
        cook_start_payload = {"event": "start"}
        response = requests.post(
            f"{BASE_URL}/api/recipes/{recipe_id}/cook",
            json=cook_start_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on cooking start, got {response.status_code}"
        cook_start_data = response.json()
        assert cook_start_data.get("status") == "cooking_started", "Cooking start event not logged correctly"

        # Simulate some cooking duration
        time.sleep(1)

        # Step 3: Stop cooking the recipe (log cooking completion event)
        cook_stop_payload = {"event": "stop"}
        response = requests.post(
            f"{BASE_URL}/api/recipes/{recipe_id}/cook",
            json=cook_stop_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on cooking stop, got {response.status_code}"
        cook_stop_data = response.json()
        assert cook_stop_data.get("status") == "cooking_completed", "Cooking stop event not logged correctly"

        # Step 4: Fetch cooking history for the recipe to confirm event logging
        response = requests.get(
            f"{BASE_URL}/api/recipes/{recipe_id}/history",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on fetching cooking history, got {response.status_code}"
        history_data = response.json()
        events = history_data.get("events", [])
        assert any(e["event"] == "start" for e in events), "Cooking start event missing in history"
        assert any(e["event"] == "stop" for e in events), "Cooking stop event missing in history"

        # Step 5: Submit a rating update for the cooked recipe
        rating_payload = {"rating": 4}  # Rate 4 stars
        response = requests.post(
            f"{BASE_URL}/api/recipes/{recipe_id}/rate",
            json=rating_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on rating update, got {response.status_code}"
        rating_response = response.json()
        updated_rating = rating_response.get("rating")
        updated_rating_count = rating_response.get("rating_count")
        assert updated_rating is not None, "Updated rating not returned"
        assert updated_rating_count is not None and updated_rating_count > 0, "Updated rating count invalid"

        # Step 6: Validate that the recipe details reflect the updated rating
        response = requests.get(
            f"{BASE_URL}/api/recipes/{recipe_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code == 200, f"Expected 200 OK on fetching updated recipe, got {response.status_code}"
        recipe_data = response.json()
        assert abs(recipe_data.get("rating") - updated_rating) < 0.01, "Recipe rating not updated correctly"
        assert recipe_data.get("rating_count") == updated_rating_count, "Recipe rating count not updated correctly"

    finally:
        # Cleanup - delete the created recipe
        if recipe_id:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/api/recipes/{recipe_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                assert del_resp.status_code == 204, f"Expected 204 No Content on recipe deletion, got {del_resp.status_code}"
            except Exception as cleanup_err:
                print(f"Cleanup failed for recipe {recipe_id}: {cleanup_err}")

test_cooking_history_tracking_and_recipe_rating_update()
