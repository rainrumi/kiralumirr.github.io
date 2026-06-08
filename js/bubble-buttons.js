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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  const light = new THREE.Group();
  const bubbleGeometry = new THREE.SphereGeometry(1, 64, 32);
  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdffbff,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.78,
    thickness: 0.82,
    ior: 1.33,
    transparent: true,
    opacity: 0.48,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    iridescence: 0.72,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 520],
  });
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  const rim = new THREE.Mesh(
    bubbleGeometry,
    new THREE.MeshBasicMaterial({
      color: 0xf7ffff,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    })
  );

  camera.position.z = 5.2;

  light.add(new THREE.AmbientLight(0xffffff, 1.4));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
  keyLight.position.set(-2.2, 2.4, 4);
  light.add(keyLight);

  const cyanLight = new THREE.PointLight(0x8cf5ff, 3.2, 8);
  cyanLight.position.set(2.1, -0.8, 3.4);
  light.add(cyanLight);

  const limeLight = new THREE.PointLight(0xf3ffbd, 2.2, 8);
  limeLight.position.set(-2.4, -1.8, 2.8);
  light.add(limeLight);

  bubble.scale.set(1.82, 0.68, 0.34);
  rim.scale.copy(bubble.scale).multiplyScalar(1.012);
  scene.add(light, bubble, rim);

  const state = {
    button,
    bubble,
    camera,
    renderer,
    rim,
    scene,
    start: performance.now() + Math.random() * 1000,
  };

  renderers.push(state);
  resizeBubble(state);
  resizeObserver?.observe(button);
}

function resizeBubble(state) {
  const rect = state.button.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  state.renderer.setSize(width, height, false);
  state.camera.aspect = width / height;
  state.camera.updateProjectionMatrix();
}

function render(time) {
  renderers.forEach((state) => {
    const progress = (time - state.start) / 1000;
    const hover = state.button.matches(":hover, :focus-visible") ? 1 : 0;
    const wobble = prefersReducedMotion.matches ? 0 : Math.sin(progress * 1.7) * 0.035;
    const hoverLift = hover * 0.07;

    state.bubble.rotation.x = -0.16 + wobble;
    state.bubble.rotation.y = Math.sin(progress * 0.72) * 0.16;
    state.bubble.rotation.z = Math.sin(progress * 0.9) * 0.035;
    state.bubble.scale.set(1.82 + hoverLift, 0.68 + hoverLift * 0.32, 0.34);
    state.rim.rotation.copy(state.bubble.rotation);
    state.rim.scale.copy(state.bubble.scale).multiplyScalar(1.012);
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
