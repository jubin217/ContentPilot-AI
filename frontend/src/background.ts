// ContentPilot AI Background Script

const BACKEND_URL = "http://127.0.0.1:8000";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "apiCall") {
    const { endpoint, method, body } = message.payload;
    const url = `${BACKEND_URL}${endpoint}`;

    fetch(url, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("API Call error in background:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }
});
