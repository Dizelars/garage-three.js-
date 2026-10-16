import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GroundedSkybox } from "three/addons/objects/GroundedSkybox.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { HDRJPGLoader } from "@monogrid/gainmap-js";
import { InteriorTransitionHelper } from "../helpers/interiorTransitionHelper.js";

// ============================================================
// НАСТРОЙКИ
// ============================================================
const CONFIG = {
  model: "models/kater/kater.gltf",
  draco: "/draco/",
  environment: "/environmentMaps/jpg/dok_kater.jpg",

  modelScale: 3,
  modelPosition: [0, -0.44, 0.18],
  modelRotationY: 0,
  metalness: 1.5,
  skyHeight: 2,
  skyRadius: 14,
  skyResolution: 17,
  environmentIntensity: 1,
  toneMappingExposure: 1.4,
  // Отражения
  reflections: true,
  mirrorY: 0.001,
  reflectionStrength: 0.2,
  reflectionScale: 0.3,
  // Bloom
  bloomEnabled: true,
  glow: 0.1
};

// ============================================================
// МЕНЕДЖЕР ЗАГРУЗКИ
// ============================================================
const loadingManager = new THREE.LoadingManager();
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const progressBarContainer = document.querySelector(".progress-bar");

loadingManager.onProgress = (_, loaded, total) => {
  if (!total) return;
  const progress = `${Math.round(loaded / total * 100)}%`;
  if (progressBar) progressBar.style.width = progress;
  if (progressLabel) progressLabel.textContent = progress;
};

loadingManager.onLoad = () => {
  if (progressBarContainer) progressBarContainer.style.display = "none";
};

loadingManager.onError = url => console.error("Ошибка загрузки:", url);

// ============================================================
// SCENE, CAMERA, ORBITCONTROLS
// ============================================================
const canvas = document.querySelector("canvas#webgl");
if (!canvas) throw new Error("Не найден canvas#webgl");

const scene = new THREE.Scene();
scene.environmentIntensity = CONFIG.environmentIntensity;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

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
controls.maxPolarAngle = Math.PI * 0.5;
controls.maxDistance = initialCamera.maxDistance;
controls.minDistance = 4.5;
controls.enableDamping = true;
controls.enablePan = false;

// ============================================================
// RENDERER
// ============================================================
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
  precision: "lowp"
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = CONFIG.toneMappingExposure;
renderer.shadowMap.enabled = false;

// ============================================================
// РАЗМЫТЫЕ ОТРАЖЕНИЯ
// ============================================================
const MIRROR_SHADER = {
  name: "DockFloorReflection",
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    strength: { value: CONFIG.reflectionStrength }
  },

  vertexShader: `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vP;

    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vP = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float strength;
    varying vec4 vUv;
    varying vec2 vP;

    void main() {
      vec2 uv = vUv.xy / vUv.w;
      vec3 acc = vec3(0.0);
      float weight = 0.0;

      for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
          float w = 1.0 - 0.15 * float(abs(x) + abs(y));
          acc += texture2D(tDiffuse, uv + vec2(float(x), float(y)) * 0.007).rgb * w;
          weight += w;
        }
      }

      float fade = 1.0 - smoothstep(2.0, 9.0, length(vP));
      gl_FragColor = vec4(acc / weight * strength * fade, 1.0);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
};

let mirror = null;

if (CONFIG.reflections) {
  mirror = new Reflector(new THREE.PlaneGeometry(40, 40), {
    textureWidth: 512,
    textureHeight: 512,
    clipBias: 0.003,
    shader: MIRROR_SHADER
  });

  mirror.name = "DockFloorReflection";
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = CONFIG.mirrorY;
  mirror.renderOrder = 1;
  mirror.material.transparent = true;
  mirror.material.blending = THREE.AdditiveBlending;
  mirror.material.depthWrite = false;
  scene.add(mirror);
}

// ============================================================
// BLOOM
// ============================================================
let composer = null;

if (CONFIG.bloomEnabled && CONFIG.glow > 0) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.6 * CONFIG.glow,
    0.5,
    1
  );

  composer.addPass(bloom);
  composer.addPass(new OutputPass());
}

// ============================================================
// ЗАГРУЗКА КАТЕРА
// ============================================================
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath(CONFIG.draco);

const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(CONFIG.model, gltf => {
  const model = gltf.scene;
  model.position.set(...CONFIG.modelPosition);
  model.rotation.y = CONFIG.modelRotationY;
  model.scale.setScalar(CONFIG.modelScale);

  model.traverse(child => {
    if (!child.isMesh) return;

    child.castShadow = false;
    child.receiveShadow = false;

    // Оригинальная настройка материала катера
    if (child.name === "Metal") {
      const materials = Array.isArray(child.material)
        ? child.material : [child.material];

      materials.forEach(material => {
        if (material?.isMeshStandardMaterial) {
          material.metalness = CONFIG.metalness;
          material.needsUpdate = true;
        }
      });
    }
  });

  scene.add(model);
  console.info("Катер загружен:", model);
}, undefined, error => {
  console.error("Ошибка загрузки модели:", error);
});

// ============================================================
// HDR ОКРУЖЕНИЕ ДОКА
// ============================================================
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

// ============================================================
// RESIZE
// ============================================================
function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer?.setSize(sizes.width, sizes.height);

  if (mirror) {
    const dpr = renderer.getPixelRatio();

    mirror.getRenderTarget().setSize(
      Math.max(128, Math.round(sizes.width * dpr * CONFIG.reflectionScale)),
      Math.max(128, Math.round(sizes.height * dpr * CONFIG.reflectionScale))
    );
  }

  controls.maxDistance = cameraSettings(sizes.width).maxDistance;
}

window.addEventListener("resize", resize);
resize();

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ THREE.JS / A-FRAME
// ============================================================
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

        tiponsOnModel.forEach(element => {
          element.style.zIndex = "0";
        });
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

        tiponsOnModel.forEach(element => {
          element.style.zIndex = "1";
        });
      }, 1500);
    }
  });
}

// ============================================================
// RENDER LOOP
// ============================================================
function tick() {
  window.requestAnimationFrame(tick);
  controls.update();

  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

tick();
