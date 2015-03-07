/*
	Inspired by Three.js "tutorials by example", Author: Lee Stemkoski, Date: March 2013 (three.js v56)
 */

// MAIN
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables

init();
initAudio();
animate();

// consider using http://evanw.github.com/csg.js/docs/

function createLight(inName) {
	var light = new THREE.Object3D();

	var lightSphere = THREE.SceneUtils.createMultiMaterialObject( 
	new THREE.SphereGeometry( 3, 32, 16 ), Robot.lightFrame );
	lightSphere.position.set(0, 0, 0);
	light.add(lightSphere);

	var lightTarget = new THREE.Object3D();
	lightTarget.position.set(0, 0, -100);

	var lightSource = new THREE.SpotLight( 0xffffff );
	lightSource.position.set(0, 0, 0);
	lightSource.castShadow = true;
	lightSource.shadowMapWidth = 1024;
	lightSource.shadowMapHeight = 1024;
	lightSource.shadowCameraNear = 500;
	lightSource.shadowCameraFar = 4000;
	lightSource.shadowCameraFov = 30;

	lightSource.target = lightTarget;

	light.add(lightTarget);
	light.add(lightSource);	

	light.name = inName;

	return light;
}

function createFlare(inName) {
	var light = new THREE.Object3D();

	var lightCylinder = THREE.SceneUtils.createMultiMaterialObject( 
	new THREE.CylinderGeometry( 10, 10, 3, 30, 4 ), Robot.flareFrame );
	lightCylinder.position.set(0, 6, 0);
	light.add(lightCylinder);

	var lightSource = new THREE.PointLight(0xff9999);
	lightSource.position.set(0, 0, 0);
	lightSource.name = 'source';
	light.add(lightSource);

	light.name = inName;

	return light;
}


function createPlatform(inName) {
	var platform = new THREE.Object3D();

	var floor = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CubeGeometry( 800, 800, 100, 1, 1, 1 ), 
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

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
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
	
	var skyboxGeom = new THREE.CubeGeometry( 10000, 10000, 10000, 1, 1, 1 );
	
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

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	createGloomyWorld(scene);
	// createSunlitWorld(scene);

	var bob = new Robot("bob");
	scene.add(bob.model);

	var angus = new Robot("angus");
	angus.model.position.set(300, 0, 0);
	pose(angus.model);
	scene.add(angus.model);

	document.addEventListener("keydown", function (e) {
		parseKeyboardCommands(bob.model, e);
	});
	document.addEventListener("keyup", function (e) {
		parseKeyboardCommands(bob.model, e);
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

	    if (aRobot.pose == Robot.FLOAT) {
		    aRobot.position.y = 4*Math.sin(index * 1000 + Date.now()/700)+2;    	
	    }
    }

	render();		

	updateVelocity(Robot.robots[0]);
	updatePose(Robot.robots[0]);

	cameraChases(Robot.robots[0]);
}

function hide(inRobot, inPath) {
	var toBeHidden = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toBeHidden = toBeHidden.getChildByName(inPath[index]);
	}

	toBeHidden.traverse(function (obj) {
		obj.visible = false;
	})
}

function show(inRobot, inPath) {
	var toBeHidden = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toBeHidden = toBeHidden.getChildByName(inPath[index]);
	}

	toBeHidden.traverse(function (obj) {
		obj.visible = true;
	})
}

// set the target x rotation of the object at the specified object path to the given angle
function setRotationXTarget(inRobot, inObjectPath, inAngle) {
	inRobot.poseTargets.xrotation[inObjectPath] = inAngle;
}

// set the target x rotation of the object at the specified object path to the given angle
function setRotationYTarget(inRobot, inObjectPath, inAngle) {
	inRobot.poseTargets.yrotation[inObjectPath] = inAngle;
}

// set the target light intensity of the object at the specified object path to the given angle
function setLightIntensityTarget(inRobot, inObjectPath, inAngle) {
	inRobot.poseTargets.lightintensity[inObjectPath] = inAngle;
}

