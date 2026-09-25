/* Simple budget tracker script.
   This file keeps the app data in the browser and updates the page.
   Project by Raden Alovado Wresniwira Mahaghaniyy (R.A.W.M).
*/

'use strict';

/* App state */

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];

let state = {
  transactions: [],   // { id, item, amount, type, category, date }
  categories:   [],   // string[]
  spendingLimit: 0,   // number (0 = no limit)
  theme: 'light',     // 'light' | 'dark'
  viewMonth: null,    // 'YYYY-MM' string for monthly summary nav
};

let chartInstance = null;

/* Save and load app data */

function loadState() {
  const raw = localStorage.getItem('budgetAppState');
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      state.transactions  = saved.transactions  || [];
      state.categories    = saved.categories    || [...DEFAULT_CATEGORIES];
      state.spendingLimit = saved.spendingLimit || 0;
      state.theme         = saved.theme         || 'light';
    } catch {
      state.categories = [...DEFAULT_CATEGORIES];
    }
  } else {
    state.categories = [...DEFAULT_CATEGORIES];
  }
  // Always set viewMonth to current month on load
  state.viewMonth = currentMonthKey();
}

function saveState() {
  localStorage.setItem('budgetAppState', JSON.stringify({
    transactions:  state.transactions,
    categories:    state.categories,
    spendingLimit: state.spendingLimit,
    theme:         state.theme,
  }));
}

/* Helper functions */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatCurrency(amount) {
  return '$' + Math.abs(amount).toFixed(2);
}

/** Returns 'YYYY-MM' for today */
function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Returns 'YYYY-MM' for a date string */
function dateToMonthKey(dateStr) {
  return dateStr.slice(0, 7); // 'YYYY-MM-DD' → 'YYYY-MM'
}

/** Formats 'YYYY-MM' → 'September 2026' */
function formatMonthLabel(key) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Returns today's date as 'YYYY-MM-DD' */
function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Category → emoji icon */
const CATEGORY_ICONS = {
  food:          '🍔',
  transport:     '🚗',
  entertainment: '🎉',
  health:        '💊',
  shopping:      '🛍️',
  bills:         '🧾',
  other:         '📦',
  income:        '💵',
};

function getCategoryIcon(category, type) {
  if (type === 'income') return CATEGORY_ICONS.income;
  const key = category.toLowerCase();
  return CATEGORY_ICONS[key] || '📌';
}

/* Get page elements */

const $ = id => document.getElementById(id);

const dom = {
  balance:        $('balance'),
  totalIncome:    $('total-income'),
  totalExpense:   $('total-expense'),
  limitBanner:    $('limit-banner'),

  form:           $('expense-form'),
  itemInput:      $('item'),
  amountInput:    $('amount'),
  typeSelect:     $('type'),
  categorySelect: $('category'),
  dateInput:      $('date'),

  newCatInput:    $('new-category-input'),
  addCatBtn:      $('add-category-btn'),
  categoryTags:   $('category-tags'),

  limitInput:     $('limit-input'),
  setLimitBtn:    $('set-limit-btn'),
  limitInfo:      $('limit-info'),
  progressTrack:  $('progress-track'),
  progressFill:   $('progress-fill'),

  chartCanvas:    $('expense-chart'),
  chartEmpty:     $('chart-empty'),

  prevMonth:      $('prev-month'),
  nextMonth:      $('next-month'),
  monthLabel:     $('month-label'),
  monthlyStats:   $('monthly-stats'),

  sortSelect:     $('sort-select'),
  transactionList:$('transaction-list'),
  historyEmpty:   $('history-empty'),

  themeToggle:    $('theme-toggle'),
};

/* Theme switch */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  dom.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  dom.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  state.theme = theme;

  // Chart.js needs a colour refresh when theme switches
  if (chartInstance) updateChart();
}

dom.themeToggle.addEventListener('click', () => {
  const next = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  saveState();
});

/* Category list */

function populateCategorySelect() {
  const current = dom.categorySelect.value;
  dom.categorySelect.innerHTML = '';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === current) opt.selected = true;
    dom.categorySelect.appendChild(opt);
  });
}

function renderCategoryTags() {
  dom.categoryTags.innerHTML = '';
  state.categories.forEach(cat => {
    const tag = document.createElement('span');
    tag.className = 'category-tag';
    tag.innerHTML = `${cat} <button class="tag-del" aria-label="Remove ${cat}" data-cat="${cat}">×</button>`;
    dom.categoryTags.appendChild(tag);
  });
}

function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (state.categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) return;
  state.categories.push(trimmed);
  saveState();
  populateCategorySelect();
  renderCategoryTags();
}

