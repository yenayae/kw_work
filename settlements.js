import { fetchSettlements } from "./hooks/firestore.js";
import formatDate from "./hooks/formatDate.js";
import formatCost from "./hooks/formatCost.js";

export default async function loadSettlements() {
  const settlements = await fetchSettlements();

  //display information
  displaySettlements(settlements);
}

/* 
FORMAT OF SETTLEMENTS
 <div id="settlements-container">
    <div class="card-entry-header">
        <span>
        <b>03-24-2025</b>
        </span>
        <span class="entry-header-right">
        <b>$17,000.00 </b> (4 payments)
        </span>
    </div>

    <div class="card-entry-list settlements">
        <!-- one item start -->
        <div class="entry-item">
          <div class="entry-item-name">
              <span>Joan Tull</span>
          </div>
          <div>
              <span>$12,000.00</span>
              <i class="fa-solid fa-chevron-right entry-arrow"></i>
          </div>
        </div>
        <!-- <hr /> -->
        <!-- one item end -->

        <div class="entry-item">
        <div class="entry-item-name">
            <span class="primary">Joan Tull</span>
        </div>
        <div>
            <span>$12,000.00</span>
            <i class="fa-solid fa-chevron-right entry-arrow"></i>
        </div>
        </div>
    </div>
</div>
*/

function displaySettlements(settlements) {
  const settlementsContainer = document.getElementById("settlements-container");

  for (const settlement of settlements) {
    let settlements = createSettlement(settlement);
    settlementsContainer.appendChild(settlements);
  }
}

function createSettlement(settlement) {
  //create elements
  const settlementCard = document.createElement("div");
  const cardEntryHeader = document.createElement("div");
  const entryLeftSpan = document.createElement("span");
  const entryLeftBold = document.createElement("b");
  const entryRightSpan = document.createElement("span");
  const entryRightBold = document.createElement("b");
  const cardEntryList = document.createElement("div");

  //add classes
  cardEntryHeader.classList.add("card-entry-header");
  entryRightSpan.classList.add("entry-header-right");
  cardEntryList.classList.add("card-entry-list", "settlements");

  //add content
  entryLeftBold.textContent = formatDate(settlement.date);
  entryRightBold.textContent = formatCost(settlement.amount);

  //append items
  entryRightSpan.appendChild(entryRightBold);
  entryRightSpan.appendChild(
    document.createTextNode(` (${settlement.payments.length} payments)`)
  );
  entryLeftSpan.appendChild(entryLeftBold);
  cardEntryHeader.appendChild(entryLeftSpan);
  cardEntryHeader.appendChild(entryRightSpan);
  settlementCard.appendChild(cardEntryHeader);
  settlementCard.appendChild(cardEntryList);

  for (const payment of settlement.payments) {
    let entry = createSettlementEntry(payment);
    cardEntryList.appendChild(entry);
  }

  return settlementCard;
}

function createSettlementEntry(entry) {
  const entryItem = document.createElement("div");
  const entryItemName = document.createElement("div");
  const entryItemNameSpan = document.createElement("span");
  const entryItemAmount = document.createElement("div");
  const entryItemAmountSpan = document.createElement("span");
  const entryArrow = document.createElement("i");

  //add classes
  entryItem.classList.add("entry-item");
  entryItemName.classList.add("entry-item-name");
  entryArrow.classList.add("fa-solid", "fa-chevron-right", "entry-arrow");

  //add content
  entryItemNameSpan.textContent = entry.payer;
  entryItemAmountSpan.textContent = formatCost(entry.amount);

  //append items
  entryItemName.appendChild(entryItemNameSpan);
  entryItemAmount.appendChild(entryItemAmountSpan);
  entryItemAmount.appendChild(entryArrow);
  entryItem.appendChild(entryItemName);
  entryItem.appendChild(entryItemAmount);

  return entryItem;
}
