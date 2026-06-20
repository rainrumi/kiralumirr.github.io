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

if (menuButton && siteNav) {
  menuButton.setAttribute("aria-label", "Menu");

  menuButton.addEventListener("click", () => {
    menuButton.setAttribute("aria-label", siteNav.classList.contains("is-open") ? "Close menu" : "Menu");
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

  const isSliderControl = (target) => target instanceof Element && target.closest(".work-slide-button, .work-dots");

  const beginDrag = (event, clientX, clientY, pointerId) => {
    if (isSliderControl(event.target)) {
      return;
    }

    dragStartX = clientX;
    dragStartY = clientY;
    dragPointerId = pointerId;
    isDragging = true;
    marquee.classList.add("is-dragging");
  };

  const updateDrag = (event, clientX, clientY, pointerId) => {
    if (!isDragging || pointerId !== dragPointerId) {
      return;
    }

    const horizontalMove = Math.abs(clientX - dragStartX);
    const verticalMove = Math.abs(clientY - dragStartY);

    if (horizontalMove > verticalMove && horizontalMove > 8) {
      event.preventDefault();
    }
  };

  const finishDrag = (event, clientX, clientY, pointerId) => {
    if (!isDragging || pointerId !== dragPointerId) {
      return;
    }

    const horizontalMove = clientX - dragStartX;
    const verticalMove = clientY - dragStartY;
    const shouldSlide = Math.abs(horizontalMove) >= 48 && Math.abs(horizontalMove) > Math.abs(verticalMove);

    isDragging = false;
    dragPointerId = null;
    marquee.classList.remove("is-dragging");

    if (shouldSlide) {
      suppressClick = true;
      showSlide(horizontalMove < 0 ? currentIndex + 1 : currentIndex - 1);
      window.setTimeout(() => {
        suppressClick = false;
      }, 350);
    }
  };

  marquee.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    beginDrag(event, event.clientX, event.clientY, event.pointerId);

    if (isDragging && marquee.setPointerCapture) {
      marquee.setPointerCapture(event.pointerId);
    }
  });

  marquee.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    updateDrag(event, event.clientX, event.clientY, event.pointerId);
  });

  marquee.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    finishDrag(event, event.clientX, event.clientY, event.pointerId);

    if (marquee.hasPointerCapture && marquee.hasPointerCapture(event.pointerId)) {
      marquee.releasePointerCapture(event.pointerId);
    }
  });

  marquee.addEventListener("pointercancel", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    finishDrag(event, event.clientX, event.clientY, event.pointerId);

    if (marquee.hasPointerCapture && marquee.hasPointerCapture(event.pointerId)) {
      marquee.releasePointerCapture(event.pointerId);
    }
  });

  marquee.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    beginDrag(event, touch.clientX, touch.clientY, touch.identifier);
  }, { passive: true });

  marquee.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    updateDrag(event, touch.clientX, touch.clientY, touch.identifier);
  }, { passive: false });

  marquee.addEventListener("touchend", (event) => {
    const touch = Array.from(event.changedTouches).find((changedTouch) => changedTouch.identifier === dragPointerId);

    if (!touch) {
      return;
    }

    finishDrag(event, touch.clientX, touch.clientY, touch.identifier);
  });

  marquee.addEventListener("touchcancel", (event) => {
    const touch = Array.from(event.changedTouches).find((changedTouch) => changedTouch.identifier === dragPointerId);

    if (!touch) {
      return;
    }

    finishDrag(event, touch.clientX, touch.clientY, touch.identifier);
  });

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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!prefersReducedMotion.matches) {
  const rippleCanvas = document.createElement("canvas");
  const rippleContext = rippleCanvas.getContext("2d");
  const ripples = [];
  const activePointers = new Map();
  const maxRipples = 58;
  const rippleDistance = 18;
  const rippleDuration = 1350;
  let ripplePixelRatio = 1;
  let rippleAnimationId = 0;

  rippleCanvas.className = "water-ripple-layer";
  rippleCanvas.setAttribute("aria-hidden", "true");
  document.body.prepend(rippleCanvas);

  const resizeRippleCanvas = () => {
    ripplePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    rippleCanvas.width = Math.ceil(window.innerWidth * ripplePixelRatio);
    rippleCanvas.height = Math.ceil(window.innerHeight * ripplePixelRatio);
    rippleCanvas.style.width = `${window.innerWidth}px`;
    rippleCanvas.style.height = `${window.innerHeight}px`;

    if (rippleContext) {
      rippleContext.setTransform(ripplePixelRatio, 0, 0, ripplePixelRatio, 0, 0);
    }
  };

  const addRipple = (x, y, force = 1) => {
    ripples.push({
      x,
      y,
      force,
      startedAt: performance.now(),
    });

    if (ripples.length > maxRipples) {
      ripples.splice(0, ripples.length - maxRipples);
    }

    if (!rippleAnimationId) {
      rippleAnimationId = window.requestAnimationFrame(drawRipples);
    }
  };

  function drawRipples(now) {
    if (!rippleContext) {
      return;
    }

    rippleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let index = ripples.length - 1; index >= 0; index -= 1) {
      const ripple = ripples[index];
      const progress = (now - ripple.startedAt) / rippleDuration;

      if (progress >= 1) {
        ripples.splice(index, 1);
        continue;
      }

      const eased = 1 - Math.pow(1 - progress, 3);
      const radius = 12 + eased * (74 + ripple.force * 20);
      const alpha = (1 - progress) * 0.36 * ripple.force;
      const highlight = rippleContext.createRadialGradient(ripple.x, ripple.y, Math.max(2, radius * 0.16), ripple.x, ripple.y, radius);

      highlight.addColorStop(0, `rgba(235, 255, 255, ${alpha * 0.1})`);
      highlight.addColorStop(0.54, `rgba(162, 235, 255, ${alpha * 0.18})`);
      highlight.addColorStop(1, "rgba(162, 235, 255, 0)");

      rippleContext.beginPath();
      rippleContext.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      rippleContext.fillStyle = highlight;
      rippleContext.fill();

      rippleContext.beginPath();
      rippleContext.arc(ripple.x, ripple.y, radius * 0.72, 0, Math.PI * 2);
      rippleContext.strokeStyle = `rgba(232, 255, 255, ${alpha})`;
      rippleContext.lineWidth = 1.4;
      rippleContext.stroke();

      rippleContext.beginPath();
      rippleContext.arc(ripple.x - radius * 0.12, ripple.y - radius * 0.1, radius * 0.34, -0.25, Math.PI * 1.08);
      rippleContext.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      rippleContext.lineWidth = 0.9;
      rippleContext.stroke();
    }

    if (ripples.length > 0 || activePointers.size > 0) {
      rippleAnimationId = window.requestAnimationFrame(drawRipples);
    } else {
      rippleAnimationId = 0;
    }
  }

  const updatePointerRipple = (event, isStart = false) => {
    const pointer = activePointers.get(event.pointerId);

    if (!pointer) {
      return;
    }

    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    const distance = Math.hypot(dx, dy);
    const now = performance.now();

    if (!isStart && distance < rippleDistance && now - pointer.lastAt < 80) {
      return;
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.lastAt = now;
    addRipple(event.clientX, event.clientY, isStart ? 1.1 : Math.min(1.35, 0.8 + distance / 80));
  };

  resizeRippleCanvas();

  window.addEventListener("resize", resizeRippleCanvas);

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      lastAt: performance.now(),
    });
    updatePointerRipple(event, true);
  }, { passive: true });

  window.addEventListener("pointermove", (event) => {
    updatePointerRipple(event);
  }, { passive: true });

  const removePointerRipple = (event) => {
    activePointers.delete(event.pointerId);
  };

  window.addEventListener("pointerup", removePointerRipple, { passive: true });
  window.addEventListener("pointercancel", removePointerRipple, { passive: true });
  window.addEventListener("blur", () => {
    activePointers.clear();
  });

  const bubbleLayer = document.createElement("div");
  const maxBubbles = 18;

  bubbleLayer.className = "bubble-layer";
  bubbleLayer.setAttribute("aria-hidden", "true");
  document.body.prepend(bubbleLayer);

  const createBubble = () => {
    if (bubbleLayer.childElementCount >= maxBubbles) {
      bubbleLayer.firstElementChild?.remove();
    }

    const bubble = document.createElement("span");
    const isLeftSide = Math.random() < 0.5;
    const edgeOffset = Math.round(12 + Math.random() * 82);
    const size = Math.round(5 + Math.random() * 10);
    const drift = Math.round((Math.random() * 34 + 8) * (isLeftSide ? 1 : -1));
    const duration = (14 + Math.random() * 9).toFixed(2);
    const opacity = (0.16 + Math.random() * 0.12).toFixed(2);

    bubble.className = "water-bubble";
    bubble.style.setProperty("--bubble-left", isLeftSide ? `${edgeOffset}px` : `calc(100% - ${edgeOffset}px)`);
    bubble.style.setProperty("--bubble-size", `${size}px`);
    bubble.style.setProperty("--bubble-drift", `${drift}px`);
    bubble.style.setProperty("--bubble-duration", `${duration}s`);
    bubble.style.setProperty("--bubble-opacity", opacity);
    bubble.addEventListener("animationend", () => {
      bubble.remove();
    });

    bubbleLayer.append(bubble);
  };

  for (let index = 0; index < 6; index += 1) {
    window.setTimeout(createBubble, index * 460);
  }

  window.setInterval(createBubble, 1300);
}
