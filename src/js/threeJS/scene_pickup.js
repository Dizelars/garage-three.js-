import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GroundedSkybox } from "three/addons/objects/GroundedSkybox.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { HDRJPGLoader } from "@monogrid/gainmap-js";
import { InteriorTransitionHelper } from "../helpers/interiorTransitionHelper.js";

const CONFIG = {
  model: "models/pickup/untitled.gltf",
  draco: "/draco/",
  environment: "/environmentMaps/jpg/garage.jpg",
  modelScale: 3,
  modelRotationY: Math.PI,
  skyHeight: 2.5,
  skyRadius: 12,
  skyResolution: 32,
  environmentIntensity: 1,
  floorRadius: 14,
  floorTextureSize: 1024,
  floorTileMeters: 6,
  floorSlabs: 12,
  floorY: 0.003,
  floorEnabled: true,
  bloomEnabled: true,
  glow: 0.1,
};

function makeConcrete(N, tileMeters, slabs, aniso) {
  const rnd = (seed) => {
    let t = seed >>> 0;
    return () => (t = (t * 1664525 + 1013904223) >>> 0) / 4294967296;
  };

  const noise = (cells, seed) => {
    const r = rnd(seed);
    const g = new Float32Array(cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = r();

    const o = new Float32Array(N * N);
    const sm = (t) => t * t * (3 - 2 * t);

    for (let y = 0; y < N; y++) {
      const fy = (y / N) * cells;
      const y0 = Math.floor(fy);
      const ty = sm(fy - y0);
      const ya = y0 % cells;
      const yb = (y0 + 1) % cells;

      for (let x = 0; x < N; x++) {
        const fx = (x / N) * cells;
        const x0 = Math.floor(fx);
        const tx = sm(fx - x0);
        const xa = x0 % cells;
        const xb = (x0 + 1) % cells;
        const top = g[ya * cells + xa] * (1 - tx) + g[ya * cells + xb] * tx;
        const bot = g[yb * cells + xa] * (1 - tx) + g[yb * cells + xb] * tx;
        o[y * N + x] = top * (1 - ty) + bot * ty;
      }
    }
    return o;
  };

  const oct = [
    [4, 0.3, 11],
    [12, 0.22, 12],
    [30, 0.18, 13],
    [72, 0.14, 14],
    [165, 0.1, 15],
    [384, 0.06, 16],
  ].map(([c, w, seed]) => [noise(c, seed), w]);

  const blotch = noise(8, 99);
  const pores = noise(270, 77);
  const fine = noise(768, 55);
  const h = new Float32Array(N * N);
  const pore = new Float32Array(N * N);

  for (let i = 0; i < N * N; i++) {
    let v = 0;
    for (const [n, w] of oct) v += n[i] * w;
    pore[i] = Math.min(1, Math.max(0, (pores[i] - 0.84) * 4));
    h[i] = v - pore[i] * 0.45 + (fine[i] - 0.5) * 0.05;
  }

  const slabM = tileMeters / slabs;
  const jw = 0.007;
  const rs = rnd(2024);
  const slabTone = [];
  const slabRough = [];
  const slabStep = [];

  for (let i = 0; i < slabs * slabs; i++) {
    slabTone.push((rs() - 0.5) * 16);
    slabRough.push((rs() - 0.5) * 0.14);
    slabStep.push((rs() - 0.5) * 0.1);
  }

  const joint = new Float32Array(N * N);
  const tone = new Float32Array(N * N);
  const rough = new Float32Array(N * N);

  for (let y = 0; y < N; y++) {
    const vy = (y / N) * slabs;
    const sy = Math.floor(vy);
    const fy = vy - sy;
    const dv = Math.min(fy, 1 - fy) * slabM;

    for (let x = 0; x < N; x++) {
      const ux = (x / N) * slabs;
      const sx = Math.floor(ux);
      const fx = ux - sx;
      const du = Math.min(fx, 1 - fx) * slabM;
      const i = y * N + x;
      const id = sy * slabs + sx;
      const d = Math.min(du, dv);

      tone[i] = slabTone[id];
      rough[i] = slabRough[id];
      h[i] += slabStep[id];

      if (d < jw) {
        const t = 1 - d / jw;
        const e = t * t * (3 - 2 * t);
        joint[i] = e;
        h[i] -= e * 0.5;
      } else if (d < jw * 2.2) {
        h[i] -= (1 - (d - jw) / (jw * 1.2)) * 0.06;
      }
    }
  }

  const mk = () => {
    const c = document.createElement("canvas");
    c.width = c.height = N;
    return c;
  };

  const cA = mk();
  const cN = mk();
  const cR = mk();
  const iA = cA.getContext("2d").createImageData(N, N);
  const iN = cN.getContext("2d").createImageData(N, N);
  const iR = cR.getContext("2d").createImageData(N, N);
  const S = 9;
  const at = (x, y) => h[((y + N) % N) * N + ((x + N) % N)];

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const k = i * 4;
      const nx = -(at(x + 1, y) - at(x - 1, y)) * S;
      const ny = (at(x, y + 1) - at(x, y - 1)) * S;
      const l = Math.hypot(nx, ny, 1);

      iN.data[k] = ((nx / l) * 0.5 + 0.5) * 255;
      iN.data[k + 1] = ((ny / l) * 0.5 + 0.5) * 255;
      iN.data[k + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      iN.data[k + 3] = 255;

      const t = 70 + tone[i] + (blotch[i] - 0.5) * 26 +
        (h[i] - 0.5) * 36 - pore[i] * 22 - joint[i] * 34;

      iA.data[k] = t;
      iA.data[k + 1] = t * 0.99;
      iA.data[k + 2] = t * 0.96;
      iA.data[k + 3] = 255;

      const rg = Math.max(0, Math.min(1,
        0.6 + rough[i] + (blotch[i] - 0.5) * 0.3 +
        (0.5 - h[i]) * 0.45 + pore[i] * 0.2 + joint[i] * 0.3
      ));

      iR.data[k] = 255;
      iR.data[k + 1] = rg * 255;
      iR.data[k + 2] = 0;
      iR.data[k + 3] = 255;
    }
  }

  cA.getContext("2d").putImageData(iA, 0, 0);
  cN.getContext("2d").putImageData(iN, 0, 0);
  cR.getContext("2d").putImageData(iR, 0, 0);

  const T = (canvas, srgb) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = aniso;
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  return {
    map: T(cA, true),
    normalMap: T(cN, false),
    roughnessMap: T(cR, false),
  };
}

