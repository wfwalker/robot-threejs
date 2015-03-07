// creates a robot in three.js

var Robot = function(inName) {
	this.model = new THREE.Object3D();

	this.currentPose = Robot.FLOAT;

	var body = this.createBody();
	body.position.set(0, 130, 0);
	this.model.add(body);

	var head  = this.createHead();
	head.position.set(0, 250, 0);
	this.model.add(head);

	var leftleg = this.createLeg("leftleg");
	leftleg.position.set(-20, 140, 0);
	this.model.add(leftleg);

	var rightleg = this.createLeg("rightleg");
	rightleg.position.set(20, 140, 0);
	this.model.add(rightleg);

	var leftarm = this.createArm("leftarm");
	leftarm.position.set(-45, 240, 0);
	this.model.add(leftarm);

	var rightarm = this.createArm("rightarm");
	rightarm.position.set(45, 240, 0);
	this.model.add(rightarm);

	this.model.name = inName;

	this.velocity = 0;
	this.radialVelocity = 0;
	this.maxVelocity = 600;
	this.acceleration = 10;
	this.maxRadialVelocity = 0.025;
	this.radialAcceleration = 0.0015;

	this.poseTargets = {};
	this.poseTargets.xrotation = {};
	this.poseTargets.yrotation = {};
	this.poseTargets.lightintensity = {};

	Robot.robots.push(this);

	return this;
}

// GLOBAL States

Robot.FLOAT = 1;
Robot.PUSH_BACKWARDS = 2;
Robot.PUSH_FORWARDS = 4;
Robot.TURN_CLOCKWISE = 8;
Robot.TURN_COUNTERCLOCKWISE = 16;
Robot.PUNCH = 32;

// global collection of all robot models
Robot.robots = [];

// GLOBAL TEXTURES

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

var flareMaterial = new THREE.MeshBasicMaterial( { color: 0xff9999, specular: 0xffffff, ambient: 0xffffff } );
var wireframeMaterial2 = new THREE.MeshBasicMaterial( { color: 0xff9999, wireframe: true, transparent: true } ); 
Robot.flareFrame = [ flareMaterial, flareMaterial ]; 

// INSTANCE METHODS

