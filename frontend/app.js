
const API_BASE = "http://127.0.0.1:5000/api";

const $ = (id) => document.getElementById(id);

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.error
        ? data.error
        : `Request failed (${response.status})`
    );
  }

  return data;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function showMessage(message, isError = false) {
  let element = $("app-message");

  if (!element) {
    element = document.createElement("div");
    element.id = "app-message";
    element.setAttribute("role", "status");
    element.style.cssText =
      "padding:10px;margin:10px 0;border-radius:8px;";
    document.body.prepend(element);
  }

  element.textContent = message;
  element.style.color = isError ? "#b91c1c" : "#166534";
  element.style.background = isError ? "#fee2e2" : "#dcfce7";
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function setHTML(id, value) {
  const element = $(id);
  if (element) element.innerHTML = value;
}

function renderStats(stats) {
  const summary = stats.summary || {};

  // These IDs are supported if they exist in your dashboard HTML.
  setText("total-transactions", summary.total_transactions ?? 0);
  setText("totalTransactions", summary.total_transactions ?? 0);

  setText("high-risk", summary.high_risk ?? 0);
  setText("highRisk", summary.high_risk ?? 0);

  setText("medium-risk", summary.medium_risk ?? 0);
  setText("mediumRisk", summary.medium_risk ?? 0);

  setText("low-risk", summary.low_risk ?? 0);
  setText("lowRisk", summary.low_risk ?? 0);

  setText("blocked-transactions", summary.blocked ?? 0);
  setText("blockedTransactions", summary.blocked ?? 0);

  setText("needs-review", summary.needs_review ?? 0);
  setText("needsReview", summary.needs_review ?? 0);

  setText(
    "total-amount",
    formatCurrency(summary.total_amount ?? 0)
  );

  setText(
    "average-risk-score",
    `${Number(summary.average_risk_score ?? 0).toFixed(1)} / 100`
  );

  renderBreakdown(
    "transaction-type-breakdown",
    stats.by_transaction_type || [],
    "transaction_type"
  );

  renderBreakdown(
    "daily-volume",
    stats.daily_volume || [],
    "date"
  );
}

function renderBreakdown(containerId, items, labelField) {
  const container = $(containerId);
  if (!container) return;

  if (!items.length) {
    container.textContent = "No data available yet.";
    return;
  }

  container.innerHTML = items.map((item) => {
    const label = escapeHTML(item[labelField]);
    const count = Number(item.count) || 0;

    return `
      <div class="breakdown-row">
        <span>${label}</span>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");
}

function renderTransactions(transactions) {
  const tableBody = $("transaction-table-body")
    || $("transactions-body")
    || $("transactionHistoryBody");

  if (!tableBody) {
    console.warn(
      "Transaction table body not found. Add id='transaction-table-body' to your tbody."
    );
    return;
  }

  if (!transactions.length) {
    tableBody.innerHTML =
      '<tr><td colspan="8">No transactions found.</td></tr>';
    return;
  }

  tableBody.innerHTML = transactions.map((tx) => `
    <tr>
      <td>${escapeHTML(tx.transaction_id)}</td>
      <td>${escapeHTML(formatCurrency(tx.amount))}</td>
      <td>${escapeHTML(tx.transaction_type)}</td>
      <td>${escapeHTML(tx.risk_score)} / 100</td>
      <td>${escapeHTML(tx.risk_level)}</td>
      <td>${escapeHTML(tx.decision)}</td>
      <td>${escapeHTML(tx.review_status || "New")}</td>
      <td>
        <button
          type="button"
          data-review-id="${escapeHTML(tx.transaction_id)}"
          ${tx.review_status === "Reviewed" ? "disabled" : ""}
        >
          ${tx.review_status === "Reviewed" ? "Reviewed" : "Mark reviewed"}
        </button>
      </td>
    </tr>
  `).join("");
}

async function loadStats() {
  try {
    const stats = await apiRequest("/stats");
    renderStats(stats);
  } catch (error) {
    console.error("Failed to load statistics:", error);
    showMessage(`Could not load dashboard statistics: ${error.message}`, true);
  }
}

async function loadTransactions() {
  try {
    const params = new URLSearchParams();

    const search = $("transaction-search")?.value?.trim();
    const riskLevel = $("risk-filter")?.value;
    const decision = $("decision-filter")?.value;
    const transactionType = $("type-filter")?.value;

    if (search) params.set("q", search);
    if (riskLevel) params.set("risk_level", riskLevel);
    if (decision) params.set("decision", decision);
    if (transactionType) params.set("transaction_type", transactionType);

    // The API returns a plain array when no filters are selected.
    const query = params.toString();
    const result = await apiRequest(
      `/transactions${query ? `?${query}` : ""}`
    );

    const transactions = Array.isArray(result)
      ? result
      : result.items || [];

    renderTransactions(transactions);
  } catch (error) {
    console.error("Failed to load transactions:", error);
    showMessage(`Could not load transaction history: ${error.message}`, true);
  }
}

async function analyzeTransaction(event) {
  event?.preventDefault();

  const transactionId = $("transaction_id")?.value?.trim();
  const amount = $("amount")?.value;
  const transactionType = $("transaction_type")?.value;
  const failedAttempts = $("failed_attempts")?.value ?? "0";
  const device = $("device")?.value ?? "known";
  const location = $("location")?.value ?? "usual";

  if (!transactionId || !amount || !transactionType) {
    showMessage(
      "Enter the transaction ID, amount, and transaction type.",
      true
    );
    return;
  }

  const payload = {
    transaction_id: transactionId,
    amount: Number(amount),
    transaction_type: transactionType,
    failed_attempts: Number(failedAttempts),
    device,
    location,
  };

  try {
    const result = await apiRequest("/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showMessage(
      `Analysis complete: ${result.risk_level} risk — ${result.decision}.`
    );

    renderAnalysisResult(result);
    await Promise.all([loadStats(), loadTransactions()]);
  } catch (error) {
    console.error("Transaction analysis failed:", error);
    showMessage(`Analysis failed: ${error.message}`, true);
  }
}

function renderAnalysisResult(result) {
  const container = $("analysis-result");
  if (!container) {
    console.log("Analysis result:", result);
    return;
  }

  const reasons = Array.isArray(result.reasons)
    ? result.reasons
    : [];

  container.innerHTML = `
    <h3>Analysis Result</h3>
    <p><strong>Transaction:</strong> ${escapeHTML(result.transaction_id)}</p>
    <p><strong>Risk Score:</strong> ${escapeHTML(result.risk_score)} / 100</p>
    <p><strong>Risk Level:</strong> ${escapeHTML(result.risk_level)}</p>
    <p><strong>Decision:</strong> ${escapeHTML(result.decision)}</p>
    <p><strong>Reasons:</strong></p>
    <ul>
      ${reasons.map((reason) => `<li>${escapeHTML(reason)}</li>`).join("")}
    </ul>
  `;
}

async function markReviewed(transactionId) {
  const note = window.prompt(
    "Enter an investigation note (optional):",
    ""
  );

  if (note === null) return;

  try {
    await apiRequest(
      `/transactions/${encodeURIComponent(transactionId)}/review`,
      {
        method: "PATCH",
        body: JSON.stringify({
          review_status: "Reviewed",
          review_note: note,
        }),
      }
    );

    showMessage(`Transaction ${transactionId} marked as reviewed.`);
    await Promise.all([loadStats(), loadTransactions()]);
  } catch (error) {
    console.error("Review update failed:", error);
    showMessage(`Could not update review: ${error.message}`, true);
  }
}

function exportCSV() {
  window.location.href = `${API_BASE}/transactions/export.csv`;
}

function setupDashboard() {
  const form = $("transaction-form");
  if (form) {
    form.addEventListener("submit", analyzeTransaction);
  }

  // Supports the original button ID if your HTML uses it.
  const analyzeButton = $("analyze-btn");
  if (analyzeButton && !form) {
    analyzeButton.addEventListener("click", analyzeTransaction);
  }

  ["transaction-search", "risk-filter", "decision-filter", "type-filter"]
    .forEach((id) => {
      const element = $(id);
      if (!element) return;

      element.addEventListener(
        id === "transaction-search" ? "input" : "change",
        loadTransactions
      );
    });

  const exportButton = $("export-csv");
  if (exportButton) {
    exportButton.addEventListener("click", exportCSV);
  }

  const refreshButton = $("refresh-dashboard");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await Promise.all([loadStats(), loadTransactions()]);
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-id]");
    if (button) {
      markReviewed(button.dataset.reviewId);
    }
  });

  Promise.all([loadStats(), loadTransactions()]).catch(console.error);
}

document.addEventListener("DOMContentLoaded", setupDashboard);
