export default function formatCost(cost) {
  return cost.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
