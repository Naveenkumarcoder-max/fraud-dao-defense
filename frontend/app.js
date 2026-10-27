
"use strict";

/*
 * FraudShield frontend demo.
 * Uses illustrative sample data and transparent demo rules.
 * Not connected to a bank, production fraud model, or live data feed.
 */

const $ = (selector) => document.querySelector(selector);

const state = {
  currentPage: "overview",
  period: "7",
  transactions: [
    { id: "TXN-10241", customer: "Aarav Sharma", initials: "AS", amount: 2450, type: "UPI", score: 12, status: "Approved", time: "Today, 09:42 AM" },
    { id: "TXN-10240", customer: "Priya Patel", initials: "PP", amount: 87500, type: "Bank Transfer", score: 91, status: "Blocked", time: "Today, 09:38 AM" },
    { id: "TXN-10239", customer: "Rohan Mehta", initials: "RM", amount: 12800, type: "Card", score: 58, status: "Review", time: "Today, 09:31 AM" },
    { id: "TXN-10238", customer: "Ananya Rao", initials: "AR", amount: 950, type: "UPI", score: 8, status: "Approved", time: "Today, 09:26 AM" },
    { id: "TXN-10237", customer: "Kabir Singh", initials: "KS", amount: 64900, type: "Wallet", score: 78, status: "Review", time: "Today, 09:19 AM" },
    { id: "TXN-10236", customer: "Diya Nair", initials: "DN", amount: 3200, type: "Card", score: 16, status: "Approved", time: "Today, 09:12 AM" },
    { id: "TXN-10235", customer: "Ishaan Verma", initials: "IV", amount: 152000, type: "Bank Transfer", score: 96, status: "Blocked", time: "Today, 09:04 AM" },
    { id: "TXN-10234", customer: "Meera Iyer", initials: "MI", amount: 5400, type: "UPI", score: 33, status: "Approved", time: "Today, 08:57 AM" }
  ],
  alerts: [
    { icon: "⚑", color: "pink", title: "Unusual transaction amount", detail: "TXN-10240 · ₹87,500", time: "2 min ago", severity: "High" },
    { icon: "◎", color: "orange", title: "Identity verification review", detail: "DAO application · DAO-0082", time: "12 min ago", severity: "Medium" },
    { icon: "⌁", color: "purple", title: "Multiple failed attempts", detail: "TXN-10237 · 5 attempts", time: "24 min ago", severity: "Medium" }
  ],
  daoApplications: [
    { id: "DAO-0084", name: "Kavya Menon", method: "Document + OTP", score: 8, status: "Verified" },
    { id: "DAO-0083", name: "Arjun Das", method: "Document + OTP", score: 27, status: "Verified" },
    { id: "DAO-0082", name: "Sample Applicant 082", method: "Document review", score: 76, status: "Review" },
    { id: "DAO-0081", name: "Sample Applicant 081", method: "OTP verification", score: 91, status: "Flagged" }
  ],
  investigations: [
    { id: "CASE-003", title: "High-value transfer review", detail: "TXN-10240", priority: "High", status: "Open" },
    { id: "CASE-002", title: "Identity mismatch review", detail: "DAO-0082", priority: "Medium", status: "Open" },
    { id: "CASE-001", title: "Repeated failed attempts", detail: "TXN-10237", priority: "Medium", status: "In progress" }
  ]
};

const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
}).format(amount);

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[char]);

