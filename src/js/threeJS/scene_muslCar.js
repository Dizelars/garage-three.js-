import * as THREE from 'three'
// import {defineCustomElements, THREE} from '@google/model-viewer/dist/model-viewer';
//   defineCustomElements();
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
// Логика типонов

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
const PointFolder = gui.addFolder('Типоны');
const One = PointFolder.addFolder('Типон 1');
const Two = PointFolder.addFolder('Типон 2');
const Three = PointFolder.addFolder('Типон 3');

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
let sceneReady = false

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
    sceneReady = true;
    raycasterTipons()
    positionTipons()
}

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
        }
    })
}


let dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')
let gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// let sceneReady = false

gltfLoader.load("models/MuslCarLowPoly_mintexture_transform/untitled.gltf", (gltf) => {
    // gltfLoader.load("models/moto/untitled.gltf", (gltf) => {
    console.log(gltf);
    let current_object = gltf.scene;

    current_object.position.x = 0
    current_object.position.y = Math.PI * 0.42
    current_object.position.z = 0

    // current_object.position.x = 0
    // current_object.position.y = Math.PI * 0.4
    // current_object.position.z = 0

    // current_object.scale.set(0.1,0.1,0.1);

    scene.add(current_object);

    // controls.update()
    updateAllMaterials()
    console.log(renderer.info)

    // window.setTimeout(() => {
    //     sceneReady = true
    // }, 500)
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

/**
 * Pounts on model
 */
const points = [
    {
        position: new THREE.Vector3(0.96, 0.8, - 0.58),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.04, 0.76, 2.4),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(0, 0.86, - 2.26),
        element: document.querySelector('.point-2')
    }
]

One.add(points[0].position,'x',-9,9,0.01)
One.add(points[0].position,'y',-9,9,0.01)
One.add(points[0].position,'z',-9,9,0.01)

Two.add(points[1].position,'x',-9,9,0.01)
Two.add(points[1].position,'y',-9,9,0.01)
Two.add(points[1].position,'z',-9,9,0.01)

Three.add(points[2].position,'x',-9,9,0.01)
Three.add(points[2].position,'y',-9,9,0.01)
Three.add(points[2].position,'z',-9,9,0.01)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

// Canvas
const canvas = document.querySelector('canvas#webgl')

// Scene
const scene = new THREE.Scene()

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

// Логика типонов
controls.addEventListener('change', () => {
    positionTipons();
});

controls.addEventListener('end', () => {
    raycasterTipons();
});

function raycasterTipons() {
    if (sceneReady) {
        for(const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            if (intersects.length === 0) {
                point.element.classList.add('visible')
            }
            else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)
                if (intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible')
                }
                else {
                    point.element.classList.add('visible')
                }
            }
        }
    }
}

function positionTipons() {
    if (sceneReady) {
        for(const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }
    }
}

controls.update();

/**
 * Point click
 */
const pointsOnModel = document.querySelectorAll('.point')

pointsOnModel.forEach((point) => {
    point.addEventListener('click', () => {
        point.classList.toggle('show')

        // Проверка наличия класса 'show' у остальных точек
        pointsOnModel.forEach((otherPoint) => {
            if (otherPoint !== point) {
                if (otherPoint.classList.contains('show')) {
                    otherPoint.classList.remove('show')
                }
            }
        })
    })
})


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
const tiponsOnModel = document.querySelectorAll('.point');

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
            tiponsOnModel.forEach((e) => {
                e.style.zIndex = "0";
            })
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
            tiponsOnModel.forEach((e) => {
                e.style.zIndex = "1";
            })
        }, 1500);
    }
});