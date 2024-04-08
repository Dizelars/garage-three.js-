import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js'

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

// Создаем папки дебагера
// const sceneFolder = gui.addFolder('Сцена');

const lightsFolder = gui.addFolder('Свет');
const Ambient = lightsFolder.addFolder('AmbientLight')
const Hemisphere = lightsFolder.addFolder('HemisphereLight')
const Directional = lightsFolder.addFolder('DirectionalLight')
const Pointer = lightsFolder.addFolder('PointerLight')
const RectArea = lightsFolder.addFolder('RectAreaLight')
const Spot = lightsFolder.addFolder('SpotLight')

const shadowFolder = gui.addFolder('Тени');
const DirectionalShadow = shadowFolder.addFolder('DirectionalShadow')
const PointerShadow = shadowFolder.addFolder('PointerShadow')
const SpotShadow = shadowFolder.addFolder('SpotShadow')

// const PointFolder = gui.addFolder('Типоны');
// const One = PointFolder.addFolder('Типон 1');
// const Two = PointFolder.addFolder('Типон 2');
// const Three = PointFolder.addFolder('Типон 3');

const hdriFolder = gui.addFolder('Карта окружения');
const toneMapping = gui.addFolder('Тоновое отображение')


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
        }
    })
}

// let sceneReady = false

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// let mixer = null

gltfLoader.load(
    '/models/Porsche/scene.gltf',
    // '/models/AmarokAnimated/amarok.gltf',
    // '/models/DroneAnimated/scene.gltf',
    // '/models/FoxAnimated/glTF/Fox.gltf',
    (gltf) =>
    {
        console.log(gltf)
        // console.log(gltf.animations)
        //* Уменьшаем модель
        // gltf.scene.scale.set(0.025, 0.025, 0.025)
        // gltf.scene.rotation.set(0, Math.PI / 2, 0)
        gltf.scene.position.set(0, -0.08, 0)

        //* Анимация модели
        // mixer = new THREE.AnimationMixer(gltf.scene)
        // const action = mixer.clipAction(gltf.animations[0])
        // action.play()

        scene.add(gltf.scene)
        updateAllMaterials()
        // window.setTimeout(() =>
        // {
        //     sceneReady = true
        // }, 500)
    },
)


/**
 * Pounts on model
 */
// const points = [
//     {
//         position: new THREE.Vector3(0.9, 0.85, - 0.25),
//         element: document.querySelector('.point-0')
//     },
//     {
//         position: new THREE.Vector3(0, 0.65, 2.4),
//         element: document.querySelector('.point-1')
//     },
//     {
//         position: new THREE.Vector3(0, 1.1, - 2.1),
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


/**
 * Raycaster
 */
// const raycaster = new THREE.Raycaster()


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const colorTextureAsphalt = textureLoader.load('/textures/asphalt_2/ALBEDO.jpg')
const heightTextureAsphalt = textureLoader.load('/textures/asphalt_2/DISPLACEMENT.jpg')
const normalTextureAsphalt = textureLoader.load('/textures/asphalt_2/NORMAL.jpg')
const ambientOcclusionTextureAsphalt = textureLoader.load('/textures/asphalt_2/AMBIENT_OCCLUSION.jpg')
const roughnessTextureAsphalt = textureLoader.load('/textures/asphalt_2/GLOSS.jpg')

colorTextureAsphalt.colorSpace = THREE.SRGBColorSpace
colorTextureAsphalt.generateMipmaps = false
colorTextureAsphalt.minFilter = THREE.NearestFilter

//* Текстура слишком велика. Чтобы исправить это, мы можем просто повторить каждую текстуру травы с помощью свойства repeat:
colorTextureAsphalt.repeat.set(4, 4)
ambientOcclusionTextureAsphalt.repeat.set(4, 4)
normalTextureAsphalt.repeat.set(4, 4)
roughnessTextureAsphalt.repeat.set(4, 4)
heightTextureAsphalt.repeat.set(4, 4)

//! И не забудьте изменить свойства wrapS и wrapT, чтобы активировать повтор:
colorTextureAsphalt.wrapS = THREE.RepeatWrapping
ambientOcclusionTextureAsphalt.wrapS = THREE.RepeatWrapping
normalTextureAsphalt.wrapS = THREE.RepeatWrapping
roughnessTextureAsphalt.wrapS = THREE.RepeatWrapping
heightTextureAsphalt.wrapS = THREE.RepeatWrapping

colorTextureAsphalt.wrapT = THREE.RepeatWrapping
ambientOcclusionTextureAsphalt.wrapT = THREE.RepeatWrapping
normalTextureAsphalt.wrapT = THREE.RepeatWrapping
roughnessTextureAsphalt.wrapT = THREE.RepeatWrapping
heightTextureAsphalt.wrapT = THREE.RepeatWrapping

