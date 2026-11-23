import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { METH_PDB } from './molecule.js';

let camera, scene, renderer, labelRenderer, controls, root;

const loader = new PDBLoader();
const offset = new THREE.Vector3();

init();

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x050505 );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.z = 1000;
	scene.add( camera );

	const light1 = new THREE.DirectionalLight( 0xffffff, 2.5 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	const light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( - 1, - 1, 1 );
	scene.add( light2 );

	root = new THREE.Group();
	scene.add( root );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animate );
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	labelRenderer = new CSS2DRenderer();
	labelRenderer.setSize( window.innerWidth, window.innerHeight );
	labelRenderer.domElement.style.position = 'absolute';
	labelRenderer.domElement.style.top = '0px';
	labelRenderer.domElement.style.pointerEvents = 'none';
	document.getElementById( 'container' ).appendChild( labelRenderer.domElement );

	controls = new TrackballControls( camera, renderer.domElement );
	controls.minDistance = 500;
	controls.maxDistance = 2000;

	loadMolecule();

	window.addEventListener( 'resize', onWindowResize );

}

function loadMolecule() {

	const pdb = loader.parse( METH_PDB );

	const geometryAtoms = pdb.geometryAtoms;
	const geometryBonds = pdb.geometryBonds;
	const json = pdb.json;

	const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	const sphereGeometry = new THREE.IcosahedronGeometry( 1, 3 );

	geometryAtoms.computeBoundingBox();
	geometryAtoms.boundingBox.getCenter( offset ).negate();

	geometryAtoms.translate( offset.x, offset.y, offset.z );
	geometryBonds.translate( offset.x, offset.y, offset.z );

	let positions = geometryAtoms.getAttribute( 'position' );

	const position = new THREE.Vector3();

	for ( let i = 0; i < positions.count; i ++ ) {

		position.fromBufferAttribute( positions, i );

		const atom = json.atoms[ i ];
		const element = atom[ 4 ].trim();

		let hexColor;
		if ( element === 'C' ) hexColor = 0xbcbcbc;
		else if ( element === 'N' ) hexColor = 0x00bfff;
		else if ( element === 'H' ) hexColor = 0xffffff;
		else hexColor = 0x808080;

		const object = new THREE.Mesh( sphereGeometry, new THREE.MeshPhongMaterial( { color: hexColor } ) );
		object.position.copy( position ).multiplyScalar( 75 );
		object.scale.multiplyScalar( 25 );
		root.add( object );

	}

	positions = geometryBonds.getAttribute( 'position' );

	const start = new THREE.Vector3();
	const end = new THREE.Vector3();

	for ( let i = 0; i < positions.count; i += 2 ) {

		start.fromBufferAttribute( positions, i ).multiplyScalar( 75 );
		end.fromBufferAttribute( positions, i + 1 ).multiplyScalar( 75 );

		const object = new THREE.Mesh( boxGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
		object.position.copy( start ).lerp( end, 0.5 );
		object.scale.set( 5, 5, start.distanceTo( end ) );
		object.lookAt( end );
		root.add( object );

	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	labelRenderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	controls.update();

	const time = Date.now() * 0.0004;
	root.rotation.x = time;
	root.rotation.y = time * 0.7;

	renderer.render( scene, camera );
	labelRenderer.render( scene, camera );

}
