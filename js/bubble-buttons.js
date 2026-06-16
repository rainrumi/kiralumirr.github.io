import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const bubbleTargets = document.querySelectorAll(".button-primary, .button-secondary, .work-source-link");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const renderers = [];
const resizeObserver = "ResizeObserver" in window
  ? new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const state = renderers.find((rendererState) => rendererState.button === entry.target);

        if (state) {
          resizeBubble(state);
        }
      });
    })
  : null;

function wrapButtonLabel(button) {
  const label = document.createElement("span");
  label.className = "bubble-button-label";

  Array.from(button.childNodes).forEach((node) => {
    label.append(node);
  });

  button.append(label);
}

function buildWaterSurfaceGeometry(width, height, time, seed, isHovering) {
  const columns = 42;
  const rows = 18;
  const positions = [];
  const colors = [];
  const indices = [];
  const waveAmount = isHovering ? 1.25 : 0.86;
  const edgeFalloffStart = 0.68;

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    const yRatio = v * 2 - 1;

    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const xRatio = u * 2 - 1;
      const edgeDistance = Math.max(Math.abs(xRatio), Math.abs(yRatio));
      const rawEdgeDepth = Math.max(0, (edgeDistance - edgeFalloffStart) / (1 - edgeFalloffStart));
      const edgeDepth = rawEdgeDepth * rawEdgeDepth * (3 - 2 * rawEdgeDepth);
      const centerPlane = 1 - Math.min(1, rawEdgeDepth);
      const ripple = prefersReducedMotion.matches
        ? 0
        : (
          Math.sin((xRatio * 6.8) + (time * 1.2) + seed)
          + Math.sin((yRatio * 8.4) - (time * 1.05) + seed * 0.6)
          + Math.sin(((xRatio + yRatio) * 5.2) + (time * 0.78) + seed * 1.3)
        ) * 0.012 * waveAmount;
      const edgeRipple = prefersReducedMotion.matches
        ? 0
        : Math.sin((xRatio - yRatio) * 10 + time * 1.45 + seed) * 0.018 * edgeDepth;
      const shrink = 1 - edgeDepth * 0.16;
      const x = xRatio * width * shrink;
      const y = yRatio * height * shrink;
      const z = (ripple * centerPlane) + edgeRipple - edgeDepth * 0.34;
      const light = 0.58 + centerPlane * 0.16 + Math.sin((xRatio * 9) + (time * 0.9) + seed) * 0.035;
      const saturation = 0.62 + edgeDepth * 0.16;
      const hue = 0.51 + Math.sin((xRatio - yRatio) * 2 + seed) * 0.018;
      const color = new THREE.Color().setHSL(hue, saturation, light);

      positions.push(x, y, z);
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const current = row * (columns + 1) + column;
      const next = current + columns + 1;

      indices.push(current, current + 1, next, current + 1, next + 1, next);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return geometry;
}

function createBubbleButton(button) {
  if (!button.querySelector(".bubble-button-label")) {
    wrapButtonLabel(button);
  }

  const canvas = document.createElement("canvas");
  canvas.className = "bubble-button-canvas";
  canvas.setAttribute("aria-hidden", "true");
  button.prepend(canvas);
  button.classList.add("bubble-button", "is-three-bubble");

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "low-power",
    });
  } catch (error) {
    canvas.remove();
    button.classList.remove("is-three-bubble");
    return;
  }

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 20);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.58,
    vertexColors: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const surface = new THREE.Mesh(new THREE.BufferGeometry(), material);
  const seed = Math.random() * Math.PI * 2;

  camera.position.z = 6;
  scene.add(surface);

  const state = {
    button,
    camera,
    heightScale: 0.96,
    renderer,
    scene,
    seed,
    start: performance.now(),
    surface,
    widthScale: 1.65,
  };

  renderers.push(state);
  resizeBubble(state);
  resizeObserver?.observe(button);
}

function resizeBubble(state) {
  const rect = state.button.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const aspect = width / height;

  state.heightScale = 0.96;
  state.widthScale = Math.max(1.1, aspect * state.heightScale);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  state.renderer.setSize(width, height, false);
  state.camera.aspect = aspect;
  state.camera.updateProjectionMatrix();
}

function render(time) {
  renderers.forEach((state) => {
    const progress = (time - state.start) / 1000;
    const isHovering = state.button.matches(":hover, :focus-visible");
    const geometry = buildWaterSurfaceGeometry(state.widthScale, state.heightScale, progress, state.seed, isHovering);

    state.surface.geometry.dispose();
    state.surface.geometry = geometry;
    state.surface.rotation.x = prefersReducedMotion.matches ? 0 : Math.sin(progress * 0.55 + state.seed) * 0.018;
    state.surface.rotation.y = prefersReducedMotion.matches ? 0 : Math.sin(progress * 0.48 + state.seed) * 0.035;
    state.surface.material.opacity = isHovering ? 0.74 : 0.58;
    state.renderer.render(state.scene, state.camera);
  });

  window.requestAnimationFrame(render);
}

if (bubbleTargets.length > 0) {
  bubbleTargets.forEach(createBubbleButton);
  window.addEventListener("resize", () => {
    renderers.forEach(resizeBubble);
  });

  if (renderers.length > 0) {
    window.requestAnimationFrame(render);
  }
}
