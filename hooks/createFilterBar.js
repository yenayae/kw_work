export default function createFilterBar(filters, onFilterApply) {
  const filterBar = document.createElement("div");
  filterBar.classList.add("filter-bar");
  filterBar.id = "filter-bar";

  let activeButton = null;
  let activeMenu = null;

  //close menu when clicking outside
  function closeMenu() {
    if (activeButton && activeMenu) {
      activeButton.classList.remove("selected");
      activeMenu.classList.add("hidden");
      activeMenu.classList.remove("visible");
      activeButton = null;
      activeMenu = null;
    }
  }

  filters.forEach((filter) => {
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("filter-button-wrapper");

    const button = document.createElement("button");
    button.classList.add("filter-button");

    const filterMenu = createFilterMenu(
      filter.name,
      filter.options,
      closeMenu,
      button,
      onFilterApply
    );
    filterMenu.classList.add("hidden");

    button.onclick = () => {
      const isActive = button === activeButton;

      closeMenu(); // close any open menu

      if (!isActive) {
        button.classList.add("selected");
        filterMenu.classList.remove("hidden");
        filterMenu.classList.add("visible");
        activeButton = button;
        activeMenu = filterMenu;
        console.log(`Filter applied: ${filter.name}`);
      }
    };

    const icon = document.createElement("span");
    icon.classList.add("material-symbols-outlined", "plus-icon");
    icon.textContent = "add";

    const label = document.createElement("span");
    label.textContent = filter.name;

    button.appendChild(icon);
    button.appendChild(label);
    buttonWrapper.appendChild(button);
    buttonWrapper.appendChild(filterMenu);
    filterBar.appendChild(buttonWrapper);
  });

  return filterBar;
}

function createFilterMenu(
  title,
  options,
  onClose,
  filterButton,
  onFilterApply
) {
  const filterMenu = document.createElement("div");
  filterMenu.classList.add("filter-menu", "hidden");

  // header =========================================
  const menuHeader = document.createElement("div");
  menuHeader.classList.add("filter-menu-header");

  const menuHeaderSpan = document.createElement("span");
  menuHeaderSpan.textContent = title;
  menuHeader.appendChild(menuHeaderSpan);

  const closeButton = document.createElement("button");
  closeButton.classList.add(
    "close-icon",
    "material-symbols-outlined",
    "filter-menu-close"
  );
  closeButton.textContent = "close";
  closeButton.onclick = () => {
    console.log("Filter menu closed");
    onClose?.();
  };
  menuHeader.appendChild(closeButton);
  filterMenu.appendChild(menuHeader);

  // options =========================================
  const menuDivider = document.createElement("hr");
  filterMenu.appendChild(menuDivider);

  const menuOptions = document.createElement("div");
  menuOptions.classList.add("filter-menu-options");
  filterMenu.appendChild(menuOptions);

  const menuOptionsList = document.createElement("ul");
  menuOptionsList.classList.add("filter-menu-list");
  menuOptions.appendChild(menuOptionsList);

  const checkboxes = [];

  function updateButtonStates() {
    const anyChecked = checkboxes.some((cb) => cb.checked);
    if (anyChecked) {
      clearButton.classList.remove("disabled");
      applyButton.classList.remove("disabled");
    } else {
      clearButton.classList.add("disabled");
      applyButton.classList.add("disabled");
    }
  }

  options.forEach((option) => {
    const optionWrapper = document.createElement("div");
    optionWrapper.classList.add("filter-option-wrapper");

    const filterOption = document.createElement("label");
    filterOption.classList.add("filter-option");

    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.id = option;
    checkboxInput.name = option;
    checkboxInput.value = option;
    checkboxInput.addEventListener("change", () => {
      console.log(
        `Filter option ${option} ${
          checkboxInput.checked ? "selected" : "deselected"
        }`
      );
      updateButtonStates();
    });

    checkboxes.push(checkboxInput);

    const customBox = document.createElement("span");
    customBox.classList.add("custom-box");

    const label = document.createElement("span");
    label.textContent = option;

    filterOption.appendChild(checkboxInput);
    filterOption.appendChild(customBox);
    filterOption.appendChild(label);
    optionWrapper.appendChild(filterOption);
    menuOptions.appendChild(optionWrapper);
  });

  // footer =========================================
  const menuFooterDivider = document.createElement("hr");
  menuOptions.appendChild(menuFooterDivider);

  const menuFooter = document.createElement("div");
  menuFooter.classList.add("filter-menu-footer");

  const clearButton = document.createElement("button");
  clearButton.classList.add("filter-menu-button", "clear", "disabled");
  clearButton.textContent = "Clear";
  clearButton.onclick = () => {
    checkboxes.forEach((cb) => (cb.checked = false));
    updateButtonStates();
    filterButton.classList.remove("filtered");
    console.log("Filter cleared");
    onClose?.();
    if (onFilterApply) {
      onFilterApply(title, []); // Call with empty filters when cleared
    }
  };

  const applyButton = document.createElement("button");
  applyButton.classList.add("filter-menu-button", "apply", "disabled");
  applyButton.textContent = "Apply";
  applyButton.onclick = () => {
    const anyChecked = checkboxes.some((cb) => cb.checked);
    if (anyChecked) {
      filterButton.classList.add("filtered");
      const selectedOptions = checkboxes
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
      if (onFilterApply) {
        onFilterApply(title, selectedOptions);
      }
    } else {
      filterButton.classList.remove("filtered");
      if (onFilterApply) {
        onFilterApply(title, []); // Call with empty filters when none selected
      }
    }
    console.log("Filter applied");
    onClose?.();
  };

  menuFooter.appendChild(clearButton);
  menuFooter.appendChild(applyButton);
  menuOptions.appendChild(menuFooter);

  return filterMenu;
}
