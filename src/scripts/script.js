// Code source du projet étudiant "Artemisia Gentileschi, toiles d'une vie résiliente" - 2024
// Développé par Arthur Zachary 👽 | https://arthur-zachary.dev

// Ce script est un prototype d'exposition virtuelle en 3D, développé avec la librairie Three.js

            ////////////////////////////////////////////////////////////
            ///                                                      ///
            ///     //     //      /////     //           //////     ///
            ///     //  //       //     //   //         //      //   ///
            ///     ////        //      //   //        //////////    ///
            ///     //  //      //     //    //       //      //     ///
            ///     //    //      /////      //////  //      //      ///
            ///                                                      ///
            ////////////////////////////////////////////////////////////

// Script Signature /////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const delay = 5000;
    const message = `
    %c -----------------------------
    %c
    Artemisia Gentileschi,
    toiles d'une vie résiliente - 2024

    Dev by Arthur Zachary / K0la 👽
    Portfolio: https://arthur-zachary.dev

    %c -----------------------------
    `;
    function signature() {
        console.clear();
        console.log(message, 'color: #ff0000', 'color: #00ff00', 'color: #ff0000');
    }
    setTimeout(signature, delay);
});

// Importation des modules ///////////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from '../three/examples/jsm/controls/PointerLockControls.js';

// Initialisation /////////////////////////////////////////////////////////////////////////////////////////////////////

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new PointerLockControls(camera, renderer.domElement);
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();


// Configuration /////////////////////////////////////////////////////////////////////////////////////////////////////

let currentLanguage = 'en';  // Langue définit par défaut

const moveSpeed = 2.5; // Vitesse de déplacement de l'utilisateur 

const cameraBaseY = 1; // Hauteur de la caméra | des yeux de l'utilisateur

const frequency = 5; // Fréquence de l'oscillation de la caméra lors des déplacements
const amplitude = 0.05; // Amplitude de l'oscillation de la caméra lors des déplacements

const cameraHeightAdjustSpeed = 0.05; // Vitesse d'ajustement de la hauteur de la caméra 
const cameraSize = 0.8; // Taille de la caméra | de l'utilisateur


// Assignation des touches du clavier
const keyBindings = {
    avancer: 'Z',
    reculer: 'S',
    gauche: 'Q',
    droite: 'D',
    interagir: 'F',
    lampe: 'T'
}; 

// Initialisation des touches
const keysPressed = {
    Z: false,
    S: false,
    Q: false,
    D: false,
    F: false,
    T: false
};



// Lumières ////////////////////////////////////////////////////////////////////////////////////////////////////////////

const spotLight = new THREE.SpotLight(0xffa500); // Lampe torche
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Lumière ambiante
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1); // Lumière directionnelle | Soleil/Lune


// Ajout des lumières à la scène ------------------------------------------------------------

scene.add(ambientLight); // Ajout de la lumière ambiante

scene.add(spotLight); // Ajout de la lampe torche
scene.add(spotLight.target); // Ajout de la cible de la lampe torche

scene.add(directionalLight); // Ajout de la lumière directionnelle

//Placements des lampes ----------------------------------------------------------------------

// Positions des sources lumineuses 
const pointLightPositions = [
    { x: -17.48, y: 0.5, z: -1.28 },
    { x: -17.48, y: 0.5, z: 1.28 },
    { x: -16.24, y: 0.5, z: -0.05 },
    { x: -19, y: 0.5, z: -0.05 },
];


//Configurations des lampes --------------------------------------------------------------------

// Lampe Torche -------------------------

spotLight.intensity = 10; // Intensité de la lumière
spotLight.angle = Math.PI / 4; // Angle de la lumière
spotLight.penumbra = 0.1; // Pénombre
spotLight.decay = 1.2; // Décroissance
spotLight.distance = 500; // Distance de la lumière / Puissance de la lumière

// Lumière directionnelle ---------------

directionalLight.position.set(0, 1, 0); // placement de la source lumineuse

// Initialisation des livres //////////////////////////////////////////////////////////////////////////////////////////

