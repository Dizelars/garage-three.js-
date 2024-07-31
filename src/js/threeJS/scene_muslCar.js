import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'stats.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HDRJPGLoader } from '@monogrid/gainmap-js'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'
import {InteriorTransitionHelper} from "../helpers/interiorTransitionHelper.js";
// import { gsap } from 'gsap'

// Менеджер загрузки
// Переключение между сценами

/**
 * Base
 */
// Debug
const gui = new GUI({
    title: 'Контроллер',
    width: 350,
    closeFolders: true
})
gui.close()
gui.hide();

window.addEventListener('keypress', (event) => {
    if(event.key == 'h') {
        gui.show(gui._hidden)
    }
})

// Создаем папки дебагера
const hdriFolder = gui.addFolder('Карта окружения');
const toneMapping = gui.addFolder('Тоновое отображение')

//! Monitor FPS
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// Обьект параметров
let constants = {
    colorFloor: '#a1a1a1',
    height: 1.8,
	radius: 7.5,
    resolution: 16
}

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
    setTimeout( () => {
        progressBarContainer.style.display = 'none';
        const hotspotsAll = document.querySelectorAll('.hotspot');
        let activeHotspot = null;
        hotspotsAll.forEach((hotspot) => {
            hotspot.addEventListener('mousedown', (event) => {
                event.stopPropagation();

                if (activeHotspot) {
                    activeHotspot.classList.remove('clicked');
                }

                hotspot.classList.add('clicked');
                activeHotspot = hotspot;
            });
        });
        document.body.addEventListener('mousedown', () => {
            if (activeHotspot) {
                activeHotspot.classList.remove('clicked');
                activeHotspot = null;
            }
        });
    }, 0);
}

// const loadingBarElement = document.querySelector('.loading-bar')
// const loadingManager = new THREE.LoadingManager(
//     // Loaded
//     () =>
//     {
//         window.setTimeout(() =>
//         {
//             loadingBarElement.classList.add('ended')
//             loadingBarElement.style.transform = ''

//             window.setTimeout(() => {
//                 overlayMaterial.uniforms.uAlpha.value = 0
//                 scene.remove(overlay)
//             }, 1500)
            
//         }, 500)
//     },

//     // Progress
//     (itemUrl, itemsLoaded, itemsTotal) =>
//     {
//         const progressRatio = itemsLoaded / itemsTotal
//         loadingBarElement.style.transform = `scaleX(${progressRatio})`
//     }
// )

/**
 * Change models
 */
// let current_object = null;
// let name_model = null;
// const models = document.querySelectorAll('.sidenav .model');
// models.forEach((model) => {
//     model.addEventListener('click', () => {
//         if (current_object !== null && name_model != model.textContent) {
//             scene.remove(current_object);
//         }
//         if (name_model != model.textContent) {
//             overlayMaterial.uniforms.uAlpha.value = 1
//             loadingBarElement.classList.remove('ended')
//             loadingBarElement.style.transform = 'scaleX(0)';
//             scene.add(overlay)
//             loadModel(model.textContent, model.getAttribute("data-folder"), model.getAttribute("data-model"));
//         }
//     })
// })

/**
 * Models
 */
//* Обьект для хранения параметров мешей модели
const global = {}
//* Update all materials
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.material.envMapIntensity = global.envMapIntensity
            child.material.side = THREE.FrontSide
            // if (child.name.toLowerCase().includes('glass')) {

            // }
        }
    })
}


let dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')
let gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load("models/MuslCarLowPoly_mintexture_transform/untitled.gltf", (gltf) => {
    console.log(gltf);
    let current_object = gltf.scene;

    current_object.position.x = 0
    current_object.position.y = Math.PI * 0.42
    current_object.position.z = 0

    scene.add(current_object);

    // controls.update()
    updateAllMaterials()
    console.log(renderer.info)
});

