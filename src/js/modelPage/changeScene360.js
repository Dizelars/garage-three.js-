import {InteriorTransitionHelper} from "./interiorTransitionHelper.js";

// Переключение между сценами при клике на кнопку с классом ".tech_spec__interior"
let activeScene = 1;
const interiorButton = document.querySelector('.tech_spec__interior');
const aFrameScene = document.querySelector('a-scene');
const vectaryForbidden = document.querySelector('.vectary_forbidden');

if (aFrameScene) {
    aFrameScene.pause();
}

const transitionHelper = new InteriorTransitionHelper(interiorButton);
if (aFrameScene) {
    interiorButton.addEventListener('click', () => {
        if (transitionHelper.isTransition()) {
            return;
        }
    
        transitionHelper.startTransition();
        if (activeScene === 1) {
            vectaryForbidden.style.opacity = '0';
            vectaryForbidden.style.pointerEvents = 'none';
            setTimeout(() => {
                activeScene = 2;
                aFrameScene.style.opacity = '1';
                aFrameScene.style.height = 'auto';
                aFrameScene.style.pointerEvents = 'auto';
                aFrameScene.play();
                transitionHelper.endTransition();
            }, 1500);
        } else {
            setTimeout(() => {
                activeScene = 1;
                aFrameScene.style.opacity = '0';
                aFrameScene.style.height = '0';
                aFrameScene.style.pointerEvents = 'none';
                aFrameScene.pause();
                transitionHelper.endTransition();
                vectaryForbidden.style.opacity = '1';
                vectaryForbidden.style.pointerEvents = 'auto';
            }, 1500);
        }
    });
}