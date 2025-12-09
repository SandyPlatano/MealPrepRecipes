import requests

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_pwa_offline_functionality_and_service_worker_support():
    try:
        # 1. Verify service worker script is accessible and valid JS
        sw_response = requests.get(f"{BASE_URL}/sw.js", timeout=TIMEOUT)
        assert sw_response.status_code == 200, f"Service worker script not found: {sw_response.status_code}"
        assert sw_response.headers.get("content-type", "").startswith("application/javascript") or \
               sw_response.text.strip().startswith("self.") or \
               "serviceWorker" in sw_response.text, "Service worker script content invalid"

        # 2. Check main app page includes service worker registration script/tag
        main_page_response = requests.get(BASE_URL, timeout=TIMEOUT)
        assert main_page_response.status_code == 200, f"Main page not reachable: {main_page_response.status_code}"

        main_page_text = main_page_response.text.lower()
        # Look for typical service worker registration code snippet or keywords
        assert ("serviceworker.register" in main_page_text or 
                "navigator.serviceworker" in main_page_text), \
            "Service worker registration not detected in main page"

        # 3. Check caching headers for service worker script (e.g. Cache-Control)
        cache_control = sw_response.headers.get("cache-control", "").lower()
        assert "max-age" in cache_control or "immutable" in cache_control or "public" in cache_control, \
            "Service worker script missing appropriate caching headers"

        # 4. Attempt to access the offline page or offline route
        offline_response = requests.get(f"{BASE_URL}/offline", timeout=TIMEOUT)
        assert offline_response.status_code == 200, f"Offline page not reachable: {offline_response.status_code}"
        assert "offline" in offline_response.text.lower() or "you are offline" in offline_response.text.lower(), \
            "Offline page content does not indicate offline or PWA support"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_pwa_offline_functionality_and_service_worker_support()
