document.querySelector('.pulse_wrapper').addEventListener('click', () => {
	const modelViewer = document.querySelector('#pageWithModel');

	console.log("Доступность AR: " + modelViewer.canActivateAR)
	
	if (modelViewer.canActivateAR) {
		modelViewer.activateAR();
	} else {
		console.log('Открываем QR с ссылкой на AR');
		openErrorStatus()
	}
});

// Popip с QR-кодом
const statusError = document.querySelector('.qrCode-popup');
const arButton = document.querySelector('.pulse_wrapper');

// Для отключения скролла
let bodyOverflow = document.querySelector('body');
let scrollPosition = 0;

function closePopup() {
	bodyOverflow.style.removeProperty("overflow");
	bodyOverflow.style.removeProperty("position");
	bodyOverflow.style.removeProperty("top");
	bodyOverflow.style.removeProperty("width");
	window.scrollTo(0, scrollPosition);
}

function openPopup() {
	scrollPosition = window.scrollY;
	bodyOverflow.style.overflow = "hidden";
	bodyOverflow.style.position = "fixed";
	bodyOverflow.style.top = `-${scrollPosition}px`;
	bodyOverflow.style.width = "100%";
}

function openErrorStatus() {
	statusError.classList.add('active');
	statusError.style.visibility = 'visible';
	arButton.classList.add('hidden');
	openPopup();
}

function closeErrorStatus() {
	statusError.classList.remove('active');
	arButton.classList.remove('hidden');
	setTimeout(() => {
		statusError.style.visibility = 'hidden';
	}, 450);
	closePopup();
}

// function clickOutOfPopup(popup, closeFunc) {
// 	popup.addEventListener('mousedown', (event) => {
// 		const target = event.target;
// 		const isInsidePopup = target.closest('.qrCode-popup_wrapper');
// 		if (!isInsidePopup) {
// 			closeFunc();
// 		}
// 	});
// }

// clickOutOfPopup(statusError, closeErrorStatus);

function clickButtonClose(clickedElem, closeFunc) {
	clickedElem.addEventListener('click', () => {
		closeFunc();
	});
}

const statusErrorCloseIcon = document.querySelector('.qrCode-popup .closeButton');
clickButtonClose(statusErrorCloseIcon, closeErrorStatus);