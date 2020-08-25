let scene, model, camera, renderer;

init();
animate();

function init() {
scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);

renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);

// camera.position.set(-1, 5, 3.8);
// camera.position.set(30, 1, -3.8);

const ambient = new THREE.AmbientLight(0x404040, 2);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(30, 20, 100);
scene.add(light);

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', renderer);

hlight = new THREE.AmbientLight(0x404040, 40);
scene.add(hlight);

let loader = new THREE.GLTFLoader();
loader.load('model/scene.gltf', function (gltf) {  
    model = gltf.scene.children[0];
    scene.add(model);
    camera.lookAt(model.position);
});
}

function animate() {
requestAnimationFrame(animate);
renderer.render(scene, camera);
}