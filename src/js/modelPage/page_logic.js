import {InteriorTransitionHelper} from "../helpers/interiorTransitionHelper.js";

const techSection = document.querySelector('.tech_spec');
const autoSection = document.querySelector('.auto_park');
const techSpecWrapper = document.querySelector('.tech_spec .tech_spec__wrapper');
const visibleBlockMission = document.querySelector('.tech_spec__mission');
const visibleBlockOutfit = document.querySelector('.tech_spec__outfit');
const techSpecGridWrapper = document.querySelector('.tech_spec__description-grid_wrapper');
const visibleDescr = document.querySelector('.tech_spec__description');
const sliderButton = document.querySelectorAll('.auto_park_slider-button button');
const techSpecWrapperText = document.querySelector('.tech_spec__titles');
const techSpecMissionPanel = document.querySelector('.tech_spec__mission-panel');
const techSpecOutfitPanel = document.querySelector('.tech_spec__outfit-panel');
const buttontech = document.querySelector('.tech_spec__btn');
const buttonText = document.querySelector('.tech_spec__btn span');
const buttonIcon = document.querySelector('.tech_spec__btn img');
const autoParkSection = document.querySelector('.auto_park');
const autoParkControl = document.querySelector('.auto_park__control');
const buttonIcon2 = document.querySelector('.auto_park__control img');
const interior = document.querySelector('.tech_spec__interior');
const gallery_toggle = document.querySelectorAll('.gallery_item');
const interiorText = document.querySelector('.tech_spec__interior-text');
const screenWidth = window.innerWidth;

const overlay = document.getElementById('overlay');
let threeJSScene = document.querySelector('.threeJSScene');

let isAutoParkVisible = true; // Флаг для отслеживания состояния видимости секции .auto_park

function toggleElements(action) {
    const elements = [
        visibleBlockMission,
        visibleBlockOutfit,
        techSpecWrapper,
        techSpecGridWrapper,
        techSpecWrapperText,
        visibleDescr,
        techSpecMissionPanel,
        techSpecOutfitPanel
    ];

    elements.forEach(element => {
        if (action === 'toggle') {
            element.classList.toggle('hidden');
        } else if (action === 'add') {
            element.classList.add('hidden');
        } else if (action === 'remove') {
            element.classList.remove('hidden');
        }
    });
}

// Добавляем обработчик события на весь документ
document.addEventListener('mousedown', (event) => {
    const target = event.target;
    let screenWidth = window.innerWidth;

    // Проверяем, является ли целевой элемент клика блоком .tech_spec или .auto_park_wrapper или их потомком
    const isInsideTechSpec = target.closest('.tech_spec');
    const isInsideAutoParkWrapper = target.closest('.auto_park_wrapper');

    if (!isInsideTechSpec || (screenWidth <= 1200 && isInsideTechSpec)) {
        // Скрываем блок .tech_spec__visible и выполняем необходимые действия
        techSection.classList.add('active');
        toggleElements('add');
        buttonText.textContent = 'Подробнее';
        buttonIcon.classList.remove('rotate');
    }

    if (!isInsideAutoParkWrapper) {
        // Скрываем блок .auto_park и выполняем необходимые действия
        if (!isAutoParkVisible) {
            toggleAutoParkSection();
        }
    }
});

// Обработка клика по iframe от Влада.
const subscribeToIFrameClicks = () => {
    setInterval(() => {
        const activeEl = document.activeElement;
        if(activeEl && activeEl.classList.contains('threeJSScene')){
            if (buttonText.textContent === 'Скрыть') {
                // Скрываем блок .tech_spec__visible
                techSection.classList.add('active');
                toggleElements('add');
                buttonText.textContent = 'Подробнее';
                buttonIcon.classList.remove('rotate');
            } else if (!isAutoParkVisible) {
                toggleAutoParkSection();
            }
            window.focus();
        }
    }, 100);
}

subscribeToIFrameClicks();

// Добавляем обработчик события на клик по кнопке .tech_spec__btn
buttontech.addEventListener('click', () => {
    // Переключаем класс, чтобы показать/скрыть блок .tech_spec__visible с плавной анимацией
    techSection.classList.toggle('active');
    toggleElements('toggle');

    if (visibleBlockMission.classList.contains('hidden')) {
        buttonText.textContent = 'Подробнее';
        buttonIcon.classList.remove('rotate');
    } else {
        buttonText.textContent = 'Скрыть';
        buttonIcon.classList.add('rotate');
    }
    // Если блок .auto_park открыт, скрываем его
    if (!isAutoParkVisible) {
        toggleAutoParkSection();
    }
});

