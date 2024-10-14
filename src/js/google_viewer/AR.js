const modelViewer = document.querySelector('#pageWithModel');
const pulseBlock = document.querySelector('.pulse_media');

document.querySelector('.pulse_wrapper').addEventListener('click', () => {
	if (modelViewer.canActivateAR) {
		pulseBlock.classList.add('loading');
		modelViewer.activateAR();
		modelViewer.addEventListener('ar-status', (event) => {
			if (event.detail.status === 'session-started') {
				console.log('AR session started');
				// AR загружен
				pulseBlock.classList.remove('loading'); 
			} else if (event.detail.status === 'failed') {
				console.log('Failed to start AR session');
				// AR не загрузился
				pulseBlock.classList.remove('loading'); 
			}
		});
	} else {
		if (window.innerWidth < 1200) {
			console.log('No AR on this device');
			openPopupARSupport()
		} else {
			console.log('Открываем QR с ссылкой на AR');
			openPopupQR()
		}
	}
});

// Popap с QR-кодом
const qrCodePopup = document.querySelector('.qrCode-popup');
const arButton = document.querySelector('.pulse_wrapper');

// Popap с Предупреждением
const arSupportPopup = document.querySelector('.arSupport-popup');

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

function openPopupQR() {
	qrCodePopup.classList.add('active');
	qrCodePopup.style.visibility = 'visible';
	arButton.classList.add('hidden');
	openPopup();
}

function closePopupQR() {
	qrCodePopup.classList.remove('active');
	arButton.classList.remove('hidden');
	setTimeout(() => {
		qrCodePopup.style.visibility = 'hidden';
	}, 450);
	closePopup();
}

function openPopupARSupport() {
	arSupportPopup.classList.add('active');
	arSupportPopup.style.visibility = 'visible';
	arButton.classList.add('hidden');
	openPopup();
}

function closePopupARSupport() {
	arSupportPopup.classList.remove('active');
	arButton.classList.remove('hidden');
	setTimeout(() => {
		arSupportPopup.style.visibility = 'hidden';
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

// clickOutOfPopup(qrCodePopup, closePopupQR);

function clickButtonClose(clickedElem, closeFunc) {
	clickedElem.addEventListener('click', () => {
		closeFunc();
	});
}

const qrCodePopupCloseIcon = document.querySelector('.qrCode-popup .closeButton');
clickButtonClose(qrCodePopupCloseIcon, closePopupQR);

const arSupportPopupCloseIcon = document.querySelector('.arSupport-popup .closeButton');
clickButtonClose(arSupportPopupCloseIcon, closePopupARSupport);