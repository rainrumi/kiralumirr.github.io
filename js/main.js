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

const workMarquees = document.querySelectorAll(".work-marquee");

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

const updateWorkCardEdges = () => {
  workMarquees.forEach((marquee) => {
    const marqueeRect = marquee.getBoundingClientRect();
    const edgeSize = Math.min(140, marqueeRect.width * 0.22);

    marquee.querySelectorAll(".work-card").forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const center = cardRect.left + cardRect.width / 2;
      const leftDistance = center - marqueeRect.left;
      const rightDistance = marqueeRect.right - center;
      const edgeDistance = Math.min(leftDistance, rightDistance);
      const progress = Math.max(0, Math.min(1, edgeDistance / edgeSize));
      const eased = progress * progress * (3 - 2 * progress);
      const scale = 0.74 + eased * 0.26;
      const opacity = eased;
      const blur = (1 - eased) * 2.8;

      card.style.setProperty("--edge-scale", scale.toFixed(3));
      card.style.setProperty("--edge-opacity", opacity.toFixed(3));
      card.style.setProperty("--edge-blur", `${blur.toFixed(2)}px`);
    });
  });

  requestAnimationFrame(updateWorkCardEdges);
};

if (workMarquees.length > 0) {
  updateWorkCardEdges();
}