let books = []; // Tableau des livres |initialisation des livres

// Positions des livres --------------------------------------------------------------------------------------------

const bookPositions = [
    new THREE.Vector3(3.2, 0.15, 0),
    new THREE.Vector3(-2, 0.15, -5.5),
    new THREE.Vector3(-8.5, 0.15, 0),
    new THREE.Vector3(-2, 0.15, 5.5),
    new THREE.Vector3(-33, 0.15, -5.5),
    new THREE.Vector3(-26.5, 0.15, 0)
];

// Initialisations des bougies -------------------------------------------------------------------------------------

const candles = [];

// Positions des bougies --------------------------------------------------------------------------------------------

const candlePositions = [
    { pos: new THREE.Vector3(-26.5, 0, -0.5), freq: 5 },
    { pos: new THREE.Vector3(3, 0, -0.5), freq: 3 },
    { pos: new THREE.Vector3(-8.5, 0, -0.5), freq: 4 },
    { pos: new THREE.Vector3(-1.5, 0, -5.5), freq: 6 },
    { pos: new THREE.Vector3(-33.5, 0, -5.5), freq: 2 },
    { pos: new THREE.Vector3(-2.5, 0, 5.5), freq: 7 },
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let enableMovement = false;
let translations = {};

let simulatedTime = 600;

raycaster.far = 10;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const cameraBox = new THREE.Box3();

const bookDescriptions = {};
let currentBookInView = null;

let time = 0;

let totalDistance = 0;
const lerpFactor = 0.1;

let isNearBook = false;



// --------------------------------------------------------------------------------------------------------------


camera.position.set(15.24, 0, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));


renderer.setSize(window.innerWidth, window.innerHeight);


document.body.appendChild(renderer.domElement);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);


document.getElementById('loading-uid').style.display = 'block';
document.getElementById('start-uid').style.display = 'none';
document.getElementById('pause-uid').style.display = 'none';

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-uid').style.display = 'none';
        document.getElementById('start-uid').style.display = 'block';
    }, 1000);
    updateUI();
});

document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-uid').style.display = 'none';
    controls.lock();
    enableMovement = true;
});

document.getElementById('resume-button').addEventListener('click', () => {
    document.getElementById('pause-uid').style.display = 'none';
    setTimeout(() => {
        controls.lock();
    }, 100);
    
    enableMovement = true;
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (controls.isLocked) {
            controls.unlock();
            document.getElementById('pause-uid').style.display = 'block';
            document.getElementById('resume-button').disabled = true;
            setTimeout(() => {
                document.getElementById('resume-button').disabled = false;
            }, 1500);
            enableMovement = false;
        }
    }
});

document.getElementById('lang-toggle-start').addEventListener('click', switchLanguage);
document.getElementById('lang-toggle-pause').addEventListener('click', switchLanguage);


function loadTranslations() {
    fetch('./src/trad.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            translations = data;
            updateUI();
        })
        .catch(error => console.error(error));
}

document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('#pause-uid img');
    images.forEach(img => {
        const container = document.createElement('div');
        container.classList.add('image-container');
        
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = img.alt;
        
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(tooltip);
    });
});