function removeCategory(name) {
  // Don't delete if any transactions use it
  const inUse = state.transactions.some(t => t.category === name);
  if (inUse) {
    alert(`Cannot remove "${name}" — it is used by existing transactions.`);
    return;
  }
  state.categories = state.categories.filter(c => c !== name);
  saveState();
  populateCategorySelect();
  renderCategoryTags();
}

dom.addCatBtn.addEventListener('click', () => {
  addCategory(dom.newCatInput.value);
  dom.newCatInput.value = '';
});

dom.newCatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addCategory(dom.newCatInput.value);
    dom.newCatInput.value = '';
  }
});

dom.categoryTags.addEventListener('click', e => {
  const btn = e.target.closest('.tag-del');
  if (btn) removeCategory(btn.dataset.cat);
});

/* Monthly spending limit */

function updateLimitUI() {
  const limit = state.spendingLimit;

  // Current month expenses only
  const monthKey = currentMonthKey();
  const monthExpenses = state.transactions
    .filter(t => t.type === 'expense' && dateToMonthKey(t.date) === monthKey)
    .reduce((sum, t) => sum + t.amount, 0);

  if (limit <= 0) {
    dom.limitInfo.textContent = 'No limit set';
    dom.progressTrack.style.display = 'none';
    dom.limitBanner.classList.add('hidden');
    return;
  }

  const pct = Math.min((monthExpenses / limit) * 100, 100);
  dom.limitInfo.textContent = `Spent ${formatCurrency(monthExpenses)} of ${formatCurrency(limit)} this month`;
  dom.progressTrack.style.display = 'block';
  dom.progressFill.style.width = pct + '%';

  dom.progressFill.classList.remove('near-limit', 'over-limit');
  if (monthExpenses > limit) {
    dom.progressFill.classList.add('over-limit');
    dom.limitBanner.classList.remove('hidden');
  } else if (pct >= 80) {
    dom.progressFill.classList.add('near-limit');
    dom.limitBanner.classList.add('hidden');
  } else {
    dom.limitBanner.classList.add('hidden');
  }
}

dom.setLimitBtn.addEventListener('click', () => {
  const val = parseFloat(dom.limitInput.value);
  if (isNaN(val) || val < 0) return;
  state.spendingLimit = val;
  saveState();
  dom.limitInput.value = '';
  updateLimitUI();
});

dom.limitInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    dom.setLimitBtn.click();
  }
});

/* Balance cards */

function updateBalanceSummary() {
  const income  = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  dom.totalIncome.textContent  = formatCurrency(income);
  dom.totalExpense.textContent = formatCurrency(expense);
  dom.balance.textContent      = (balance < 0 ? '-' : '') + formatCurrency(balance);
}

/* Spending chart */

// A fixed palette — cycles if there are more categories than colours
const CHART_PALETTE = [
  '#6c63ff','#ef4444','#22c55e','#f59e0b','#3b82f6',
  '#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4',
];

