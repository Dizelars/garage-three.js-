import { isAutoplayVideoScreenSize, isElementInViewport, observeElementVisibility } from "./utils.js";

// Примечания по видео на стартовой странице:
// Webpack импортирует пути до видео Абсолютными, что мешает открытию ролика в современных версиях iOS
// Нужны абсолютные пути до файлов
// Так как данный webpack пока не конвертирует пути, мы кладем путь и сами видео сразу на сервер
// Размер ролика также тормозит отображение, нужно максимально сжимать до допустимого качества и в случае тяжеловесного файла,
// ставить лоадер.

// import videoMainDesctop from '../img/video/startVideo/main_desctop.mp4';
// import videoMainMobile from '../img/video/startVideo/main_mobile.mp4';
const videoMainDesctop = 'media/video/main_desctop.mp4';
const videoMainMobile = 'media/video/main_mobile.mp4';

const createVideoSource = (el, fileType) => {
    const source = document.createElement("source");
    source.setAttribute("src", fileType);
    source.setAttribute("type", "video/mp4");
    el.appendChild(source);
};

function createVideo() {
    const videoMain = document.querySelector('section.main video.preview_video');
    const isiPad = window.innerWidth < 1200;
    const isMobile = window.innerWidth < 700;
    const isVertical = window.innerHeight > window.innerWidth;

    if (!isiPad && !isVertical && !isMobile) { // десктоп
        createVideoSource(videoMain, videoMainDesctop);
    } else if (isiPad && !isVertical && !isMobile) { // iPad горизонтально
        createVideoSource(videoMain, videoMainDesctop);
    } else if (isiPad && isVertical && !isMobile) { // iPad вертикально
        createVideoSource(videoMain, videoMainMobile);
    } else if (isMobile) { // мобилка
        createVideoSource(videoMain, videoMainMobile);
    }

    videoMain.play();
}