/**
 * Environment map
 */
//! Global intensity
global.envMapIntensity = 1.2
hdriFolder.add(global, 'envMapIntensity').min(0).max(10).step(0.001).onChange(() => {
    updateAllMaterials()
})

const rgbeLoader = new RGBELoader()
//! Карта окружающей среды с наземной проекцией при помощи GroundProjectedSkybox
rgbeLoader.load('/environmentMaps/skylit_garage_2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = environmentMap

    const skybox = new GroundProjectedSkybox(environmentMap)
    skybox.radius = 7.2
    skybox.height = 2.2
    //* Появляется сфера с картой окружения которую нужно растянуть с помощью метода setScalar:
    skybox.scale.setScalar(50)
    // scene.add(skybox)

    //* Мы можем управлять проекцией скайбокса с помощью радиуса и высоты, но так как результат непредсказуем, лучше добавить эти значения в lil-gui:
    // hdriFolder.add(skybox, 'radius', 1, 200, 0.1).name('skyboxRadius')
    // hdriFolder.add(skybox, 'height', 1, 100, 0.1).name('skyboxHeight')
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Обьект параметров
let constants = {
    // colorScene: '#000000',
    colorFloor: '#a1a1a1',
    AmbientLightColor: 0xffffff,
    HemisphereLightColorTop: 0xffffff,
    HemisphereLightColorBottom: 0x00ff00,
    DirectionalLightColor: 0xffffff,
    PointerLightColor: 0xffffff,
    RectAreaLightColor: 0xffffff,
    SpotLightColor: 0xffffff,
    SpotLightAngle: 0.2
}

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(constants.colorScene);

// sceneFolder
//     .addColor(constants, 'colorScene')
//     .name('Фон')
//     .onChange(() => {
//         scene.background = new THREE.Color(constants.colorScene);
//     })

/**
 * Fog
 */
const fog = new THREE.Fog('#262837', 1, 12)
scene.fog = fog

/**
 * Floor
 */
const floorMaterial = new THREE.MeshPhysicalMaterial({
    color: constants.colorFloor,
    map: colorTextureAsphalt,
    aoMap: ambientOcclusionTextureAsphalt,
    aoMapIntensity: 1,
    displacementMap: heightTextureAsphalt,
    displacementScale: 0.05,
    normalMap: normalTextureAsphalt,
    roughnessMap: roughnessTextureAsphalt
})

// sceneFolder
//     .addColor(constants, 'colorFloor')
//     .name('Пол')
//     .onChange(() => {
//         floorMaterial.color.set(constants.colorFloor)
//     })

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    floorMaterial
)
// floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
//! Ambient Light
const ambientLight = new THREE.AmbientLight(constants.AmbientLightColor, 0.5)
// scene.add(ambientLight)

//* Ambient Debug
Ambient.addColor(constants, 'AmbientLightColor').onChange(() => {
    ambientLight.color.set(constants.AmbientLightColor)
}).name('цвет')
Ambient.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name('интенсивность')


// //! Hemisphere Light
const hemisphereLight = new THREE.HemisphereLight(constants.HemisphereLightColorTop, constants.HemisphereLightColorBottom, 0.9)
// scene.add(hemisphereLight)

//* Hemisphere Debug
Hemisphere.addColor(constants, 'HemisphereLightColorTop').onChange(() => {
    hemisphereLight.skyColor.set(constants.HemisphereLightColorTop)
}).name('цвет сверху')
Hemisphere.addColor(constants, 'HemisphereLightColorBottom').onChange(() => {
    hemisphereLight.groundColor.set(constants.HemisphereLightColorBottom)
}).name('цвет снизу')
Hemisphere.add(hemisphereLight, 'intensity').min(0).max(3).step(0.001).name('интенсивность')


//! Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15)

// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// // directionalLight.shadow.camera.far = constants.DirectionalLightShadowCameraFar
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7

directionalLight.position.set(-5.7, 5.5, -5.3)
directionalLight.rotation.set(0, 3.2, 0)
// scene.add(directionalLight)

//* Directional Debug
Directional.addColor(constants, 'DirectionalLightColor').onChange(() => {
    directionalLight.color.set(constants.DirectionalLightColor)
}).name('цвет')
Directional.add(directionalLight, 'intensity').min(0).max(3).step(0.001).name('интенсивность')
Directional.add(directionalLight.position, 'x').min(- 10).max(10).step(0.1).name('X')
Directional.add(directionalLight.position, 'y').min(- 10).max(10).step(0.1).name('Y')
Directional.add(directionalLight.position, 'z').min(- 10).max(10).step(0.1).name('Z')
Directional.add(directionalLight.rotation, 'x').min(- 10).max(10).step(0.1).name('rotation X')
Directional.add(directionalLight.rotation, 'y').min(- 10).max(10).step(0.1).name('rotation Y')
Directional.add(directionalLight.rotation, 'z').min(- 10).max(10).step(0.1).name('rotation Z')


