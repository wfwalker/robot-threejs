/*
	Inspired by Three.js "tutorials by example", Author: Lee Stemkoski, Date: March 2013 (three.js v56)
 */

// MAIN
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
// standard global variables
var container, scene, camera, renderer;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var bob = new Robot("bob");
var angus = new Robot("angus");

// Do not recreate these for every frame!
var relativeCameraOffset = new THREE.Vector3();
var targetPosition = new THREE.Vector3();

// custom global variables

init();
initAudio();
animate();

// consider using http://evanw.github.com/csg.js/docs/

function createPlatform(inName) {
	var platform = new THREE.Object3D();

	var floor = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.BoxGeometry( 800, 800, 100, 1, 1, 1 ), 
		Robot.floorFrame );
	floor.name = "platform";
	floor.position.y = -50;
	floor.rotation.x = Math.PI / 2;

	platform.add(floor);

	platform.name = inName;

	return platform;
}

function createGloomyWorld(inScene) {
	var ambientLight = new THREE.AmbientLight(0x111111);
	inScene.add(ambientLight);	

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 0, 1, 0 );
	inScene.add( directionalLight );

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x555555, side: THREE.BackSide } );
	Robot.skybox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	inScene.add(Robot.skybox);
	inScene.fog = new THREE.FogExp2( 0x555555, 0.0005 );

	// floating platforms	
	var start = createPlatform('start');
	inScene.add(start);

	for (var index = 0; index < 50; index++) {
		var randomPlat = createPlatform('platform' + index);
		randomPlat.position.set(-5000 + Math.random() * 10000, -550 + Math.random() * 500, -5000 + Math.random() * 10000);
		inScene.add(randomPlat);
	}	
}

function createSunlitWorld(inScene) {
	var ambientLight = new THREE.AmbientLight(0x111111);
	inScene.add(ambientLight);	

	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zneg.png' ) }));
	for (var i = 0; i < 6; i++)
	   materialArray[i].side = THREE.BackSide;
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	
	var skyboxGeom = new THREE.BoxGeometry( 10000, 10000, 10000, 1, 1, 1 );
	
	Robot.skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );

	inScene.add( Robot.skybox );	
	inScene.fog = new THREE.FogExp2( 0x999999, 0.0002 );

	// floating platforms	
	var start = createPlatform('start');
	inScene.add(start);

	for (var index = 0; index < 50; index++) {
		var randomPlat = createPlatform('platform' + index);
		randomPlat.position.set(-5000 + Math.random() * 10000, -550 + Math.random() * 500, -5000 + Math.random() * 10000);
		inScene.add(randomPlat);
	}	
}


// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 55, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(0, 200, 0);	

	// RENDERER
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );

	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	createGloomyWorld(scene);
	// createSunlitWorld(scene);

	scene.add(bob.model);

	angus.model.position.set(300, 0, 0);
	angus.pose();
	scene.add(angus.model);

	document.addEventListener("keydown", function (e) {
		bob.parseKeyboardCommands(e);
	});
	document.addEventListener("keyup", function (e) {
		bob.parseKeyboardCommands(e);
	});

}

function initAudio() {
	// wire up sound
	window.AudioContext = window.AudioContext||window.webkitAudioContext;
	context = new AudioContext();
	console.log("created audio context");
	console.log(context);

	var bufferSize = 2 * context.sampleRate;
	noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
	output = noiseBuffer.getChannelData(0);
	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}

	var whiteNoise = context.createBufferSource();
	whiteNoise.buffer = noiseBuffer;
	whiteNoise.loop = true;

	// create gain, wire up to noise
	Robot.engineGain = context.createGain();
	whiteNoise.connect(Robot.engineGain);
	Robot.engineGain.connect(context.destination);

	// initialize gain.gain, start whitenoise
	Robot.engineGain.gain.value = 0;
	whiteNoise.start(0);
}

function animate() 
{
    requestAnimationFrame( animate );

    for (var index = 0; index < Robot.robots.length; index++) {
		var aRobot = Robot.robots[index];

	    if (aRobot.currentPose == Robot.FLOAT) {
		    aRobot.model.position.y = 4*Math.sin(index * 1000 + clock.elapsedTime)+2;    	
	    }
    }

	renderer.render( scene, camera );

	bob.updateVelocity();
	bob.updatePose();
	bob.cameraChases(camera);
}
