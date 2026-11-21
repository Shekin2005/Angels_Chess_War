/*
 * ANGEL'S CHESS WAR
 * Student: Shekin David Raj
 * File: luxury-board.js
 * Purpose: Three.js integration of the kingdoms, castles, celestial objects, and environment assets.
 * Existing functionality is preserved; imported assets belong to their credited creators.
 */

// READABILITY NOTES: Comments explain the existing code; the game logic is unchanged.
/** Uploaded luxury_onyx_and_marble_chess_board.glb — board-only layer.
 * The original WebGL2 chess pieces, markers, hit testing, game rules,
 * castles and angels stay in the existing main.js and chess.js.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// canvas: Stores a value used by the game.
const canvas = document.createElement('canvas');
canvas.id = 'luxuryBoardLayer';
canvas.setAttribute('aria-hidden', 'true');
document.body.insertBefore(canvas, document.querySelector('#scene'));
// The pink backdrop comes from the original page / WebGL2 canvas CSS,
// not from the Three.js renderer alone. Force transparent foreground.
// spaceStyle: Stores a value used by the game.
const spaceStyle = document.createElement('style');
spaceStyle.id = 'angels-black-space-override';
spaceStyle.textContent = `html, body { background: #000 !important; }
  #scene { background: transparent !important; }
  #luxuryBoardLayer { background: #000 !important; }`;
document.head.appendChild(spaceStyle);

// renderer: Stores a value used by the game.
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setClearColor(0x000000,1); // Deep black outer space
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05; // Dim the overly bright imported marble.
// scene: Stores a value used by the game.
const scene = new THREE.Scene();
// camera: Controls how the player views the 3D world.
const camera = new THREE.PerspectiveCamera(47.55,1,.1,160);
scene.add(new THREE.HemisphereLight(0xe8e9ff,0x60534a,1.5));
// sun: Controls lighting or celestial objects in the scene.
const sun = new THREE.DirectionalLight(0xffd9b3,1.05);
sun.position.set(-7,14,9);scene.add(sun);
// fill: Stores a value used by the game.
const fill = new THREE.DirectionalLight(0x8798bf,0.35);
fill.position.set(8,7,-8);scene.add(fill);
// The playable board is now generated in main.js using raw WebGL2.
// This layer only renders advanced kingdom and celestial GLB scenery.
// Verified GLB geometry bounds: X 79,671; Y 10,919; Z 72,802.
// The supplied model is ALREADY Y-up. Rotating it made the fortress lie sideways.
// SketchUp edge-color primitives are LINES; hide them to remove white wireframe.
// volcanoStatus: Stores a value used by the game.
const volcanoStatus = window.VolcanoKingdom = {ready:false,error:null};
// The old lava/rock causeway and its lava fingers have been removed.
// The Black Kingdom is now visually separate from the chessboard.
new GLTFLoader().load('models/volcano_valley.glb', gltf => {
  // volcano: Builds part of the environment around the chessboard.
  const volcano = gltf.scene;
  volcano.name='UprightVolcanoValley';
  volcano.rotation.set(0,0,0); // Asset is already Y-up; DO NOT rotate it.
  volcano.updateMatrixWorld(true);
  // bounds: Stores a value used by the game.
  const bounds=new THREE.Box3().setFromObject(volcano);
  // size: Stores a value used by the game.
  const size=bounds.getSize(new THREE.Vector3());
  // center: Stores a value used by the game.
  const center=bounds.getCenter(new THREE.Vector3());
  // Checks a condition before running the next block.
  if(!(size.x>0&&size.z>0&&size.y>0))throw Error('Invalid volcano dimensions');
  // Fit the landscape within the black realm, not over the entire chessboard.
  // factor: Stores a value used by the game.
  const factor=Math.min(30/size.x,25/size.z); // Larger volcanic terrain
  volcano.scale.setScalar(factor);
  // Move the visible ground near Y=0, leaving some terrain below the island.
  volcano.position.set(19.5-center.x*factor,-bounds.min.y*factor-0.22,-center.z*factor);
  volcano.traverse(node=>{
    // Sketchfab export includes bright SketchUp edge outlines as LineSegments.
    // These were the giant white wireframe seen around the lava mountain.
    // Checks a condition before running the next block.
    if(node.isLine || node.isLineSegments || /edge_color/i.test(node.material?.name||'')) {
      node.visible=false;
      return;
    }
    // Returns the result to the code that called this function.
    if(!node.isMesh)return;
    node.frustumCulled=false;
    // mats: Stores a value used by the game.
    const mats=Array.isArray(node.material)?node.material:[node.material];
    node.material=Array.isArray(node.material)?mats.map(tune):tune(mats[0]);
  });
  // Preserve geometry and lava. Use warm sandstone for rock surfaces, while
  // retaining original texture maps and letting the lighting reveal relief.
  // tune(): Runs this named part of the game when called.
  function tune(mat){
    // Returns the result to the code that called this function.
    if(!mat)return mat;
    // m: Stores a value used by the game.
    const m=mat.clone();
    // name: Stores a value used by the game.
    const name=(m.name||'').toLowerCase();
    m.side=THREE.DoubleSide;
    // Returns the result to the code that called this function.
    if(/lava|flow|molten|fire|magma|ember/.test(name))return m;
    // Checks a condition before running the next block.
    if(m.color)m.color.set(0xD4B18A);
    // Checks a condition before running the next block.
    if(m.roughness!==undefined)m.roughness=Math.min(m.roughness,0.85);
    // Checks a condition before running the next block.
    if(m.metalness!==undefined)m.metalness=0;
    // No blanket darkening; preserve original textures for visible rock detail.
    m.needsUpdate=true;
    return m;
  }
  // Dedicated fill illumination ensures the distant black kingdom remains
  // visible against the black sky, without affecting the white kingdom.
  // realmLight: Stores a value used by the game.
  const realmLight=new THREE.DirectionalLight(0xffdfb9,3.0);
  realmLight.position.set(24,24,14);
  realmLight.target.position.set(19.5,0,0);
  scene.add(realmLight,realmLight.target);
  // rim: Stores a value used by the game.
  const rim=new THREE.PointLight(0xffc98a,90,55,2);
  rim.position.set(19.5,12,-6);
  scene.add(rim);
  scene.add(volcano);volcanoStatus.ready=true;
  console.info('Y-up volcano loaded, sketch outlines hidden', {size:size.toArray(),factor});
},undefined,err=>{volcanoStatus.error=String(err);console.error('Volcano failed',err);});

// WHITE KINGDOM — user's new island_snow_water.glb and white_castle.glb.
// Original GLB meshes, materials, textures, normals and scene lighting are preserved.
// Existing main.js chains, angels, chess gameplay and black realm are unchanged.
// whiteRealm: Stores a value used by the game.
const whiteRealm = window.WhiteCloudKingdom = {
  ready:false, assets:0, errors:[], islandLoaded:false, castleLoaded:false
};
// whiteRoot: Stores a value used by the game.
const whiteRoot = new THREE.Group();
whiteRoot.name = 'WhiteCloudKingdom';
scene.add(whiteRoot);
// WHITE_CENTER_X: Stores a value used by the game.
const WHITE_CENTER_X = -18.5;
// WHITE_CENTER_Z: Stores a value used by the game.
const WHITE_CENTER_Z = 0;
// WHITE_ISLAND_WIDTH: Stores a value used by the game.
const WHITE_ISLAND_WIDTH = 23;
// WHITE_ISLAND_DEPTH: Stores a value used by the game.
const WHITE_ISLAND_DEPTH = 20;
// WHITE_CASTLE_WIDTH: Stores a value used by the game.
const WHITE_CASTLE_WIDTH = 10;
// WHITE_CASTLE_BACK_OFFSET: Stores a value used by the game.
const WHITE_CASTLE_BACK_OFFSET = -4.5;

// Place a model by its actual transformed bounding box. Its geometry and materials
// remain untouched; only the outer group is scaled and translated.
// fitWhiteModel(): Runs this named part of the game when called.
function fitWhiteModel(model, width, depth, x, y, z, yaw=0) {
  // holder: Stores a value used by the game.
  const holder = new THREE.Group();
  holder.add(model);
  model.rotation.y = yaw;
  holder.updateMatrixWorld(true);
  // originalBox: Stores a value used by the game.
  const originalBox = new THREE.Box3().setFromObject(holder);
  // originalSize: Stores a value used by the game.
  const originalSize = originalBox.getSize(new THREE.Vector3());
  // Checks a condition before running the next block.
  if (!(originalSize.x>0 && originalSize.y>0 && originalSize.z>0)) {
    throw new Error('Invalid 3D model dimensions: '+model.name);
  }
  // scale: Stores a value used by the game.
  const scale = Math.min(width/originalSize.x, depth/originalSize.z);
  holder.scale.setScalar(scale);
  holder.updateMatrixWorld(true);
  // fittedBox: Stores a value used by the game.
  const fittedBox = new THREE.Box3().setFromObject(holder);
  // fittedCenter: Stores a value used by the game.
  const fittedCenter = fittedBox.getCenter(new THREE.Vector3());
  holder.position.set(x-fittedCenter.x, y-fittedBox.min.y, z-fittedCenter.z);
  whiteRoot.add(holder);
  return holder;
}

// loadNewWhiteModel(): Runs this named part of the game when called.
function loadNewWhiteModel(url, name, onLoaded) {
  new GLTFLoader().load(url, gltf => {
    try {
      // model: Stores a value used by the game.
      const model = gltf.scene;
      model.name = name;
      // Do not recolour, clone, replace or alter GLB materials or lighting.
      model.traverse(node => { if(node.isMesh) node.frustumCulled=false; });
      onLoaded(model);
      whiteRealm.assets++;
      whiteRealm.ready=whiteRealm.islandLoaded && whiteRealm.castleLoaded;
      console.info(name+' loaded',whiteRealm);
    } catch(error) {
      whiteRealm.errors.push(name+': '+String(error));
      console.error(name+' placement failed',error);
    }
  }, undefined, error => {
    whiteRealm.errors.push(name+': '+String(error));
    console.error(name+' failed to load',error);
  });
}

loadNewWhiteModel('models/white_kingdom/island_snow_water.glb','NewSnowWaterIsland', model => {
  fitWhiteModel(model, WHITE_ISLAND_WIDTH, WHITE_ISLAND_DEPTH,
    WHITE_CENTER_X, -0.15, WHITE_CENTER_Z);
  whiteRealm.islandLoaded=true;
});

loadNewWhiteModel('models/white_kingdom/white_castle.glb','NewWhiteCastle', model => {
  fitWhiteModel(model, WHITE_CASTLE_WIDTH, WHITE_CASTLE_WIDTH,
    WHITE_CENTER_X, 0.05, WHITE_CENTER_Z+WHITE_CASTLE_BACK_OFFSET);
  whiteRealm.castleLoaded=true;
});

// NEW CASTLES AND ROOK WATCHTOWERS — black kingdom only (two towers).
// These are decorative towers; the chess rook pieces and game rules are unchanged.
// All imported GLB materials and textures remain exactly as supplied.
// fortressStatus: Stores a value used by the game.
const fortressStatus = window.KingdomFortresses = {
  blackCastle:false, blackRooks:0, whiteRooks:0, errors:[]
};
// blackFortressRoot: Stores a value used by the game.
const blackFortressRoot = new THREE.Group();
blackFortressRoot.name='BlackCastleAndWatchtowers';
scene.add(blackFortressRoot);

// placeFortressModel(): Runs this named part of the game when called.
function placeFortressModel(model, parent, width, depth, x, groundY, z, yaw=0) {
  // holder: Stores a value used by the game.
  const holder=new THREE.Group();
  holder.add(model);
  model.rotation.y=yaw;
  holder.updateMatrixWorld(true);
  // sourceBox: Stores a value used by the game.
  const sourceBox=new THREE.Box3().setFromObject(holder);
  // size: Stores a value used by the game.
  const size=sourceBox.getSize(new THREE.Vector3());
  // Checks a condition before running the next block.
  if(!(size.x>0 && size.y>0 && size.z>0)) throw Error('Invalid bounds for '+model.name);
  // factor: Stores a value used by the game.
  const factor=Math.min(width/size.x,depth/size.z);
  holder.scale.setScalar(factor);
  holder.updateMatrixWorld(true);
  // box: Stores a value used by the game.
  const box=new THREE.Box3().setFromObject(holder);
  // center: Stores a value used by the game.
  const center=box.getCenter(new THREE.Vector3());
  holder.position.set(x-center.x,groundY-box.min.y,z-center.z);
  parent.add(holder);
  return holder;
}
// loadFortress(): Runs this named part of the game when called.
function loadFortress(url, name, parent, width, depth, x, y, z, yaw, onReady) {
  new GLTFLoader().load(url,gltf=>{
    try {
      // model: Stores a value used by the game.
      const model=gltf.scene;
      model.name=name;
      model.traverse(n=>{if(n.isMesh)n.frustumCulled=false;});
      placeFortressModel(model,parent,width,depth,x,y,z,yaw);
      onReady();
      console.info(name+' loaded');
    } catch(e){fortressStatus.errors.push(name+': '+String(e));console.error(e);}
  },undefined,e=>{fortressStatus.errors.push(name+': '+String(e));console.error(name+' failed',e);});
}
// Black castle sits behind the central volcano; adjust x if your volcano obscures it.
loadFortress('models/black_kingdom/black_castle.glb','NewBlackCastle',
  blackFortressRoot,11,10,20.5,0.10,-4.5,0,()=>{fortressStatus.blackCastle=true;});
// Two towers flank the black castle along the Z axis, away from the chessboard.
// A single GLB is loaded once and cloned, preserving its original textures.
new GLTFLoader().load('models/rook_watchtower.glb',gltf=>{
  try {
    // original: Stores a value used by the game.
    const original=gltf.scene;
    // Repeats this block for the required items or frames.
    for(const [side,x,z] of [
      ['BlackLeft',20.5,-9.0],['BlackRight',20.5,8.5]
    ]) {
      // model: Stores a value used by the game.
      const model=original.clone(true);
      model.name=side+'RookWatchtower';
      model.traverse(n=>{if(n.isMesh)n.frustumCulled=false;});
      // black: Stores a value used by the game.
      const black=side.startsWith('Black');
      placeFortressModel(model,black?blackFortressRoot:whiteRoot,
        3.8,3.8,x,black?0.12:0.05,z,0);
      // Checks a condition before running the next block.
      if(black)fortressStatus.blackRooks++;
      else fortressStatus.whiteRooks++;
    }
    console.info('Two black rook watchtowers loaded',fortressStatus);
  }catch(e){fortressStatus.errors.push('Rook towers: '+String(e));console.error(e);}
},undefined,e=>{fortressStatus.errors.push('Rook towers: '+String(e));console.error(e);});

// CELESTIAL KINGDOM OBJECTS — original user-supplied GLB materials preserved.
// Moon floats above the snowy White Kingdom; Sun above the volcanic Black Kingdom.
// The GLB geometry, textures, materials and built-in animations are unchanged.
// celestialStatus: Stores a value used by the game.
const celestialStatus = window.KingdomCelestials = {
  moon:false, sun:false, errors:[], animated:[]
};
// celestialMixers: Stores a value used by the game.
const celestialMixers=[];
// celestialClock: Stores a value used by the game.
const celestialClock=new THREE.Clock();
// loadCelestial(): Runs this named part of the game when called.
function loadCelestial(url,name,realmX,realmZ,span,height,spin=0){
  new GLTFLoader().load(url,gltf=>{
    try {
      // model: Stores a value used by the game.
      const model=gltf.scene;
      model.name=name;
      model.traverse(node=>{if(node.isMesh)node.frustumCulled=false;});
      // Keep moon/sun GLB materials, textures, colours and geometry exactly as imported.
      // No emissive tint, cloned materials, shader replacement or texture edits.
      // holder: Stores a value used by the game.
      const holder=new THREE.Group();
      holder.name=name+'Holder';
      holder.add(model);
      model.rotation.y=spin;
      holder.updateMatrixWorld(true);
      // sourceBox: Stores a value used by the game.
      const sourceBox=new THREE.Box3().setFromObject(holder);
      // size: Stores a value used by the game.
      const size=sourceBox.getSize(new THREE.Vector3());
      // Checks a condition before running the next block.
      if(!(size.x>0&&size.y>0&&size.z>0))throw Error('Invalid '+name+' dimensions');
      // scale: Stores a value used by the game.
      const scale=span/Math.max(size.x,size.y,size.z);
      holder.scale.setScalar(scale);
      holder.updateMatrixWorld(true);
      // fitted: Stores a value used by the game.
      const fitted=new THREE.Box3().setFromObject(holder);
      // center: Stores a value used by the game.
      const center=fitted.getCenter(new THREE.Vector3());
      holder.position.set(realmX-center.x,height-center.y,realmZ-center.z);
      scene.add(holder);
      // Checks a condition before running the next block.
      if(gltf.animations?.length){
        // mixer: Stores a value used by the game.
        const mixer=new THREE.AnimationMixer(model);
        // Repeats this block for the required items or frames.
        for(const clip of gltf.animations)mixer.clipAction(clip).play();
        celestialMixers.push(mixer);
        celestialStatus.animated.push(name);
      }
      celestialStatus[name==='WhiteMoon'?'moon':'sun']=true;
      console.info(name+' loaded',celestialStatus);
    }catch(e){celestialStatus.errors.push(name+': '+String(e));console.error(e);}
  },undefined,e=>{celestialStatus.errors.push(name+': '+String(e));console.error(name+' load failed',e);});
}
loadCelestial('models/celestial/moon.glb','WhiteMoon',-18.5,-3.0,5.5,14);
loadCelestial('models/celestial/sun.glb','BlackSun',19.5,-3.0,6.0,15);

// SPARSE SPACE BACKGROUND — custom GPU points, independent of camera zoom.
// This replaces the dense imported star-field rendering, not the kingdoms.
// starScene: Stores a value used by the game.
const starScene = new THREE.Scene();
starScene.background = new THREE.Color(0x000000);
// starCamera: Stores a value used by the game.
const starCamera = new THREE.PerspectiveCamera(65,1,0.1,500);
starCamera.position.set(0,0,0);
// starStatus: Stores a value used by the game.
const starStatus = window.SpaceStarsBackground = {
  ready:true, error:null, fixedZoom:true, rotationFollowsCamera:true,
  source:'procedural sparse sparkling stars', count:125
};
// Stable pseudo-random distribution on a sphere: stars never approach the camera.
// seed: Stores a value used by the game.
let seed=76421;
// Returns the result to the code that called this function.
function randStar(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
// positions: Stores a value used by the game.
const positions=[], phases=[], sizes=[];
// Repeats this block for the required items or frames.
for(let i=0;i<starStatus.count;i++){
  // z: Stores a value used by the game.
  const z=2*randStar()-1, theta=2*Math.PI*randStar();
  // r: Stores a value used by the game.
  const r=100, planar=Math.sqrt(1-z*z);
  positions.push(r*planar*Math.cos(theta),r*z,r*planar*Math.sin(theta));
  phases.push(6.28318*randStar());
  sizes.push(2.0+1.6*randStar());
}
// starGeo: Stores a value used by the game.
const starGeo=new THREE.BufferGeometry();
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
starGeo.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));
starGeo.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
// starMat: Stores a value used by the game.
const starMat=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0}},
  vertexShader:`attribute float aPhase; attribute float aSize; varying float vPhase;
    void main(){vPhase=aPhase; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    gl_Position=p; gl_PointSize=aSize*2.5;}`,
  fragmentShader:`uniform float uTime; varying float vPhase;
    void main(){vec2 q=gl_PointCoord-0.5; float d=length(q);
      float soft=1.0-smoothstep(0.12,0.50,d);
      float twinkle=0.62+0.28*sin(uTime*0.8+vPhase);
      gl_FragColor=vec4(vec3(0.80,0.87,1.0),soft*twinkle);}`,
  transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
  toneMapped:false
});
starScene.add(new THREE.Points(starGeo,starMat));
// The WebGL2 overlay canvas stays transparent so stars show through it.
// Keep the user's main.js unchanged.
// animate(): Updates the scene over time for animation.
function animate(){
  // celestialDelta: Stores a value used by the game.
  const celestialDelta=Math.min(celestialClock.getDelta(),0.05);
  // Repeats this block for the required items or frames.
  for(const mixer of celestialMixers)mixer.update(celestialDelta);
  requestAnimationFrame(animate);
  // w: Stores a value used by the game.
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.setSize(w,h,false);
  // state: Stores a value used by the game.
  const state=window.CelestialSceneState;
  // Checks a condition before running the next block.
  if(state?.eye){
    camera.fov=THREE.MathUtils.radToDeg(state.fovRadians);
    camera.aspect=w/h;camera.position.set(...state.eye);
    camera.lookAt(...state.target);camera.updateProjectionMatrix();
  }
  starMat.uniforms.uTime.value=performance.now()*0.001;
  // Independent star camera: fixed FOV and zero translation. It only rotates
  // with the user's view; scrolling/zooming cannot enlarge the star field.
  starCamera.aspect=w/h;
  starCamera.quaternion.copy(camera.quaternion);
  starCamera.updateProjectionMatrix();
  renderer.autoClear=false;
  renderer.clear(true,true,true);
  renderer.render(starScene,starCamera);
  renderer.clearDepth();
  renderer.render(scene,camera);
}
animate();