//! Pointer Light
const pointLight = new THREE.PointLight(constants.PointerLightColor, 3, 10, 2)

// pointLight.castShadow = true
// pointLight.shadow.mapSize.width = 1024
// pointLight.shadow.mapSize.height = 1024
// pointLight.shadow.camera.near = 0.1
// pointLight.shadow.camera.far = 5

pointLight.position.set(-0.4, 0.2, -2.4)
// scene.add(pointLight)

//* Pointer Debug
Pointer.addColor(constants, 'PointerLightColor').onChange(() => {
    pointLight.color.set(constants.PointerLightColor)
}).name('цвет')
Pointer.add(pointLight, 'intensity').min(0).max(3).step(0.1).name('интенсивность')
Pointer.add(pointLight, 'distance').min(1).max(10).step(0.5).name('расстояние')
Pointer.add(pointLight, 'decay').min(0).max(2).step(0.1).name('затухание')
Pointer.add(pointLight.position, 'x').min(- 10).max(10).step(0.1).name('X')
Pointer.add(pointLight.position, 'y').min(- 10).max(10).step(0.1).name('Y')
Pointer.add(pointLight.position, 'z').min(- 10).max(10).step(0.1).name('Z')
Pointer.add(pointLight.rotation, 'x').min(- 10).max(10).step(0.1).name('rotation X')
Pointer.add(pointLight.rotation, 'y').min(- 10).max(10).step(0.1).name('rotation Y')
Pointer.add(pointLight.rotation, 'z').min(- 10).max(10).step(0.1).name('rotation Z')


//! RectArea Light
const rectAreaLight = new THREE.RectAreaLight(constants.RectAreaLightColor, 20, 2, 1.5)
rectAreaLight.position.set(1.9, 0.8, 0.2)
rectAreaLight.rotation.set(0.1, 1.5, -0.01)
rectAreaLight.lookAt(new THREE.Vector3())
// scene.add(rectAreaLight)

//* RectArea Debug
RectArea.addColor(constants, 'RectAreaLightColor').onChange(() => {
    rectAreaLight.color.set(constants.RectAreaLightColor)
}).name('цвет')
RectArea.add(rectAreaLight, 'intensity').min(1).max(20).step(1).name('интенсивность')
RectArea.add(rectAreaLight, 'width').min(1).max(20).step(0.5).name('ширина')
RectArea.add(rectAreaLight, 'height').min(1).max(20).step(0.5).name('высота')
RectArea.add(rectAreaLight.position, 'x').min(- 10).max(10).step(0.1).name('X')
RectArea.add(rectAreaLight.position, 'y').min(- 10).max(10).step(0.1).name('Y')
RectArea.add(rectAreaLight.position, 'z').min(- 10).max(10).step(0.1).name('Z')
RectArea.add(rectAreaLight.rotation, 'x').min(- 10).max(10).step(0.1).name('rotation X')
RectArea.add(rectAreaLight.rotation, 'y').min(- 10).max(10).step(0.1).name('rotation Y')
RectArea.add(rectAreaLight.rotation, 'z').min(- 10).max(10).step(0.1).name('rotation Z')


// //! Spot Light
const spotLight = new THREE.SpotLight(constants.SpotLightColor, 6, 12, Math.PI * constants.SpotLightAngle, 0.2, 0.2)

// spotLight.castShadow = true
// spotLight.shadow.mapSize.width = 1024
// spotLight.shadow.mapSize.height = 1024
// spotLight.shadow.camera.near = 1
// spotLight.shadow.camera.far = 6

spotLight.position.set(-2.6, 3, 4.7)
// scene.add(spotLight)
spotLight.target.position.set(-0.75, 0, 1.6)
// scene.add(spotLight.target)