function updateUI() {
    document.getElementById('start-button').textContent = translations[currentLanguage].startButton;
    document.getElementById('resume-button').textContent = translations[currentLanguage].resumeButton;
    document.getElementById('lang-toggle-start-p').textContent = translations[currentLanguage].languageToggle;
    document.getElementById('lang-toggle-pause-p').textContent = translations[currentLanguage].languageToggle;
    document.getElementById('h1_movements').textContent = translations[currentLanguage].deplacements.h1;
    document.getElementById('h2_movements').textContent = translations[currentLanguage].deplacements.h2;
    document.getElementById('expo_title').textContent = translations[currentLanguage].expoTitle;
    document.getElementById('expo_subtitle').textContent = translations[currentLanguage].expoSubtitle;

    const deplacementsKeys = Object.keys(translations[currentLanguage].deplacements);
    deplacementsKeys.forEach(key => {
        const keyBind = keyBindings[key];
        const noticeElement = document.getElementById(`notice_${key}`);
        if (noticeElement) {
            noticeElement.innerHTML = `${translations[currentLanguage].deplacements.press} ` +
                `<img src="src/ressources/icons/${keyBind}_before.svg" alt="Touche pour ${translations[currentLanguage].deplacements[key]}"> ` +
                translations[currentLanguage].deplacements[key];
        }
    });

    const interactElement = document.getElementById('notice_interact');
    if (interactElement) {
        interactElement.innerHTML = `${translations[currentLanguage].deplacements.press_tab} ` +
            `<img src="src/ressources/icons/${keyBindings['interagir']}_before.svg" alt="Touche pour ${translations[currentLanguage].deplacements['interagir']}"> ` +
            translations[currentLanguage].deplacements['interagir'];
    }

    const changelangElement = document.getElementById('notice_change_lang');
    if (changelangElement) {
        changelangElement.innerHTML = `${translations[currentLanguage].deplacements.press_tab} ` +
            `<img src="src/ressources/icons/X_before.svg" alt="Touche pour ${translations[currentLanguage].languageToggle}"> ` +
            translations[currentLanguage].languageToggle;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
    document.getElementById('lang-toggle-start').addEventListener('click', switchLanguage);
    document.getElementById('lang-toggle-pause').addEventListener('click', switchLanguage);
});





document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();
});


document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (controls.isLocked) {
            controls.unlock();
            document.getElementById('pause-uid').style.display = 'block';
            document.getElementById('resume-button').disabled = true;
            setTimeout(() => {
                document.getElementById('resume-button').disabled = false;
            }, 1500);
            enableMovement = false;
        }
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.fullscreenElement) {
        event.preventDefault();
        if (controls.isLocked) {
            controls.unlock();
            document.getElementById('pause-uid').style.display = 'block';
            document.getElementById('resume-button').disabled = true;
            setTimeout(() => {
                document.getElementById('resume-button').disabled = false;
            }, 1500);
            enableMovement = false;
        }
    }
});

controls.addEventListener('unlock', () => {
    document.getElementById('pause-uid').style.display = 'block';
    document.getElementById('resume-button').disabled = true;
    setTimeout(() => {
        document.getElementById('resume-button').disabled = false;
    }, 1500);
    enableMovement = false;
});




window.addEventListener('blur', () => {
    if (controls.isLocked) {
        controls.unlock();
        document.getElementById('pause-uid').style.display = 'block';
        enableMovement = false;
    }
});


pointLightPositions.forEach(pos => {
    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(pos.x, pos.y, pos.z);
    scene.add(pointLight);
});





function updateSpotlightPosition() {
    const offsetX = 0.05;
    const offsetY = -0.02;
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const downVector = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion);
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

    spotLight.position.copy(camera.position)
        .add(rightVector.multiplyScalar(offsetX))
        .add(downVector.multiplyScalar(offsetY));
    spotLight.target.position.copy(camera.position).add(forwardVector.multiplyScalar(10));
}

document.addEventListener('keydown', event => {
    if (event.key === 't' || event.key === 'T') {
        spotLight.intensity = (spotLight.intensity > 0) ? 0 : 10;
    }
});




function updateCameraBox() {
    cameraBox.setFromCenterAndSize(camera.position, new THREE.Vector3(0.02, 0.02, 0.02));
}

function checkCollisions(newPosition, axis) {
    const testBox = new THREE.Box3().copy(cameraBox).setFromCenterAndSize(newPosition, new THREE.Vector3(0.02, 0.02, 0.02));
    let collision = false;
    scene.traverse(object => {
        if (object.isMesh && object.parent !== scene) {
            if (object.name.startsWith('top')) {
                return;
            }
            if (object.name.startsWith('tree')) {
                return;
            }
            if (object.name.startsWith('leaves')) {
                return;
            }
            const objectBox = new THREE.Box3().setFromObject(object);
            if (testBox.intersectsBox(objectBox)) {
                collision = true;
                console.log(`Collision detected on axis ${axis} with object:`, object);
            }
        }
    });
    return collision;
}

