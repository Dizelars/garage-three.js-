//* Меню с моделями
const openBtn = document.querySelector('.openbtn');
const closeBtn = document.querySelector('.closebtn');

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

openBtn.addEventListener('click', () => {
    openNav()
})

closeBtn.addEventListener('click', () => {
    closeNav()
})