//* Spot Debug
Spot.addColor(constants, 'SpotLightColor').onChange(() => {
    spotLight.color.set(constants.SpotLightColor)
}).name('цвет')
Spot.add(spotLight, 'intensity').min(0.5).max(10).step(0.5).name('интенсивность')
Spot.add(spotLight, 'distance').min(1).max(20).step(1).name('расстояние')
Spot.add(constants, 'SpotLightAngle').min(0.1).max(0.5).step(0.025).name('угол').onChange(() => {
    spotLight.angle = Math.PI * constants.SpotLightAngle
})
Spot.add(spotLight, 'penumbra').min(0).max(1).step(0.05).name('полутень')
Spot.add(spotLight, 'decay').min(0).max(2).step(0.1).name('затухание')
Spot.add(spotLight.position, 'x').min(- 10).max(10).step(0.1).name('X (источник)')
Spot.add(spotLight.position, 'y').min(- 10).max(10).step(0.1).name('Y (источник)')
Spot.add(spotLight.position, 'z').min(- 10).max(10).step(0.1).name('Z (источник)')
// Spot.add(spotLight.rotation, 'x').min(- 10).max(10).step(0.1).name('rotation X (источник)')
// Spot.add(spotLight.rotation, 'y').min(- 10).max(10).step(0.1).name('rotation Y (источник)')
// Spot.add(spotLight.rotation, 'z').min(- 10).max(10).step(0.1).name('rotation Z (источник)')
Spot.add(spotLight.target.position, 'x').min(- 10).max(10).step(0.1).name('X (луч)')
Spot.add(spotLight.target.position, 'y').min(- 10).max(10).step(0.1).name('Y (луч)')
Spot.add(spotLight.target.position, 'z').min(- 10).max(10).step(0.1).name('Z (луч)')
// Spot.add(spotLight.target.rotation, 'x').min(- 10).max(10).step(0.1).name('rotation X (луч)')
// Spot.add(spotLight.target.rotation, 'y').min(- 10).max(10).step(0.1).name('rotation Y (луч)')
// Spot.add(spotLight.target.rotation, 'z').min(- 10).max(10).step(0.1).name('rotation Z (луч)')



/**
 * Helpers
 */
//! Свет
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
directionalLightHelper.visible = false
// scene.add(directionalLightHelper)
Directional.add(directionalLightHelper, 'visible').name('помошник')

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
hemisphereLightHelper.visible = false
// scene.add(hemisphereLightHelper)
Hemisphere.add(hemisphereLightHelper, 'visible').name('помошник')

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
pointLightHelper.visible = false
// scene.add(pointLightHelper)
Pointer.add(pointLightHelper, 'visible').name('помошник')

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
rectAreaLightHelper.visible = false
// scene.add(rectAreaLightHelper)
RectArea.add(rectAreaLightHelper, 'visible').name('помошник')

const spotLightHelper = new THREE.SpotLightHelper(spotLight)
spotLightHelper.position.set(spotLight.target.position.x, spotLight.target.position.y, spotLight.target.position.z)
spotLightHelper.visible = false
// scene.add(spotLightHelper)
Spot.add(spotLightHelper, 'visible').name('помошник')

// //! Тени
// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// directionalLightCameraHelper.visible = false
// scene.add(directionalLightCameraHelper)
// DirectionalShadow.add(directionalLightCameraHelper, 'visible').name('помошник')

// const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// pointLightCameraHelper.visible = false
// scene.add(pointLightCameraHelper)
// PointerShadow.add(pointLightCameraHelper, 'visible').name('помошник')

// const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// spotLightCameraHelper.visible = false
// scene.add(spotLightCameraHelper)
// SpotShadow.add(spotLightCameraHelper, 'visible').name('помошник')



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
controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//* Делаем фон рендера таким же как и туман
renderer.setClearColor('#262837')

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


/**
 * Animate
 */
// const clock = new THREE.Clock()
// let previousTime = 0

const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()
    // const deltaTime = elapsedTime - previousTime
    // previousTime = elapsedTime

    // Update Helper position
    // spotLightHelper.update()
    // directionalLightCameraHelper.update()
    // pointLightCameraHelper.update()
    // spotLightCameraHelper.update()

    //* Анимация
    // if (mixer) {
    //     mixer.update(deltaTime)
    // }

    // Update points position on screen
    // if (sceneReady) {
    //     for(const point of points) {
    //         const screenPosition = point.position.clone()
    //         screenPosition.project(camera)

    //         raycaster.setFromCamera(screenPosition, camera)
    //         const intersects = raycaster.intersectObjects(scene.children, true)

    //         if (intersects.length === 0) {
    //             point.element.classList.add('visible')
    //         }
    //         else {
    //             const intersectionDistance = intersects[0].distance
    //             const pointDistance = point.position.distanceTo(camera.position)
    //             if (intersectionDistance < pointDistance) {
    //                 point.element.classList.remove('visible')
    //             }
    //             else {
    //                 point.element.classList.add('visible')
    //             }
    //         }

    //         const translateX = screenPosition.x * sizes.width * 0.5
    //         const translateY = - screenPosition.y * sizes.height * 0.5
    //         point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
    //     }
    // }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()