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
const workCarousels = [];

document.querySelectorAll(".work-track").forEach((track) => {
  const cards = Array.from(track.querySelectorAll(".work-card"));
  const marquee = track.closest(".work-marquee");

  if (!marquee || cards.length === 0) {
    return;
  }

  cards
    .sort((a, b) => String(b.dataset.published).localeCompare(String(a.dataset.published)))
    .forEach((card) => track.append(card));

  const sortedCards = Array.from(track.querySelectorAll(".work-card"));
  const prevButton = document.createElement("button");
  const nextButton = document.createElement("button");
  const dots = document.createElement("div");
  let currentIndex = 0;

  prevButton.className = "work-slide-button work-slide-button-prev";
  prevButton.type = "button";
  prevButton.setAttribute("aria-label", "前の作品を表示");
  prevButton.textContent = "‹";

  nextButton.className = "work-slide-button work-slide-button-next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "次の作品を表示");
  nextButton.textContent = "›";

  dots.className = "work-dots";
  dots.setAttribute("aria-label", "表示中の作品");

  const dotButtons = sortedCards.map((card, index) => {
    const dot = document.createElement("button");
    const title = card.querySelector("h4")?.textContent.trim() || `${index + 1}番目の作品`;

    dot.className = "work-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `${title}を表示`);
    dots.append(dot);
    return dot;
  });

  marquee.append(prevButton, nextButton, dots);

  const syncDots = () => {
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === sortedCards.length - 1;

    dotButtons.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const animateEdgeUpdate = () => {
    const endTime = performance.now() + 420;

    const tick = () => {
      updateWorkCardEdges();

      if (performance.now() < endTime) {
        requestAnimationFrame(tick);
      }
    };

    tick();
  };

  const showSlide = (nextIndex) => {
    currentIndex = Math.max(0, Math.min(nextIndex, sortedCards.length - 1));

    const target = sortedCards[currentIndex];
    const offset = (marquee.clientWidth / 2) - target.offsetLeft - (target.offsetWidth / 2);

    track.style.setProperty("--track-offset", `${Math.round(offset)}px`);
    syncDots();
    animateEdgeUpdate();
  };

  prevButton.addEventListener("click", () => {
    showSlide(currentIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentIndex + 1);
  });

  dotButtons.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
    });
  });

  workCarousels.push(() => {
    showSlide(currentIndex);
  });
  showSlide(0);
});

function updateWorkCardEdges() {
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
}

if (workMarquees.length > 0) {
  updateWorkCardEdges();
}

window.addEventListener("resize", () => {
  workCarousels.forEach((updateCarousel) => {
    updateCarousel();
  });
});
