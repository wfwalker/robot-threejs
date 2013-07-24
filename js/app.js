/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: March 2013 (three.js v56)
 */

// MAIN
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables

var Robot = {};

init();
animate();

// consider using http://evanw.github.com/csg.js/docs/

function createLimbJoint(inName, diameter, thickness) {
	var joint = new THREE.Object3D();

	var modifier = new THREE.SubdivisionModifier( 1 );
	var outerGeometry = new THREE.CylinderGeometry( diameter, diameter, thickness, 30, 4 );
	modifier.modify(outerGeometry);
	var outer = THREE.SceneUtils.createMultiMaterialObject( 
		outerGeometry, 
		Robot.goldFrame );
	outer.position.set(0, 0, 0);
	outer.rotation.z = Math.PI / 2;

	joint.add(outer);

	var innerGeometry = new THREE.CylinderGeometry( diameter/2, diameter/2, thickness+.5, 30, 4 );
	modifier.modify(innerGeometry);
	var inner = THREE.SceneUtils.createMultiMaterialObject( 
		innerGeometry, 
		Robot.redFrame );
	inner.position.set(0, 0, 0);
	inner.rotation.z = Math.PI / 2;

	joint.add(inner);

	joint.name = inName;

	return joint;
}

function createLimbSegment(inName, length, thickness) {
	var segment = new THREE.Object3D();

	var bone1 = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CylinderGeometry(0.6 * thickness, 0.7 * thickness, length, 20, 4 ), 
		Robot.redFrame );
	bone1.position.set(0, -length, 0 + 0.75 * thickness);
	segment.add(bone1);

	var bone2 = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CylinderGeometry(0.6 * thickness, 0.7 * thickness, length, 20, 4 ), 
		Robot.redFrame );
	bone2.position.set(0, -length, 0 - 0.75 * thickness);
	segment.add(bone2);

	segment.name = inName; 

	return segment;
}

function createTank(inName) {
	var tank = new THREE.Object3D();

	var cylinder = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CylinderGeometry( 10, 10, 60, 20, 4 ), 
		Robot.goldFrame );
	cylinder.position.set(0, 0, 0);
	tank.add(cylinder);

	var topSphere = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.SphereGeometry( 10, 32, 16 ), 
		Robot.goldFrame );
	topSphere.position.set(0, 30, 0);
	tank.add(topSphere);

	var topTorus = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.TorusGeometry( 10.5, 1, 32, 16 ), 
		Robot.redFrame );
	topTorus.position.set(0, 30, 0);
	topTorus.rotation.x = Math.PI / 2;

	tank.add(topTorus);

	var bottomSphere = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.SphereGeometry( 10, 32, 16 ), 
		Robot.goldFrame );
	bottomSphere.position.set(0, -30, 0);
	tank.add(bottomSphere);

	var bottomTorus = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.TorusGeometry( 10.5, 1, 32, 16 ), 
		Robot.redFrame );
	bottomTorus.position.set(0, -30, 0);
	bottomTorus.rotation.x = Math.PI / 2;

	tank.add(bottomTorus);

	return tank;
}

function createEye() {
	var eye = new THREE.Object3D();

	var modifier = new THREE.SubdivisionModifier( 1 );
	var socketGeometry = new THREE.CylinderGeometry( 5, 5, 20, 20, 8 );
	modifier.modify(socketGeometry);

	var socket = THREE.SceneUtils.createMultiMaterialObject( 
		socketGeometry, 
		Robot.goldFrame );
	socket.rotation.x = Math.PI / 2;

	eye.add(socket);

	var light = createLight();
	light.position.z = -11.3;
	eye.add(light);

	return eye;
}

function createHead() {
	var head = new THREE.Object3D();

	var modifier = new THREE.SubdivisionModifier( 1 );

	var skullGeometry = new THREE.CylinderGeometry( 18, 18, 30, 40, 6 );
	modifier.modify(skullGeometry);

	var skull = THREE.SceneUtils.createMultiMaterialObject( 
		skullGeometry, 
		Robot.redFrame );
	skull.position.set(0, 20, 0);
	head.add(skull);

	var neck = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CylinderGeometry( 10, 10, 10, 20, 4 ), 
		Robot.goldFrame );
	neck.position.set(0, 0, 0);
	head.add(neck);

	var lefteye = createEye("lefttank");
	lefteye.position.set(10, 23, -10);
	head.add(lefteye);

	var righteye = createEye("righteye");
	righteye.position.set(-10, 23, -10);
	head.add(righteye);

	head.name = "head"

	return head;
}

