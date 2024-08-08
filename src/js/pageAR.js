const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get("armodel");

const arModelUrls = {
    muslcar: 'muslCar/untitled.gltf',
    police: 'police/scene.gltf'
};

let arModelUrl = arModelUrls[newsId];

document.addEventListener("DOMContentLoaded", () => {
    const modelViewer = document.querySelector('#pageAR');

    if (arModelUrl) {
        modelViewer.setAttribute('src', `https://coddmac.store/THREE/3Dmodels/${arModelUrl}`);
        modelViewer.activateAR();
    }
});