document.querySelector('.pulse_wrapper').addEventListener('click', () => {
    console.log('click AR');
	const modelViewer = document.querySelector('model-viewer');
    console.log(modelViewer);
	if (modelViewer.canActivateAR) {
        console.log('canActivateAR');
		modelViewer.activateAR();
        console.log('AR triggered');
	} else {
		console.log('Открываем QR с ссылкой на AR');
	}
});