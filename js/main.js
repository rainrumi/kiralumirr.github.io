const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const pageTopButton = document.querySelector(".page-top-button");
const nameBubbles = document.querySelectorAll(".profile-name-bubble");
const relatedPanels = Array.from(document.querySelectorAll(".related-panel"));
let lastRelatedPanelOpener = null;

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

document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (menuButton && siteNav) {
      siteNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Menu");
      menuButton.textContent = "メニューを開く";
    }
  });
});

if (pageTopButton) {
  const updatePageTopButton = () => {
    const isVisible = window.scrollY > 120;

    pageTopButton.classList.toggle("is-visible", isVisible);
    pageTopButton.setAttribute("aria-hidden", String(!isVisible));
    pageTopButton.tabIndex = isVisible ? 0 : -1;
  };

  updatePageTopButton();
  window.addEventListener("scroll", updatePageTopButton, { passive: true });
}

if (nameBubbles.length > 0) {
  const restoreNameBubbleIds = new WeakMap();

  nameBubbles.forEach((nameBubble) => {
    nameBubble.addEventListener("click", () => {
      if (nameBubble.classList.contains("is-popped")) {
        return;
      }

      nameBubble.classList.add("is-popped");
      window.clearTimeout(restoreNameBubbleIds.get(nameBubble));
      restoreNameBubbleIds.set(nameBubble, window.setTimeout(() => {
        nameBubble.classList.remove("is-popped");
        restoreNameBubbleIds.delete(nameBubble);
      }, 6400));
    });
  });
}