// Обработчик события клика на блок .auto_park__control
autoParkControl.addEventListener('click', () => {
    // Скрываем блок .tech_spec__visible, если он открыт
    if (!visibleBlockMission.classList.contains('hidden')) {
        techSection.classList.add('active');
        toggleElements('add');
        buttonText.textContent = 'Подробнее';
        buttonIcon.classList.remove('rotate');
    } else if (visibleBlockMission.classList.contains('hidden') && window.matchMedia("(orientation: landscape)").matches) {
        techSpecWrapperText.style.height = 'auto';
        buttontech.style.display = 'block';
        if (interior) {
            interior.style.zIndex = 'none';
        }
    }

    toggleAutoParkSection();
});

function toggleAutoParkSection() {
    if (isAutoParkVisible) {
        // Если секция .auto_park видима, скрываем ее
        if (screenWidth <= 576 || (screenWidth <= 900 && window.matchMedia("(orientation: landscape)").matches)) {
            // autoParkSection.style.transform = 'translateY(20px)';
            autoParkSection.style.transform = 'translateY(15px)';
        } else {
            autoParkSection.style.transform = 'translateY(0)';
            // autoParkSection.style.transform = 'translateY(-5)';
        }
        buttonIcon2.classList.remove('rotate');
    } else {
        autoParkSection.style.transform = 'translateY(74%)';
        buttonIcon2.classList.add('rotate');
    }

    // Инвертируем флаг видимости секции .auto_park
    isAutoParkVisible = !isAutoParkVisible;
}

const transitionHelper = new InteriorTransitionHelper(interior);
const idToClassMap = {
    'amarok': 'garage_amarok',
    'ford': 'garage_ford',
    'solaris_gray': 'garage_solaris_gray',
    'bus': 'garage_bus',
    'kater': 'garage_kater',
    'moskvich': 'garage_moskvich',
    'kamaz': 'garage_kamaz',
};

if (interior) {
    interior.addEventListener('click', () => {
        if (transitionHelper.isTextChangedOnTransition()) {
            return;
        }
    
        threeJSScene.classList.toggle('active');
        overlay.classList.toggle('active');
        setTimeout(() => {
            techSection.classList.toggle('hidden');
            autoSection.classList.toggle('hidden');
            threeJSScene.classList.toggle('active');
            overlay.classList.toggle('active');
            sliderButton.forEach(e => {
                e.classList.toggle('hidden');
            });
        }, 1500);
    
        const idValue = interior.getAttribute('id');
        const interiorTextContent = interiorText.textContent;
        const classToAdd = idToClassMap[idValue];
    
        if (interiorTextContent === 'В салон') {
            interiorText.textContent = 'В гараж';
        } else if (interiorTextContent === 'В рубку') {
            interiorText.textContent = 'На причал';
        } else if (interiorTextContent === 'На причал') {
            interiorText.textContent = 'В рубку';
        } else {
            interiorText.textContent = 'В салон';
        }
    
        if (classToAdd) {
            interior.classList.toggle(classToAdd);
        }
    
        transitionHelper.onTextChange();
    });
}

gallery_toggle.forEach((e) => {
    e.addEventListener('click', () => {
        gallery_toggle.forEach((el) => el.classList.remove('active'));
        e.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const allSlides = document.querySelectorAll('.swiper-slide');
    const activeSlideIndex = Array.from(allSlides).findIndex(slide => slide.classList.contains('active'));

    const swipermodel = new Swiper('.swiper_model', {
        initialSlide: activeSlideIndex,
        slidesPerView: 1,
        spaceBetween: 2,
        freeMode: true,
        navigation: {
            nextEl: '.next_button',
            prevEl: '.prev_button',
        },
        breakpoints: {
            370: { slidesPerView: 2 },
            770: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1200: { slidesPerView: 4,
                    freeMode: true,
                },
        },
    });

    // Функция для управления видимостью кнопок в зависимости от положения слайдера
    const updateButtonVisibility = () => {
        const prevButton = document.querySelector('.prev_button');
        const nextButton = document.querySelector('.next_button');

        prevButton.style.display = swipermodel.isBeginning ? 'none' : 'block';
        nextButton.style.display = swipermodel.isEnd ? 'none' : 'block';
    };

    // Вызвать функцию при загрузке страницы и после каждого события Swiper
    updateButtonVisibility();
    swipermodel.on('reachBeginning reachEnd fromEdge', updateButtonVisibility);
});