function riskLevel(score) {
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function statusClass(status) {
  return ({
    Approved: "status-approved",
    Verified: "status-approved",
    "Low Risk": "status-approved",
    Review: "status-review",
    Pending: "status-review",
    "In progress": "status-review",
    Blocked: "status-blocked",
    Flagged: "status-blocked",
    Open: "status-blocked"
  })[status] || "status-review";
}

function renderTransactionRows(items = state.transactions.slice(0, 5)) {
  const body = $("#transaction-body");
  if (!body) return;

  if (!items.length) {
    body.innerHTML = `<tr><td colspan="5">No matching transactions found.</td></tr>`;
    return;
  }

  body.innerHTML = items.map((tx) => {
    const level = riskLevel(tx.score);
    return `
      <tr>
        <td>
          <span class="txn-id">${escapeHTML(tx.id)}</span>
          <span class="txn-date">${escapeHTML(tx.time)}</span>
        </td>
        <td class="amount">${money(tx.amount)}</td>
        <td><span class="risk-score score-${level}"><i></i>${tx.score}/100</span></td>
        <td><span class="status-pill ${statusClass(tx.status)}">${escapeHTML(tx.status)}</span></td>
        <td><button class="row-action" data-txn="${escapeHTML(tx.id)}" aria-label="View ${escapeHTML(tx.id)}">···</button></td>
      </tr>`;
  }).join("");

  $("#transaction-count").textContent =
    `Showing ${items.length} of ${state.transactions.length} demo transactions`;
}

function renderAlerts() {
  const container = $("#alerts-list");
  if (!container) return;

  if (!state.alerts.length) {
    container.innerHTML = `<p>No active demo alerts. You're all caught up!</p>`;
  } else {
    container.innerHTML = state.alerts.slice(0, 4).map((alert, index) => `
      <div class="alert-item">
        <div class="alert-icon ${escapeHTML(alert.color)}">${escapeHTML(alert.icon)}</div>
        <div class="alert-copy">
          <strong>${escapeHTML(alert.title)}</strong>
          <p>${escapeHTML(alert.detail)}</p>
          <span class="alert-time">${escapeHTML(alert.time)} · ${escapeHTML(alert.severity)}</span>
        </div>
        <button class="row-action" data-alert="${index}" aria-label="Review alert">···</button>
      </div>`).join("");
  }

  $("#alert-number").textContent = state.alerts.length;
  $(".alert-count").textContent = state.alerts.length;
}

function drawActivityChart() {
  const canvas = $("#activity-chart");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const left = 34, right = 9, top = 10, bottom = 25;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const labels = state.period === "1"
    ? ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM"]
    : state.period === "30"
      ? ["Week 1", "Week 2", "Week 3", "Week 4", "Today"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const values = state.period === "1"
    ? [22, 39, 31, 65, 51, 76, 59]
    : state.period === "30"
      ? [42, 68, 51, 82, 64]
      : [44, 65, 49, 78, 58, 87, 69];

  const flagged = state.period === "1"
    ? [5, 12, 9, 18, 14, 24, 16]
    : state.period === "30"
      ? [12, 20, 17, 28, 21]
      : [12, 19, 14, 25, 17, 30, 22];

  ctx.clearRect(0, 0, width, height);
  ctx.font = '10px "DM Sans", sans-serif';
  ctx.textAlign = "right";

  for (let i = 0; i <= 4; i++) {
    const y = top + plotH * i / 4;
    ctx.beginPath();
    ctx.strokeStyle = "#f0edf6";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#aaa3b8";
    ctx.fillText(String(100 - i * 25), left - 9, y + 3);
  }

  const xAt = (i) => left + (plotW * i / (labels.length - 1));
  const yAt = (value) => top + plotH * (1 - value / 100);

  function drawArea(data, color, fillColor) {
    ctx.beginPath();
    data.forEach((value, i) => {
      const x = xAt(i), y = yAt(value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(xAt(data.length - 1), top + plotH);
    ctx.lineTo(xAt(0), top + plotH);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, top, 0, top + plotH);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(1, "#ffffff00");
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    data.forEach((value, i) => {
      const x = xAt(i), y = yAt(value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    data.forEach((value, i) => {
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(value), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  drawArea(values, "#8b69f5", "#8b69f535");
  drawArea(flagged, "#f17ea5", "#f17ea51b");

  ctx.textAlign = "center";
  ctx.fillStyle = "#9992a9";
  labels.forEach((label, i) => {
    ctx.fillText(label, xAt(i), height - 6);
  });
}

function drawRiskDistribution() {
  const scores = state.transactions.map((tx) => tx.score);
  const total = scores.length || 1;
  const low = scores.filter((score) => score < 35).length;
  const medium = scores.filter((score) => score >= 35 && score < 70).length;
  const high = scores.filter((score) => score >= 70).length;

  const lowPct = Math.round(low / total * 100);
  const mediumPct = Math.round(medium / total * 100);
  const highPct = 100 - lowPct - mediumPct;

  $("#risk-donut").style.background =
    `conic-gradient(#8b69f5 0% ${lowPct}%, #ffbc83 ${lowPct}% ${lowPct + mediumPct}%, #f279a1 ${lowPct + mediumPct}% 100%)`;

  const rows = $$(".risk-legend > div");
  const percentages = [lowPct, mediumPct, highPct];
  rows.forEach((row, index) => {
    row.querySelector("strong").textContent = `${percentages[index]}%`;
  });

  $("#risk-total").textContent = String(total);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function openAnalysis() {
  $("#analysis-result").hidden = true;
  $("#analysis-modal").hidden = false;
  document.body.style.overflow = "hidden";
  $("#analysis-form").elements.transactionId.focus();
}

function closeAnalysis() {
  $("#analysis-modal").hidden = true;
  document.body.style.overflow = "";
}

function renderSecondaryPage(page) {
  const titles = {
    transactions: ["Transactions", "Review transactions, scores and statuses."],
    identity: ["DAO Identity Defense", "Review digital account-opening verification signals."],
    alerts: ["Fraud Alerts", "Prioritize suspicious activity for investigation."],
    analytics: ["Security Analytics", "Explore illustrative activity and risk metrics."],
    investigations: ["Investigations", "Review and track flagged demo cases."],
    settings: ["Settings", "Manage demo preferences and application information."]
  };

  const [title, subtitle] = titles[page] || titles.transactions;
  $("#secondary-title").textContent = title;
  $("#secondary-subtitle").textContent = subtitle;
  $("#breadcrumb-title").textContent = title;

  const action = $("#secondary-action");
  action.textContent = page === "transactions" ? "＋ Analyze transaction" :
    page === "identity" ? "＋ Add demo application" :
    page === "alerts" ? "✓ Review alerts" : "↻ Refresh view";

  let content = "";

  if (page === "transactions") {
    content = `
      <div class="secondary-intro"><span class="big-icon">⇄</span><div><strong>Transaction monitoring</strong><p>Illustrative sample records. Use the search field to find a transaction.</p></div></div>
      <label class="search-label" for="txn-search">Search transactions</label>
      <input id="txn-search" class="search-input" placeholder="Search by ID, customer, or transaction type..." style="width:100%;max-width:420px;padding:12px;border:1px solid #e9e5f1;border-radius:9px;margin:12px 0">
      <div class="table-scroll"><table class="secondary-table"><thead><tr><th>TRANSACTION / CUSTOMER</th><th>TYPE</th><th>AMOUNT</th><th>RISK SCORE</th><th>STATUS</th></tr></thead><tbody id="all-transactions"></tbody></table></div>`;
  } else if (page === "identity") {
    content = `
      <div class="secondary-intro"><span class="big-icon">◎</span><div><strong>Digital account-opening review</strong><p>These records demonstrate a UI workflow, not real identity verification.</p></div></div>
      <div class="table-scroll"><table class="secondary-table"><thead><tr><th>APPLICATION</th><th>APPLICANT</th><th>CHECKS</th><th>RISK</th><th>STATUS</th></tr></thead><tbody>
      ${state.daoApplications.map((app) => `<tr><td>${escapeHTML(app.id)}</td><td>${escapeHTML(app.name)}</td><td>${escapeHTML(app.method)}</td><td><span class="risk-score score-${riskLevel(app.score)}"><i></i>${app.score}/100</span></td><td><span class="status-pill ${statusClass(app.status)}">${escapeHTML(app.status)}</span></td></tr>`).join("")}
      </tbody></table></div>`;
  } else if (page === "alerts") {
    content = `<div class="secondary-intro"><span class="big-icon">⚑</span><div><strong>Alert center</strong><p>Review the illustrative alerts generated for this demo.</p></div></div>
      ${state.alerts.length ? state.alerts.map((alert, index) => `<div class="alert-item"><div class="alert-icon ${escapeHTML(alert.color)}">${escapeHTML(alert.icon)}</div><div class="alert-copy"><strong>${escapeHTML(alert.title)}</strong><p>${escapeHTML(alert.detail)}</p><span class="alert-time">${escapeHTML(alert.time)} · ${escapeHTML(alert.severity)}</span></div><button class="text-link" data-secondary-alert="${index}">Review</button></div>`).join("") : "<p>No active alerts.</p>"}`;
  } else if (page === "investigations") {
    content = `<div class="secondary-intro"><span class="big-icon">⌕</span><div><strong>Investigation queue</strong><p>Sample cases for demonstrating analyst review workflows.</p></div></div>
      <div class="table-scroll"><table class="secondary-table"><thead><tr><th>CASE</th><th>DESCRIPTION</th><th>REFERENCE</th><th>PRIORITY</th><th>STATUS</th></tr></thead><tbody>
      ${state.investigations.map((item) => `<tr><td>${escapeHTML(item.id)}</td><td>${escapeHTML(item.title)}</td><td>${escapeHTML(item.detail)}</td><td>${escapeHTML(item.priority)}</td><td><span class="status-pill ${statusClass(item.status)}">${escapeHTML(item.status)}</span></td></tr>`).join("")}
      </tbody></table></div>`;
  } else if (page === "analytics") {
    content = `<div class="secondary-intro"><span class="big-icon">▥</span><div><strong>Demo analytics</strong><p>Summary metrics derived from the illustrative records currently in this browser.</p></div></div>
      <div class="stats-grid">
      <article class="stat-card stat-purple"><span class="stat-label">TOTAL SAMPLE RECORDS</span><div class="stat-value">${state.transactions.length}</div></article>
      <article class="stat-card stat-pink"><span class="stat-label">HIGH-RISK RECORDS</span><div class="stat-value">${state.transactions.filter(t => t.score >= 70).length}</div></article>
      <article class="stat-card stat-orange"><span class="stat-label">REVIEW QUEUE</span><div class="stat-value">${state.transactions.filter(t => t.status === "Review").length}</div></article>
      <article class="stat-card stat-green"><span class="stat-label">APPROVED SAMPLES</span><div class="stat-value">${state.transactions.filter(t => t.status === "Approved").length}</div></article></div>
      <p style="margin-top:22px">The overview chart uses illustrative activity patterns. Production analytics will require real, authorized backend data.</p>`;
  } else {
    content = `<div class="secondary-intro"><span class="big-icon">⚙</span><div><strong>Application information</strong><p>FraudShield is currently running as a standalone frontend demo.</p></div></div>
      <h3>Current environment</h3><p>Mode: Local demo · Data source: Sample records · API connection: Not configured</p>
      <h3>Security reminder</h3><p>Do not enter real banking or identity data. Before production, add backend authentication, server-side risk checks, access control, audit logs, and secure secret management.</p>`;
  }

  $("#secondary-body").innerHTML = content;

  if (page === "transactions") {
    renderAllTransactions(state.transactions);
    $("#txn-search").addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase().trim();
      renderAllTransactions(state.transactions.filter((tx) =>
        `${tx.id} ${tx.customer} ${tx.type} ${tx.status}`.toLowerCase().includes(query)
      ));
    });
  }
}

function renderAllTransactions(items) {
  const body = $("#all-transactions");
  if (!body) return;

  body.innerHTML = items.length ? items.map((tx) => `
    <tr>
      <td><strong>${escapeHTML(tx.id)}</strong><span class="txn-date">${escapeHTML(tx.customer)}</span></td>
      <td>${escapeHTML(tx.type)}</td>
      <td class="amount">${money(tx.amount)}</td>
      <td><span class="risk-score score-${riskLevel(tx.score)}"><i></i>${tx.score}/100</span></td>
      <td><span class="status-pill ${statusClass(tx.status)}">${escapeHTML(tx.status)}</span></td>
    </tr>`).join("") : `<tr><td colspan="5">No matching transactions found.</td></tr>`;
}

function navigate(page) {
  const validPages = ["overview", "transactions", "identity", "alerts", "analytics", "investigations", "settings"];
  if (!validPages.includes(page)) page = "overview";

  state.currentPage = page;
  $$(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  $("#overview").hidden = page !== "overview";
  $("#secondary-page").hidden = page === "overview";

  if (page === "overview") {
    $("#breadcrumb-title").textContent = "Overview";
    requestAnimationFrame(() => {
      drawActivityChart();
      drawRiskDistribution();
    });
  } else {
    renderSecondaryPage(page);
  }

  if (location.hash !== `#${page}`) {
    history.replaceState(null, "", `#${page}`);
  }
}

function analyzeTransaction(formData) {
  const id = formData.get("transactionId").trim();
  const amount = Number(formData.get("amount"));
  const failedAttempts = Number(formData.get("failedAttempts"));

  if (!id || !Number.isFinite(amount) || amount <= 0 ||
      !Number.isInteger(failedAttempts) || failedAttempts < 0) {
    showToast("Please enter valid transaction details.");
    return;
  }

  let score = 5;
  const reasons = [];

  if (amount >= 100000) {
    score += 35;
    reasons.push("High transaction amount (₹1,00,000 or above).");
  } else if (amount >= 50000) {
    score += 20;
    reasons.push("Elevated transaction amount (₹50,000 or above).");
  } else if (amount >= 20000) {
    score += 10;
    reasons.push("Transaction amount exceeds the demo threshold.");
  }

  if (formData.get("device") === "new") {
    score += 20;
    reasons.push("Transaction uses a new device.");
  }

  if (formData.get("location") === "unusual") {
    score += 25;
    reasons.push("Transaction originates from an unusual location.");
  }

  if (failedAttempts >= 5) {
    score += 25;
    reasons.push("Five or more failed attempts were reported.");
  } else if (failedAttempts >= 3) {
    score += 15;
    reasons.push("Multiple failed attempts were reported.");
  } else if (failedAttempts > 0) {
    score += 5;
    reasons.push("At least one failed attempt was reported.");
  }

  score = Math.min(score, 100);
  const level = riskLevel(score);

  const recommendation = level === "high"
    ? "Flag for investigation and apply additional verification."
    : level === "medium"
      ? "Request additional verification or analyst review."
      : "No major demo risk signals detected. Continue standard checks.";

  if (!reasons.length) reasons.push("No elevated signals were triggered by the demo rules.");

  $("#analysis-result").innerHTML = `
    <div class="result-heading">
      <div><strong>Demo risk assessment</strong><p class="result-disclaimer">Reference: ${escapeHTML(id)}</p></div>
      <div class="result-score score-${level}">${score}<span style="font-size:12px">/100</span></div>
    </div>
    <p><span class="status-pill ${level === "high" ? "status-blocked" : level === "medium" ? "status-review" : "status-approved"}">${level.toUpperCase()} RISK</span></p>
    <ul class="result-reasons">${reasons.map((reason) => `<li>${escapeHTML(reason)}</li>`).join("")}</ul>
    <p><strong>Suggested next step:</strong> ${escapeHTML(recommendation)}</p>
    <p class="result-disclaimer">Illustrative rule-based result only. This is not a validated fraud prediction or a decision to block a real transaction.</p>
    <button type="button" class="btn btn-white" id="save-demo-result">Add to demo transaction list</button>`;

  $("#analysis-result").hidden = false;
  $("#save-demo-result").addEventListener("click", () => {
    const existing = state.transactions.some((tx) => tx.id === id);
    if (existing) {
      showToast("That transaction ID already exists in the demo list.");
      return;
    }

    const newTx = {
      id,
      customer: "Demo transaction",
      initials: "DT",
      amount,
      type: formData.get("type"),
      score,
      status: level === "high" ? "Review" : level === "medium" ? "Review" : "Approved",
      time: "Just now"
    };

    state.transactions.unshift(newTx);
    renderTransactionRows();
    drawRiskDistribution();
    showToast("Added to the local demo list. Not sent to a bank.");
    $("#save-demo-result").disabled = true;
    $("#save-demo-result").textContent = "Added to demo list";
  });
}

function exportReport() {
  const headers = ["Transaction ID", "Customer", "Type", "Amount INR", "Risk Score", "Status", "Time"];
  const rows = state.transactions.map((tx) => [
    tx.id, tx.customer, tx.type, tx.amount, tx.score, tx.status, tx.time
  ]);

  const csvCell = (value) => {
    let text = String(value);
    // Prevent spreadsheet formula injection in exported values.
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fraudshield-demo-transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Demo transaction report exported.");
}

function attachEvents() {
  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.page);
    });
  });

  $$("[data-go]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.go));
  });

  $("#analyze-btn").addEventListener("click", openAnalysis);
  $("#secondary-action").addEventListener("click", () => {
    if (state.currentPage === "transactions" || state.currentPage === "overview") {
      openAnalysis();
    } else if (state.currentPage === "identity") {
      showToast("Identity onboarding form will be added in the next development stage.");
    } else if (state.currentPage === "alerts") {
      state.alerts = [];
      renderAlerts();
      renderSecondaryPage("alerts");
      showToast("Demo alerts cleared from this browser session.");
    } else {
      showToast("This demo view is up to date.");
    }
  });

  $("#modal-close").addEventListener("click", closeAnalysis);
  $("#analysis-modal").addEventListener("click", (event) => {
    if (event.target === $("#analysis-modal")) closeAnalysis();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#analysis-modal").hidden) closeAnalysis();
  });

  $("#analysis-form").addEventListener("submit", (event) => {
    event.preventDefault();
    analyzeTransaction(new FormData(event.currentTarget));
  });

  $("#export-btn").addEventListener("click", exportReport);

  $("#date-filter").addEventListener("click", () => {
    const periods = ["7", "1", "30"];
    const next = periods[(periods.indexOf(state.period) + 1) % periods.length];
    state.period = next;
    $("#date-filter").innerHTML = next === "1" ? "◷ &nbsp; Today &nbsp;⌄" :
      next === "30" ? "◷ &nbsp; Last 30 days &nbsp;⌄" : "◷ &nbsp; Last 7 days &nbsp;⌄";
    drawActivityChart();
    showToast("Chart updated with illustrative " + (next === "1" ? "daily" : next === "30" ? "monthly" : "weekly") + " data.");
  });

  $("#notification-btn").addEventListener("click", () => {
    navigate("alerts");
  });

  document.addEventListener("click", (event) => {
    const txnButton = event.target.closest("[data-txn]");
    if (txnButton) {
      const tx = state.transactions.find((item) => item.id === txnButton.dataset.txn);
      if (tx) showToast(`${tx.id}: ${money(tx.amount)} · Risk ${tx.score}/100 · ${tx.status}`);
      return;
    }

    const alertButton = event.target.closest("[data-alert]");
    if (alertButton) {
      const alert = state.alerts[Number(alertButton.dataset.alert)];
      if (alert) showToast(`${alert.title}: ${alert.detail}`);
      return;
    }

    const secondaryAlert = event.target.closest("[data-secondary-alert]");
    if (secondaryAlert) {
      const index = Number(secondaryAlert.dataset.secondaryAlert);
      const alert = state.alerts[index];
      if (alert) showToast(`Review requested for: ${alert.title}`);
    }
  });

  window.addEventListener("resize", () => {
    if (state.currentPage === "overview") drawActivityChart();
  });

  window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "overview";
    navigate(page);
  });
}

function init() {
  renderTransactionRows();
  renderAlerts();
  drawRiskDistribution();
  attachEvents();

  const initialPage = location.hash.replace("#", "") || "overview";
  navigate(initialPage);
}

document.addEventListener("DOMContentLoaded", init);
