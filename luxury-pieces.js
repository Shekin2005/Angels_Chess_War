/*
 * ANGEL'S CHESS WAR
 * Student: Shekin David Raj
 * File: luxury-pieces.js
 * Purpose: Legacy optional GLB chess-piece renderer; not loaded by the current index.html.
 * Existing functionality is preserved; imported assets belong to their credited creators.
 */

// READABILITY NOTES: Comments explain the existing code; the game logic is unchanged.
/** Original user-supplied GLB characters as chess pieces. Three.js MIT.
 * All chess rules, selection and captures remain owned by chess.js/main.js.
 */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from 'three/addons/utils/SkeletonUtils.js';
// canvas: Stores a value used by the game.
const canvas=document.createElement('canvas');
canvas.id='luxuryPiecesLayer';canvas.setAttribute('aria-hidden','true');
document.body.appendChild(canvas);
// renderer: Stores a value used by the game.
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
// scene: Stores a value used by the game.
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(47.55,1,.1,160);
scene.add(new THREE.HemisphereLight(0xffffff,0x686075,3));
// sun: Controls lighting or celestial objects in the scene.
const sun=new THREE.DirectionalLight(0xffe6be,3.4);sun.position.set(-6,12,8);scene.add(sun);
// blue: Stores a value used by the game.
const blue=new THREE.DirectionalLight(0xd9eaff,2.2);blue.position.set(8,9,-7);scene.add(blue);
// assets: Stores a value used by the game.
const assets={k:'models/chess-pieces/king.glb',q:'models/chess-pieces/queen.glb',r:'models/chess-pieces/rook.glb',b:'models/chess-pieces/bishop.glb',n:'models/chess-pieces/knight.glb',p:'models/chess-pieces/pawn.glb'};
// loader: Stores a value used by the game.
const loader=new GLTFLoader(),templates={};
// info: Stores a value used by the game.
const info=window.LuxuryChessPieces={ready:false,errors:[],loaded:0,total:6};
// Preserve every original skin/face texture. Only recolor materials that
// explicitly describe clothes/armor; single-material characters retain their
// original diffuse maps to avoid recoloring skin pixels.
// palette: Stores a value used by the game.
const palette={
 white:{base:new THREE.Color('#fff6e6'),metal:new THREE.Color('#d8ac49')},
 black:{base:new THREE.Color('#18121a'),metal:new THREE.Color('#8e182b')}
};
// colorize(): Runs this named part of the game when called.
function colorize(root,team){
 // pal: Stores a value used by the game.
 const pal=palette[team];
 root.traverse(obj=>{
  // Returns the result to the code that called this function.
  if(!obj.isMesh)return;
  // change: Stores a value used by the game.
  const change=material=>{
   // c: Stores a value used by the game.
   const c=material.clone();
   // name: Stores a value used by the game.
   const name=(material.name+' '+obj.name).toLowerCase();
   // protectedPart: Stores a value used by the game.
   const protectedPart=/skin|face|head|body|eye|mouth|lip|hand|finger|hair|teeth|nail|ear|neck|nose|eyebrow|eyelash/.test(name);
   // clothing: Stores a value used by the game.
   const clothing=/armor|armour|cloth|fabric|dress|robe|cape|metal|gold|silver|plate|helmet|boot|shoe|belt|shield|tunic|jacket|trouser|pants|vest|hood|glove/.test(name);
   // Checks a condition before running the next block.
   if(!protectedPart && clothing){
    // Keep source skin untouched, including skin inside textured materials.
    // A tinted textured material preserves texture detail, but very dark
    // textures can remain dark; faction-colored trim is added separately.
    // Checks a condition before running the next block.
    if(c.color)c.color.copy(/gold|silver|metal|trim|plate/.test(name)?pal.metal:pal.base);
    // Checks a condition before running the next block.
    if('metalness' in c && /gold|silver|metal|trim|plate/.test(name))c.metalness=.7;
   }
   c.side=THREE.DoubleSide;c.needsUpdate=true;
   return c;
  };
  obj.material=Array.isArray(obj.material)?obj.material.map(change):change(obj.material);
  obj.frustumCulled=false;
 });
}
// addFactionTrim(): Runs this named part of the game when called.
function addFactionTrim(root,team,type){
 // pal: Stores a value used by the game.
 const pal=palette[team];
 // metal: Stores a value used by the game.
 const metal=new THREE.MeshStandardMaterial({color:pal.metal,metalness:.82,roughness:.24});
 // dark: Stores a value used by the game.
 const dark=new THREE.MeshStandardMaterial({color:pal.base,metalness:.55,roughness:.3});
 // ring: Stores a value used by the game.
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.027,9,32),metal);
 ring.rotation.x=Math.PI/2;ring.position.y=.09;root.add(ring);
 // ring2: Stores a value used by the game.
 const ring2=new THREE.Mesh(new THREE.TorusGeometry(.27,.019,9,32),dark);
 ring2.rotation.x=Math.PI/2;ring2.position.y=.18;root.add(ring2);
 // Gold for white, deep red for black; no overlays over face or skin.
}
// pieces: Stores a value used by the game.
const pieces=[];
// setup: Stores a value used by the game.
const setup='rnbqkbnr';
// build(): Runs this named part of the game when called.
function build(){
 // Repeats this block for the required items or frames.
 for(const row of [0,1,6,7])for(let file=0;file<8;file++){
  // id: Stores a value used by the game.
  const id=row*8+file,type=(row===1||row===6)?'p':setup[file];
  // team: Stores a value used by the game.
  const team=row<2?'black':'white';
  // root: Stores a value used by the game.
  const root=new THREE.Group();const model=cloneRig(templates[type]);
  colorize(model,team);
  root.add(model);
  // Imported assets have different units, orientations and offsets.
  // Fit each piece into a 1.5-unit chess square; king/queen are tallest.
  model.updateMatrixWorld(true);
  // bounds: Stores a value used by the game.
  const bounds=new THREE.Box3().setFromObject(model);
  // size: Stores a value used by the game.
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  // height: Stores a value used by the game.
  const height=({k:1.38,q:1.32,b:1.20,n:1.16,r:1.12,p:.94})[type];
  // factor: Stores a value used by the game.
  const factor=Math.min(height/Math.max(size.y,.001),1.12/Math.max(size.x,size.z,.001));
  model.scale.setScalar(factor);
  model.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor);
  // Default imported character forward is +Z. Face each kingdom's opponent.
  model.rotation.y=team==='white'?0:Math.PI;
  addFactionTrim(root,team,type);
  scene.add(root);pieces.push({id,root,model,type,team});
 }
 info.ready=true;
 console.info('Imported 32 themed GLB chess pieces',info);
}
Promise.all(Object.entries(assets).map(([type,path])=>new Promise((resolve,reject)=>{
 loader.load(path,gltf=>{templates[type]=gltf.scene;info.loaded++;resolve();},undefined,e=>{info.errors.push(`${type}: ${e}`);reject(e);});
}))).then(build).catch(e=>console.error('Chess pieces failed; keeping procedural fallback',e));
// updatePromotedCharacter(): Runs this named part of the game when called.
function updatePromotedCharacter(piece,type){
 // Returns the result to the code that called this function.
 if(piece.type===type)return;
 // old: Stores a value used by the game.
 const old=piece.model;
 piece.root.remove(old);
 // model: Stores a value used by the game.
 const model=cloneRig(templates[type]);colorize(model,piece.team);
 piece.root.add(model);model.updateMatrixWorld(true);
 // bounds: Stores a value used by the game.
 const bounds=new THREE.Box3().setFromObject(model);
 // size: Stores a value used by the game.
 const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 // height: Stores a value used by the game.
 const height=({k:1.38,q:1.32,b:1.20,n:1.16,r:1.12,p:.94})[type];
 // factor: Stores a value used by the game.
 const factor=Math.min(height/Math.max(size.y,.001),1.12/Math.max(size.x,size.z,.001));
 model.scale.setScalar(factor);
 model.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor);
 model.rotation.y=piece.team==='white'?0:Math.PI;
 piece.model=model;piece.type=type;
}
// frame(): Updates the scene over time for animation.
function frame(){requestAnimationFrame(frame);
 // w: Stores a value used by the game.
 const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h,false);
 // state: Stores a value used by the game.
 const state=window.CelestialSceneState;
 // Checks a condition before running the next block.
 if(state?.eye){camera.fov=THREE.MathUtils.radToDeg(state.fovRadians);camera.aspect=w/h;
 camera.position.set(...state.eye);camera.lookAt(...state.target);camera.updateProjectionMatrix();}
 // Checks a condition before running the next block.
 if(info.ready&&window.CelestialChessActorPositions){
  // Repeats this block for the required items or frames.
  for(const p of pieces){const pos=window.CelestialChessActorPositions[p.id];
   p.root.visible=!!pos;
   // Checks a condition before running the next block.
   if(pos){if(pos.type&&pos.type!==p.type)updatePromotedCharacter(p,pos.type);p.root.position.set((pos.file-3.5)*1.5,.98,(pos.row-3.5)*1.5);}
  }
 }
 renderer.render(scene,camera);
}
frame();
