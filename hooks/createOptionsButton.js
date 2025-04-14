export default function createOptionsButton(labelContent, isBlue = false) {
  const optionsButton = document.createElement("button");
  optionsButton.classList.add("options-button");

  if (isBlue) {
    optionsButton.classList.add("blue");
  }

  optionsButton.setAttribute(
    "onclick",
    "window.location.href = 'invoiceBuilder.html'"
  );

  const icon = document.createElement("span");
  icon.classList.add("material-symbols-outlined", "plus-icon");
  icon.textContent = "add";

  const label = document.createElement("span");
  label.textContent = labelContent;

  optionsButton.appendChild(icon);
  optionsButton.appendChild(label);

  return optionsButton;
}
