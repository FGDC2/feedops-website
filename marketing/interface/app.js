const rows = [
  ["product feed management", 50, 51, 90],
  ["google shopping title optimization", 3, 5, 10],
  ["product feed optimisation", 8, 7, 40],
  ["google shopping ads not showing", 5, 6, 10],
  ["google merchant center errors", 17, 16, 10],
  ["shopping feed agency", 70, 72, 10],
  ["FeedOps", 1, 1, 70],
  ["FeedOps Learning", 1, 1, 0],
  ["contact FeedOps", 1, 1, 0],
  ["FeedOps privacy policy", 1, 1, 0],
  ["FeedOps pricing", 1, 1, 0],
  ["Book a demo", null, null, 30],
  ["Free Google Shopping Feed Audit", 1, 1, 0],
  ["FeedOps FAQ", 1, 1, 0],
  ["Google local inventory ads Performance Max", 6, 6, 0],
  ["Google Shopping Graph", null, null, 10],
  ["Intelligent Reach alternative", null, null, 0],
  ["Feedonomics Alternative", 2, 2, 10],
  ["Google Shopping Ads Management", 5, 5, 50],
  ["Google Shopping Free Listings", 3, 3, 10],
  ["what is a google shopping feed", 36, 37, 10],
  ["Product Type Google Shopping", 5, 5, 20],
  ["Google Shopping Feed Optimization", 3, 4, 30],
  ["Google Product Category", null, null, 90]
];

const body = document.getElementById("rankings-body");
const buttons = document.querySelectorAll("[data-filter]");

function classify(rank) {
  if (rank && rank <= 3) return "top-3";
  if (rank && rank <= 10) return "quick-win";
  return "attention";
}

function label(status) {
  if (status === "top-3") return "Top 3";
  if (status === "quick-win") return "Quick win";
  return "Needs attention";
}

function insight(keyword, rank) {
  if (rank && rank <= 3) return "Protect current position and monitor competitors.";
  if (rank && rank <= 10) return "Close enough to push into top 3 with page updates, internal links, and CTR improvements.";
  if (rank) return "Needs content, intent, authority, or cannibalization review.";
  return "Not ranking in the visible tracked range. Confirm target page and search intent.";
}

function render(filter = "all") {
  body.innerHTML = rows
    .map(([keyword, rank, previous, volume]) => {
      const status = classify(rank);
      return { keyword, rank, previous, volume, status };
    })
    .filter((row) => filter === "all" || row.status === filter)
    .map((row) => `
      <tr>
        <td>${row.keyword}</td>
        <td>${row.rank ?? ">100"}</td>
        <td>${row.previous ?? "-"}</td>
        <td>${row.volume}</td>
        <td><span class="status ${row.status}">${label(row.status)}</span></td>
        <td>${insight(row.keyword, row.rank)}</td>
      </tr>
    `)
    .join("");
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    render(button.dataset.filter);
  });
});

render();