// function loadModel(name, folder, model) {
//     gltfLoader.setPath(`models/${folder}/`);
//     gltfLoader.load(model + ".gltf", function(gltf) {
//         console.log(gltf);
//         current_object = gltf.scene;
//         name_model = name;
//         if (name == 'Muslcar') {
//             current_object.position.x = 0
//             current_object.position.y = Math.PI * 0.42
//             current_object.position.z = 0
//         } else if (name == 'Police') {
//             current_object.position.x = 0
//             current_object.position.y = Math.PI * 0.48
//             current_object.position.z = 0
//             current_object.rotation.y = Math.PI * 0.5
//         } else if (name == 'Bank_truck') {
//             current_object.scale.set(0.01, 0.01, 0.01)
//             current_object.rotation.y = - (Math.PI * 0.5)
//         } else if (name == 'Japanese_sedan') {
//             current_object.scale.set(0.03, 0.03, 0.03)
//             current_object.rotation.y = Math.PI * 0.5
//             current_object.position.y = Math.PI * 0.48
//         } else if (name == 'Pickup') {
//             current_object.scale.set(0.03, 0.03, 0.03)
//             current_object.rotation.y = Math.PI * 0.5
//             current_object.position.y = Math.PI * 0.72
//         } else if (name == 'Wagon') {
//             current_object.rotation.y = Math.PI * 0.5
//             current_object.position.y = Math.PI * 0.45
//         }
    
//         scene.add(current_object);

//         // controls.update()
//         updateAllMaterials()
//         console.log(renderer.info)
//     });
// }


// Canvas
const canvas = document.querySelector('canvas#webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)

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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2.5, 2, 4.5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.maxPolarAngle = Math.PI * 0.5;
controls.maxDistance = 5.5;
controls.minDistance = 3.5;
controls.enableDamping = true
//* Отключение перетаскивания
controls.enablePan = false
controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


let hdrJpgEquirectangularMap
let hdrJpg = new HDRJPGLoader(renderer).load( '/environmentMaps/jpg/skylit_garage_4k.jpg', () => {

    hdrJpgEquirectangularMap = hdrJpg.renderTarget.texture;

    hdrJpgEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
    hdrJpgEquirectangularMap.needsUpdate = true;

    scene.environment = hdrJpgEquirectangularMap;

    let skybox = new GroundedSkybox(hdrJpgEquirectangularMap, constants.height, constants.radius, constants.resolution);
    skybox.position.y = constants.height  - 0.01;
    scene.add(skybox)

    //* Мы можем управлять проекцией скайбокса с помощью радиуса и высоты, но так как результат непредсказуем, лучше добавить эти значения в lil-gui:
    hdriFolder.add(constants, 'radius', 1, 200, 0.1).name('skyboxRadius').onFinishChange(() => {
        skybox.radius = constants.radius;
        scene.remove(skybox); // Удаление старого skybox
        skybox = new GroundedSkybox(hdrJpgEquirectangularMap, constants.height, constants.radius); // Создание нового skybox с обновленными параметрами
        skybox.position.y = constants.height - 0.01;
        scene.add(skybox); // Добавление нового skybox на сцену
    });
    hdriFolder.add(constants, 'height', 1, 100, 0.1).name('skyboxHeight').onFinishChange(() => {
        skybox.height = constants.height;
        scene.remove(skybox); // Удаление старого skybox
        skybox = new GroundedSkybox(hdrJpgEquirectangularMap, constants.height, constants.radius); // Создание нового skybox с обновленными параметрами
        skybox.position.y = constants.height - 0.01;
        scene.add(skybox); // Добавление нового skybox на сцену
    });
});

//! Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping
toneMapping.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})

renderer.toneMappingExposure = 2
toneMapping.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)


const tick = () =>
{
    stats.begin()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()
//! 1. Информация о рендере
console.log(renderer.info)

// Переключение между сценами при клике на кнопку с классом ".tech_spec__interior"
let activeScene = 1;
const interiorButton = document.querySelector('.tech_spec__interior');
const aFrameScene = document.querySelector('a-scene');

const transitionHelper = new InteriorTransitionHelper(interiorButton);
interiorButton.addEventListener('click', () => {
    if (transitionHelper.isTransition()) {
        return;
    }

    transitionHelper.startTransition();

    if (activeScene === 1) {
        setTimeout(() => {
            activeScene = 2;
            aFrameScene.style.opacity = '1';
            aFrameScene.style.height = 'auto';
            aFrameScene.style.pointerEvents = 'auto';
            aFrameScene.play();
            controls.enabled = false;
            transitionHelper.endTransition();
        }, 1500);
    } else {
        setTimeout(() => {
            activeScene = 1;
            aFrameScene.style.opacity = '0';
            aFrameScene.style.height = '0';
            aFrameScene.style.pointerEvents = 'none';
            aFrameScene.pause();
            controls.enabled = true;
            transitionHelper.endTransition();
        }, 1500);
    }
});