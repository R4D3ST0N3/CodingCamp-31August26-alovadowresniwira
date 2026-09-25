# Expense & Budget Visualizer Design

## Architecture

This is a static client-side web app with no backend.

```text
index.html
  -> css/style.css
  -> Chart.js CDN
  -> js/script.js

tutorial.html
  -> css/style.css
  -> inline theme handler
```

The main tracker and tutorial share the same design tokens, typography, theme behavior, and navigation style.

## Main Tracker Layout

The tracker uses these visual areas:

1. Sticky header with the app title, tracker/tutorial navigation, and theme toggle.
2. Balance summary with total balance, income, and expenses.
3. Responsive dashboard grid containing:
   - Add Transaction form across the full grid width.
   - Manage Categories panel.
   - Monthly Spending Limit panel.
   - Spending by Category chart.
   - Monthly Summary panel.
   - Transaction History across the full grid width.
4. Footer with project attribution.

On desktop and tablet widths, the secondary panels sit side by side. At narrow widths, panels collapse to a single column and form controls stack vertically.

## Tutorial Layout

The tutorial page contains:

1. Orientation section with a short explanation and a link to the tracker.
2. Animated flow panel showing `Record it -> See the change -> Review the pattern`.
3. Four animated guide cards for:
   - Add Transaction
   - Balance Summary
   - Spending Limit
   - Chart and History
4. Closing link back to the tracker.

Decorative background elements use low-contrast outlined shapes so they add depth without interfering with reading or controls.

## State Model

The tracker stores one serialized object in Local Storage under `budgetAppState`.

```text
{
  transactions: [
    {
      id: string,
      item: string,
      amount: number,
      type: "income" | "expense",
      category: string,
      date: "YYYY-MM-DD"
    }
  ],
  categories: string[],
  spendingLimit: number,
  theme: "light" | "dark"
}
```

The currently viewed month is derived at load time and is used for the monthly summary navigation.

## Main Data Flow

1. `loadState` reads the saved object or initializes default categories.
2. Form submission validates and appends a transaction.
3. `saveState` persists changes after every mutation.
4. Render functions update the balance cards, chart, monthly summary, limit state, and history list.
5. Deleting a transaction repeats the same persistence and rendering flow.

## Calculation Rules

- Total income is the sum of all income transactions.
- Total expenses is the sum of all expense transactions.
- Balance is income minus expenses.
- Monthly summary filters transactions by the selected `YYYY-MM` key.
- Spending limit progress uses current-month expense totals.
- Chart data aggregates expense amounts by category.

## Visual System

- `Space Grotesk` is used for interface text.
- `DM Mono` is used for currency, labels, and compact status values.
- Light mode uses warm paper, terracotta, teal, ochre, and charcoal tones.
- Dark mode uses deep green-charcoal surfaces with warm accent colors.
- Cards use small radii and restrained borders rather than large decorative containers.
- Animations are short, subtle, and limited to tutorial examples and warning feedback.

## Browser Compatibility

The design relies on standard HTML, CSS Grid, CSS custom properties, Local Storage, and vanilla JavaScript. Chart.js is used only for the doughnut chart.
