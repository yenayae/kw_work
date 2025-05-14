export function mountCardPayment(containerId, stripe) {
  const elements = stripe.elements();
  const cardElement = elements.create("card");
  cardElement.mount(containerId);
}

export function mountBankPayment(containerId) {
  const container = document.querySelector(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found.`);
    return;
  }

  const holderNameInput = document.createElement("input");
  holderNameInput.setAttribute("placeholder", "Account Holder Name");
  holderNameInput.setAttribute("id", "account-holder-name");
  holderNameInput.setAttribute("type", "text");
  holderNameInput.setAttribute("autocomplete", "off");
  holderNameInput.setAttribute("autocorrect", "off");
  holderNameInput.required = true;
  container.appendChild(holderNameInput);

  const routingInput = document.createElement("input");
  routingInput.setAttribute("placeholder", "Routing Number");
  routingInput.setAttribute("id", "bank-routing");
  routingInput.setAttribute("type", "text");
  routingInput.setAttribute("autocomplete", "off");
  routingInput.required = true;
  container.appendChild(routingInput);

  const accountInput = document.createElement("input");
  accountInput.setAttribute("placeholder", "Account Number");
  accountInput.setAttribute("id", "bank-account");
  accountInput.setAttribute("type", "text");
  accountInput.setAttribute("autocomplete", "off");
  accountInput.required = true;
  container.appendChild(accountInput);

  const selectBankType = document.createElement("select");
  selectBankType.setAttribute("id", "bank-type");
  container.appendChild(selectBankType);

  const checkingOption = document.createElement("option");
  checkingOption.value = "checking";
  checkingOption.text = "Checking";
  selectBankType.appendChild(checkingOption);

  const savingsOption = document.createElement("option");
  savingsOption.value = "savings";
  savingsOption.text = "Savings";
  selectBankType.appendChild(savingsOption);
}