Robot.prototype.createLimbJoint = function(inName, diameter, thickness) {
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

Robot.prototype.createLimbSegment = function(inName, length, thickness) {
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

Robot.prototype.createTank = function(inName) {
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

Robot.prototype.createLight = function(inName) {
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

Robot.prototype.createEye = function() {
	var eye = new THREE.Object3D();

	var modifier = new THREE.SubdivisionModifier( 1 );
	var socketGeometry = new THREE.CylinderGeometry( 5, 5, 20, 20, 8 );
	modifier.modify(socketGeometry);

	var socket = THREE.SceneUtils.createMultiMaterialObject( 
		socketGeometry, 
		Robot.goldFrame );
	socket.rotation.x = Math.PI / 2;

	eye.add(socket);

	var light = this.createLight();
	light.position.z = -11.3;
	eye.add(light);

	return eye;
}

Robot.prototype.createHead = function() {
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

	var lefteye = this.createEye("lefttank");
	lefteye.position.set(10, 23, -10);
	head.add(lefteye);

	var righteye = this.createEye("righteye");
	righteye.position.set(-10, 23, -10);
	head.add(righteye);

	head.name = "head"

	return head;
}

Robot.prototype.createBody = function() {
	var body = new THREE.Object3D();

	var tube = THREE.SceneUtils.createMultiMaterialObject( 
		new THREE.CylinderGeometry( 3, 3, 100, 20, 4 ), 
		Robot.steelFrame );
	tube.rotation.z = Math.PI / 2;
	tube.position.y = 110;
	body.add(tube);	

	var lefttank = this.createTank("lefttank");
	lefttank.position.set(15, 80, 25);
	body.add(lefttank);

	var righttank = this.createTank("righttank");
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

Robot.prototype.createFoot = function(inName) {
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

Robot.prototype.createFlare = function(inName) {
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

Robot.prototype.createShinJet = function(inName) {
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

	var light = this.createFlare();
	light.position.y = 10;
	light.name = 'flare';

	shinjet.add(light);

	shinjet.name = inName;

	return shinjet;
}

Robot.prototype.createLeg = function(inName) {
	var leg = new THREE.Object3D();

	var hip = this.createLimbJoint("hip", 16, 19);
	leg.add(hip);

	var thigh = this.createLimbSegment("thigh", 70, 5);
	thigh.position.y = 40;
	leg.add(thigh);

	var shin = new THREE.Object3D();

	var knee = this.createLimbJoint("knee", 8, 14)
	knee.position.y = 0;
	shin.add(knee);

	var shinJet = this.createShinJet("shinJet");
	shinJet.position.y = -80;
	shin.add(shinJet);

	shin.name = 'shin';
	shin.position.y = -70

	leg.add(shin);

	leg.name = inName;

	return leg;
}

Robot.prototype.createArm = function(inName) {
	var arm = new THREE.Object3D();

	var shoulder = this.createLimbJoint("shoulder", 10, 15);
	arm.add(shoulder);

	var bicep = this.createLimbSegment("bicep", 50, 5);
	bicep.position.y = 20;
	arm.add(bicep);

	var forearm = new THREE.Object3D();

	var elbow = this.createLimbJoint("elbow", 8, 12);
	elbow.position.y = 0;
	forearm.add(elbow);

	var bone = this.createLimbSegment("bone", 50, 4);
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


Robot.prototype.hide = function(inPath) {
	var toBeHidden = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toBeHidden = toBeHidden.getChildByName(inPath[index]);
	}

	toBeHidden.traverse(function (obj) {
		obj.visible = false;
	})
}

Robot.prototype.show = function(inPath) {
	var toBeHidden = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toBeHidden = toBeHidden.getChildByName(inPath[index]);
	}

	toBeHidden.traverse(function (obj) {
		obj.visible = true;
	})
}

// set the target x rotation of the object at the specified object path to the given angle
Robot.prototype.setRotationXTarget = function(inObjectPath, inAngle) {
	this.poseTargets.xrotation[inObjectPath] = inAngle;
}

// set the target x rotation of the object at the specified object path to the given angle
Robot.prototype.setRotationYTarget = function(inObjectPath, inAngle) {
	this.poseTargets.yrotation[inObjectPath] = inAngle;
}

// set the target light intensity of the object at the specified object path to the given angle
Robot.prototype.setLightIntensityTarget = function(inObjectPath, inAngle) {
	this.poseTargets.lightintensity[inObjectPath] = inAngle;
}

Robot.prototype.getRotationX = function(inPath) {
	var toRotate = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	return toRotate.rotation.x;
}

Robot.prototype.setRotationX = function(inPath, inAngle) {
	var toRotate = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	toRotate.rotation.x = inAngle;
}

Robot.prototype.getRotationY = function(inPath) {
	var toRotate = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	return toRotate.rotation.y;
}

Robot.prototype.setRotationY = function(inPath, inAngle) {
	var toRotate = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	toRotate.rotation.y = inAngle;
}

Robot.prototype.getLightIntensity = function(inPath) {
	var toRotate = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toRotate = toRotate.getChildByName(inPath[index]);
	}

	return toRotate.intensity;
}

Robot.prototype.setLightIntensity = function(inPath, inIntensity) {
	var toBeHidden = this.model;
	for (var index = 0; index < inPath.length; index++) {
		toBeHidden = toBeHidden.getChildByName(inPath[index]);
	}

	toBeHidden.traverse(function (obj) {
		obj.intensity = inIntensity;
	})
}

Robot.prototype.setPushForwardsPoseTargets = function() {
	this.setRotationXTarget(['leftleg'], -0.3);
	this.setRotationXTarget(['rightleg'], -0.3);
	this.setRotationXTarget(['leftleg', 'shin'], -0.5);
	this.setRotationXTarget(['rightleg', 'shin'], -0.5);
	this.setRotationYTarget(['head'], 0);

	this.setRotationXTarget(['rightarm'], -0.4);
	this.setRotationXTarget(['rightarm', 'forearm'], 0.4);
	this.setRotationXTarget(['leftarm'], -0.4);
	this.setRotationXTarget(['leftarm', 'forearm'], 0.4);

	this.setLightIntensityTarget(['leftleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
	this.setLightIntensityTarget(['rightleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
}

Robot.prototype.setPushBckwardsPoseTargets = function() {
	this.setRotationXTarget(['leftleg'], 0.7);
	this.setRotationXTarget(['rightleg'], 0.7);
	this.setRotationXTarget(['leftleg', 'shin'], -0.5);
	this.setRotationXTarget(['rightleg', 'shin'], -0.5);
	this.setRotationYTarget(['head'], 0);

	this.setRotationXTarget(['rightarm'], -0.3);
	this.setRotationXTarget(['rightarm', 'forearm'], 1.1);
	this.setRotationXTarget(['leftarm'], -0.3);
	this.setRotationXTarget(['leftarm', 'forearm'], 1.1);

	this.setLightIntensityTarget(['leftleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
	this.setLightIntensityTarget(['rightleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
}

Robot.prototype.setTurnClockwisePoseTargets = function() {
	this.setRotationXTarget(['leftleg'], 0);
	this.setRotationXTarget(['rightleg'], -0.3);
	this.setRotationXTarget(['leftleg', 'shin'], 0);
	this.setRotationXTarget(['rightleg', 'shin'], -0.5);
	this.setRotationYTarget(['head'], 0.5);

	this.setRotationXTarget(['rightarm'], 0.3);
	this.setRotationXTarget(['rightarm', 'forearm'], 0.6);
	this.setRotationXTarget(['leftarm'], -0.4);
	this.setRotationXTarget(['leftarm', 'forearm'], 0.4);

	this.setLightIntensityTarget(['leftleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
	this.setLightIntensityTarget(['rightleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
}

Robot.prototype.setTurnCounterclockwisePoseTargets = function() {
	this.setRotationXTarget(['leftleg'], -0.3);
	this.setRotationXTarget(['rightleg'], 0);
	this.setRotationXTarget(['leftleg', 'shin'], -0.5);
	this.setRotationXTarget(['rightleg', 'shin'], 0);
	this.setRotationYTarget(['head'], -0.5);

	this.setRotationXTarget(['rightarm'], -0.4);
	this.setRotationXTarget(['rightarm', 'forearm'], 0.4);
	this.setRotationXTarget(['leftarm'], -0.3);
	this.setRotationXTarget(['leftarm', 'forearm'], 0.6);

	this.setLightIntensityTarget(['leftleg', 'shin', 'shinJet', 'flare', 'source'], 1.0);
	this.setLightIntensityTarget(['rightleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
}

Robot.prototype.setFloatPoseTargets = function() {
	this.setRotationXTarget(['leftleg'], 0);
	this.setRotationXTarget(['rightleg'], 0);
	this.setRotationXTarget(['leftleg', 'shin'], 0);
	this.setRotationXTarget(['rightleg', 'shin'], 0);

	this.setRotationYTarget(['head'], 0);

	this.setRotationXTarget(['rightarm'], 0);
	this.setRotationXTarget(['rightarm', 'forearm'], 0);
	this.setRotationXTarget(['leftarm'], 0);
	this.setRotationXTarget(['leftarm', 'forearm'], 0);

	this.setLightIntensityTarget(['leftleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
	this.setLightIntensityTarget(['rightleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
}

Robot.prototype.setPunchPoseTargets = function() {
	this.setRotationXTarget(['rightarm'], 1.3);
	this.setRotationXTarget(['rightarm', 'forearm'], 0.5);

	this.setRotationYTarget(['head'], 0);

	this.setLightIntensityTarget(['leftleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
	this.setLightIntensityTarget(['rightleg', 'shin', 'shinJet', 'flare', 'source'], 0.1);
}

Robot.prototype.pose = function() {
	if (this.currentPose & Robot.PUSH_FORWARDS) {
		this.setPushForwardsPoseTargets();
	} else if (this.currentPose & Robot.PUSH_BACKWARDS) {
		this.setPushBckwardsPoseTargets();
	} else if (this.currentPose & Robot.TURN_CLOCKWISE) {
		this.setTurnClockwisePoseTargets();
	} else if (this.currentPose & Robot.TURN_COUNTERCLOCKWISE) {
		this.setTurnCounterclockwisePoseTargets();
	} else if (this.currentPose & Robot.FLOAT) {
		this.setFloatPoseTargets();
	} else if (this.currentPose & Robot.PUNCH) {
		this.setPunchPoseTargets();
	}
}

Robot.prototype.parseKeyboardCommands = function(inEvent) {
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

	if (this.pose != newPose) {
		console.log("CHANGE POSE TO " + newPose);
		this.currentPose = newPose;
		this.pose();	
	}
}

// update the rotation and light intensity angles to match the targets
Robot.prototype.updatePose = function() {
	for (var pathString in this.poseTargets.xrotation) {
		objectPath = pathString.split(",");
		var currentRotation = this.getRotationX(objectPath);
		var targetRotation = this.poseTargets.xrotation[pathString];

		this.setRotationX(objectPath, (currentRotation + targetRotation) / 2.0);
	}

	for (var pathString in this.poseTargets.yrotation) {
		objectPath = pathString.split(",");
		var currentRotation = this.getRotationY(objectPath);
		var targetRotation = this.poseTargets.yrotation[pathString];

		this.setRotationY(objectPath, (currentRotation + targetRotation) / 2.0);
	}

	for (var pathString in this.poseTargets.lightintensity) {
		objectPath = pathString.split(",");
		var currentIntensity = this.getLightIntensity(objectPath);
		var targetIntensity = this.poseTargets.lightintensity[pathString];

		this.setLightIntensity(objectPath, (currentIntensity + targetIntensity) / 2.0);
	}	
}

Robot.prototype.updateVelocity = function()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = delta * this.velocity; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * this.radialVelocity;   // pi/2 radians (90 degrees) per second

	// center the skybox around the robot, so we don't run off the edge of it.
	Robot.skybox.position = this.model.position;

	// always moving
	this.model.translateZ( moveDistance );

	// always rotating
	// TODO: create object each animation frame
	rotation_matrix = new THREE.Matrix4().makeRotationY(rotateAngle);
	this.model.matrix.multiply(rotation_matrix);
	this.model.rotation.setEulerFromRotationMatrix(this.model.matrix);

	// move forwards/backwards/left/right
	if (this.currentPose & Robot.PUSH_FORWARDS) {
		this.velocity = Math.max(-this.maxVelocity, this.velocity - this.acceleration);
		this.radialVelocity = 0.9 * this.radialVelocity;
	} 
	if (this.currentPose & Robot.PUSH_BACKWARDS) {
		this.radialVelocity = 0.9 * this.radialVelocity;
		this.velocity = Math.min(this.maxVelocity, this.velocity + this.acceleration);
	} 
	
	if (this.currentPose & Robot.TURN_CLOCKWISE) {
		this.radialVelocity = Math.min(this.maxRadialVelocity, this.radialVelocity + this.radialAcceleration);
	} 
	if (this.currentPose & Robot.TURN_COUNTERCLOCKWISE) {
		this.radialVelocity = Math.max(-this.maxRadialVelocity, this.radialVelocity - this.radialAcceleration);
	} 

	if (!(this.currentPose & Robot.TURN_CLOCKWISE || this.currentPose & Robot.TURN_COUNTERCLOCKWISE)) {
		// Slow Down! unless pushing
		this.radialVelocity = 0.9 * this.radialVelocity;
	}

	if (!(this.currentPose & Robot.PUSH_BACKWARDS || this.currentPose & Robot.PUSH_FORWARDS)) {
		// Slow Down! unless pushing
		this.velocity = 0.95 * this.velocity;
	}

	// set the engine sound based on both radial and forward velocity
	Robot.engineGain.gain.value = Math.abs(this.velocity / 1200) + Math.abs(this.radialVelocity / 0.05);

	document.getElementById('speedometer').innerHTML = Math.round(this.velocity);
}
