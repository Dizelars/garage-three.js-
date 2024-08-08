const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get("armodel");

const arModelUrls = {
    muslcar: 'muslCar/untitled.gltf',
    police: 'police/scene.gltf'
};

let arModelUrl = arModelUrls[newsId];

document.addEventListener("DOMContentLoaded", () => {
    const modelViewer = document.querySelector('#police');
    setTimeout(() => {
        modelViewer.activateAR();
    }, 100);

    // if (arModelUrl) {
    //     modelViewer.setAttribute('src', `https://coddmac.store/THREE/3Dmodels/${arModelUrl}`);
    //     modelViewer.activateAR();
    // }

    const m_viewer = document.createElement('model-viewer');
    m_viewer.setAttribute( 'id', 'pageAR' );
    m_viewer.setAttribute( 'class', 'google_viewer' );
    m_viewer.setAttribute( 'ar', 'true' );
    m_viewer.setAttribute( 'alt', 'AR 3D-model' );
    if (arModelUrl) {
        m_viewer.setAttribute( 'src', `https://coddmac.store/THREE/3Dmodels/${arModelUrl}` );
    }

    document.getElementById('div_mv').appendChild( m_viewer );
    console.log(m_viewer)
    if (m_viewer.loaded) {
        m_viewer.activateAR();
    }
});