function updateChart() {
  const expenses = state.transactions.filter(t => t.type === 'expense');

  if (expenses.length === 0) {
    dom.chartEmpty.style.display = 'block';
    dom.chartCanvas.style.display = 'none';
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  dom.chartEmpty.style.display = 'none';
  dom.chartCanvas.style.display = 'block';

  // Aggregate by category
  const totals = {};
  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data   = labels.map(l => totals[l]);
  const colors = labels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);

  // Determine text colour from current theme
  const isDark   = state.theme === 'dark';
  const textColor = isDark ? '#e8eaf0' : '#1a1d23';

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(dom.chartCanvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: isDark ? '#1a1d27' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 14,
            font: { size: 13, family: "'Segoe UI', system-ui, sans-serif" },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.parsed.toFixed(2)}`,
          },
        },
      },
    },
  });
}

/* Monthly summary */

function offsetMonth(key, delta) {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function renderMonthlySummary() {
  const key = state.viewMonth;
  dom.monthLabel.textContent = formatMonthLabel(key);

  const inMonth = state.transactions.filter(t => dateToMonthKey(t.date) === key);
  const income  = inMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = inMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net     = income - expense;
  const count   = inMonth.length;

  dom.monthlyStats.innerHTML = `
    <div class="monthly-stat-item">
      <p class="stat-label">Income</p>
      <p class="stat-value stat-income">${formatCurrency(income)}</p>
    </div>
    <div class="monthly-stat-item">
      <p class="stat-label">Expenses</p>
      <p class="stat-value stat-expense">${formatCurrency(expense)}</p>
    </div>
    <div class="monthly-stat-item">
      <p class="stat-label">Net Balance</p>
      <p class="stat-value stat-balance">${(net < 0 ? '-' : '') + formatCurrency(net)}</p>
    </div>
    <div class="monthly-stat-item">
      <p class="stat-label">Transactions</p>
      <p class="stat-value stat-count">${count}</p>
    </div>
  `;
}

dom.prevMonth.addEventListener('click', () => {
  state.viewMonth = offsetMonth(state.viewMonth, -1);
  renderMonthlySummary();
});

dom.nextMonth.addEventListener('click', () => {
  state.viewMonth = offsetMonth(state.viewMonth, +1);
  renderMonthlySummary();
});

/* Transaction list and sorting */

function getSortedTransactions() {
  const sort = dom.sortSelect.value;
  const list = [...state.transactions];

  switch (sort) {
    case 'date-desc':    return list.sort((a, b) => b.date.localeCompare(a.date));
    case 'date-asc':     return list.sort((a, b) => a.date.localeCompare(b.date));
    case 'amount-desc':  return list.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':   return list.sort((a, b) => a.amount - b.amount);
    case 'category':     return list.sort((a, b) => a.category.localeCompare(b.category));
    default:             return list;
  }
}

function renderTransactionList() {
  const sorted = getSortedTransactions();
  const limit  = state.spendingLimit;

  if (sorted.length === 0) {
    dom.transactionList.innerHTML = '';
    dom.historyEmpty.style.display = 'block';
    return;
  }

  dom.historyEmpty.style.display = 'none';
  dom.transactionList.innerHTML = '';

  sorted.forEach(t => {
    const isOverLimit = limit > 0 && t.type === 'expense' && t.amount > limit;
    const icon        = getCategoryIcon(t.category, t.type);
    const sign        = t.type === 'income' ? '+' : '-';
    const amtClass    = t.type === 'income' ? 'income' : 'expense';
    const overClass   = isOverLimit ? ' over-limit-item' : '';

    const li = document.createElement('li');
    li.className = `transaction-item${overClass}`;
    li.dataset.id = t.id;

    li.innerHTML = `
      <span class="transaction-icon">${icon}</span>
      <div class="transaction-details">
        <p class="transaction-name">${escapeHtml(t.item)}</p>
        <p class="transaction-meta">${escapeHtml(t.category)} · ${t.date}</p>
      </div>
      <span class="transaction-amount ${amtClass}">${sign}${formatCurrency(t.amount)}</span>
      <button class="btn btn-danger delete-btn" aria-label="Delete ${escapeHtml(t.item)}">✕</button>
    `;

    dom.transactionList.appendChild(li);
  });
}

// Delegate delete clicks on the list
dom.transactionList.addEventListener('click', e => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  const li = btn.closest('.transaction-item');
  if (!li) return;
  deleteTransaction(li.dataset.id);
});

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveState();
  renderAll();
}

/* Safely escape user text for innerHTML */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

dom.sortSelect.addEventListener('change', renderTransactionList);

/* Add transaction form */

dom.form.addEventListener('submit', e => {
  e.preventDefault();

  const item     = dom.itemInput.value.trim();
  const amount   = parseFloat(dom.amountInput.value);
  const type     = dom.typeSelect.value;
  const category = dom.categorySelect.value;
  const date     = dom.dateInput.value;

  // Basic validation
  if (!item || isNaN(amount) || amount <= 0 || !category || !date) {
    showFormError('Please fill in all fields with valid values.');
    return;
  }

  const transaction = { id: generateId(), item, amount, type, category, date };
  state.transactions.push(transaction);
  saveState();

  dom.form.reset();
  dom.dateInput.value = todayDateString(); // restore default date after reset

  renderAll();
});

function showFormError(msg) {
  // Simple inline feedback — remove after 3 s
  let err = document.getElementById('form-error');
  if (!err) {
    err = document.createElement('p');
    err.id = 'form-error';
    err.style.cssText = 'color:var(--expense-color);font-size:0.82rem;margin-top:0.5rem;text-align:right;';
    dom.form.appendChild(err);
  }
  err.textContent = msg;
  clearTimeout(err._timer);
  err._timer = setTimeout(() => err.remove(), 3000);
}

/* Update everything on screen */

function renderAll() {
  updateBalanceSummary();
  updateLimitUI();
  updateChart();
  renderMonthlySummary();
  renderTransactionList();
}

/* Start the app */

function init() {
  loadState();

  // Apply saved theme
  applyTheme(state.theme);

  // Populate category dropdown & tags
  populateCategorySelect();
  renderCategoryTags();

  // Set today's date as default in the form
  dom.dateInput.value = todayDateString();

  // Populate the limit input placeholder if a limit is set
  if (state.spendingLimit > 0) {
    dom.limitInput.placeholder = `Current: ${formatCurrency(state.spendingLimit)}`;
  }

  renderAll();
}

init();
