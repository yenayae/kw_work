//processing fee listeners
const radios = document.querySelectorAll('input[name="processing-fee"]');
let selectedRadio = null;

radios.forEach((radio) => {
  radio.addEventListener("click", function () {
    if (selectedRadio === this) {
      this.checked = false;
      selectedRadio = null;
    } else {
      selectedRadio = this;
    }
  });
});
