# Expense & Budget Visualizer Requirements

## 1. Product Goal

Build a mobile-friendly browser application that helps users record daily spending, understand their current balance, and review spending distribution by category.

## 2. Required MVP Features

### Requirement 2.1: Add Transactions

The application shall provide an input form with:

- Item name or description
- Amount
- Transaction type: expense or income
- Category
- Date

When the user submits a valid form, the application shall add the transaction to the transaction history and update all related totals and visualizations.

The application shall validate that the required fields are completed and that the amount is a valid non-negative number.

### Requirement 2.2: Transaction History

The application shall display all saved transactions in a readable history list.

Each transaction shall show its description, amount, category, type, and date. The user shall be able to delete a transaction, after which totals, charts, limits, and summaries shall update automatically.

The history shall support sorting by date, amount, and category.

### Requirement 2.3: Balance Summary

The application shall display total balance, total income, and total expenses near the top of the tracker.

The balance shall be calculated as total income minus total expenses. The displayed values shall update immediately whenever a transaction is added or deleted.

### Requirement 2.4: Spending Chart

The application shall display a doughnut or pie chart showing expense distribution by category.

The chart shall update automatically when expense transactions change. The chart shall show a useful empty state when no expenses exist.

## 3. Optional Challenges Implemented

### Requirement 3.1: Custom Categories

The user shall be able to add a new category. Category names shall not be duplicated, ignoring letter case.

The user shall not be able to remove a category that is already used by a transaction.

### Requirement 3.2: Monthly Summary

The application shall provide a monthly summary showing income, expenses, net balance, and transaction count for the selected month.

The user shall be able to navigate to the previous or next month.

### Requirement 3.3: Spending Limit Highlight

The user shall be able to set a monthly spending limit.

The application shall show progress toward the limit and warn the user when current-month expenses exceed it. The progress state shall visually distinguish normal, near-limit, and over-limit spending.

### Requirement 3.4: Dark and Light Mode

The user shall be able to switch between light and dark themes. The selected theme shall be persisted in browser storage and restored on the next visit.

## 4. Tutorial Experience

The application shall provide a separate `tutorial.html` page linked from the main tracker.

The tutorial shall explain the basic flow:

1. Record a transaction.
2. See the balance and totals change.
3. Review patterns using limits, charts, summaries, and history.

The tutorial shall include short, non-blocking animations that demonstrate each major tracker area. The tutorial shall remain usable on mobile screens and shall provide a link back to the tracker.

## 5. Data Persistence

The application shall store transactions, categories, spending limit, and theme preference in the browser Local Storage API.

No backend server or account system is required. Data shall remain client-side only.

## 6. Technical Constraints

- HTML shall be used for structure.
- CSS shall be used for styling.
- Vanilla JavaScript shall be used for application logic.
- Frameworks such as React and Vue shall not be used.
- No backend server is required.
- Chart.js may be loaded from a CDN for the spending visualization.
- The app shall work in modern Chrome, Firefox, Edge, and Safari browsers.
- The app shall work as a standalone web app or as a GitHub Pages site.
- Only one CSS file shall be kept inside `css/`.
- Only one JavaScript file shall be kept inside `js/`. The tutorial's small theme handler is inline in `tutorial.html` so the folder rule remains satisfied.

## 7. Non-Functional Requirements

### 7.1 Simplicity

The interface shall be clean, easy to understand, and usable without complex setup.

### 7.2 Performance

The app shall load quickly, respond immediately to user interactions, and avoid noticeable lag while updating the transaction list or chart.

### 7.3 Visual Design

The interface shall have clear visual hierarchy, readable typography, responsive layouts, and distinct visual states for income, expenses, warnings, and empty data.

## 8. Deployment

The source code shall be pushed to a GitHub repository and published using GitHub Pages. The repository shall include this `.kiro` directory for submission evidence.
