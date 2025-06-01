export function createTable(headers, content, onSort = null) {
  const table = document.createElement("table");
  table.classList.add("generic-table");

  // ===== Create THEAD =====
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.classList.add("header-row");

  headers.forEach((header, i) => {
    const th = document.createElement("th");
    th.classList.add("header-item");

    const div = document.createElement("div");
    div.classList.add("header-item-content");

    //first cell should have an arrow icon
    if (i == 0) {
      const arrowContainer = document.createElement("div");
      arrowContainer.classList.add("arrow-container");

      const arrowIcon = document.createElement("span");
      arrowIcon.classList.add("material-symbols-outlined", "arrow-icon");
      arrowIcon.textContent = "keyboard_arrow_down";

      const label = document.createElement("span");
      label.textContent = header;

      arrowContainer.appendChild(arrowIcon);
      arrowContainer.appendChild(label);
      div.appendChild(arrowContainer);
    } else {
      const label = document.createElement("span");
      label.textContent = header;
      div.appendChild(label);
    }

    //add the unfold icon for each header except actions header
    if (header !== "Actions") {
      const icon = document.createElement("span");
      icon.classList.add("material-symbols-outlined", "header-icon");
      icon.textContent = "unfold_more";
      div.appendChild(icon);

      // if a sort handler is provided, make clickable
      if (onSort) {
        let sortDirection = "asc";

        th.addEventListener("click", () => {
          // toggle direction each click
          sortDirection = sortDirection === "asc" ? "desc" : "asc";
          onSort(header, sortDirection);
        });
      }
    } else {
      div.classList.add("actions");
    }

    th.appendChild(div);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ===== Create TBODY =====
  table.appendChild(createTableContent(headers, content));

  return table;
}

export function updateTable(headers, content, table) {
  //clear previous content
  const tbody = table.querySelector("tbody");
  if (tbody) {
    table.removeChild(tbody);
  }

  // fill in table
  const newTbody = createTableContent(headers, content);
  table.appendChild(newTbody);
  return table;
}

export function createStatusComponent(status) {
  const statusSpan = document.createElement("span");
  statusSpan.classList.add("status", status.replace(/\s+/g, "-").toLowerCase());
  statusSpan.textContent = status;
  return statusSpan;
}

function createActionsMenu(functions) {
  console.log(functions);

  //create elements
  const actionsMenu = document.createElement("div");
  actionsMenu.classList.add("actions-menu");

  const actionsList = document.createElement("ul");
  actionsList.classList.add("actions-list");

  functions.forEach((func) => {
    const actionsListItem = document.createElement("li");

    const actionsItem = document.createElement("div");
    actionsItem.classList.add("actions-item");

    actionsItem.addEventListener("click", () => {
      func.action();
    });

    const actionsIcon = document.createElement("span");
    actionsIcon.classList.add("material-symbols-outlined", "action-icon");
    actionsIcon.textContent = func.icon;

    const actionsLabel = document.createElement("span");
    actionsLabel.textContent = func.label;

    //append items
    actionsItem.appendChild(actionsIcon);
    actionsItem.appendChild(actionsLabel);
    actionsListItem.appendChild(actionsItem);
    actionsList.appendChild(actionsListItem);
  });

  actionsMenu.appendChild(actionsList);

  return actionsMenu;
}

function closeAllMenus() {
  document.querySelectorAll(".actions-menu").forEach((menu) => {
    menu.style.display = "none";
  });
}

function actionsButtonClick(button) {
  console.log("Actions button clicked!");

  const td = button.closest(".actions-td");
  if (!td) return;

  const menu = td.querySelector(".actions-menu");
  if (!menu) return;

  // toggle the menu visibility
  const isMenuOpen = menu.style.display === "block";

  // close all menus first
  closeAllMenus();

  if (!isMenuOpen) {
    menu.style.display = "block";

    // prevent this click from triggering the document click listener
    setTimeout(() => {
      document.addEventListener("click", handleDocumentClick);
    }, 0);
  } else {
    // remove the listener if closing manually
    document.removeEventListener("click", handleDocumentClick);
  }
}

function handleDocumentClick(e) {
  const isInsideMenu = e.target.closest(".actions-td");
  if (!isInsideMenu) {
    closeAllMenus();
    document.removeEventListener("click", handleDocumentClick);
  }
}

export function createTableContent(headers, content) {
  // ===== Create TBODY =====
  const tbody = document.createElement("tbody");
  tbody.classList.add("generic-table-body");

  if (content.length === 0) {
    //create empty state message
    const emptySpan = document.createElement("span");
    emptySpan.textContent = "No data available.";
    emptySpan.classList.add("empty-state-message");
    tbody.appendChild(emptySpan);

    for (let i = 0; i < 1; i++) {
      const emptyRow = document.createElement("tr");
      headers.forEach(() => {
        const td = document.createElement("td");
        td.classList.add("empty-state-td");

        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("empty-state-div");
        td.appendChild(emptyDiv);

        emptyRow.appendChild(td);
      });
      tbody.appendChild(emptyRow);
    }
  }

  content.forEach((row) => {
    const tr = document.createElement("tr");

    row.forEach((cell, i) => {
      const td = document.createElement("td");

      const header = headers[i];
      const contentSpan = document.createElement("span");

      // handle first cell case
      if (i === 0) {
        console.log("First cell:", cell);
        const arrowContainer = document.createElement("div");
        arrowContainer.classList.add("arrow-container");

        const arrowIcon = document.createElement("span");
        arrowIcon.classList.add("material-symbols-outlined", "arrow-icon");
        arrowIcon.textContent = "keyboard_arrow_down";

        const label = document.createElement("span");

        arrowContainer.appendChild(arrowIcon);
        arrowContainer.appendChild(label);
        td.appendChild(arrowContainer);

        if (header == "Invoice #") {
          td.classList.add("link");

          const invoiceLink = document.createElement("a");

          invoiceLink.href = `/InvoiceDetails/invoiceDetails.html?id=${cell.id}`;
          invoiceLink.textContent = cell.entryId;
          invoiceLink.classList.add("link");
          invoiceLink.target = "_blank"; // Open in new tab
          invoiceLink.rel = "noopener noreferrer"; // Security measure
          arrowContainer.appendChild(invoiceLink);
        } else {
          label.textContent = cell;
          arrowContainer.appendChild(label);
        }
      }

      //if the cell should be a link
      else if (header === "Customer" || header === "Source") {
        td.classList.add("link");

        contentSpan.textContent = cell;
        td.appendChild(contentSpan);
      }

      //if the cell should be formatted for money
      else if (header === "Invoice Amount") {
        td.classList.add("money");
        td.textContent = cell;
      }

      //create a status component
      else if (header === "Status" || header === "Payment Status") {
        td.appendChild(createStatusComponent(cell));
      }

      //create a payment method component
      else if (header === "Payment Method") {
        const methodDiv = document.createElement("div");
        methodDiv.className = "payment-method";
        methodDiv.innerHTML = `<span>bank icon and card info</span>`;
        td.appendChild(methodDiv);
      }

      //check if actions is enabled
      else if (header === "Actions") {
        td.classList.add("actions-td");
        const btn = document.createElement("button");
        btn.classList.add("actions-button");
        btn.addEventListener("click", () => {
          actionsButtonClick(btn);
        });

        //options icon
        const icon = document.createElement("span");
        icon.classList.add("material-symbols-outlined", "actions-icon");

        icon.textContent = "more_vert";

        //append items
        btn.appendChild(icon);
        td.appendChild(btn);

        //actions stuff
        if (cell.length == 0 || !cell) {
          icon.classList.add("disabled");
          btn.disabled = true;
        } else {
          //create actions list
          const actionsMenu = createActionsMenu(cell);
          td.appendChild(actionsMenu);
        }
      }

      //auto renew or one time payment
      else if (header == "Frequency") {
        const frequencyDiv = document.createElement("div");
        frequencyDiv.classList.add("frequency");

        const frequencyIcon = document.createElement("span");
        frequencyIcon.classList.add(
          "material-symbols-outlined",
          "frequency-icon"
        );

        const frequencyLabel = document.createElement("span");
        frequencyLabel.textContent = cell;

        frequencyDiv.appendChild(frequencyIcon);
        frequencyDiv.appendChild(frequencyLabel);

        if (cell.toLowerCase() == "monthly") {
          frequencyIcon.textContent = "sync";
        }

        //auto renew icon
        else {
          frequencyIcon.textContent = "payment";
        }

        td.appendChild(frequencyDiv);
      }

      //default case
      else {
        contentSpan.textContent = cell;
        td.appendChild(contentSpan);
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  return tbody;
}

/*

<table class="generic-table">
            <thead>
              <tr class="header-row">
                <th class="header-item">
                  <div class="header-item-content">
                    <div class="arrow-container">
                      <span class="material-symbols-outlined arrow-icon">
                        keyboard_arrow_down
                      </span>
                      <span>Payment Date</span>
                    </div>
                    <div>
                      <span class="material-symbols-outlined header-icon">
                        unfold_more
                      </span>
                    </div>
                  </div>
                </th>
                <th class="header-item">
                  <div class="header-item-content">
                    <span>Amount</span>
                    <span class="material-symbols-outlined header-icon">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th class="header-item">
                  <div class="header-item-content">
                    <span>Customer</span>
                    <span class="material-symbols-outlined header-icon">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th class="header-item">
                  <div class="header-item-content">
                    <span>Payment Status</span>
                    <span class="material-symbols-outlined header-icon">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th class="header-item">
                  <div class="header-item-content">
                    <span>Source</span>
                    <span class="material-symbols-outlined header-icon">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th class="header-item">
                  <div class="header-item-content">
                    <span>Payment Method</span>
                    <span class="material-symbols-outlined header-icon">
                      unfold_more
                    </span>
                  </div>
                </th>
                <th class="header-item">
                  <div class="header-item-content actions">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <div class="arrow-container">
                    <span class="material-symbols-outlined arrow-icon">
                      keyboard_arrow_down
                    </span>
                    <span>04/04/2025</span>
                  </div>
                </td>
                <td class="money">$40.00</td>
                <td class="link">John Doe</td>
                <td>
                  <span class="status scheduled"> Scheduled </span>
                </td>
                <td class="link">Invoice #001111</td>
                <td>
                  <div class="payment-method">
                    <span>bank icon and card info</span>
                  </div>
                </td>

                <td class="actions-td">
                  <button class="actions-button">
                    <span
                      class="material-symbols-outlined actions-icon disabled"
                    >
                      more_vert
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>




*/
