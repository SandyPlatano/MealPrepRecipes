/**
 * Options page script for Chrome extension
 */

const form = document.getElementById('settings-form');
const appUrlInput = document.getElementById('appUrl');
const testBtn = document.getElementById('test-btn');
const statusDiv = document.getElementById('status');

// Load saved settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['appUrl']);
  if (result.appUrl) {
    appUrlInput.value = result.appUrl;
  }
}

// Show status message
function showStatus(message, type = 'success') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type} show`;
  setTimeout(() => {
    statusDiv.classList.remove('show');
  }, 3000);
}

// Save settings
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const appUrl = appUrlInput.value.trim();
  
  if (!appUrl) {
    showStatus('Please enter an app URL', 'error');
    return;
  }

  // Validate URL format
  try {
    new URL(appUrl);
  } catch {
    showStatus('Please enter a valid URL', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ appUrl });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Failed to save settings: ' + error.message, 'error');
  }
});

// Test connection
testBtn.addEventListener('click', async () => {
  const appUrl = appUrlInput.value.trim();
  
  if (!appUrl) {
    showStatus('Please enter an app URL first', 'error');
    return;
  }

  try {
    new URL(appUrl);
  } catch {
    showStatus('Please enter a valid URL', 'error');
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = 'Testing...';
  statusDiv.textContent = 'Testing connection...';
  statusDiv.className = 'status show';

  try {
    // Test by calling the parse-recipe endpoint (it will fail without proper data, but we can check if the endpoint exists)
    const response = await fetch(`${appUrl}/api/parse-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    // We expect an error, but if we get a response, the endpoint exists
    if (response.status === 400 || response.status === 405) {
      showStatus('Connection successful! API endpoint is reachable.', 'success');
    } else {
      showStatus(`Connection successful! (Status: ${response.status})`, 'success');
    }
  } catch (error) {
    showStatus('Couldn't connect: ' + error.message + '. Is your app URL right?', 'error');
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = 'Test Connection';
  }
});

// Initialize
loadSettings();

