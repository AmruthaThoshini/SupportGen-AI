
const form = document.getElementById("supportForm");
const messageInput = document.getElementById("customerMessage");
const charCount = document.getElementById("charCount");
const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");
const toast = document.getElementById("toast");

const submitButton = form.querySelector('button[type="submit"]');
const API_URL = "http://127.0.0.1:5000/api/predict";

const historyNav = document.getElementById("historyNav");
const HISTORY_KEY = "supportgen_recent_activity";
const MAX_HISTORY = 20;

messageInput.addEventListener("input", () => {
  charCount.textContent = `${messageInput.value.length} / 3000`;
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function getHistory() {
  try {
    const history = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveActivity(message, result) {
  const history = getHistory();

  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    category: result.category,
    intent: result.intent,
    suggested_reply: result.suggested_reply,
    timestamp: new Date().toISOString()
  });

  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history.slice(0, MAX_HISTORY))
    );
  } catch (error) {
    console.error("Could not save recent activity:", error);
    showToast("Analysis succeeded, but activity could not be saved.");
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function displayResult(result) {
  document.getElementById("categoryValue").textContent =
    result.category;

  document.getElementById("intentValue").textContent =
    result.intent;

  document.getElementById("replyValue").value =
    result.suggested_reply;

  document.getElementById("nextActionValue").textContent =
    "Verify relevant order, payment, or account details in the " +
    "authorized system before taking action. Never claim an action " +
    "is complete without confirmation.";

  emptyState.classList.add("hidden");
  resultContent.classList.remove("hidden");
}

function renderHistory() {
  const history = getHistory();

  let panel = document.getElementById("activityPanel");

  if (!panel) {
    panel = document.createElement("section");
    panel.id = "activityPanel";
    panel.className = "activity-panel";

    panel.style.cssText = [
      "margin: 24px 0",
      "padding: 20px",
      "border: 1px solid var(--border-color, #ddd)",
      "border-radius: 12px",
      "background: var(--card-bg, #fff)",
      "color: var(--text-color, #222)"
    ].join(";");

    const app = document.querySelector(".app") || document.body;
    app.appendChild(panel);
  }

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between;
                align-items:center; gap:12px; flex-wrap:wrap;">
      <div>
        <h2 style="margin:0 0 6px;">Recent Activity</h2>
        <p style="margin:0; opacity:.75;">
          Your latest ${MAX_HISTORY} successful analyses on this browser.
        </p>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" id="backToDashboard"
                style="padding:9px 12px; cursor:pointer;">
          Back to dashboard
        </button>
        <button type="button" id="clearActivity"
                style="padding:9px 12px; cursor:pointer;">
          Clear history
        </button>
      </div>
    </div>
    <div id="activityList" style="margin-top:20px;"></div>
  `;

  const list = panel.querySelector("#activityList");

  if (history.length === 0) {
    list.innerHTML = `
      <p style="padding:20px 0; opacity:.75;">
        No activity yet. Analyze a customer message to see it here.
      </p>
    `;
  } else {
    list.innerHTML = history.map((item) => `
      <article style="padding:16px 0; border-top:1px solid
                      var(--border-color, #ddd);">
        <p style="margin:0 0 8px; font-size:12px; opacity:.7;">
          ${escapeHTML(formatDate(item.timestamp))}
        </p>
        <p style="margin:0 0 10px; overflow-wrap:anywhere;">
          <strong>Customer message:</strong>
          ${escapeHTML(item.message)}
        </p>
        <p style="margin:0 0 6px;">
          <strong>Category:</strong> ${escapeHTML(item.category)}
        </p>
        <p style="margin:0 0 10px;">
          <strong>Intent:</strong> ${escapeHTML(item.intent)}
        </p>
        <details>
          <summary style="cursor:pointer;">View suggested reply</summary>
          <p style="white-space:pre-wrap; overflow-wrap:anywhere;">
            ${escapeHTML(item.suggested_reply)}
          </p>
        </details>
        <button type="button"
                class="viewActivity"
                data-activity-id="${escapeHTML(item.id)}"
                style="margin-top:10px; padding:8px 12px; cursor:pointer;">
          View result on dashboard
        </button>
      </article>
    `).join("");
  }

  panel.querySelector("#backToDashboard").addEventListener(
    "click",
    () => {
      panel.remove();
      document.getElementById("supportForm").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );

  panel.querySelector("#clearActivity").addEventListener(
    "click",
    () => {
      if (!getHistory().length) {
        showToast("There is no activity to clear.");
        return;
      }

      if (!window.confirm("Clear all saved recent activity?")) {
        return;
      }

      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      showToast("Recent activity cleared.");
    }
  );

  panel.querySelectorAll(".viewActivity").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getHistory().find(
        (entry) => entry.id === button.dataset.activityId
      );

      if (!item) {
        showToast("This activity could not be found.");
        return;
      }

      displayResult(item);
      messageInput.value = item.message;
      charCount.textContent = `${item.message.length} / 3000`;

      panel.remove();

      document.getElementById("supportForm").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      showToast("Previous analysis loaded.");
    });
  });

  panel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    messageInput.focus();
    showToast("Enter a customer message first.");
    return;
  }

  if (message.length > 3000) {
    showToast("The message must be 3000 characters or fewer.");
    return;
  }

  submitButton.disabled = true;
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Analyzing...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `Request failed (${response.status}).`
      );
    }

    if (
      typeof result.category !== "string" ||
      typeof result.intent !== "string" ||
      typeof result.suggested_reply !== "string"
    ) {
      throw new Error("The backend returned an unexpected response.");
    }

    displayResult(result);
    saveActivity(message, result);
    showToast("Analysis received and activity saved.");

  } catch (error) {
    console.error("SupportGen API error:", error);

    if (error instanceof TypeError) {
      showToast(
        "Cannot reach the backend. Start Flask and try again."
      );
    } else {
      showToast(error.message || "Analysis failed. Please try again.");
    }

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

document.getElementById("copyReply").addEventListener(
  "click",
  async () => {
    const reply = document.getElementById("replyValue").value;

    if (!reply.trim()) {
      showToast("There is no reply to copy yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(reply);
      showToast("Suggested reply copied.");
    } catch {
      const field = document.getElementById("replyValue");
      field.select();

      showToast(
        document.execCommand("copy")
          ? "Suggested reply copied."
          : "Select and copy the reply manually."
      );
    }
  }
);

historyNav.addEventListener("click", (event) => {
  event.preventDefault();
  renderHistory();
});
