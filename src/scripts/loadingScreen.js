import * as THREE from 'three';

const loadingScene = new THREE.Scene();
const loadingCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const loadingRenderer = new THREE.WebGLRenderer({ alpha: true });
loadingRenderer.setSize(window.innerWidth, window.innerHeight);

const simulateLoading = function() {
    let loadProgress = 0;
    const interval = setInterval(() => {
        loadProgress += 10;
        document.getElementById('loading-bar').style.width = `${loadProgress}%`;
        if (loadProgress >= 100) clearInterval(interval);
    }, 100);
};
simulateLoading();
