import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_weekly_meal_planning_drag_and_drop_functionality():
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_ACCESS_TOKEN"  # Added placeholder Authorization header
    }

    # Step 1: Create a sample recipe to use in the meal plan
    recipe_payload = {
        "title": "Test Recipe for Meal Planning",
        "description": "A recipe to test meal planning drag-and-drop functionality.",
        "ingredients": [
            {"name": "Ingredient 1", "quantity": "1 cup"},
            {"name": "Ingredient 2", "quantity": "2 tbsp"}
        ],
        "instructions": [
            "Step 1: Do something",
            "Step 2: Do something else"
        ],
        "servings": 2,
        "cookTimeMinutes": 30
    }
    recipe_id = None
    meal_plan_id = None

    try:
        # Create the recipe
        create_recipe_resp = requests.post(
            f"{BASE_URL}/api/recipes",
            json=recipe_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_recipe_resp.status_code == 201, f"Recipe creation failed: {create_recipe_resp.text}"
        recipe_data = create_recipe_resp.json()
        recipe_id = recipe_data.get("id")
        assert recipe_id is not None, "Recipe ID missing in creation response"

        # Step 2: Create a new weekly meal plan (empty initially)
        new_plan_payload = {
            "weekStartDate": "2025-12-08",  # Monday date for the meal plan week
            "title": "Test Weekly Meal Plan"
        }
        create_plan_resp = requests.post(
            f"{BASE_URL}/api/meal-plans",
            json=new_plan_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_plan_resp.status_code == 201, f"Meal plan creation failed: {create_plan_resp.text}"
        plan_data = create_plan_resp.json()
        meal_plan_id = plan_data.get("id")
        assert meal_plan_id is not None, "Meal plan ID missing in creation response"

        # Step 3: Assign a recipe to a day and meal slot (simulate drag-and-drop)
        # Also assign cook and adjust servings
        # Example: Assign recipe to Tuesday dinner slot with cook "Jane Doe" and servings 4
        meal_slot_payload = {
            "recipeId": recipe_id,
            "day": "Tuesday",
            "meal": "dinner",
            "assignedCook": "Jane Doe",
            "servings": 4
        }
        assign_resp = requests.put(
            f"{BASE_URL}/api/meal-plans/{meal_plan_id}/meal-slot",
            json=meal_slot_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert assign_resp.status_code == 200, f"Assigning meal slot failed: {assign_resp.text}"
        assign_data = assign_resp.json()
        assert assign_data.get("recipeId") == recipe_id, "Recipe ID mismatch in assigned meal slot"
        assert assign_data.get("day") == "Tuesday", "Day mismatch in assigned meal slot"
        assert assign_data.get("meal") == "dinner", "Meal mismatch in assigned meal slot"
        assert assign_data.get("assignedCook") == "Jane Doe", "Cook assignment mismatch"
        assert assign_data.get("servings") == 4, "Servings mismatch"

        # Step 4: Save/Finalize the meal plan (simulate user saving the plan after drag-and-drop)
        finalize_payload = {
            "status": "finalized"
        }
        finalize_resp = requests.put(
            f"{BASE_URL}/api/meal-plans/{meal_plan_id}/status",
            json=finalize_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert finalize_resp.status_code == 200, f"Finalizing meal plan failed: {finalize_resp.text}"
        finalize_data = finalize_resp.json()
        assert finalize_data.get("status") == "finalized", "Meal plan status not updated to finalized"

        # Step 5: Retrieve the meal plan to verify updates persisted correctly
        get_plan_resp = requests.get(
            f"{BASE_URL}/api/meal-plans/{meal_plan_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_plan_resp.status_code == 200, f"Fetching meal plan failed: {get_plan_resp.text}"
        plan_details = get_plan_resp.json()

        slots = plan_details.get("mealSlots", [])
        matched_slot = next((slot for slot in slots if slot.get("recipeId") == recipe_id and slot.get("day") == "Tuesday" and slot.get("meal") == "dinner"), None)
        assert matched_slot is not None, "Assigned meal slot missing in meal plan"
        assert matched_slot.get("assignedCook") == "Jane Doe", "Cook assignment mismatch on meal plan retrieval"
        assert matched_slot.get("servings") == 4, "Servings mismatch on meal plan retrieval"

    finally:
        # Clean up: Delete the created meal plan and recipe
        if meal_plan_id:
            try:
                del_plan_resp = requests.delete(
                    f"{BASE_URL}/api/meal-plans/{meal_plan_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert del_plan_resp.status_code in (200,204), f"Meal plan deletion failed: {del_plan_resp.text}"
            except Exception:
                pass
        if recipe_id:
            try:
                del_recipe_resp = requests.delete(
                    f"{BASE_URL}/api/recipes/{recipe_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert del_recipe_resp.status_code in (200,204), f"Recipe deletion failed: {del_recipe_resp.text}"
            except Exception:
                pass

test_weekly_meal_planning_drag_and_drop_functionality()
