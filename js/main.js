const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

if (menuButton && siteNav) {
  menuButton.textContent = "メニューを開く";

  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "メニューを閉じる" : "メニューを開く";
  });
}

document.querySelectorAll(".work-track").forEach((track) => {
  const cards = Array.from(track.querySelectorAll(".work-card"));

  cards
    .sort((a, b) => String(b.dataset.published).localeCompare(String(a.dataset.published)))
    .forEach((card) => track.append(card));

  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    track.append(clone);
  });

  track.classList.add("is-looping");
});