function getRotationX(inRobot, inPath) {
	var toRotate = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	return toRotate.rotation.x;
}

function setRotationX(inRobot, inPath, inAngle) {
	var toRotate = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	toRotate.rotation.x = inAngle;
}

function getRotationY(inRobot, inPath) {
	var toRotate = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	return toRotate.rotation.y;
}

function setRotationY(inRobot, inPath, inAngle) {
	var toRotate = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	toRotate.rotation.y = inAngle;
}

function getLightIntensity(inRobot, inPath) {
	var toRotate = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	return toRotate.intensity;
}

function setLightIntensity(inRobot, inPath, inIntensity) {
	var toBeHidden = inRobot;
	for (var index = 0; index < inPath.length; index++) {
		toBeHidden = toBeHidden.getChildByName(inPath[index]);
	}

	toBeHidden.traverse(function (obj) {
		obj.intensity = inIntensity;
	})
}

function setPushForwardsPoseTargets(inRobot) {
	setRotationXTarget(inRobot, ['leftleg'], -0.3);
	setRotationXTarget(inRobot, ['rightleg'], -0.3);
	setRotationXTarget(inRobot, ['leftleg', 'shin'], -0.5);
	setRotationXTarget(inRobot, ['rightleg', 'shin'], -0.5);
	setRotationYTarget(inRobot, ['head'], 0);

	setRotationXTarget(inRobot, ['rightarm'], -0.4);
	setRotationXTarget(inRobot, ['rightarm', 'forearm'], 0.4);
	setRotationXTarget(inRobot, ['leftarm'], -0.4);
	setRotationXTarget(inRobot, ['leftarm', 'forearm'], 0.4);

	setLightIntensityTarget(inRobot, ['leftleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
	setLightIntensityTarget(inRobot, ['rightleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
}

function setPushBckwardsPoseTargets(inRobot) {
	setRotationXTarget(inRobot, ['leftleg'], 0.7);
	setRotationXTarget(inRobot, ['rightleg'], 0.7);
	setRotationXTarget(inRobot, ['leftleg', 'shin'], -0.5);
	setRotationXTarget(inRobot, ['rightleg', 'shin'], -0.5);
	setRotationYTarget(inRobot, ['head'], 0);

	setRotationXTarget(inRobot, ['rightarm'], -0.3);
	setRotationXTarget(inRobot, ['rightarm', 'forearm'], 1.1);
	setRotationXTarget(inRobot, ['leftarm'], -0.3);
	setRotationXTarget(inRobot, ['leftarm', 'forearm'], 1.1);

	setLightIntensityTarget(inRobot, ['leftleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
	setLightIntensityTarget(inRobot, ['rightleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
}

function setTurnClockwisePoseTargets(inRobot) {
	setRotationXTarget(inRobot, ['leftleg'], 0);
	setRotationXTarget(inRobot, ['rightleg'], -0.3);
	setRotationXTarget(inRobot, ['leftleg', 'shin'], 0);
	setRotationXTarget(inRobot, ['rightleg', 'shin'], -0.5);
	setRotationYTarget(inRobot, ['head'], 0.5);

	setRotationXTarget(inRobot, ['rightarm'], 0.3);
	setRotationXTarget(inRobot, ['rightarm', 'forearm'], 0.6);
	setRotationXTarget(inRobot, ['leftarm'], -0.4);
	setRotationXTarget(inRobot, ['leftarm', 'forearm'], 0.4);

	setLightIntensityTarget(inRobot, ['leftleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
	setLightIntensityTarget(inRobot, ['rightleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
}

function setTurnCounterclockwisePoseTargets(inRobot) {
	setRotationXTarget(inRobot, ['leftleg'], -0.3);
	setRotationXTarget(inRobot, ['rightleg'], 0);
	setRotationXTarget(inRobot, ['leftleg', 'shin'], -0.5);
	setRotationXTarget(inRobot, ['rightleg', 'shin'], 0);
	setRotationYTarget(inRobot, ['head'], -0.5);

	setRotationXTarget(inRobot, ['rightarm'], -0.4);
	setRotationXTarget(inRobot, ['rightarm', 'forearm'], 0.4);
	setRotationXTarget(inRobot, ['leftarm'], -0.3);
	setRotationXTarget(inRobot, ['leftarm', 'forearm'], 0.6);

	setLightIntensityTarget(inRobot, ['leftleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
	setLightIntensityTarget(inRobot, ['rightleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
}

function setFloatPoseTargets(inRobot) {
	setRotationXTarget(inRobot, ['leftleg'], 0);
	setRotationXTarget(inRobot, ['rightleg'], 0);
	setRotationXTarget(inRobot, ['leftleg', 'shin'], 0);
	setRotationXTarget(inRobot, ['rightleg', 'shin'], 0);

	setRotationYTarget(inRobot, ['head'], 0);

	setRotationXTarget(inRobot, ['rightarm'], 0);
	setRotationXTarget(inRobot, ['rightarm', 'forearm'], 0);
	setRotationXTarget(inRobot, ['leftarm'], 0);
	setRotationXTarget(inRobot, ['leftarm', 'forearm'], 0);

	setLightIntensityTarget(inRobot, ['leftleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
	setLightIntensityTarget(inRobot, ['rightleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
}

function setPunchPoseTargets(inRobot) {
	setRotationXTarget(inRobot, ['rightarm'], 1.3);
	setRotationXTarget(inRobot, ['rightarm', 'forearm'], 0.5);

	setRotationYTarget(inRobot, ['head'], 0);

	setLightIntensityTarget(inRobot, ['leftleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
	setLightIntensityTarget(inRobot, ['rightleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
}

function pose(inRobot) {
	if (inRobot.pose & Robot.PUSH_FORWARDS) {
		setPushForwardsPoseTargets(inRobot);
	} else if (inRobot.pose & Robot.PUSH_BACKWARDS) {
		setPushBckwardsPoseTargets(inRobot);
	} else if (inRobot.pose & Robot.TURN_CLOCKWISE) {
		setTurnClockwisePoseTargets(inRobot);
	} else if (inRobot.pose & Robot.TURN_COUNTERCLOCKWISE) {
		setTurnCounterclockwisePoseTargets(inRobot);
	} else if (inRobot.pose & Robot.FLOAT) {
		setFloatPoseTargets(inRobot);
	} else if (inRobot.pose & Robot.PUNCH) {
		setPunchPoseTargets(inRobot);
	}
}

function parseKeyboardCommands(inRobot, inEvent) {
	console.log("PARSE");

	newPose = 0;

	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") ) {
		newPose = newPose | Robot.PUSH_FORWARDS;
	} 
	if ( keyboard.pressed("S") ) {
		newPose = newPose | Robot.PUSH_BACKWARDS;
	} 
	if ( keyboard.pressed("A") ) {
		newPose = newPose | Robot.TURN_CLOCKWISE;
	} 
	if ( keyboard.pressed("D") ) {
		newPose = newPose | Robot.TURN_COUNTERCLOCKWISE;
	} 
	if ( keyboard.pressed("2") ) {
		newPose = newPose | Robot.PUNCH;
	}  
	if (newPose == 0) {
		newPose = Robot.FLOAT;
	}

	if (inRobot.pose != newPose) {
		console.log("CHANGE POSE TO " + newPose);
		inRobot.pose = newPose;
		pose(inRobot);	
	}
}

// update the rotation and light intensity angles to match the targets
function updatePose(inRobot) {
	for (var pathString in inRobot.poseTargets.xrotation) {
		objectPath = pathString.split(",");
		var currentRotation = getRotationX(inRobot, objectPath);
		var targetRotation = inRobot.poseTargets.xrotation[pathString];

		setRotationX(inRobot, objectPath, (currentRotation + targetRotation) / 2.0);
	}

	for (var pathString in inRobot.poseTargets.yrotation) {
		objectPath = pathString.split(",");
		var currentRotation = getRotationY(inRobot, objectPath);
		var targetRotation = inRobot.poseTargets.yrotation[pathString];

		setRotationY(inRobot, objectPath, (currentRotation + targetRotation) / 2.0);
	}

	for (var pathString in inRobot.poseTargets.lightintensity) {
		objectPath = pathString.split(",");
		var currentIntensity = getLightIntensity(inRobot, objectPath);
		var targetIntensity = inRobot.poseTargets.lightintensity[pathString];

		setLightIntensity(inRobot, objectPath, (currentIntensity + targetIntensity) / 2.0);
	}	
}

function updateVelocity(inRobot)
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = delta * inRobot.velocity; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * inRobot.radialVelocity;   // pi/2 radians (90 degrees) per second
	var rotation_matrix = new THREE.Matrix4().identity();

	// center the skybox around the robot, so we don't run off the edge of it.
	Robot.skybox.position = inRobot.position;

	// always moving
	inRobot.translateZ( moveDistance );

	// always rotating
	rotation_matrix = new THREE.Matrix4().makeRotationY(rotateAngle);
	inRobot.matrix.multiply(rotation_matrix);
	inRobot.rotation.setEulerFromRotationMatrix(inRobot.matrix);

	// move forwards/backwards/left/right
	if (inRobot.pose & Robot.PUSH_FORWARDS) {
		inRobot.velocity = Math.max(-inRobot.maxVelocity, inRobot.velocity - inRobot.acceleration);
		inRobot.radialVelocity = 0.9 * inRobot.radialVelocity;
	} 
	if (inRobot.pose & Robot.PUSH_BACKWARDS) {
		inRobot.radialVelocity = 0.9 * inRobot.radialVelocity;
		inRobot.velocity = Math.min(inRobot.maxVelocity, inRobot.velocity + inRobot.acceleration);
	} 
	
	if (inRobot.pose & Robot.TURN_CLOCKWISE) {
		inRobot.radialVelocity = Math.min(inRobot.maxRadialVelocity, inRobot.radialVelocity + inRobot.radialAcceleration);
	} 
	if (inRobot.pose & Robot.TURN_COUNTERCLOCKWISE) {
		inRobot.radialVelocity = Math.max(-inRobot.maxRadialVelocity, inRobot.radialVelocity - inRobot.radialAcceleration);
	} 

	if (!(inRobot.pose & Robot.TURN_CLOCKWISE || inRobot.pose & Robot.TURN_COUNTERCLOCKWISE)) {
		// Slow Down! unless pushing
		inRobot.radialVelocity = 0.9 * inRobot.radialVelocity;
	}

	if (!(inRobot.pose & Robot.PUSH_BACKWARDS || inRobot.pose & Robot.PUSH_FORWARDS)) {
		// Slow Down! unless pushing
		inRobot.velocity = 0.95 * inRobot.velocity;
	}

	Robot.engineGain.gain.value = Math.abs(inRobot.velocity / 1200) + Math.abs(inRobot.radialVelocity / 0.05);

	document.getElementById('speedometer').innerHTML = Math.round(inRobot.velocity);
}

function cameraChases(inRobot) {
	var panClock = Date.now() / 1400.0; 
	//TODO have target chase camera angle and distance for each pose! brilliant!
	var relativeCameraOffset = new THREE.Vector3(10 + 1 * Math.sin(panClock), 300, 300 + 10 * Math.cos(panClock));

	var cameraOffset = relativeCameraOffset.applyMatrix4( inRobot.matrixWorld );

	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;	

	targetPosition = new THREE.Vector3();
	targetPosition.x = inRobot.position.x;
	targetPosition.y = inRobot.position.y + 170;
	targetPosition.z = inRobot.position.z;
	camera.lookAt( targetPosition );
	
	camera.updateMatrix();
	camera.updateProjectionMatrix();
			
	stats.update();
}

function render() 
{
	renderer.render( scene, camera );
}
