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

function superellipsePoint(angle, width, height, radiusPower) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = Math.sign(cos) * Math.abs(cos) ** (2 / radiusPower) * width;
  const y = Math.sign(sin) * Math.abs(sin) ** (2 / radiusPower) * height;

  return new THREE.Vector3(x, y, 0);
}

function buildWaterRimGeometry(width, height, time, seed, isHovering) {
  const segments = 120;
  const positions = [];
  const colors = [];
  const indices = [];
  const radiusPower = 4.8;
  const outerWidth = width * 0.92;
  const outerHeight = height * 0.74;
  const baseThickness = 0.035 + (isHovering ? 0.014 : 0);

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const point = superellipsePoint(angle, outerWidth, outerHeight, radiusPower);
    const nextPoint = superellipsePoint(angle + 0.01, outerWidth, outerHeight, radiusPower);
    const tangent = nextPoint.clone().sub(point).normalize();
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    const waterWave = prefersReducedMotion.matches
      ? 0
      : Math.sin(angle * 5 + time * 1.45 + seed) * 0.026
        + Math.sin(angle * 9 - time * 1.1 + seed * 0.7) * 0.012;
    const thicknessWave = prefersReducedMotion.matches
      ? 0
      : Math.sin(angle * 7 - time * 1.25 + seed) * 0.01;
    const depthWave = prefersReducedMotion.matches
      ? 0
      : Math.sin(angle * 3 + time * 0.9 + seed) * 0.05;
    const outer = point.clone().add(normal.clone().multiplyScalar(waterWave));
    const inner = point.clone().add(normal.clone().multiplyScalar(-(baseThickness + thicknessWave)));
    const color = new THREE.Color().setHSL(0.5 + Math.sin(angle + seed) * 0.045, 0.72, 0.78);

    outer.z = depthWave;
    inner.z = depthWave - 0.02;
    positions.push(outer.x, outer.y, outer.z, inner.x, inner.y, inner.z);
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
  }

  for (let index = 0; index < segments; index += 1) {
    const nextIndex = (index + 1) % segments;
    const outerIndex = index * 2;
    const innerIndex = outerIndex + 1;
    const nextOuterIndex = nextIndex * 2;
    const nextInnerIndex = nextOuterIndex + 1;

    indices.push(outerIndex, nextOuterIndex, innerIndex, innerIndex, nextOuterIndex, nextInnerIndex);
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
    opacity: 0.82,
    vertexColors: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const rim = new THREE.Mesh(new THREE.BufferGeometry(), material);
  const seed = Math.random() * Math.PI * 2;

  camera.position.z = 6;
  scene.add(rim);

  const state = {
    button,
    camera,
    heightScale: 0.42,
    renderer,
    rim,
    scene,
    seed,
    start: performance.now(),
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

  state.widthScale = Math.max(1.1, aspect * 0.82);
  state.heightScale = 0.62;
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  state.renderer.setSize(width, height, false);
  state.camera.aspect = aspect;
  state.camera.updateProjectionMatrix();
}

function render(time) {
  renderers.forEach((state) => {
    const progress = (time - state.start) / 1000;
    const isHovering = state.button.matches(":hover, :focus-visible");
    const geometry = buildWaterRimGeometry(state.widthScale, state.heightScale, progress, state.seed, isHovering);

    state.rim.geometry.dispose();
    state.rim.geometry = geometry;
    state.rim.rotation.x = prefersReducedMotion.matches ? 0 : Math.sin(progress * 0.7 + state.seed) * 0.035;
    state.rim.rotation.y = prefersReducedMotion.matches ? 0 : Math.sin(progress * 0.55 + state.seed) * 0.08;
    state.rim.material.opacity = isHovering ? 0.96 : 0.82;
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
