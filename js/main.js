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
  const wakes = [];
  const waterMarks = [];
  const pointerPoints = new Map();
  const touchPoints = new Map();
  const maxWakes = 74;
  const maxWaterMarks = 16;
  const wakeDistance = 14;
  const wakeDuration = 1250;
  const waterMarkDuration = 3200;
  const waterMarkMargin = 80;
  let ripplePixelRatio = 1;
  let wakeAnimationId = 0;
  let waterMarkTimeoutId = 0;
  let lastMousePoint = null;

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

  const queueWake = (x, y, dx, dy, force = 1) => {
    const distance = Math.hypot(dx, dy);

    if (distance < 1) {
      return;
    }

    wakes.push({
      x,
      y,
      angle: Math.atan2(dy, dx),
      force: Math.min(1.65, force),
      speed: Math.min(120, distance),
      startedAt: performance.now(),
    });

    if (wakes.length > maxWakes) {
      wakes.splice(0, wakes.length - maxWakes);
    }

    startWaterAnimation();
  };

  const queueWaterMark = () => {
    waterMarks.push({
      x: -waterMarkMargin + Math.random() * (window.innerWidth + waterMarkMargin * 2),
      y: -waterMarkMargin + Math.random() * (window.innerHeight + waterMarkMargin * 2),
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

  const updateWakePoint = (store, key, x, y, force = 1) => {
    const previous = store.get(key);
    const now = performance.now();

    if (!previous) {
      store.set(key, { x, y, lastAt: now });
      return;
    }

    const dx = x - previous.x;
    const dy = y - previous.y;
    const distance = Math.hypot(dx, dy);

    if (distance >= wakeDistance || now - previous.lastAt > 90) {
      queueWake(x, y, dx, dy, force + Math.min(0.45, distance / 120));
      store.set(key, { x, y, lastAt: now });
    }
  };

  const drawWakeArm = (context, length, width, side, alpha, progress) => {
    const rearX = -length;
    const rearY = width * side;
    const controlX = -length * (0.42 + progress * 0.18);
    const controlY = width * side * (0.2 + progress * 0.15);

    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(controlX, controlY, rearX, rearY);
    context.strokeStyle = `rgba(226, 255, 255, ${alpha})`;
    context.lineWidth = Math.max(0.8, 2.1 - progress * 1.1);
    context.stroke();

    context.beginPath();
    context.moveTo(-length * 0.18, side * 2);
    context.quadraticCurveTo(controlX * 0.9, controlY + side * 8, rearX * 0.88, rearY * 0.82);
    context.strokeStyle = `rgba(126, 218, 255, ${alpha * 0.42})`;
    context.lineWidth = 1;
    context.stroke();
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

  function startWaterAnimation() {
    if (!wakeAnimationId) {
      wakeAnimationId = window.requestAnimationFrame(drawWakes);
    }
  }

  function drawWakes(now) {
    if (!rippleContext) {
      return;
    }

    rippleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    rippleContext.lineCap = "round";
    rippleContext.lineJoin = "round";

    for (let index = waterMarks.length - 1; index >= 0; index -= 1) {
      if (!drawWaterMark(rippleContext, waterMarks[index], now)) {
        waterMarks.splice(index, 1);
      }
    }

    for (let index = wakes.length - 1; index >= 0; index -= 1) {
      const wake = wakes[index];
      const progress = (now - wake.startedAt) / wakeDuration;

      if (progress >= 1) {
        wakes.splice(index, 1);
        continue;
      }

      const eased = 1 - Math.pow(1 - progress, 2.4);
      const length = 38 + wake.speed * 0.7 + eased * 42;
      const width = 12 + wake.speed * 0.22 + eased * 34;
      const alpha = (1 - progress) * 0.28 * wake.force;

      rippleContext.save();
      rippleContext.translate(wake.x, wake.y);
      rippleContext.rotate(wake.angle);

      const wash = rippleContext.createLinearGradient(0, 0, -length, 0);

      wash.addColorStop(0, `rgba(235, 255, 255, ${alpha * 0.18})`);
      wash.addColorStop(0.48, `rgba(128, 222, 255, ${alpha * 0.12})`);
      wash.addColorStop(1, "rgba(128, 222, 255, 0)");

      rippleContext.beginPath();
      rippleContext.ellipse(-length * 0.34, 0, length * 0.46, width * 0.56, 0, 0, Math.PI * 2);
      rippleContext.fillStyle = wash;
      rippleContext.fill();

      drawWakeArm(rippleContext, length, width, -1, alpha, progress);
      drawWakeArm(rippleContext, length, width, 1, alpha, progress);

      rippleContext.beginPath();
      rippleContext.moveTo(-4, 0);
      rippleContext.quadraticCurveTo(-length * 0.34, Math.sin(progress * Math.PI * 2) * 4, -length * 0.82, 0);
      rippleContext.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.54})`;
      rippleContext.lineWidth = 0.9;
      rippleContext.stroke();

      rippleContext.restore();
    }

    if (wakes.length > 0 || waterMarks.length > 0) {
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

  window.addEventListener("pointermove", (event) => {
    const key = event.pointerType === "mouse" ? "mouse" : event.pointerId;

    updateWakePoint(pointerPoints, key, event.clientX, event.clientY, event.pointerType === "touch" ? 1.18 : 1);

    if (event.pointerType === "mouse") {
      lastMousePoint = { x: event.clientX, y: event.clientY };
    }
  }, { passive: true });

  window.addEventListener("wheel", (event) => {
    const x = Number.isFinite(event.clientX) ? event.clientX : lastMousePoint?.x ?? window.innerWidth / 2;
    const y = Number.isFinite(event.clientY) ? event.clientY : lastMousePoint?.y ?? window.innerHeight / 2;
    const dx = event.deltaX || 0;
    const dy = event.deltaY || 0;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      queueWake(x, y, dx / Math.max(1, distance) * 34, dy / Math.max(1, distance) * 34, 1.24);
    }
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    Array.from(event.changedTouches).forEach((touch) => {
      updateWakePoint(touchPoints, touch.identifier, touch.clientX, touch.clientY, 1.22);
    });
  }, { passive: true });

  const forgetTouchPoint = (event) => {
    Array.from(event.changedTouches).forEach((touch) => {
      touchPoints.delete(touch.identifier);
    });
  };

  window.addEventListener("touchend", forgetTouchPoint, { passive: true });
  window.addEventListener("touchcancel", forgetTouchPoint, { passive: true });
  window.addEventListener("pointercancel", (event) => {
    pointerPoints.delete(event.pointerId);
  }, { passive: true });
  window.addEventListener("blur", () => {
    pointerPoints.clear();
    touchPoints.clear();
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
