document.querySelector('.pulse_wrapper').addEventListener('click', () => {
	const modelViewer = document.querySelector('model-viewer');
	if (modelViewer.canActivateAR) {
		modelViewer.activateAR();
	} else {
		console.log('Открываем QR с ссылкой на AR');
	}
});