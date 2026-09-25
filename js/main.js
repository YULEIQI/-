import * as THREE from "three";

const canvas = document.getElementById("bg");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070d, 0.035);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.4, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05070d, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const hemi = new THREE.HemisphereLight(0x7ec8ff, 0x0a1020, 0.9);
scene.add(hemi);

const keyLight = new THREE.PointLight(0x5ce1e6, 18, 40);
keyLight.position.set(4, 3, 6);
scene.add(keyLight);

const fill = new THREE.PointLight(0xf0c36a, 8, 30);
fill.position.set(-6, -2, 4);
scene.add(fill);

const coreGeo = new THREE.IcosahedronGeometry(1.55, 1);
const coreMat = new THREE.MeshStandardMaterial({
  color: 0x0b1b2c,
  metalness: 0.72,
  roughness: 0.22,
  emissive: 0x12384a,
  emissiveIntensity: 0.55,
  transparent: true,
  opacity: 1,
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.set(2.4, 0.3, -1.2);
scene.add(core);

const wire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.62, 1),
  new THREE.MeshBasicMaterial({
    color: 0x5ce1e6,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  })
);
core.add(wire);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.35, 0.018, 16, 180),
  new THREE.MeshBasicMaterial({ color: 0xf0c36a, transparent: true, opacity: 0.7 })
);
ring.rotation.x = Math.PI / 2.4;
core.add(ring);

const ring2 = ring.clone();
ring2.rotation.x = Math.PI / 1.7;
ring2.rotation.y = 0.6;
core.add(ring2);

const nodes = new THREE.Group();
const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
const palette = [0x5ce1e6, 0xf0c36a, 0x7aa8ff, 0xffffff];
for (let i = 0; i < 18; i += 1) {
  const mat = new THREE.MeshStandardMaterial({
    color: palette[i % palette.length],
    emissive: palette[i % palette.length],
    emissiveIntensity: 0.8,
    metalness: 0.4,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(nodeGeo, mat);
  const phi = Math.acos(1 - (2 * (i + 0.5)) / 18);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  const r = 2.45;
  mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
  mesh.userData.base = mesh.position.clone();
  nodes.add(mesh);
}
core.add(nodes);

function makeStars(count, spread, size, color) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

const farStars = makeStars(1400, 80, 0.035, 0xb7d4ff);
const nearStars = makeStars(280, 28, 0.055, 0x5ce1e6);
scene.add(farStars, nearStars);

const mouse = new THREE.Vector2();
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  const pageScroll = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const recede = Math.min(Math.max((window.scrollY - 40) / (window.innerHeight * 0.72), 0), 1);

  core.rotation.y = t * 0.18 + pageScroll * 1.4;
  core.rotation.x = Math.sin(t * 0.25) * 0.18 + pageScroll * 0.4;
  ring.rotation.z = t * 0.35;
  ring2.rotation.z = -t * 0.22;
  const isMobile = window.innerWidth < 900;
  const recedeScale = 1 - recede * 0.42;
  core.scale.setScalar(isMobile ? recedeScale * 0.52 : recedeScale);
  wire.material.opacity = 0.35 * (1 - recede * 0.75);
  ring.material.opacity = 0.7 * (1 - recede * 0.7);
  ring2.material.opacity = 0.7 * (1 - recede * 0.7);
  coreMat.opacity = 1 - recede * 0.62;
  nodes.children.forEach((node, i) => {
    node.material.transparent = true;
    node.material.opacity = 1 - recede * 0.7;
    const pulse = 1 + Math.sin(t * 1.6 + i) * 0.08;
    node.scale.setScalar(pulse);
    node.position.copy(node.userData.base).multiplyScalar(1 + Math.sin(t * 0.7 + i * 0.3) * 0.04);
  });

  farStars.rotation.y = t * 0.012;
  nearStars.rotation.y = -t * 0.03;

  const targetX = (isMobile ? 1.05 : 2.55) + mouse.x * 0.45 + recede * (isMobile ? 2.2 : 5.2);
  const targetY = (isMobile ? -0.95 : 0.2) + mouse.y * 0.28 + recede * 0.4;
  const targetZ = (isMobile ? -3.4 : -1.2) - recede * 10;
  core.position.z += (targetZ - core.position.z) * 0.05;
  core.position.x += (targetX - core.position.x) * 0.04;
  core.position.y += (targetY - core.position.y) * 0.04;

  camera.position.x += (mouse.x * 0.45 - camera.position.x) * 0.03;
  camera.position.y += (0.35 + mouse.y * 0.2 - camera.position.y) * 0.03;
  camera.lookAt(0.8, 0.2, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
