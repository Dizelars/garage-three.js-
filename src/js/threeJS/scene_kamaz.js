import * as THREE from 'three'
// import {THREE} from '@google/model-viewer/dist/model-viewer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import GUI from 'lil-gui'
// import Stats from 'stats.js'
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
// const gui = new GUI({
//     title: 'Контроллер',
//     width: 350,
//     closeFolders: true
// })
// gui.close()
// gui.hide();

// window.addEventListener('keypress', (event) => {
//     if(event.key == 'h') {
//         gui.show(gui._hidden)
//     }
// })

// Создаем папки дебагера
// const hdriFolder = gui.addFolder('Карта окружения');
// const toneMapping = gui.addFolder('Тоновое отображение')

// const PointFolder = gui.addFolder('Типоны');
// const One = PointFolder.addFolder('Типон 1');
// const Two = PointFolder.addFolder('Типон 2');
// const Three = PointFolder.addFolder('Типон 3');

// const ModelFolder = gui.addFolder('Модель');
// const modelPosition = ModelFolder.addFolder('Позиция');
// const modelScale = ModelFolder.addFolder('Масштаб');

// const positionFolder = modelPosition.addFolder('position');
// const rotationFolder = modelPosition.addFolder('rotation');
// const scaleFolder = modelScale.addFolder('scale');

// Monitor FPS
// const stats = new Stats()
// stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild(stats.dom)

/**
 * Loading Менеджер загрузки
 */
// let sceneReady = false

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
    // sceneReady = true;
    // raycasterTipons()
    // positionTipons()
}

/**
 * Raycaster
 */
// const raycaster = new THREE.Raycaster()

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
//* Обьект для хранения параметров мешей модели
// const global = {
//     envMapIntensity: 100,
// }
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
    scale: 4,
    // scale: 1.8,
    height: 2.5,
	radius: 12,
    // resolution: 24
    resolution: 17
}

// let constants = {
//     scale: 4.2,
//     height: 8.5,
// 	radius: 50,
//     resolution: 24
// }

// let sceneReady = false

// Камаз
// Без фикса андроида с анимацией
// 'models/model_vectary/kamaz/full_animation/kamaz.gltf',
// Без анимаций и с фиксом андроида
// 'models/model_vectary/kamaz/noAnimation/ar_android_fix/kamaz_no_animation.gltf',

// Сжатая модель и текстуры
// models/model_vectary/transformed/kamaz/kamaz_no_animation.gltf

gltfLoader.load("models/model_vectary/transformed/kamaz/kamaz.gltf", (gltf) => {
    console.log(gltf);
    let current_object = gltf.scene;

    // current_object.position.x = 0.05;
    // current_object.position.y = -0.36;
    // current_object.position.z = 0;
    // current_object.rotation.y = -1.58;

    current_object.position.x = 0.05;
    current_object.position.y = 0;
    current_object.position.z = 0.3;
    current_object.rotation.y = -0.02;
    current_object.scale.set(constants.scale, constants.scale, constants.scale);

    // positionFolder.add(current_object.position, 'x', -9, 9, 0.01).name('position X')
    // positionFolder.add(current_object.position, 'y', -9, 9, 0.01).name('position Y')
    // positionFolder.add(current_object.position, 'z', -9, 9, 0.01).name('position Z')
    
    // rotationFolder.add(current_object.rotation, 'x', -9, 9, 0.01).name('rotation X')
    // rotationFolder.add(current_object.rotation, 'y', -9, 9, 0.01).name('rotation Y')
    // rotationFolder.add(current_object.rotation, 'z', -9, 9, 0.01).name('rotation Z')
    
    // scaleFolder.add(constants, 'scale', 0.1, 9, 0.1).name('Scale').onChange((value) => {
    //     current_object.scale.set(value, value, value);
    // });

    scene.add(current_object);

    // controls.update()
    updateAllMaterials()
    console.log(renderer.info)

    // window.setTimeout(() => {
    //     sceneReady = true
    // }, 500)
});

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

/**
 * Pounts on model
 */
// const points = [
//     {
//         position: new THREE.Vector3(0.96, 0.8, - 0.58),
//         element: document.querySelector('.point-0')
//     },
//     {
//         position: new THREE.Vector3(0.04, 0.76, 2.4),
//         element: document.querySelector('.point-1')
//     },
//     {
//         position: new THREE.Vector3(0, 0.86, - 2.26),
//         element: document.querySelector('.point-2')
//     }
// ]

