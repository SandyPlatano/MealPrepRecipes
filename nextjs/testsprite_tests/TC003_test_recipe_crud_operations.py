import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_recipe_crud_operations():
    headers = {
        "Content-Type": "application/json",
        # Add any required authentication headers here if applicable, e.g.:
        # "Authorization": "Bearer <token>",
    }

    recipe_data_create = {
        "title": "Test Recipe CRUD",
        "description": "Test description for CRUD operations",
        "ingredients": [
            {"name": "Tomato", "quantity": "2", "unit": "pcs"},
            {"name": "Salt", "quantity": "1", "unit": "tsp"}
        ],
        "instructions": [
            "Chop tomatoes.",
            "Add salt and mix well."
        ],
        "cook_time_minutes": 10,
        "servings": 2,
        # Add fields as defined by the API schema if needed
    }

    recipe_data_update = {
        "title": "Test Recipe CRUD Updated",
        "description": "Updated description after edit",
        "ingredients": [
            {"name": "Tomato", "quantity": "3", "unit": "pcs"},
            {"name": "Pepper", "quantity": "1", "unit": "tsp"}
        ],
        "instructions": [
            "Chop tomatoes finely.",
            "Add pepper and mix well."
        ],
        "cook_time_minutes": 15,
        "servings": 4,
    }

    recipe_id = None
    try:
        # CREATE recipe
        response_create = requests.post(
            f"{BASE_URL}/api/recipes",
            headers=headers,
            json=recipe_data_create,
            timeout=TIMEOUT
        )
        assert response_create.status_code == 201, f"Create failed: {response_create.text}"
        created_recipe = response_create.json()
        assert "id" in created_recipe, "Created recipe missing ID"
        recipe_id = created_recipe["id"]

        # READ recipe by ID to verify creation
        response_get = requests.get(
            f"{BASE_URL}/api/recipes/{recipe_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_get.status_code == 200, f"Get after create failed: {response_get.text}"
        fetched_recipe = response_get.json()
        assert fetched_recipe["title"] == recipe_data_create["title"], "Fetched title mismatch after create"
        assert fetched_recipe["description"] == recipe_data_create["description"], "Fetched description mismatch after create"
        assert len(fetched_recipe.get("ingredients", [])) == len(recipe_data_create["ingredients"]), "Fetched ingredients count mismatch"
        assert fetched_recipe["cook_time_minutes"] == recipe_data_create["cook_time_minutes"], "Fetched cook time mismatch"

        # UPDATE recipe
        response_update = requests.put(
            f"{BASE_URL}/api/recipes/{recipe_id}",
            headers=headers,
            json=recipe_data_update,
            timeout=TIMEOUT
        )
        assert response_update.status_code == 200, f"Update failed: {response_update.text}"
        updated_recipe = response_update.json()
        assert updated_recipe["title"] == recipe_data_update["title"], "Updated recipe title mismatch"

        # READ recipe to verify update
        response_get_updated = requests.get(
            f"{BASE_URL}/api/recipes/{recipe_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_get_updated.status_code == 200, f"Get after update failed: {response_get_updated.text}"
        fetched_updated_recipe = response_get_updated.json()
        assert fetched_updated_recipe["title"] == recipe_data_update["title"], "Fetched title mismatch after update"
        assert fetched_updated_recipe["description"] == recipe_data_update["description"], "Fetched description mismatch after update"
        assert len(fetched_updated_recipe.get("ingredients", [])) == len(recipe_data_update["ingredients"]), "Ingredients count mismatch after update"
        assert fetched_updated_recipe["cook_time_minutes"] == recipe_data_update["cook_time_minutes"], "Cook time mismatch after update"
        assert fetched_updated_recipe["servings"] == recipe_data_update["servings"], "Servings mismatch after update"

        # DELETE recipe
        response_delete = requests.delete(
            f"{BASE_URL}/api/recipes/{recipe_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_delete.status_code in (200, 204), f"Delete failed: {response_delete.text}"

        # VERIFY deletion by attempting to GET deleted recipe
        response_get_deleted = requests.get(
            f"{BASE_URL}/api/recipes/{recipe_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert response_get_deleted.status_code == 404, "Deleted recipe still accessible"

    finally:
        # Cleanup if recipe was created but test failed before deletion
        if recipe_id:
            try:
                requests.delete(f"{BASE_URL}/api/recipes/{recipe_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_recipe_crud_operations()
