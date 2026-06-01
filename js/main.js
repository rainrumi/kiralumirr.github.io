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
  const cardCount = sortedCards.length;
  const prevButton = document.createElement("button");
  const nextButton = document.createElement("button");
  const dots = document.createElement("div");
  let currentIndex = 0;
  let visualIndex = cardCount;
  let isAnimating = false;
  let transitionFallbackId = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragPointerId = null;
  let isDragging = false;
  let suppressClick = false;

  sortedCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    track.append(clone);
  });

  sortedCards
    .slice()
    .reverse()
    .forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a").forEach((link) => {
        link.setAttribute("tabindex", "-1");
      });
      track.prepend(clone);
    });

  const visibleCards = Array.from(track.querySelectorAll(".work-card"));

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
    visibleCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === visualIndex);
    });

    dotButtons.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const updatePosition = (withTransition = true) => {
    const target = visibleCards[visualIndex];
    const marqueeStyle = window.getComputedStyle(marquee);
    const marqueePaddingLeft = parseFloat(marqueeStyle.paddingLeft) || 0;
    const offset = (marquee.clientWidth / 2) - marqueePaddingLeft - target.offsetLeft - (target.offsetWidth / 2);

    track.style.transition = withTransition ? "" : "none";
    track.style.setProperty("--track-offset", `${Math.round(offset)}px`);
    syncDots();
    updateWorkCardEdges();

    if (!withTransition) {
      track.offsetHeight;
      track.style.transition = "";
    }
  };

  const normalizeLoopPosition = () => {
    const normalizedIndex = ((currentIndex % cardCount) + cardCount) % cardCount;

    if (visualIndex < cardCount) {
      visualIndex += cardCount;
    } else if (visualIndex >= cardCount * 2) {
      visualIndex -= cardCount;
    }

    currentIndex = normalizedIndex;
    updatePosition(false);
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

  const finishMovement = (shouldNormalize) => {
    window.clearTimeout(transitionFallbackId);
    isAnimating = false;

    if (shouldNormalize) {
      normalizeLoopPosition();
    } else {
      updateWorkCardEdges();
    }
  };

  const waitForMovement = (shouldNormalize) => {
    const onTransitionEnd = (event) => {
      if (event.target !== track || event.propertyName !== "transform") {
        return;
      }

      track.removeEventListener("transitionend", onTransitionEnd);
      finishMovement(shouldNormalize);
    };

    track.addEventListener("transitionend", onTransitionEnd);
    transitionFallbackId = window.setTimeout(() => {
      track.removeEventListener("transitionend", onTransitionEnd);
      finishMovement(shouldNormalize);
    }, 560);
  };

  const showSlide = (nextIndex) => {
    if (isAnimating) {
      return;
    }

    let difference = nextIndex - currentIndex;

    if (difference > cardCount / 2) {
      difference -= cardCount;
    } else if (difference < cardCount / -2) {
      difference += cardCount;
    }

    currentIndex = ((nextIndex % cardCount) + cardCount) % cardCount;
    visualIndex += difference;
    isAnimating = true;

    updatePosition(true);
    animateEdgeUpdate();
    waitForMovement(visualIndex < cardCount || visualIndex >= cardCount * 2);
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

  marquee.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".work-slide-button, .work-dots")) {
      return;
    }

    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragPointerId = event.pointerId;
    isDragging = true;
    marquee.classList.add("is-dragging");
    marquee.setPointerCapture(event.pointerId);
  });

  marquee.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== dragPointerId) {
      return;
    }

    const horizontalMove = Math.abs(event.clientX - dragStartX);
    const verticalMove = Math.abs(event.clientY - dragStartY);

    if (horizontalMove > verticalMove && horizontalMove > 8) {
      event.preventDefault();
    }
  });

  const finishDrag = (event) => {
    if (!isDragging || event.pointerId !== dragPointerId) {
      return;
    }

    const horizontalMove = event.clientX - dragStartX;
    const verticalMove = event.clientY - dragStartY;
    const shouldSlide = Math.abs(horizontalMove) >= 48 && Math.abs(horizontalMove) > Math.abs(verticalMove);

    isDragging = false;
    dragPointerId = null;
    marquee.classList.remove("is-dragging");

    if (marquee.hasPointerCapture(event.pointerId)) {
      marquee.releasePointerCapture(event.pointerId);
    }

    if (shouldSlide) {
      suppressClick = true;
      showSlide(horizontalMove < 0 ? currentIndex + 1 : currentIndex - 1);
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
  };

  marquee.addEventListener("pointerup", finishDrag);
  marquee.addEventListener("pointercancel", finishDrag);

  track.addEventListener("click", (event) => {
    if (!suppressClick) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }, true);

  workCarousels.push(() => {
    updatePosition(false);
  });
  updatePosition(false);
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
      const cardScale = scale * (card.classList.contains("is-active") ? 1.18 : 1);
      const opacity = eased;
      const blur = (1 - eased) * 2.8;

      card.style.setProperty("--card-scale", cardScale.toFixed(3));
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
