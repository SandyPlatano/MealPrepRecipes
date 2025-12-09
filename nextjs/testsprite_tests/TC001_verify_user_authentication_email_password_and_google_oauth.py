import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_verify_user_authentication_email_password_and_google_oauth():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}

    # 1. Signup with email/password
    signup_payload = {
        "email": "testuser@example.com",
        "password": "StrongPassword123!"
    }
    try:
        signup_resp = session.post(
            f"{BASE_URL}/api/auth/signup",
            json=signup_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert signup_resp.status_code == 201, f"Signup failed: {signup_resp.text}"
        signup_data = signup_resp.json()
        assert "user" in signup_data and signup_data["user"]["email"] == signup_payload["email"]
        assert "onboardingRequired" in signup_data, "Missing onboarding info in signup response"

        # 2. Login with email/password
        login_payload = {
            "email": signup_payload["email"],
            "password": signup_payload["password"]
        }
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert "user" in login_data and login_data["user"]["email"] == signup_payload["email"]
        assert login_data.get("redirectTo") is not None, "No onboarding redirection URL after login"

        # 3. Simulate Google OAuth Login Flow
        # Step 1: Get Google OAuth URL
        oauth_url_resp = session.get(f"{BASE_URL}/api/auth/google/url", timeout=TIMEOUT)
        assert oauth_url_resp.status_code == 200, f"Failed to get Google OAuth URL: {oauth_url_resp.text}"
        oauth_url_data = oauth_url_resp.json()
        assert "url" in oauth_url_data and oauth_url_data["url"].startswith("https://accounts.google.com/o/oauth2")

        # We cannot perform real OAuth redirection and callback in a unit test without user interaction,
        # but we can test the OAuth callback API endpoint by simulating an OAuth callback with a dummy token.

        # Step 2: Simulate OAuth callback with invalid token (error case)
        fake_oauth_callback_payload = {
            "code": "fake_invalid_auth_code"
        }
        oauth_callback_resp = session.post(
            f"{BASE_URL}/api/auth/google/callback",
            json=fake_oauth_callback_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        # Should return error due to invalid code; expect 400 or 401 or similar
        assert oauth_callback_resp.status_code in (400, 401), \
            f"Expected failure for invalid OAuth code, got {oauth_callback_resp.status_code}"

    finally:
        # Cleanup: Delete the test user if created

        # Attempt login to get auth token for deletion
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json=signup_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        if login_resp.status_code == 200:
            login_data = login_resp.json()
            access_token = login_data.get("accessToken") or login_data.get("token")
            if access_token:
                auth_headers = headers.copy()
                auth_headers["Authorization"] = f"Bearer {access_token}"
                delete_resp = session.delete(
                    f"{BASE_URL}/api/users/me",
                    headers=auth_headers,
                    timeout=TIMEOUT,
                )
                # We allow 200 or 204 for success
                assert delete_resp.status_code in (200, 204), f"User deletion failed: {delete_resp.text}"


test_verify_user_authentication_email_password_and_google_oauth()