function updatePosition(delta) {
    const position = camera.position.clone();
    const directionDown = new THREE.Vector3(0, -1, 0);
    raycaster.set(position, directionDown);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let targetY = cameraBaseY;
    if (intersects.length > 0) {
        const closest = intersects[0];
        targetY = closest.point.y + cameraBaseY;
    }
    
    if (!enableMovement) return;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const sideways = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    direction.copy(forward.multiplyScalar(keysPressed['Z'] - keysPressed['S']));
    direction.add(sideways.multiplyScalar(keysPressed['D'] - keysPressed['Q']));

    if (direction.lengthSq() > 0) {
        direction.normalize();
        const moveDistance = moveSpeed * delta;
        totalDistance += moveDistance;
        const newPositionX = camera.position.x + direction.x * moveDistance;
        const newPositionZ = camera.position.z + direction.z * moveDistance;

        if (!checkCollisions(new THREE.Vector3(newPositionX, camera.position.y, newPositionZ), 'x')) {
            camera.position.x = newPositionX;
        }
        if (!checkCollisions(new THREE.Vector3(camera.position.x, camera.position.y, newPositionZ), 'z')) {
            camera.position.z = newPositionZ;
        }

        const bobbingY = amplitude * Math.sin(frequency * totalDistance);
        const interpolatedY = camera.position.y + (targetY + bobbingY - camera.position.y) * lerpFactor;
        camera.position.y = interpolatedY;
    } else {
        camera.position.y += (targetY - camera.position.y) * cameraHeightAdjustSpeed;
    }
}




function updateCameraHeight() {
    const positionAbove = camera.position.clone().add(new THREE.Vector3(0, 1, 0));
    const directionDown = new THREE.Vector3(0, -1, 0);
    raycaster.set(positionAbove, directionDown);
    raycaster.far = 2 * cameraSize;

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const closest = intersects[0];
        const obstacleHeight = closest.point.y;
        const minimumCameraHeight = obstacleHeight + 0.2 * cameraSize;

        if (camera.position.y < minimumCameraHeight) {
            camera.position.y = minimumCameraHeight;
        }
    } else {
        camera.position.y += (cameraBaseY - camera.position.y) * cameraHeightAdjustSpeed;
    }
}





document.addEventListener('keydown', event => {
    keysPressed[event.key.toUpperCase()] = true;
});

document.addEventListener('keyup', event => {
    keysPressed[event.key.toUpperCase()] = false;
});

const modelLoader = new GLTFLoader();
modelLoader.load('src/ressources/models/map.glb', (gltf) => {
    scene.add(gltf.scene);
    console.log('Model loaded:', gltf);
}, undefined, (error) => {
    console.error(error);
});



function createCandle(position, flickerFrequency) {
    const candleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 32);
    const candleMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const candle = new THREE.Mesh(candleGeometry, candleMaterial);
    candle.position.set(position.x, position.y, position.z);
    scene.add(candle);

    const flame = new THREE.PointLight(0xffa500, 100, 200);
    flame.position.set(position.x, position.y + 0.5, position.z);
    scene.add(flame);

    return { candle, flame, baseY: position.y + 0.5, flickerFrequency };
}



function animateCandles() {
    const time = performance.now() / 1000;
    candles.forEach(({ flame, baseY, flickerFrequency }) => {
        const flickerSpeed = flickerFrequency;
        const flickerIntensity = 0.5;
        const flickerHeight = 0.05;

        const sinValue = Math.sin(time * flickerSpeed);

        const randomIntensity = Math.random() * 0.2 - 0.1;
        const randomHeight = Math.random() * 0.02 - 0.01;

        flame.intensity = 2 + sinValue * flickerIntensity + randomIntensity;
        flame.position.y = baseY + sinValue * flickerHeight + randomHeight;
    });
}


function initializeCandles() {
    candlePositions.forEach(({ pos, freq }) => {
        candles.push(createCandle(pos, freq));
    });
}