function createBody() {
	var body = new THREE.Object3D();

	var tube = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CylinderGeometry( 3, 3, 100, 20, 4 ), 
		Robot.steelFrame );
	tube.rotation.z = Math.PI / 2;
	tube.position.y = 110;
	body.add(tube);	

	var lefttank = createTank("lefttank");
	lefttank.position.set(15, 80, 25);
	body.add(lefttank);

	var righttank = createTank("righttank");
	righttank.position.set(-15, 80, 25);
	body.add(righttank);

	var bodyGeometry = new THREE.CubeGeometry( 70, 80, 30, 4, 4, 4 );
	var modifier = new THREE.SubdivisionModifier( 1 );
	modifier.modify( bodyGeometry ); 

	var bodyBox = THREE.SceneUtils.createMultiMaterialObject( 
		bodyGeometry, 
		Robot.steelFrame );
	bodyBox.position.y = 80;
	body.add(bodyBox);

	var hipsGeometry = new THREE.CubeGeometry( 50, 35, 30, 4, 4, 4 );
	modifier.modify(hipsGeometry);
	var hips = THREE.SceneUtils.createMultiMaterialObject( 
		hipsGeometry, 
		Robot.steelFrame );
	hips.position.y = 20;
	body.add(hips);

	var beltGeometry = new THREE.CubeGeometry( 43, 30, 23, 4, 4, 4 );
	modifier.modify(beltGeometry);

	var belt = THREE.SceneUtils.createMultiMaterialObject( 
		beltGeometry, 
		Robot.goldFrame );
	belt.position.y = 40;
	body.add(belt);

	body.name = "body"

	return body;
}

function createFoot(inName) {
	var foot = new THREE.Object3D();

	var heel = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CubeGeometry( 16, 10, 16, 1, 1, 1 ), 
		Robot.steelFrame );
	heel.position.set(0, 5, 0);
	heel.name = "heel";

	foot.add(heel);

	for (var toeIndex = -1; toeIndex <= 1; toeIndex++) {
		var toe = THREE.SceneUtils.createMultiMaterialObject( 
			new THREE.CylinderGeometry( 2, 2, 20, 20, 4 ), 
			Robot.redFrame );
		toe.position.set(5 * toeIndex, 5, -16);
		toe.rotation.x = Math.PI / 2;

		toe.name = "toe" + toeIndex;

		foot.add(toe);
	}

	var toebox = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CubeGeometry( 16, 10, 10, 1, 1, 1 ), 
		Robot.steelFrame );
	toebox.position.set(0, 5, -22);
	toebox.name = "toebox";

	foot.add(toebox);

	foot.name = inName;

	return foot;
}

function createShinJet(inName) {
	var shinjet = new THREE.Object3D();

	var modifier = new THREE.SubdivisionModifier( 1 );
	var tubeGeometry = new THREE.CylinderGeometry( 15, 15, 60, 30, 10 );
	modifier.modify( tubeGeometry ); 	

	var tube = THREE.SceneUtils.createMultiMaterialObject( 
		tubeGeometry, 
		Robot.redFrame );
	tube.position.set(0, 50, 0);
	tube.name = 'tube';
	shinjet.add(tube);

	var light = createFlare();
	light.position.y = 10;
	light.name = 'flare';

	shinjet.add(light);

	shinjet.name = inName;

	return shinjet;
}

function createLeg(inName) {
	var leg = new THREE.Object3D();

	var hip = createLimbJoint("hip", 16, 19);
	leg.add(hip);

	var thigh = createLimbSegment("thigh", 70, 5);
	thigh.position.y = 40;
	leg.add(thigh);

	var shin = new THREE.Object3D();

	var knee = createLimbJoint("knee", 8, 14)
	knee.position.y = 0;
	shin.add(knee);

	var shinJet = createShinJet("shinJet");
	shinJet.position.y = -80;
	shin.add(shinJet);

	shin.name = 'shin';
	shin.position.y = -70

	leg.add(shin);

	leg.name = inName;

	return leg;
}

function createArm(inName) {
	var arm = new THREE.Object3D();

	var shoulder = createLimbJoint("shoulder", 10, 15);
	arm.add(shoulder);

	var bicep = createLimbSegment("bicep", 50, 5);
	bicep.position.y = 20;
	arm.add(bicep);

	var forearm = new THREE.Object3D();

	var elbow = createLimbJoint("elbow", 8, 12);
	elbow.position.y = 0;
	forearm.add(elbow);

	var bone = createLimbSegment("bone", 50, 4);
	bone.position.y = 25;
	forearm.add(bone);

	var hand = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.SphereGeometry( 10, 32, 16 ), 
		Robot.goldFrame );
	hand.position.y = -57;
	forearm.add(hand);
	forearm.name = "forearm"

	forearm.position.y = -55;
	arm.add(forearm);

	arm.name = inName;

	return arm;
}

function createRobot(inName) {
	var robot = new THREE.Object3D();

	var body = createBody();
	body.position.set(0, 130, 0);
	robot.add(body);

	var head  = createHead();
	head.position.set(0, 250, 0);
	robot.add(head);

	var leftleg = createLeg("leftleg");
	leftleg.position.set(-20, 140, 0);
	robot.add(leftleg);

	var rightleg = createLeg("rightleg");
	rightleg.position.set(20, 140, 0);
	robot.add(rightleg);

	var leftarm = createArm("leftarm");
	leftarm.position.set(-45, 240, 0);
	robot.add(leftarm);

	var rightarm = createArm("rightarm");
	rightarm.position.set(45, 240, 0);
	robot.add(rightarm);

	robot.name = inName;

	robot.pose = Robot.FLOAT;
	robot.velocity = 0;
	robot.radialVelocity = 0;
	robot.maxVelocity = 600;
	robot.acceleration = 10;
	robot.maxRadialVelocity = 0.025;
	robot.radialAcceleration = 0.0015;

	robot.poseTargets = {};
	robot.poseTargets.xrotation = {};
	robot.poseTargets.yrotation = {};
	robot.poseTargets.lightintensity = {};

	Robot.robots.push(robot);

	return robot;
}