const canvas = document.querySelector("canvas#webgl");
if (!canvas) throw new Error("Не найден canvas#webgl");

const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const progressContainer = document.querySelector(".progress-bar");
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (_url, loaded, total) => {
  if (!total) return;
  const value = `${Math.round((loaded / total) * 100)}%`;
  if (progressBar) progressBar.style.width = value;
  if (progressLabel) progressLabel.textContent = value;
};

loadingManager.onLoad = () => {
  if (progressContainer) progressContainer.style.display = "none";
};

loadingManager.onError = (url) => console.error("Ошибка загрузки:", url);

const scene = new THREE.Scene();
scene.environmentIntensity = CONFIG.environmentIntensity;

const sizes = { width: window.innerWidth, height: window.innerHeight };

function cameraSettings(width) {
  if (width < 480) return { position: [4.7, 3.1, 8.5], maxDistance: 10 };
  if (width <= 1200) return { position: [3.2, 2.3, 5.6], maxDistance: 8 };
  return { position: [2.5, 2, 4.5], maxDistance: 6 };
}

const initialCamera = cameraSettings(sizes.width);
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(...initialCamera.position);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.maxPolarAngle = Math.PI / 2;
controls.maxDistance = initialCamera.maxDistance;
controls.minDistance = 4;
controls.enableDamping = true;
controls.enablePan = false;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
  precision: "lowp",
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sizes.width, sizes.height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.shadowMap.enabled = false;

const concrete = makeConcrete(
  CONFIG.floorTextureSize,
  CONFIG.floorTileMeters,
  CONFIG.floorSlabs,
  renderer.capabilities.getMaxAnisotropy()
);

