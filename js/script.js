let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

function updateBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById("balance").textContent = total.toFixed(2);
}

function renderList() {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";
  transactions.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = `${t.item} - ${t.category} - $${t.amount}`;
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = () => {
      transactions.splice(i, 1);
      localStorage.setItem("transactions", JSON.stringify(transactions));
      renderList();
      updateBalance();
      updateChart();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
}

document.getElementById("expense-form").addEventListener("submit", e => {
  e.preventDefault();
  const item = document.getElementById("item").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  if (!item || !amount || !category) return;
  transactions.push({ item, amount, category });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderList();
  updateBalance();
  updateChart();
  e.target.reset();
});

function updateChart() {
  const categories = ["Food", "Transport", "Fun"];
  const data = categories.map(cat =>
    transactions.filter(t => t.category === cat)
                .reduce((sum, t) => sum + t.amount, 0)
  );
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("expense-chart"), {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{ data, backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"] }]
    }
  });
}

renderList();
updateBalance();
updateChart();