document.addEventListener("DOMContentLoaded", function() {
    createVideo();

    // Получаем все элементы с классом "burger-menu"
    const burgerMenus = document.querySelectorAll(".burger-menu");
    const burgerClose = document.querySelectorAll(".burger-menu .bar");

    // Добавляем обработчик события "click" для каждого элемента
    burgerMenus.forEach((burgerMenu) => {
        burgerMenu.addEventListener("click", function () {
            // Добавляем/удаляем классы "burger-menu--opened" и "burger-menu--closed"
            this.classList.toggle("burger-menu--opened");
            this.classList.toggle("burger-menu--closed");
            burgerClose.forEach((e) => {
                e.classList.toggle("close_width");
            });
        });
    });

    // Функция для плавного скроллинга к якорю
    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const offset = element.getBoundingClientRect().top + window.scrollY;

            window.scroll({
                top: offset,
                behavior: 'smooth'
            });
        }
    }

    // Появление и скрытие меню сайта
    let bodyOverflow = document.querySelector('body.main');
    let menuBtn = document.querySelector('.header__menu');
    let menu = document.querySelector('.menu');
    let blur = document.querySelector('.block_blur');
    const menuAnimationAdd = document.querySelectorAll('.menu .menu_navigation .menu_navigation-list li[class^="menu_navigation-"], .menu .menu-media a[class^="media-"]');
    menuBtn.addEventListener('click', function(){
        menu.classList.toggle('active');
        bodyOverflow.classList.toggle('overflow');
        blur.classList.toggle('active');
        menuAnimationAdd.forEach(e => {
            e.classList.toggle('animation');
        });
    })

    // Замена цвета у других ссылок при наведении на одну из ниих
    const navigationLinks = document.querySelectorAll(".menu_navigation-link");

    function addHoveredClass(link) {
        link.classList.add("hovered");
    }

    function removeHoveredClass() {
        navigationLinks.forEach(link => link.classList.remove("hovered"));
    }

    function handleLinkHover(event) {
        const hoveredLink = event.target;
        removeHoveredClass();

        let prevSibling = hoveredLink.parentElement.previousElementSibling;
        while (prevSibling) {
            if (prevSibling.querySelector(".menu_navigation-link")) {
                addHoveredClass(prevSibling.querySelector(".menu_navigation-link"));
            }
            prevSibling = prevSibling.previousElementSibling;
        }

        let nextSibling = hoveredLink.parentElement.nextElementSibling;
        while (nextSibling) {
            if (nextSibling.querySelector(".menu_navigation-link")) {
                addHoveredClass(nextSibling.querySelector(".menu_navigation-link"));
            }
            nextSibling = nextSibling.nextElementSibling;
        }
    }

    function handleLinkLeave() {
        removeHoveredClass();
    }

    // Измененная функция обработчика события для ссылок
    function handleLinkCloseMenu(event) {
        event.preventDefault();
        const target = event.target.getAttribute("href"); // Получаем атрибут href якорной ссылки
        menu.classList.toggle('active');
        bodyOverflow.classList.toggle('overflow');
        blur.classList.toggle('active');
        burgerMenus.forEach((burgerMenu) => {
            burgerMenu.classList.remove("burger-menu--opened");
            burgerMenu.classList.add("burger-menu--closed");
            burgerClose.forEach((e) => {
                e.classList.remove("close_width");
            });
        });
        menuAnimationAdd.forEach(e => {
            e.classList.toggle('animation');
        });
        // Вызываем функцию плавного скроллинга к якорю
        smoothScrollTo(target);
    }

    navigationLinks.forEach(link => {
        link.addEventListener("mouseover", handleLinkHover);
        link.addEventListener("mouseout", handleLinkLeave);
        link.addEventListener("click", handleLinkCloseMenu);
    });

    // ПОЯВЛЕНИЕ видео превью при наведении на список меню. (на десктопе)
    if(window.innerWidth > 1200) {
        // Получаем все элементы списка
        const menuItems = document.querySelectorAll('.menu_navigation-item');

        // Для каждого элемента списка добавляем обработчики событий
        menuItems.forEach(menuItem => {
            const previewBlock = menuItem.querySelector('.menu_preview-block');
            const previewVideo = menuItem.querySelector('.menu_preview-block .menu_preview-video');

            menuItem.addEventListener('mouseenter', () => {
                previewBlock.style.display = 'block';
                previewVideo.play();
                menuItem.style.zIndex = '5';
            });

            menuItem.addEventListener('mouseleave', () => {
                previewBlock.style.display = 'none';
                previewVideo.pause();
                previewVideo.currentTime = 0;
                menuItem.style.zIndex = 'unset';
            });

            menuItem.addEventListener('mousemove', (event) => {
                const xRelativeToItem = event.clientX - menuItem.getBoundingClientRect().left;
                const yRelativeToItem = event.clientY - menuItem.getBoundingClientRect().top;
                const previewBlockWidth = previewBlock.offsetWidth;
                const previewBlockHeight = previewBlock.offsetHeight;

                const x = xRelativeToItem - previewBlockWidth / 2; // Центрирование по X относительно курсора
                const y = yRelativeToItem - previewBlockHeight - 10; // Смещение чуть выше курсора

                previewBlock.style.left = x + 'px';
                previewBlock.style.top = y + 'px';
            });
        });
    }

    // ВИДЕО при ховере на карточку .garage_model_card
    const modelCards = document.querySelectorAll('.garage_model_card');
    if (isAutoplayVideoScreenSize()) {
        setInterval(() => {
            modelCards.forEach(card => {
                let modelCardVideo = card.querySelector('.slid_img .menu_preview-video');
                let mediaWrap = card.querySelector('.garage_model_card .slid_img');
                let modelCardImage = card.querySelector('.garage_model_card .slid_img picture');
                observeElementVisibility(
                    card,
                    () => {
                        // Действия, когда элемент видим
                        modelCardVideo.style.visibility = 'visible';
                        modelCardVideo.play();
                        modelCardImage.style.visibility = 'hidden';
                        mediaWrap.style.background = '#090909 ';
                    },
                    () => {
                        // Действия, когда элемент невидим
                        modelCardVideo.style.visibility = 'hidden';
                        modelCardVideo.pause();
                        modelCardVideo.currentTime = 0;
                        modelCardImage.style.visibility = 'visible';
                        mediaWrap.style.background = '';
                    }
                );
            });
        }, 200);
    } else {
        modelCards.forEach(card => {
            let modelCardVideo = card.querySelector('.slid_img .menu_preview-video');
            let mediaWrap = card.querySelector('.garage_model_card .slid_img');
            let modelCardImage = card.querySelector('.garage_model_card .slid_img picture');

            card.addEventListener('mouseenter', () => {
                modelCardVideo.style.visibility = 'visible';
                modelCardVideo.play();
                modelCardImage.style.visibility = 'hidden';
                mediaWrap.style.background = '#090909 ';
            });

            card.addEventListener('mouseleave', () => {
                modelCardVideo.style.visibility = 'hidden';
                modelCardVideo.pause();
                modelCardVideo.currentTime = 0;
                modelCardImage.style.visibility = 'visible';
                mediaWrap.style.background = '';
            });
        });
    }


    // Получаем ссылки футера для плавного скролла
    const footerLinks = document.querySelectorAll('footer.footer_main .footer-menu-links a');
    footerLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Предотвращаем переход по ссылке
            const target2 = link.getAttribute("href"); // Используем link.getAttribute("href") вместо link.target.getAttribute("href")
            smoothScrollTo(target2);
        });
    });


    // Swiper slider
    const swiper1 = new Swiper('.swiper1', {
        slidesPerView: 1,
        // spaceBetween: 0,
        spaceBetween: 20,

        pagination: {
            el: '.swiper-pagination1',
            clickable: true
        },

        // navigation: {
        //     nextEl: '.btn_next',
        //     prevEl: '.btn_prev'
        // },

        // breakpoints: {
        //     440: {
        //         slidesPerView: 2,
        //         spaceBetween: 20,
        //     },
        //     1024: {
        //         slidesPerView: 3,
        //         spaceBetween: 20,
        //     }
        // }
    });
    
    const swiper2 = new Swiper('.swiper2', {
        slidesPerView: "auto",
        spaceBetween: 20,

        pagination: {
            el: '.swiper-pagination2',
            clickable: true,
        },
    });

    const swiper3 = new Swiper('.swiper3', {
        slidesPerView: 1,
        // spaceBetween: 0,
        spaceBetween: 20,

        pagination: {
            el: '.swiper-pagination3',
            clickable: true,
        },

        breakpoints: {
            440: { // when window width is >= 440px
                slidesPerView: "auto",
                spaceBetween: 20,
            },
        }
    });

    function moveBeforeElement(section) {
        if (section.classList.contains('help_desk')) {
            const pseudoElementHeight = 600;

            // Получаем высоту секции
            const sectionHeight = section.clientHeight;

            // Генерируем случайные координаты в пределах высоты и ширины секции
            const newPositionTop = Math.random() * (sectionHeight - pseudoElementHeight);
            const newPositionBottom = newPositionTop + pseudoElementHeight;
            const newPositionRight = Math.random() * 100;
            const newPositionLeft = Math.random() * 100;

            // Изменяем свойства для анимации перемещения псевдоэлемента "before"
            section.style.setProperty('--before-top', `${newPositionTop}px`);
            section.style.setProperty('--before-bottom', `${newPositionBottom}px`);
            section.style.setProperty('--before-left', `${newPositionLeft}%`);
            section.style.setProperty('--before-right', `${newPositionRight}%`);
        } else {
            const newPositionTop = Math.random() * 100;
            const newPositionBottom = Math.random() * 100;
            const newPositionRight = Math.random() * 100;
            const newPositionLeft = Math.random() * 100;

            section.style.setProperty('--before-top', `${newPositionTop}%`);
            section.style.setProperty('--before-bottom', `${newPositionBottom}%`);
            section.style.setProperty('--before-right', `${newPositionRight}%`);
            section.style.setProperty('--before-left', `${newPositionLeft}%`);
        }
    }