// One.add(points[0].position,'x',-9,9,0.01)
// One.add(points[0].position,'y',-9,9,0.01)
// One.add(points[0].position,'z',-9,9,0.01)

// Two.add(points[1].position,'x',-9,9,0.01)
// Two.add(points[1].position,'y',-9,9,0.01)
// Two.add(points[1].position,'z',-9,9,0.01)

// Three.add(points[2].position,'x',-9,9,0.01)
// Three.add(points[2].position,'y',-9,9,0.01)
// Three.add(points[2].position,'z',-9,9,0.01)


// Логика типонов
// controls.addEventListener('change', () => {
//     positionTipons();
// });

// controls.addEventListener('end', () => {
//     raycasterTipons();
// });

// function raycasterTipons() {
//     if (sceneReady) {
//         for(const point of points) {
//             const screenPosition = point.position.clone()
//             screenPosition.project(camera)

//             raycaster.setFromCamera(screenPosition, camera)
//             const intersects = raycaster.intersectObjects(scene.children, true)

//             if (intersects.length === 0) {
//                 point.element.classList.add('visible')
//             }
//             else {
//                 const intersectionDistance = intersects[0].distance
//                 const pointDistance = point.position.distanceTo(camera.position)
//                 if (intersectionDistance < pointDistance) {
//                     point.element.classList.remove('visible')
//                 }
//                 else {
//                     point.element.classList.add('visible')
//                 }
//             }
//         }
//     }
// }

// function positionTipons() {
//     if (sceneReady) {
//         for(const point of points) {
//             const screenPosition = point.position.clone()
//             screenPosition.project(camera)

//             const translateX = screenPosition.x * sizes.width * 0.5
//             const translateY = - screenPosition.y * sizes.height * 0.5
//             point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
//         }
//     }
// }

// controls.update();

/**
 * Point click
 */
// const pointsOnModel = document.querySelectorAll('.point')

// pointsOnModel.forEach((point) => {
//     point.addEventListener('click', () => {
//         point.classList.toggle('show')

//         // Проверка наличия класса 'show' у остальных точек
//         pointsOnModel.forEach((otherPoint) => {
//             if (otherPoint !== point) {
//                 if (otherPoint.classList.contains('show')) {
//                     otherPoint.classList.remove('show')
//                 }
//             }
//         })
//     })
// })


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

    //* Управление параметрами skybox через GUI:
    // hdriFolder.add(constants, 'radius', 1, 200, 0.1).name('skyboxRadius').onChange(() => {
    //     updateSkybox();
    // });

    // hdriFolder.add(constants, 'height', 1, 100, 0.1).name('skyboxHeight').onChange(() => {
    //     updateSkybox();
    // });

    // hdriFolder.add(constants, 'resolution', 1, 64, 1).name('skyboxResolution').onChange(() => {
    //     updateSkybox();
    // });

    // function updateSkybox() {
    //     scene.remove(skybox); // Удаление старого skybox
    //     skybox = new GroundedSkybox(hdrJpgEquirectangularMap, constants.height, constants.radius, constants.resolution); // Создание нового skybox с обновленными параметрами
    //     skybox.position.y = constants.height - 0.01;
    //     scene.add(skybox); // Добавление нового skybox на сцену
    // }
});

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping
// toneMapping.add(renderer, 'toneMapping', {
//     No: THREE.NoToneMapping,
//     Linear: THREE.LinearToneMapping,
//     Reinhard: THREE.ReinhardToneMapping,
//     Cineon: THREE.CineonToneMapping,
//     ACESFilmic: THREE.ACESFilmicToneMapping
// })

renderer.toneMappingExposure = 2;
// renderer.toneMappingExposure = 1.4;
// renderer.toneMappingExposure = 2.2;
// toneMapping.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.1)


const tick = () =>
{
    // stats.begin()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    // stats.end()
}

tick()

// let renderCount = 0; // Счетчик рендеров
// const maxRenders = 150; // Максимальное количество рендеров

// // Добавление обработчика событий на изменения контроллера
// controls.addEventListener("change", () => {
//     renderer.render(scene, camera);
// });

// const tick = () => {
//     // stats.begin()

//     // Update controls
//     controls.update();

//     // Render
//     if (renderCount < maxRenders) {
//         renderer.render(scene, camera);
//     }
//     renderCount++; // Увеличиваем счетчик

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick);

//     // stats.end()
// };

// tick();

// Информация о рендере
// console.log(renderer.info)
// console.log(renderer.shadowMap.autoUpdate)
// console.log(renderer.shadowMap.needsUpdate)

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