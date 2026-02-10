import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HDRJPGLoader } from '@monogrid/gainmap-js'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'

/**
 * Loading Менеджер загрузки
 */
const loadingManager = new THREE.LoadingManager();

const progressBar = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
loadingManager.onProgress = function(url, loaded, total) {
    const progressPercent = Math.round((loaded / total) * 100);
    progressBar.style.width = `${progressPercent}%`;
    progressLabel.textContent = `${progressPercent}%`;
}

// 3) onLoad - Запись по завершению загрузки.
const progressBarContainer = document.querySelector('.progress-bar');
loadingManager.onLoad = function() {
    progressBarContainer.style.display = 'none';
}

// Canvas
const canvas = document.querySelector('canvas#webgl')

// Scene
const scene = new THREE.Scene(loadingManager)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

let cameraPosX;
let cameraPosY;
let cameraPosZ;
let maxDistanceOrbit;

if (window.innerWidth < 480) {
    cameraPosX = 4.7;
    cameraPosY = 3.1;
    cameraPosZ = 8.5;
    maxDistanceOrbit = 10;
} else if (window.innerWidth >= 480 && window.innerWidth <= 1200) {
    cameraPosX = 3.2;
    cameraPosY = 2.3;
    cameraPosZ = 5.6;
    maxDistanceOrbit = 8;
} else {
    cameraPosX = 2.5;
    cameraPosY = 2;
    cameraPosZ = 4.5;
    maxDistanceOrbit = 6;
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(cameraPosX, cameraPosY, cameraPosZ)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.maxPolarAngle = Math.PI * 0.5;
controls.maxDistance = maxDistanceOrbit;
controls.minDistance = 3.5;
controls.enableDamping = true
//* Отключение перетаскивания
controls.enablePan = false

/**
 * Models
 */
//* Update all materials
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child.isMesh && child.material.isMeshStandardMaterial) {
            child.castShadow = false;
            child.receiveShadow = false;
            child.matrixAutoUpdate = false;
            child.matrixWorldAutoUpdate = false;
            child.matrixWorldNeedsUpdate = false;
        }
    });
};


let dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')
let gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Обьект параметров
let constants = {
    scale: 2.6,
    height: 2,
	radius: 14,
    resolution: 17
}

gltfLoader.load("models/model_vectary/transformed/moto/moto.gltf", (gltf) => {
    console.log(gltf);
    let current_object = gltf.scene;

    current_object.position.x = 0.03;
    current_object.position.y = 0;
    current_object.position.z = 0;
    current_object.rotation.y = -3.14;
    current_object.scale.set(constants.scale, constants.scale, constants.scale);

    scene.add(current_object);
    updateAllMaterials()
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: 'high-performance',
    precision: 'lowp'
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.autoUpdate = false;


let hdrJpgEquirectangularMap;
let hdrJpg = new HDRJPGLoader(renderer, loadingManager).load( '/environmentMaps/jpg/garage.jpg', () => {

    hdrJpgEquirectangularMap = hdrJpg.renderTarget.texture;
    hdrJpgEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
    hdrJpgEquirectangularMap.needsUpdate = true;

    scene.environment = hdrJpgEquirectangularMap;

    let skybox = new GroundedSkybox(hdrJpgEquirectangularMap, constants.height, constants.radius, constants.resolution);
    skybox.position.y = constants.height - 0.01;
    scene.add(skybox);
});

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.4;

const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick();

// Информация о рендере
// console.log(renderer.info)