if (relatedPanels.length > 0) {
  relatedPanels.forEach((panel) => {
    panel.setAttribute("aria-hidden", "true");
  });

  const getHashPanel = () => {
    const hashValue = window.location.hash.replace(/^#/, "");
    let panelId = hashValue;

    try {
      panelId = decodeURIComponent(hashValue);
    } catch {
      panelId = hashValue;
    }

    return relatedPanels.find((panel) => panel.id === panelId) || null;
  };

  const closeRelatedPanels = (shouldRestoreFocus = false) => {
    relatedPanels.forEach((panel) => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("is-related-panel-open");

    if (shouldRestoreFocus && lastRelatedPanelOpener) {
      lastRelatedPanelOpener.focus();
    }
  };

  const openRelatedPanel = (targetPanel) => {
    relatedPanels.forEach((panel) => {
      const isTarget = panel === targetPanel;

      panel.classList.toggle("is-open", isTarget);
      panel.setAttribute("aria-hidden", String(!isTarget));
    });

    document.body.classList.add("is-related-panel-open");
    window.setTimeout(() => {
      targetPanel.focus({ preventScroll: true });
    }, 0);
  };

  const syncRelatedPanel = (shouldRestoreFocus = false) => {
    const targetPanel = getHashPanel();

    if (targetPanel) {
      openRelatedPanel(targetPanel);
      return;
    }

    closeRelatedPanels(shouldRestoreFocus);
  };

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const opener = target.closest(".work-related-link");

    if (opener) {
      event.preventDefault();
      lastRelatedPanelOpener = opener;

      const panelId = opener.getAttribute("data-related-panel") || opener.getAttribute("href")?.replace(/^#/, "");
      const targetPanel = relatedPanels.find((panel) => panel.id === panelId);

      if (!targetPanel) {
        return;
      }

      if (window.location.hash !== `#${targetPanel.id}`) {
        window.location.hash = targetPanel.id;
      } else {
        openRelatedPanel(targetPanel);
      }

      return;
    }

    if (target.closest("[data-related-close]")) {
      window.setTimeout(() => {
        closeRelatedPanels(true);
      }, 0);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !document.body.classList.contains("is-related-panel-open")) {
      return;
    }

    event.preventDefault();

    if (getHashPanel()) {
      window.location.hash = "works";
      return;
    }

    closeRelatedPanels(true);
  });

  window.addEventListener("hashchange", () => {
    syncRelatedPanel(true);
  });

  syncRelatedPanel(false);
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

  track.addEventListener("click", (event) => {
    if (suppressClick || event.defaultPrevented) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const cardLink = target.closest(".work-card-link");

    if (!cardLink || !track.contains(cardLink)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (cardLink.target === "_blank") {
      const openedWindow = window.open(cardLink.href, "_blank");

      if (openedWindow) {
        openedWindow.opener = null;
      } else {
        window.location.href = cardLink.href;
      }

      return;
    }

    window.location.href = cardLink.href;
  });

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
  const waterMarks = [];
  const tapRipples = [];
  const pointerStarts = new Map();
  const maxWaterMarks = 16;
  const maxTapRipples = 12;
  const waterMarkDuration = 3200;
  const tapRippleDuration = 1150;
  const waterMarkMargin = 80;
  let ripplePixelRatio = 1;
  let wakeAnimationId = 0;
  let waterMarkTimeoutId = 0;
  let lastTapRipple = null;

  rippleCanvas.className = "water-ripple-layer";
  rippleCanvas.setAttribute("aria-hidden", "true");
  document.body.prepend(rippleCanvas);

  const getRippleViewport = () => {
    return {
      width: window.visualViewport?.width || window.innerWidth,
      height: window.visualViewport?.height || window.innerHeight,
    };
  };

  const resizeRippleCanvas = () => {
    const viewport = getRippleViewport();

    ripplePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    rippleCanvas.width = Math.ceil(viewport.width * ripplePixelRatio);
    rippleCanvas.height = Math.ceil(viewport.height * ripplePixelRatio);
    rippleCanvas.style.width = `${viewport.width}px`;
    rippleCanvas.style.height = `${viewport.height}px`;

    if (rippleContext) {
      rippleContext.setTransform(ripplePixelRatio, 0, 0, ripplePixelRatio, 0, 0);
    }
  };

  const queueWaterMark = () => {
    const viewport = getRippleViewport();

    waterMarks.push({
      x: -waterMarkMargin + Math.random() * (viewport.width + waterMarkMargin * 2),
      y: -waterMarkMargin + Math.random() * (viewport.height + waterMarkMargin * 2),
      scale: 1 + Math.random() * 9,
      rotation: Math.random() * Math.PI,
      driftX: (Math.random() - 0.5) * 18,
      driftY: (Math.random() - 0.5) * 18,
      startedAt: performance.now(),
    });

    if (waterMarks.length > maxWaterMarks) {
      waterMarks.splice(0, waterMarks.length - maxWaterMarks);
    }

    startWaterAnimation();
  };

  const queueTapRipple = (x, y) => {
    tapRipples.push({
      x,
      y,
      startedAt: performance.now(),
    });

    if (tapRipples.length > maxTapRipples) {
      tapRipples.splice(0, tapRipples.length - maxTapRipples);
    }

    startWaterAnimation();
  };

  const isRippleBlockedTarget = (target) => {
    return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select, summary, [role='button'], .work-marquee"));
  };

  const drawWaterMark = (context, mark, now) => {
    const progress = (now - mark.startedAt) / waterMarkDuration;

    if (progress >= 1) {
      return false;
    }

    const eased = 1 - Math.pow(1 - progress, 2.2);
    const baseRadius = mark.scale * (7 + eased * 6);
    const alpha = (1 - progress) * (0.16 + mark.scale * 0.012);
    const x = mark.x + mark.driftX * eased;
    const y = mark.y + mark.driftY * eased;

    context.save();
    context.translate(x, y);
    context.rotate(mark.rotation);

    for (let ring = 0; ring < 3; ring += 1) {
      const ringProgress = Math.max(0, Math.min(1, progress + ring * 0.12));
      const radius = baseRadius * (1 + ringProgress * (1.1 + ring * 0.26));

      context.beginPath();
      context.ellipse(0, 0, radius * (1.42 + ring * 0.08), radius * (0.72 + ring * 0.04), 0, 0, Math.PI * 2);
      context.strokeStyle = `rgba(224, 255, 255, ${alpha * (1 - ring * 0.24)})`;
      context.lineWidth = Math.max(0.65, 1.6 - ring * 0.32);
      context.stroke();
    }

    const haze = context.createRadialGradient(0, 0, baseRadius * 0.4, 0, 0, baseRadius * 2.4);

    haze.addColorStop(0, `rgba(226, 255, 255, ${alpha * 0.08})`);
    haze.addColorStop(1, "rgba(226, 255, 255, 0)");

    context.beginPath();
    context.ellipse(0, 0, baseRadius * 2.4, baseRadius * 1.1, 0, 0, Math.PI * 2);
    context.fillStyle = haze;
    context.fill();
    context.restore();

    return true;
  };

  const drawTapRipple = (context, ripple, now) => {
    const progress = (now - ripple.startedAt) / tapRippleDuration;

    if (progress >= 1) {
      return false;
    }

    const eased = 1 - Math.pow(1 - progress, 2.4);
    const radius = 14 + eased * 86;
    const alpha = (1 - progress) * 0.38;
    const glow = context.createRadialGradient(ripple.x, ripple.y, radius * 0.12, ripple.x, ripple.y, radius * 1.12);

    glow.addColorStop(0, `rgba(235, 255, 255, ${alpha * 0.08})`);
    glow.addColorStop(0.62, `rgba(142, 229, 255, ${alpha * 0.16})`);
    glow.addColorStop(1, "rgba(142, 229, 255, 0)");

    context.beginPath();
    context.arc(ripple.x, ripple.y, radius * 1.12, 0, Math.PI * 2);
    context.fillStyle = glow;
    context.fill();

    for (let ring = 0; ring < 2; ring += 1) {
      context.beginPath();
      context.arc(ripple.x, ripple.y, radius * (0.72 + ring * 0.28), 0, Math.PI * 2);
      context.strokeStyle = `rgba(232, 255, 255, ${alpha * (1 - ring * 0.34)})`;
      context.lineWidth = Math.max(0.8, 1.8 - ring * 0.5);
      context.stroke();
    }

    return true;
  };

  function startWaterAnimation() {
    if (!wakeAnimationId) {
      wakeAnimationId = window.requestAnimationFrame(drawWakes);
    }
  }

  function drawWakes(now) {
    if (!rippleContext) {
      return;
    }

    rippleContext.setTransform(1, 0, 0, 1, 0, 0);
    rippleContext.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
    rippleContext.setTransform(ripplePixelRatio, 0, 0, ripplePixelRatio, 0, 0);
    rippleContext.lineCap = "round";
    rippleContext.lineJoin = "round";

    for (let index = waterMarks.length - 1; index >= 0; index -= 1) {
      if (!drawWaterMark(rippleContext, waterMarks[index], now)) {
        waterMarks.splice(index, 1);
      }
    }

    for (let index = tapRipples.length - 1; index >= 0; index -= 1) {
      if (!drawTapRipple(rippleContext, tapRipples[index], now)) {
        tapRipples.splice(index, 1);
      }
    }

    if (waterMarks.length > 0 || tapRipples.length > 0) {
      wakeAnimationId = window.requestAnimationFrame(drawWakes);
    } else {
      wakeAnimationId = 0;
    }
  }

  const scheduleWaterMark = () => {
    if (document.visibilityState === "hidden") {
      return;
    }

    waterMarkTimeoutId = window.setTimeout(() => {
      queueWaterMark();
      scheduleWaterMark();
    }, 1400 + Math.random() * 2300);
  };

  resizeRippleCanvas();
  scheduleWaterMark();

  window.addEventListener("resize", resizeRippleCanvas);
  window.visualViewport?.addEventListener("resize", resizeRippleCanvas);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      window.clearTimeout(waterMarkTimeoutId);
      waterMarkTimeoutId = 0;
      return;
    }

    if (!waterMarkTimeoutId) {
      scheduleWaterMark();
    }
  });

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStarts.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      target: event.target,
    });
  }, { passive: true });

  window.addEventListener("pointerup", (event) => {
    const start = pointerStarts.get(event.pointerId);

    pointerStarts.delete(event.pointerId);

    if (!start || isRippleBlockedTarget(start.target) || isRippleBlockedTarget(event.target)) {
      return;
    }

    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) {
      return;
    }

    if (lastTapRipple && performance.now() - lastTapRipple.at < 360 && Math.hypot(event.clientX - lastTapRipple.x, event.clientY - lastTapRipple.y) < 28) {
      return;
    }

    lastTapRipple = {
      x: event.clientX,
      y: event.clientY,
      at: performance.now(),
    };
    queueTapRipple(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener("pointercancel", (event) => {
    pointerStarts.delete(event.pointerId);
  }, { passive: true });

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
