export default function createTable(headers, content) {
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
    } else {
      div.classList.add("actions");
    }

    th.appendChild(div);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ===== Create TBODY =====
  const tbody = document.createElement("tbody");

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
        label.textContent = cell;

        arrowContainer.appendChild(arrowIcon);
        arrowContainer.appendChild(label);
        td.appendChild(arrowContainer);

        if (header == "Invoice #") {
          td.classList.add("link");
        }
      }

      //if the cell should be a link
      else if (
        header === "Customer" ||
        header === "Source" ||
        header === "Invoice #"
      ) {
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
      else if (header === "Status") {
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

        //options icon
        const icon = document.createElement("span");
        icon.classList.add("material-symbols-outlined", "actions-icon");
        if (!cell) {
          icon.classList.add("disabled");
        }
        icon.textContent = "more_vert";

        //append items
        btn.appendChild(icon);
        td.appendChild(btn);
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

        if (cell == "monthly") {
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

  table.appendChild(tbody);

  return table;
}

function createStatusComponent(status) {
  const statusSpan = document.createElement("span");

  statusSpan.classList.add("status", status.replace(/\s+/g, "-").toLowerCase());
  statusSpan.textContent = status;
  return statusSpan;
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
