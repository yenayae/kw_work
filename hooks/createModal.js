export default function createModal(contentBuilder) {
  // Overlay
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  // Modal Box
  const modalBox = document.createElement("div");
  modalBox.classList.add("modal-box");

  // Close Button
  const closeButton = document.createElement("span");
  closeButton.classList.add("modal-close", "material-symbols-outlined");
  closeButton.textContent = "close";
  closeButton.onclick = () => overlay.remove();
  modalBox.appendChild(closeButton);

  // Custom Content
  const content = contentBuilder();
  modalBox.appendChild(content);

  // Close on clicking outside modalBox
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}