function createPartsPile() {
	var partspile = new THREE.Object3D();

	var body = createBody();
	body.position.set(0, 0, -300);
	partspile.add(body);

	var head  = createHead();
	head.position.set(0, 0, -200);
	partspile.add(head);

	var leftleg = createLeg("leftleg");
	leftleg.position.set(0, 140, -100);
	partspile.add(leftleg);

	var rightleg = createLeg("rightleg");
	rightleg.position.set(0, 140, 0);
	partspile.add(rightleg);

	var leftarm = createArm("leftarm");
	leftarm.position.set(0, 120, 100);
	partspile.add(leftarm);

	var rightarm = createArm("rightarm");
	rightarm.position.set(0, 120, 200);
	partspile.add(rightarm);

	return partspile;
}


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

	var lightSource = new THREE.PointLight(0xff0000);
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
	// States
	Robot.FLOAT = 1;
	Robot.PUSH_BACKWARDS = 2;
	Robot.PUSH_FORWARDS = 4;
	Robot.TURN_CLOCKWISE = 8;
	Robot.TURN_COUNTERCLOCKWISE = 16;
	Robot.PUNCH = 32;

	Robot.robots = [];

	// Materials and Textures
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/metal1.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 

	var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, color: 0xBBBBBB, specular: 0xffffff } );
	var wireframeMaterial1 = new THREE.MeshBasicMaterial( { color: 0x888888, wireframe: true, transparent: true } ); 
	Robot.floorFrame = [ floorMaterial, floorMaterial ]; 

	var steelTexture = new THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
	steelTexture.wrapS = steelTexture.wrapT = THREE.RepeatWrapping; 

	var redMaterial = new THREE.MeshPhongMaterial( { map: steelTexture, color: 0xff0000, specular: 0xff0000 } );
	var wireframeMaterial1 = new THREE.MeshBasicMaterial( { color: 0x888888, wireframe: true, transparent: true } ); 
	Robot.redFrame = [ redMaterial, redMaterial ]; 

	var steelMaterial = new THREE.MeshPhongMaterial( { map: steelTexture, color: 0xBBBBBB, specular: 0xffffff } );
	var wireframeMaterial1 = new THREE.MeshBasicMaterial( { color: 0x888888, wireframe: true, transparent: true } ); 
	Robot.steelFrame = [ steelMaterial, steelMaterial ]; 

	var goldMaterial = new THREE.MeshPhongMaterial( { map: steelTexture, color: 0xF5E642, specular: 0xff0000 } );
	var wireframeMaterial2 = new THREE.MeshBasicMaterial( { color: 0x888888, wireframe: true, transparent: true } ); 
	Robot.goldFrame = [ goldMaterial, goldMaterial ]; 

	var lightMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, specular: 0xffffff, ambient: 0xffffff } );
	var wireframeMaterial2 = new THREE.MeshBasicMaterial( { color: 0x888888, wireframe: true, transparent: true } ); 
	Robot.lightFrame = [ lightMaterial, lightMaterial ]; 

	var flareMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, specular: 0xffffff, ambient: 0xffffff } );
	var wireframeMaterial2 = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true, transparent: true } ); 
	Robot.flareFrame = [ flareMaterial, flareMaterial ]; 

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

	var bob = createRobot("bob");
	scene.add(bob);

	var angus = createRobot("angus");
	angus.position.set(300, 0, 0);
	pose(angus);
	scene.add(angus);

	// scene.add(createPartsPile());

	document.addEventListener("keydown", function (e) {
		parseKeyboardCommands(bob, e);
	});
	document.addEventListener("keyup", function (e) {
		parseKeyboardCommands(bob, e);
	});
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
		document.getElementById('jet').play();
	} else if (inRobot.pose & Robot.PUSH_BACKWARDS) {
		setPushBckwardsPoseTargets(inRobot);
		document.getElementById('jet').play();
	} else if (inRobot.pose & Robot.TURN_CLOCKWISE) {
		setTurnClockwisePoseTargets(inRobot);
		document.getElementById('jet').play();
	} else if (inRobot.pose & Robot.TURN_COUNTERCLOCKWISE) {
		setTurnCounterclockwisePoseTargets(inRobot);
		document.getElementById('jet').play();
	} else if (inRobot.pose & Robot.FLOAT) {
		setFloatPoseTargets(inRobot);
		document.getElementById('jet').pause();
	} else if (inRobot.pose & Robot.PUNCH) {
		setPunchPoseTargets(inRobot);
		document.getElementById('jet').pause();
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
