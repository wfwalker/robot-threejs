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

var listener = null;

// Do not recreate these for every frame!
var relativeCameraOffset = new THREE.Vector3();
var targetPosition = new THREE.Vector3();

// custom global variables

init();
initAudio();
animate();

// consider using http://evanw.github.com/csg.js/docs/

function createBeacon(inName) {
	var beaconGeometry = new THREE.BoxGeometry( 400, 400, 400, 1, 1, 1 );
	var cube = new THREE.Mesh( beaconGeometry, Robot.goldMaterial );
	cube.name = inName;
	return cube;
}

function createPlatform(inName) {
	var platformGeometry = new THREE.BoxGeometry( 800, 800, 100, 1, 1, 1 );
	var platform = new THREE.Mesh( platformGeometry, Robot.floorMaterial );

	platform.name = inName;
	platform.rotation.x = Math.PI / 2;

	return platform;
}

function createGloomyWorld(inScene) {
	var ambientLight = new THREE.AmbientLight(0x222222);
	inScene.add(ambientLight);	

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
	directionalLight.position.set( 10, 10, 0 );
	inScene.add( directionalLight );

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x555555, side: THREE.BackSide } );
	Robot.skybox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	inScene.add(Robot.skybox);
	inScene.fog = new THREE.FogExp2( 0x555555, 0.0003 );

	// floating platforms	
	var start = createPlatform('start');
	start.position.y = -50;
	inScene.add(start);

	for (var index = 0; index < 50; index++) {
		var randomPlat = createPlatform('platform' + index);
		randomPlat.position.set(-5000 + Math.random() * 10000, -550 + Math.random() * 500, -5000 + Math.random() * 10000);
		inScene.add(randomPlat);
	}	

	// beacon

	var beacon = createBeacon('beacon1');
	beacon.position.set(2000, 100, 0);
	console.log(beacon);
	inScene.add(beacon);

}

function createSunlitWorld(inScene) {
	var ambientLight = new THREE.AmbientLight(0x303030);
	inScene.add(ambientLight);	

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
	directionalLight.position.set( 10, 10, 0 );
	inScene.add( directionalLight );

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
	listener = context.listener;
	console.log("created audio context");

	var bufferSize = 2 * context.sampleRate;

	// SPEED sound proportional to velocity

	speedBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
	output = speedBuffer.getChannelData(0);
	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}

	var speedSource = context.createBufferSource();
	speedSource.buffer = speedBuffer;
	speedSource.loop = true;

	// create gain, wire up to noise
	Robot.speedGain = context.createGain();
	speedSource.connect(Robot.speedGain);
	Robot.speedGain.connect(context.destination);

	// initialize gain.gain, start whitenoise
	Robot.speedGain.gain.value = 0;
	speedSource.start(0);


	// PUSH sound when pushing

	pushBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
	output = pushBuffer.getChannelData(0);
	for (var i = 0; i < bufferSize; i++) {
		output[i] = (i % 1000) / 1000.0;
	}

	var pushSource = context.createBufferSource();
	pushSource.buffer = pushBuffer;
	pushSource.loop = true;

	// create gain, wire up to noise
	Robot.pushGain = context.createGain();
	pushSource.connect(Robot.pushGain);
	Robot.pushGain.connect(context.destination);

	// initialize gain.gain, start whitenoise
	Robot.pushGain.gain.value = 0;
	pushSource.start(0);

	// TURN sound when pushing

	turnBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
	output = turnBuffer.getChannelData(0);
	for (var i = 0; i < bufferSize; i++) {
		output[i] = (i % 900) / 1000.0;
	}

	var turnSource = context.createBufferSource();
	turnSource.buffer = turnBuffer;
	turnSource.loop = true;

	// create gain, wire up to noise
	Robot.turnGain = context.createGain();
	turnSource.connect(Robot.turnGain);
	Robot.turnGain.connect(context.destination);

	// initialize gain.gain, start whitenoise
	Robot.turnGain.gain.value = 0;
	turnSource.start(0);

	// BEACON

	beaconBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
	output = beaconBuffer.getChannelData(0);
	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 0.5 - 0.25;
	}

	var beaconSource = context.createBufferSource();
	beaconSource.buffer = beaconBuffer;
	beaconSource.loop = true;

	// create panner in fixed position
	var panner = context.createPanner();
	panner.panningModel = 'HRTF';
	panner.distanceModel = 'inverse';
	panner.refDistance = 100;
	panner.maxDistance = 10000;
	panner.rolloffFactor = 1;
	panner.coneInnerAngle = 360;
	panner.coneOuterAngle = 0;
	panner.coneOuterGain = 0;
	panner.setOrientation(1,0,0);
	panner.setPosition(2000,0,0);
	beaconSource.connect(panner);

	// create gain, wire up to noise
	panner.connect(context.destination);

	// initialize gain.gain, start whitenoise
	beaconSource.start(0);
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
	bob.microphoneChases(camera);
}