const repeat = (CONFIG.floorRadius * 2) / CONFIG.floorTileMeters;
Object.values(concrete).forEach((texture) => texture.repeat.set(repeat, repeat));

function createRadialTexture(size, stops) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([offset, color]) => g.addColorStop(offset, color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

const floorFade = createRadialTexture(256, [
  [0, "#ffffff"],
  [0.55, "#ffffff"],
  [1, "#000000"],
]);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(CONFIG.floorRadius, 96),
  new THREE.MeshStandardMaterial({
    map: concrete.map,
    normalMap: concrete.normalMap,
    roughnessMap: concrete.roughnessMap,
    roughness: 1,
    metalness: 0,
    normalScale: new THREE.Vector2(0.5, 0.5),
    alphaMap: floorFade,
    transparent: true,
    depthWrite: false,
  })
);

floor.name = "ConcreteFloor";
floor.rotation.x = -Math.PI / 2;
floor.position.y = CONFIG.floorY;
floor.receiveShadow = false;
floor.visible = CONFIG.floorEnabled;
scene.add(floor);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  0.6 * CONFIG.glow,
  0.5,
  1.0
);

bloom.enabled = CONFIG.bloomEnabled && CONFIG.glow > 0;
composer.addPass(bloom);
composer.addPass(new OutputPass());

let currentObject = null;

function prepareModel(gltf) {
  currentObject = gltf.scene;
  currentObject.position.y = 0;
  currentObject.rotation.y = CONFIG.modelRotationY;
  currentObject.scale.setScalar(CONFIG.modelScale);

  currentObject.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
  });

  scene.add(currentObject);
  console.info("Модель загружена:", currentObject);
}

const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath(CONFIG.draco);

const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(CONFIG.model, prepareModel, undefined, (error) => {
  console.error("Ошибка загрузки модели:", error);
});

let skybox = null;

const hdrJpg = new HDRJPGLoader(renderer, loadingManager).load(
  CONFIG.environment,
  () => {
    const texture = hdrJpg.renderTarget.texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;
    scene.environment = texture;
    scene.environmentIntensity = CONFIG.environmentIntensity;

    skybox = new GroundedSkybox(
      texture,
      CONFIG.skyHeight,
      CONFIG.skyRadius,
      CONFIG.skyResolution
    );

    skybox.position.y = CONFIG.skyHeight - 0.01;
    scene.add(skybox);
  }
);

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(sizes.width, sizes.height);
  controls.maxDistance = cameraSettings(sizes.width).maxDistance;
}

window.addEventListener("resize", resize);
resize();

let activeScene = 1;
const interiorButton = document.querySelector(".tech_spec__interior");
const aFrameScene = document.querySelector("a-scene");
const tiponsOnModel = document.querySelectorAll(".point");

if (interiorButton && aFrameScene) {
  const transitionHelper = new InteriorTransitionHelper(interiorButton);

  interiorButton.addEventListener("click", () => {
    if (transitionHelper.isTransition()) return;
    transitionHelper.startTransition();

    if (activeScene === 1) {
      setTimeout(() => {
        activeScene = 2;
        aFrameScene.style.opacity = "1";
        aFrameScene.style.height = "auto";
        aFrameScene.style.pointerEvents = "auto";
        aFrameScene.play();
        controls.enabled = false;
        transitionHelper.endTransition();
        tiponsOnModel.forEach((element) => element.style.zIndex = "0");
      }, 1500);
    } else {
      setTimeout(() => {
        activeScene = 1;
        aFrameScene.style.opacity = "0";
        aFrameScene.style.height = "0";
        aFrameScene.style.pointerEvents = "none";
        aFrameScene.pause();
        controls.enabled = true;
        transitionHelper.endTransition();
        tiponsOnModel.forEach((element) => element.style.zIndex = "1");
      }, 1500);
    }
  });
}

function tick() {
  window.requestAnimationFrame(tick);
  if (document.hidden) return;
  controls.update();
  if (bloom.enabled) composer.render();
  else renderer.render(scene, camera);
}

tick();