// Список секций, к которым применяется анимация
    const sections = document.querySelectorAll('section.traffic_patrol, section.situation_centre, section.velo_patrol, section.help_desk');

// Обработчик для вызова функции перемещения псевдоэлемента через интервал для каждой секции
    sections.forEach(section => {
        setInterval(() => {
            moveBeforeElement(section);
        }, 1800);
    });


    // Анимация градиента в футере, изменение интенсивности при движении курсора
    const container = document.querySelector('footer.footer_main .container_main');

    container.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = container.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        const offsetX = e.clientX - left;
        const offsetY = e.clientY - top;
        const distance = Math.sqrt((offsetX - centerX) ** 2 + (offsetY - centerY) ** 2);

        const maxOpacity = 1.0;
        const minOpacity = 0.3;
        const opacityRange = maxOpacity - minOpacity;

        const beforeOpacity = Math.max(minOpacity, maxOpacity - (distance / centerX) * opacityRange);
        const afterOpacity = Math.max(minOpacity, (distance / centerX) * opacityRange);

        container.style.setProperty('--before-opacity', beforeOpacity);
        container.style.setProperty('--after-opacity', afterOpacity);
    });


    // Анимации появления контента на странице при скролле:
    // Функция для применения анимаций к элементам секции
    function animateElementsOnScroll(sectionSelector) {
        const elements = document.querySelectorAll(sectionSelector + ' [class*="-animation-"]');
        elements.forEach(element => {
            if (!element.classList.contains('animated') && isElementInViewport(element)) {
                const animationDelay = parseFloat(window.getComputedStyle(element).animationDelay);
                element.style.animation = 'none'; // Отключаем анимацию, чтобы перезапустить ее
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.animation = ''; // Включаем анимацию
                    element.classList.add('animated'); // Добавляем класс для пометки анимации
                }, animationDelay);
            }
        });
    }

// Обработчик события прокрутки
    function handleScroll() {
        animateElementsOnScroll('section.traffic_patrol');
        animateElementsOnScroll('section.water_patrol');
        animateElementsOnScroll('section.velo_patrol');
        animateElementsOnScroll('section.situation_centre');
        animateElementsOnScroll('section.help_desk');
    }

// Добавляем обработчик события прокрутки окна
    window.addEventListener('scroll', handleScroll);

// Вызываем обработчик события прокрутки в начале для проверки видимости элементов при загрузке страницы
    handleScroll();
});