let isModelLoaded = false;

const LOADING_TIME = 50000;
const PERCENT_STEP = 2;
const COUNT_LOAD_TIME = LOADING_TIME / (100 / PERCENT_STEP);
let percent = 1;
let preloader = document.querySelector(".progress-bar");
const percentEl = document.getElementById("progress-label");
const barEl = document.getElementById("progress-bar");

function fadeOutnojquery(el) {
    el.style.opacity = 1;
    let interhellopreloader = setInterval(function () {
        el.style.opacity = el.style.opacity - 0.05;

        if (el.style.opacity <= 0.05) {
            clearInterval(interhellopreloader);
            preloader.style.display = "none";
        }
    }, 16);
}

function countLoad() {
    barEl.style.width = "1%";
    percentEl.textContent = `1%`;
    barEl.style.transition = `width ${COUNT_LOAD_TIME / 4000}s linear`;

    let countInterval = setInterval(function () {
        percent += PERCENT_STEP;

        if ((percent > 96) && !isModelLoaded) {
            percent = 98;
        } else {
            if (percent > 100) {
                percent = 100;
            }
        }

        percentEl.textContent = `${percent}%`;
        barEl.style.width = `${percent}%`;

        if (isModelLoaded) {
            clearInterval(countInterval);
            let acceleratedInterval = COUNT_LOAD_TIME / 0;
            countInterval = setInterval(function () {
                percent += PERCENT_STEP;

                if (percent > 100) {
                    percent = 100;
                }

                percentEl.textContent = `${percent}%`;
                barEl.style.width = `${percent}%`;

                if (percent === 100) {
                    setTimeout(function () {
                        fadeOutnojquery(preloader);
                    }, 500);
                    clearInterval(countInterval);
                }
            }, acceleratedInterval);
        }
    }, COUNT_LOAD_TIME);
}

countLoad();

function myLoading() {
    console.log('myLoading go!');
    setTimeout(() => {
        isModelLoaded = true;
    }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
    myLoading();
});