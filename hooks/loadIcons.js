export default function loadIcons() {
  document.fonts.ready.then(() => {
    document.querySelectorAll(".material-symbols-outlined").forEach((el) => {
      el.style.visibility = "visible";
    });
  });
}
