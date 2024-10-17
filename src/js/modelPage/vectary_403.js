const vectaryForbidden = document.querySelector('.vectary_forbidden');
const vectaryForbiddenArrow = document.querySelector('.vectary_forbidden .forbidden_icons .forbidden-arrow');

// Функция для открытия плашки предупреждения
vectaryForbiddenArrow.addEventListener('click', () => {
    vectaryForbidden.classList.toggle('open');
})