function switchLanguage() {
    currentLanguage = (currentLanguage === 'en') ? 'fr' : 'en';
    updateUI();
    updateAllBookDescriptions();
}

function updateAllBookDescriptions() {
    books.forEach(book => {
        updateBookDescription(book);
    });
}

function updateBookDescription(book) {
    const bookData = translations[currentLanguage]?.tab[book.userData.id];
    if (bookData) {
        book.userData.title = bookData.title;
        book.userData.description = bookData.text;
        if (book === currentBookInView) {
            document.getElementById('bookTitle').textContent = bookData.title;
            document.getElementById('bookDescription').textContent = bookData.text;
        }
    } else {
        console.error('Missing translation for book with ID:', book.userData.id);
    }
}


document.addEventListener('keydown', event => {
    if (event.key === 'x') {
        switchLanguage();
    }
});


bookPositions.forEach((position, index) => {
    modelLoader.load('src/ressources/models/book.glb', (gltf) => {
        gltf.scene.position.copy(position);
        gltf.scene.userData = {
            type: 'book',
            id: `b${index + 1}`,
            title: `Tableau n° ${index + 1}`,
            desc: `Ceci est le tableau n° ${index + 1} de l'exposition.`

        };
        scene.add(gltf.scene);
        books.push(gltf.scene);
        console.log(`Book ${index + 1} loaded with userData:`, gltf.scene.userData);
    }, undefined, (error) => {
        console.error(`Failed to load the book model:`, error);
    });
});

    

function checkProximity() {
    const proximityThreshold = 2;
    const crossHairDiv = document.getElementById('cross_hair');
    const crossHelpDiv = document.getElementById('notice_interact');

    let isNearAnyBook = false;
    const raycaster = new THREE.Raycaster();
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));

    currentBookInView = null; 

    books.forEach(book => {
        const distance = camera.position.distanceTo(book.position);
        if (distance < proximityThreshold) {
            isNearAnyBook = true;

            const intersects = raycaster.intersectObject(book, true);
            if (intersects.length > 0) {
                currentBookInView = book; 
                
            }
        }
    });

    if (isNearAnyBook) {
        crossHairDiv.style.display = 'block';
        crossHelpDiv.style.display = 'flex';
    } else {
        crossHairDiv.style.display = 'none';
        crossHelpDiv.style.display = 'none';
        document.getElementById('bookInfo').style.display = 'none';

    }
}


document.addEventListener('keydown', event => {
  if (event.key === 'f' || event.key === 'F') {
    
    if (document.getElementById('bookInfo').style.display === 'block') {
      document.getElementById('bookInfo').style.display = 'none';
    } else if (currentBookInView) {
      updateBookInfoUI(); 
      document.getElementById('bookInfo').style.display = 'block';


    }
  }
});

function updateBookInfoUI() {
    const crossHairDiv = document.getElementById('cross_hair');
    const crossHelpDiv = document.getElementById('notice_interact');

    if (currentBookInView) {
        console.log('Updating UI for:', currentBookInView);
        const bookData = translations[currentLanguage]?.tab[currentBookInView.userData.id];
        if (bookData) {
            document.getElementById('bookTitle').textContent = bookData.title;
            document.getElementById('bookDescription').textContent = bookData.text;
            crossHairDiv.style.display = 'none'; 
            crossHelpDiv.style.display = 'none';
            document.getElementById('bookInfo').style.display = 'block';
        } else {
            console.error('Missing translations or descriptions for current language:', currentLanguage);
            document.getElementById('bookTitle').textContent = "Title not available.";
            document.getElementById('bookDescription').textContent = "Description not available.";
        }
    } else {
        console.log('No book in view to update UI.');
        crossHairDiv.style.display = 'block';
        crossHelpDiv.style.display = 'flex';
        document.getElementById('bookInfo').style.display = 'none';
    }
}



const animate = function () {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateSpotlightPosition();
    updateCameraHeight();
    updatePosition(delta);
    checkProximity();
    animateCandles();
    renderer.render(scene, camera);
}; 


initializeCandles();
animate();