/*
 * ANGEL'S CHESS WAR
 * Student: Shekin David Raj
 * File: main.js
 * Purpose: Core custom WebGL2 rendering, GLSL shaders, procedural chessboard and chess-piece geometry, camera, and effects.
 * Existing functionality is preserved; imported assets belong to their credited creators.
 */

// READABILITY NOTES: Comments explain the existing code; the game logic is unchanged.
'use strict';
/*
 * ANGEL'S CHESS WAR — MAIN WEBGL2 SCENE
 *
 * PROJECT CODE: adapted from the earlier Angel's Chess War game supplied
 * in this conversation. This file has been annotated for coursework review.
 *
 * Original procedural meshes: board, castles, islands, wings, swords,
 * chess pieces, particles and chains.
 * Imported asset: Female_Adult_11.glb (provided by the user).
 * External dependency: Meshoptimizer decoder (see index.html).
 *
 * REFERENCE IMAGE: references/Angels_Chess_War_at_Sunset.png
 * The painting is a visual design reference, not a 3D model or texture.
 * This scene is NOT an exact reproduction of the painting.
 *
 * See SOURCES_AND_ATTRIBUTION.md for provenance and licensing checks.
 */
// Locate the single WebGL2 canvas and initialize its rendering context.
// canvas: Stores a value used by the game.
const canvas = document.querySelector('#scene');
// gl: Stores a value used by the game.
const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });

// Checks a condition before running the next block.
if (!gl) {
  throw new Error('WebGL2 is required to run Angel\'s Chess War.');
}

// Load the bundled textured female mesh. No in-game upload control is used.
// Source: user-provided Female_Adult_11.glb, rendered by real-angels.js.
// Character models are handled by the optional Three.js character layer.
// The environment and chess engine remain custom WebGL2 + GLSL.
const vertex=`#version 300 es
precision highp float;
in vec3 aPos;in vec3 aNormal;in vec3 aColor;
uniform mat4 uView; uniform mat4 uProjection;uniform vec3 uEye;uniform vec3 uOffset;uniform float uWingPhase;uniform vec3 uWingCenter;uniform float uWingEnabled;uniform float uSwordAngle;uniform vec3 uSwordPivot;uniform float uBodyRig;uniform float uBodyPhase;uniform vec3 uBodyCenter;
out vec3 vColor,vNormal,vWorld;
void main(){
  // Animate individual wing vertices in world space; zero for non-bird meshes.
  vec3 p=aPos;
  float wingSide=sign(aPos.x-uWingCenter.x);
  float wingDistance=abs(aPos.x-uWingCenter.x);
  // Shoulder and outer-feather motion, with a delayed tip flex.
  float joint=clamp((wingDistance-.22)/1.6,0.0,1.0);
  float tip=clamp((wingDistance-1.4)/2.1,0.0,1.0);
  p.y+=uWingEnabled*(wingDistance*.28*sin(uWingPhase)+joint*.22*sin(uWingPhase-.7)+tip*.18*sin(uWingPhase-1.25));
  p.z+=uWingEnabled*tip*.18*cos(uWingPhase-.55);
  // Lightweight vertex-driven character rig: head nod, breathing, shoulder/arm sway.
  // Applied only to angel-body draw ranges. All motions use the original 3D geometry.
  if(uBodyRig>0.5){
    vec3 local=p-uBodyCenter;
    float breath=0.022*sin(uBodyPhase*1.35);
    float torso=smoothstep(-0.9,0.15,local.y)*(1.0-smoothstep(0.35,0.70,local.y));
    p.z+=torso*breath;
    // Neck and head are rotated around the neck, preserving facial detail.
    float head=smoothstep(0.57,0.85,local.y);
    float nod=0.045*sin(uBodyPhase*0.67);
    float hy=local.y-0.55,hz=local.z;
    p.y+=head*(hy*(cos(nod)-1.0)-hz*sin(nod));
    p.z+=head*(hy*sin(nod)+hz*(cos(nod)-1.0));
    // Shoulder-to-hand movement, fading toward the torso and head.
    float arm=smoothstep(0.32,0.43,abs(local.x))*(1.0-smoothstep(0.15,0.48,local.y));
    p.x+=arm*sign(local.x)*0.055*sin(uBodyPhase*1.9);
    p.y+=arm*0.095*sin(uBodyPhase*1.9+local.x);
  }
  // Separate sword draw range rotates around the right gauntlet pivot.
  float ca=cos(uSwordAngle),sa=sin(uSwordAngle);
  vec3 rel=p-uSwordPivot;
  p=uSwordPivot+vec3(rel.x*ca-rel.y*sa,rel.x*sa+rel.y*ca,rel.z);
  // Model translation moves each mesh independently in world space.
  mat4 model = mat4(1.0);
  model[3] = vec4(uOffset, 1.0);
  vec4 world = model * vec4(p, 1.0);
  vColor = aColor;
  vNormal = aNormal;
  vWorld = world.xyz;
  gl_Position = uProjection * uView * world;
}`;
const fragment=`#version 300 es
precision highp float;
in vec3 vColor,vNormal,vWorld;
uniform vec3 uEye;
uniform float uTime;
// 0 = environment and board, 1 = chess piece. Custom WebGL2 material switch.
uniform float uChessPiece;
uniform sampler2D uStoneTexture; // Repeating stone detail stored on the GPU.
out vec4 outColor;
float hash3(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
 vec3 N=normalize(vNormal),V=normalize(uEye-vWorld);
 vec3 sun=normalize(vec3(-.45,.9,.35)),fill=normalize(vec3(.7,.35,-.45));
 float d=max(dot(N,sun),0.),f=max(dot(N,fill),0.);
 vec3 base=vColor;
 // MEDIEVAL CHESS MATERIALS — inspired by the procedural marble/basalt
 // approach in user-provided rork-medieval-3d-chess-main/web/src/scene/textures.ts.
 // This shader is a new WebGL2/GLSL adaptation, NOT copied Three.js code.
 // Board is detected by its exact top height and flat upward-facing normal.
 float boardTop = 1.0 - smoothstep(0.008, 0.035, abs(vWorld.y - 0.9725));
 boardTop *= smoothstep(0.65, 0.92, N.y);
 boardTop *= 1.0 - step(6.04, max(abs(vWorld.x), abs(vWorld.z)));
 // Identify the two board-square base colours without affecting the castles.
 float lightSquare = 1.0 - step(0.045, distance(vColor, vec3(0.82, 0.77, 0.65)));
 float darkSquare = 1.0 - step(0.045, distance(vColor, vec3(0.19, 0.18, 0.20)));
 float marbleField = noise3(vec3(vWorld.x * 1.7, vWorld.z * 1.7, 0.2));
 float marbleVein = abs(sin(vWorld.x * 9.1 + vWorld.z * 4.7
                         + noise3(vWorld * 4.0) * 8.0));
 float fineVein = 1.0 - smoothstep(0.045, 0.22, marbleVein);
 float stoneSpeckle = noise3(vWorld * 42.0);
 vec3 paleMarble = vec3(0.88, 0.85, 0.77) * (0.87 + 0.20 * marbleField);
 paleMarble -= fineVein * vec3(0.19, 0.17, 0.14);
 vec3 darkBasalt = vec3(0.105, 0.115, 0.135) * (0.78 + 0.43 * stoneSpeckle);
 darkBasalt += fineVein * vec3(0.060, 0.068, 0.085);
 base = mix(base, paleMarble, boardTop * lightSquare);
 base = mix(base, darkBasalt, boardTop * darkSquare);
 // Planar UV mapping: world X/Z coordinates repeat the stone texture.
 float stoneDetail = texture(uStoneTexture, vWorld.xz * 0.8).r;
 base *= mix(1.0, 0.85 + 0.30 * stoneDetail, boardTop);
 // HIGH-CONTRAST PIECE MATERIALS: visible even on small chess figures.
 // Piece geometry has original ivory/obsidian vertex colours; trim remains gold/red.
 float pieceIvory = uChessPiece * (1.0 - step(0.075, distance(vColor, vec3(0.96,0.89,0.73))));
 float pieceObsidian = uChessPiece * (1.0 - step(0.075, distance(vColor, vec3(0.13,0.14,0.18))));
 float broadVein = abs(sin(vWorld.y*21.0 + vWorld.x*15.0 + vWorld.z*9.0
                 + 4.5*noise3(vWorld*7.0)));
 float veinMask = 1.0 - smoothstep(0.10,0.32,broadVein);
 float cloud = noise3(vWorld*12.0);
 vec3 whiteStone = mix(vec3(0.98,0.96,0.89),vec3(0.65,0.67,0.67),cloud*0.42);
 whiteStone = mix(whiteStone,vec3(0.37,0.40,0.43),veinMask*0.86);
 vec3 blackStone = mix(vec3(0.015,0.020,0.033),vec3(0.17,0.20,0.25),cloud);
 blackStone = mix(blackStone,vec3(0.48,0.12,0.18),veinMask*0.70);
 // Thin horizontal metallic striations are intentionally obvious on the pieces.
 float band = 1.0-smoothstep(0.055,0.16,abs(sin(vWorld.y*37.0)));
 whiteStone = mix(whiteStone,vec3(0.89,0.67,0.24),band*0.34);
 blackStone = mix(blackStone,vec3(0.67,0.12,0.16),band*0.48);
 base = mix(base,whiteStone,pieceIvory);
 base = mix(base,blackStone,pieceObsidian);
 float gold=step(.54,vColor.r)*step(vColor.b,.48)*step(.25,vColor.g);
 float marble=step(.65,vColor.r)*step(.55,vColor.g)*step(.48,vColor.b);
 float dark=1.-step(.30,vColor.r+vColor.g+vColor.b);
 float skin=smoothstep(.65,.80,vColor.r)*(1.-smoothstep(.52,.68,vColor.g))*(1.-smoothstep(.45,.60,vColor.b));
 float grain=noise3(vWorld*37.),fine=noise3(vWorld*112.);
 float vein=sin(vWorld.x*8.7+vWorld.y*2.6+sin(vWorld.z*7.3+vWorld.x*2.1)*1.5);
 base*=1.+(grain-.5)*(.07+.05*gold+.04*skin);
 base=mix(base,base*(.89+.11*smoothstep(.75,.97,vein)),marble*.55);
 float cracks=pow(max(0.,sin(vWorld.x*6.1+sin(vWorld.z*4.7)*2.4)*sin(vWorld.y*3.7+vWorld.z*6.3)),17.);
 base+=dark*cracks*vec3(.10,.025,.032);
 base*=1.+skin*(fine-.5)*.025;
 vec3 c=base*(vec3(.31,.34,.40)+vec3(1.,.88,.72)*d*.83+vec3(.43,.52,.73)*f*.32);
 vec3 H=normalize(sun+V);
 float gloss=mix(33.,95.,gold),spec=pow(max(dot(N,H),0.),gloss);
 c+=vec3(1.,.86,.67)*spec*mix(.27,.72,gold)*(1.-skin*.65);
 float rim=pow(1.-max(dot(N,V),0.),3.);
 c+=rim*vec3(.12,.16,.22);
 float lava=step(.91,vColor.r)*step(vColor.g,.27)*step(vColor.b,.07);
 c+=lava*vec3(.45,.10,.012)*(.75+.25*sin(uTime*2.+vWorld.x*3.));
 float jewel=step(.72,max(vColor.b,vColor.g))*step(vColor.r,.88);
 c+=jewel*vColor*.30;
 c+=vec3(.15,.025,.007)*smoothstep(0.,9.,vWorld.x);
 float dist=length(vWorld-uEye),fog=1.-exp(-.001*dist*dist);
 vec3 sky=vec3(0.0);
 c=mix(c,sky,clamp(fog*0.16,0.,0.12));
 outColor=vec4(c,1.);
}`;
// shader(): Sets up GPU shaders or rendering so the 3D scene can be drawn.
function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
// program: Sets up GPU shaders or rendering so the 3D scene can be drawn.
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
// loc: Stores a value used by the game.
const loc={p:gl.getAttribLocation(program,'aPos'),n:gl.getAttribLocation(program,'aNormal'),c:gl.getAttribLocation(program,'aColor'),view:gl.getUniformLocation(program,'uView'),projection:gl.getUniformLocation(program,'uProjection'),eye:gl.getUniformLocation(program,'uEye'),time:gl.getUniformLocation(program,'uTime'),offset:gl.getUniformLocation(program,'uOffset'),wing:gl.getUniformLocation(program,'uWingPhase'),wingCenter:gl.getUniformLocation(program,'uWingCenter'),wingEnabled:gl.getUniformLocation(program,'uWingEnabled'),swordAngle:gl.getUniformLocation(program,'uSwordAngle'),swordPivot:gl.getUniformLocation(program,'uSwordPivot'),bodyRig:gl.getUniformLocation(program,'uBodyRig'),bodyPhase:gl.getUniformLocation(program,'uBodyPhase'),bodyCenter:gl.getUniformLocation(program,'uBodyCenter'),chessPiece:gl.getUniformLocation(program,'uChessPiece')};
// Returns the result to the code that called this function.
const V=[],N=[],C=[];let seed=1837;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
// color: Stores a value used by the game.
const color={marble:[0.85,0.81,0.69],ivory:[0.96,0.89,0.73],gold:[0.91,0.66,0.22],darkGold:[0.48,0.29,0.10],obsidian:[0.13,0.14,0.18],rock:[0.23,0.20,0.20],lava:[1.0,0.20,0.025],ash:[0.31,0.25,0.24],boardLight:[0.82,0.77,0.65],boardDark:[0.19,0.18,0.20],red:[0.72,0.08,0.08]};
// tri(): Runs this named part of the game when called.
function tri(a,b,c,col){let u=b.map((v,i)=>v-a[i]),v=c.map((q,i)=>q-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;n=n.map(x=>x/l);for(let p of [a,b,c]){V.push(...p);N.push(...n);C.push(...col);}}
// quad(): Runs this named part of the game when called.
function quad(a,b,c,d,col){tri(a,b,c,col);tri(a,c,d,col);}
// box(): Runs this named part of the game when called.
function box(x,y,z,w,h,d,col){let X=x+w/2,Y=y+h/2,Z=z+d/2,x0=x-w/2,y0=y-h/2,z0=z-d/2;quad([x0,y0,Z],[X,y0,Z],[X,Y,Z],[x0,Y,Z],col);quad([X,y0,z0],[x0,y0,z0],[x0,Y,z0],[X,Y,z0],col);quad([x0,y0,z0],[x0,y0,Z],[x0,Y,Z],[x0,Y,z0],col);quad([X,y0,Z],[X,y0,z0],[X,Y,z0],[X,Y,Z],col);quad([x0,Y,Z],[X,Y,Z],[X,Y,z0],[x0,Y,z0],col);quad([x0,y0,z0],[X,y0,z0],[X,y0,Z],[x0,y0,Z],col);}
// lathe(): Runs this named part of the game when called.
function lathe(x,y,z,profile,col,segments=18){for(let j=0;j<profile.length-1;j++){let [y0,r0]=profile[j],[y1,r1]=profile[j+1];for(let k=0;k<segments;k++){let a=k*2*Math.PI/segments,b=(k+1)*2*Math.PI/segments;quad([x+r0*Math.cos(a),y+y0,z+r0*Math.sin(a)],[x+r0*Math.cos(b),y+y0,z+r0*Math.sin(b)],[x+r1*Math.cos(b),y+y1,z+r1*Math.sin(b)],[x+r1*Math.cos(a),y+y1,z+r1*Math.sin(a)],col);}}}
// cylinder(): Runs this named part of the game when called.
function cylinder(x,y,z,r,h,col){lathe(x,y,z,[[0,r],[h,r]],col,16);}
// cone(): Runs this named part of the game when called.
function cone(x,y,z,r,h,col){lathe(x,y,z,[[0,r],[h,0]],col,14);}
// orb(): Runs this named part of the game when called.
function orb(x,y,z,r,col){let p=[];for(let j=0;j<=9;j++){let a=-Math.PI/2+j*Math.PI/9;p.push([r+r*Math.sin(a),Math.max(0.001,r*Math.cos(a))]);}lathe(x,y-r,z,p,col,14);}
// crystal(): Runs this named part of the game when called.
function crystal(x,y,z,r,h,col){const tip=[x,y+h,z];for(let k=0;k<6;k++){let a=k*Math.PI/3,b=(k+1)*Math.PI/3;tri([x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],tip,col);}}
// chessTower(): Runs this named part of the game when called.
function chessTower(x,z,h,team,kind='queen',scale=1){let base=team?color.obsidian:color.marble,trim=team?color.red:color.gold;let radius=1.2*scale;lathe(x,0,z,[[0,radius*1.25],[0.3*scale,radius*1.38],[0.5*scale,radius],[h*.68,radius*.65],[h*.78,radius*.84],[h*.86,radius*.7]],base);lathe(x,h*.68,z,[[0,radius*.77],[.16*scale,radius*.88],[.30*scale,radius*.73]],trim);if(kind==='rook'){cylinder(x,h*.86,z,radius*.83,.75*scale,base);for(let i=0;i<8;i++){let a=i*Math.PI/4;box(x+radius*.72*Math.cos(a),h*.86+.8*scale,z+radius*.72*Math.sin(a),.45*scale,.7*scale,.45*scale,base);}}
else if(kind==='king'){orb(x,h*.89,z,.65*scale,trim);box(x,h*.89+1.1*scale,z,.23*scale,1.3*scale,.23*scale,trim);box(x,h*.89+1.3*scale,z,.8*scale,.22*scale,.22*scale,trim);}
else if(kind==='bishop'){orb(x,h*.93,z,.75*scale,base);cone(x,h*.93+.55*scale,z,.4*scale,.95*scale,trim);}
else {cone(x,h*.85,z,radius*.9,1.25*scale,trim);orb(x,h*.85+1.3*scale,z,.32*scale,trim);}
// Broken upper sections and displaced masonry, preserving chess-piece silhouettes.
// Repeats this block for the required items or frames.
for(let i=0;i<5;i++){let a=rnd()*Math.PI*2;box(x+(radius+0.7+rnd())*Math.cos(a),.1+rnd()*.4,z+(radius+.7+rnd())*Math.sin(a),.4+rnd()*.5,.3+rnd()*.6,.4+rnd()*.5,base);}}
// island(): Builds part of the environment around the chessboard.
function island(cx,cz,rx,rz,team){let col=team?color.rock:color.marble,top=team?color.ash:color.ivory;const rings=[[-4,.15],[-2,.70],[-.4,1],[0,1.03]];for(let j=0;j<rings.length-1;j++){let [y0,s0]=rings[j],[y1,s1]=rings[j+1];for(let i=0;i<36;i++){let a=i*Math.PI/18,b=(i+1)*Math.PI/18;let rr=(i%5===0?.9:1);quad([cx+rx*s0*Math.cos(a)*rr,y0,cz+rz*s0*Math.sin(a)*rr],[cx+rx*s0*Math.cos(b),y0,cz+rz*s0*Math.sin(b)],[cx+rx*s1*Math.cos(b),y1,cz+rz*s1*Math.sin(b)],[cx+rx*s1*Math.cos(a),y1,cz+rz*s1*Math.sin(a)],col);}}for(let i=0;i<36;i++){let a=i*Math.PI/18,b=(i+1)*Math.PI/18;tri([cx,0,cz],[cx+rx*1.03*Math.cos(a),0,cz+rz*1.03*Math.sin(a)],[cx+rx*1.03*Math.cos(b),0,cz+rz*1.03*Math.sin(b)],top);}}
// The original painting's two contrasting floating regions, now independent meshes.
// White kingdom terrain and monuments are now loaded from the supplied clouds assets.
// Floating chessboard, its bevelled stone slab, and 64 actual individual squares.
// Main playable board: generate the slab and all 64 squares directly in WebGL2.
box(0, 0.52, 0, 12.65, 0.80, 12.65, color.obsidian);
box(0, 0.91, 0, 12.35, 0.09, 12.35, color.gold);
for (let row = 0; row < 8; row++) {
  for (let file = 0; file < 8; file++) {
    const x = (file - 3.5) * 1.5;
    const z = (row - 3.5) * 1.5;
    const shade = (row + file) % 2 ? color.boardDark : color.boardLight;
    box(x, 0.96, z, 1.5, 0.025, 1.5, shade);
  }
}
// Repeats this block for the required items or frames.
for(let i=0;i<4;i++){let x=i<2?-6.2:6.2,z=i%2?-6.2:6.2;for(let j=0;j<6;j++)orb(x,-.6-j*.6,z,.13,color.darkGold);}
// Distinct sculpted chess-piece silhouettes; small enough to keep the original board composition.
// piece(): Handles a chess piece or its 3D appearance.
function piece(type,x,z,team){let c=team?color.obsidian:color.ivory,t=team?color.red:color.gold,s=.46;lathe(x,1.0,z,[[0,.50*s],[.12,.56*s],[.2,.35*s],[.55,.22*s],[.72,.32*s]],c,20);lathe(x,1.02,z,[[0,.19],[.025,.20],[.05,.18]],t,20);lathe(x,1.59,z,[[0,.115],[.035,.145],[.065,.115]],t,20);// Raised metallic bands are geometry, not merely shader pixels.
 lathe(x,1.12,z,[[0,.235],[.032,.245],[.055,.235]],t,24);
 lathe(x,1.29,z,[[0,.169],[.028,.179],[.048,.169]],t,24);
 lathe(x,1.49,z,[[0,.136],[.027,.145],[.045,.136]],t,24);
// Checks a condition before running the next block.
if(type==='p')orb(x,1.80,z,.18,c);if(type==='r'){cylinder(x,1.70,z,.20,.22,c);for(let k=0;k<4;k++)box(x+Math.cos(k*Math.PI/2)*.15,1.94,z+Math.sin(k*Math.PI/2)*.15,.14,.16,.14,t);}if(type==='n'){box(x,1.79,z,.22,.39,.28,c);box(x+.10,2.05,z,.18,.16,.23,c);}if(type==='b'){orb(x,1.89,z,.24,c);cone(x,2.05,z,.16,.29,t);}if(type==='q'){cone(x,1.76,z,.28,.38,t);orb(x,2.16,z,.12,c);}if(type==='k'){orb(x,1.89,z,.22,t);box(x,2.2,z,.09,.35,.09,t);box(x,2.3,z,.27,.08,.09,t);}}
// Chess pieces are drawn only as movable actors below; no duplicate static set.

// ------------------------------------------------------------
// Second modelling pass: architectural detail, weathered terrain,
// separate sculptural features, floating masonry, and 3D atmosphere.
// All vertices below are real triangles, never a background photograph.
// ------------------------------------------------------------
// arch(): Runs this named part of the game when called.
function arch(x,y,z,w,h,depth,stone){
  // Two columns and an arched cap constructed as individual stone blocks.
  box(x-w*.42,y+h*.43,z,w*.14,h*.86,depth,stone);
  box(x+w*.42,y+h*.43,z,w*.14,h*.86,depth,stone);
  // steps: Stores a value used by the game.
  const steps=11,rad=w*.43;
  // Repeats this block for the required items or frames.
  for(let i=0;i<steps;i++){
    // a: Stores a value used by the game.
    let a=Math.PI*i/steps,b=Math.PI*(i+1)/steps,mid=(a+b)*.5;
    // px: Stores a value used by the game.
    let px=x+rad*Math.cos(mid),py=y+h*.79+rad*.53*Math.sin(mid);
    box(px,py,z,w*.115,h*.11,depth*1.1,stone);
  }
  box(x,y+h*.98,z,w*1.12,h*.13,depth*1.18,stone);
}
// decoratedDome(): Runs this named part of the game when called.
function decoratedDome(x,y,z,r,team){
  // stone: Stores a value used by the game.
  const stone=team?color.obsidian:color.marble,metal=team?color.red:color.gold;
  cylinder(x,y,z,r*1.05,.22,metal);
  lathe(x,y+.22,z,[[0,r],[r*.15,r*.99],[r*.55,r*.88],[r*.88,r*.48],[r*1.08,.03]],metal,30);
  // Repeats this block for the required items or frames.
  for(let k=0;k<12;k++){
    // a: Stores a value used by the game.
    let a=k*Math.PI/6;
    cylinder(x+r*.87*Math.cos(a),y+.13,z+r*.87*Math.sin(a),.065,r*.3,stone);
  }
  orb(x,y+r*1.37,z,.20,metal);
}
// facade(): Runs this named part of the game when called.
function facade(x,z,width,levels,team){
  // wall: Stores a value used by the game.
  const wall=team?color.obsidian:color.marble,trim=team?color.red:color.gold;
  box(x,1.3,z,width,2.6,1.5,wall);
  // Repeats this block for the required items or frames.
  for(let k=0;k<levels;k++){
    // px: Stores a value used by the game.
    let px=x-width*.39+(k+.5)*width*.78/levels;
    arch(px,.32,z+.80,width*.66/levels,1.9,.30,trim);
    box(px,1.16,z+.97,width*.30/levels,.82,.10,team?[.035,.027,.03]:[.37,.27,.13]);
  }
  // Repeats this block for the required items or frames.
  for(let k=0;k<Math.round(width*2);k++){
    // px: Stores a value used by the game.
    let px=x-width*.49+(k+.5)*width*.98/Math.round(width*2);
    box(px,2.79,z,.23,.42,1.55,wall);
  }
}
// stairs(): Runs this named part of the game when called.
function stairs(x,y,z,w,steps,team){
  // c: Stores a value used by the game.
  const c=team?color.ash:color.ivory;
  // Repeats this block for the required items or frames.
  for(let i=0;i<steps;i++)box(x,y+i*.14,z+i*.26,w-i*.15,.20,(steps-i)*.42,c);
}
// ruinedRook(): Runs this named part of the game when called.
function ruinedRook(x,y,z,r,h,team){
  // c: Stores a value used by the game.
  const c=team?color.obsidian:color.marble,t=team?color.red:color.gold;
  lathe(x,y,z,[[0,r*1.12],[.35,r*1.1],[.48,r],[h*.72,r*.83],[h*.94,r]],c,20);
  cylinder(x,y+h*.92,z,r*1.04,.27,t);
  // Repeats this block for the required items or frames.
  for(let i=0;i<10;i++){
    // Checks a condition before running the next block.
    if(i===2||i===7)continue; // visible broken crenellations
    // a: Stores a value used by the game.
    let a=i*Math.PI/5;
    box(x+r*.86*Math.cos(a),y+h+.22,z+r*.86*Math.sin(a),r*.38,.55,r*.38,c);
  }
  // Repeats this block for the required items or frames.
  for(let i=0;i<7;i++){
    // a: Stores a value used by the game.
    let a=rnd()*Math.PI*2,rr=r*(1.25+rnd());
    box(x+rr*Math.cos(a),y+.14+rnd()*.4,z+rr*Math.sin(a),.2+rnd()*.65,.25+rnd()*.45,.3+rnd()*.7,c);
  }
}
// White cathedral and old towers removed; imported frozen castle replaces them.
// Old black citadel and towers removed. Imported volcano supplies the entire kingdom.
// Jagged island cliff outcrops: irregular rocky wedges and shattered stone.
// Repeats this block for the required items or frames.
for(let side of []){
  // Repeats this block for the required items or frames.
  for(let i=0;i<70;i++){
    // a: Stores a value used by the game.
    const a=rnd()*Math.PI*2,rad=7+rnd()*6;
    // x: Stores a value used by the game.
    const x=side*17+rad*Math.cos(a),z=rad*.75*Math.sin(a);
    // c: Stores a value used by the game.
    const c=side<0?color.marble:color.rock;
    // h: Stores a value used by the game.
    const h=.4+rnd()*2.1;
    cone(x,-.9-rnd()*1.8,z,.2+rnd()*.8,h,c);
  }
}
// Board edges are included in the imported GLB.
// Old floating lava bars removed; continuous 3D lava now comes from luxury-board.js.
// Dynamic scene objects are genuine separate triangle meshes in the WebGL2 buffer.
// Each has its own draw range and animation transform; no image layers are used.
// Four heavy iron chain runs physically connect the chessboard to BOTH kingdoms.
// Individual toroidal links are true 3D triangles; chain anchors sit outside the playable squares.
// iron: Stores a value used by the game.
const iron=[.18,.19,.21],ironHighlight=[.34,.35,.37];
// chainLink(): Runs this named part of the game when called.
function chainLink(cx,cy,cz,rx,ry,rz,flip){
  // rings: Stores a value used by the game.
  const rings=12,sides=6,tube=.105;
  // Repeats this block for the required items or frames.
  for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){
    // a: Stores a value used by the game.
    const a=i*2*Math.PI/rings,b=(i+1)*2*Math.PI/rings;
    // u: Stores a value used by the game.
    const u=j*2*Math.PI/sides,v=(j+1)*2*Math.PI/sides;
    // point(): Runs this named part of the game when called.
    function point(t,q){
      // xx: Stores a value used by the game.
      const xx=(rx+tube*Math.cos(q))*Math.cos(t),yy=(ry+tube*Math.cos(q))*Math.sin(t),zz=tube*Math.sin(q);
      return flip?[cx+zz,cy+yy,cz+xx]:[cx+xx,cy+yy,cz+zz];
    }
    quad(point(a,u),point(b,u),point(b,v),point(a,v),(i+j)%5===0?ironHighlight:iron);
  }
}
// Repeats this block for the required items or frames.
for(const side of [-1,1])for(const z of [-4.9,4.9]){
  // Board anchor x=6.6; island anchor x=11.2; links hang slightly below the slab.
  box(side*6.63,.10,z,.35,.52,.55,iron);
  box(side*11.05,-.23,z,.44,.55,.65,iron);
  // n: Stores a value used by the game.
  const n=13;
  // Repeats this block for the required items or frames.
  for(let j=0;j<n;j++){
    // u: Stores a value used by the game.
    const u=(j+.5)/n,x=side*(6.75+4.15*u);
    // y: Stores a value used by the game.
    const y=-.25-.9*Math.sin(Math.PI*u);
    chainLink(x,y,z,.23,.34,0,j%2===1);
  }
}

// actors: Stores a value used by the game.
const actors=[];
// actor(): Runs this named part of the game when called.
function actor(kind,build,properties){
  // first: Stores a value used by the game.
  const first=V.length/3;build();actors.push({kind,first,count:V.length/3-first,...properties});
}
// The old triangle/cone birds have been removed.
// Real GLB guardian angels are loaded in celestial-characters.js instead.
// Chessboard lava fingers removed. Volcanic lava stays on the Black Kingdom only.
// Removed 65 original procedural clouds that obscured the white castle.
// Sparks rise from the volcanic kingdom, drifting and recycling continuously.
// Repeats this block for the required items or frames.
for(let i=0;i<44;i++){
  // x: Stores a value used by the game.
  const x=11+rnd()*21,z=-10+rnd()*19,y=.3+rnd()*3;
  // c: Stores a value used by the game.
  const c=i%3===0?[1,.52,.06]:[1,.18,.025];
  actor('ember',()=>crystal(x,y,z,.06+rnd()*.07,.12+rnd()*.20,c),{x,y,z,phase:rnd()*6.283,speed:.7+rnd()*1.6,range:2+rnd()*4});
}


// The castle shares the board's world coordinates. It is positioned BEHIND
// the playable squares, so the two angels duel above the board rather than
// cutting to a second scene. Every tower and parapet is real triangle geometry.
// castleStone: Stores a value used by the game.
const castleStone=[.31,.29,.34],castleLight=[.53,.45,.41],castleRoof=[.15,.12,.20];
box(0,2.0,-10.0,15,3.8,2.2,castleStone);
// Repeats this block for the required items or frames.
for(let k=-6;k<=6;k+=2){
  box(k,4.12,-9.05,1.15,.9,.8,castleLight);
  box(k,4.12,-10.95,1.15,.9,.8,castleLight);
}
// Repeats this block for the required items or frames.
for(let k of [-7,-3.6,0,3.6,7]){
  box(k,5,-10,1.8,7,2.0,castleStone);
  cone(k,8.5,-10,1.55,3.3,castleRoof);
  box(k,5.7,-8.92,.35,1.1,.12,[.92,.56,.17]);
}
box(0,3.0,-8.82,2.1,3.2,.14,[.12,.10,.15]);
// The central crest and castle stay in the scene during the game.
orb(0,10.4,-10,.65,[1,.72,.18]);

// Detailed procedural characters: individual face, armour, hair, feathers and sword meshes.
// All surfaces are real geometry; no reference image is drawn behind the game.
// Both heroes are women: golden White Angel and crimson Black Angel.
// Smooth procedural meshes for the female characters. These are actual triangles,
// not image billboards or a file-upload system. Their normals are analytic.
// smoothEllipsoid(): Runs this named part of the game when called.
function smoothEllipsoid(x,y,z,rx,ry,rz,col,rings=18,slices=28){
 // Repeats this block for the required items or frames.
 for(let j=0;j<rings;j++){
  // a: Stores a value used by the game.
  let a=-Math.PI/2+j*Math.PI/rings,b=-Math.PI/2+(j+1)*Math.PI/rings;
  // Repeats this block for the required items or frames.
  for(let k=0;k<slices;k++){
   // c: Stores a value used by the game.
   let c=k*2*Math.PI/slices,d=(k+1)*2*Math.PI/slices;
   // point: Stores a value used by the game.
   let point=(v,u)=>[x+rx*Math.cos(v)*Math.cos(u),y+ry*Math.sin(v),z+rz*Math.cos(v)*Math.sin(u)];
   quad(point(a,c),point(a,d),point(b,d),point(b,c),col);
  }
 }
}
// smoothCapsule(): Runs this named part of the game when called.
function smoothCapsule(x,y,z,r,h,col){
 smoothEllipsoid(x,y+h*.5,z,r,h*.5+r,r,col,12,20);
}
// angelBody(): Runs this named part of the game when called.
function angelBody(x,y,z,dark){
  // High-resolution smooth geometry for all angel facial and body spheres.
  // Keep the original proportions and animation anchor positions intact.
  // orb: Stores a value used by the game.
  const orb=(px,py,pz,r,c)=>smoothEllipsoid(px,py,pz,r,r,r,c,16,24);
  // cylinder: Stores a value used by the game.
  const cylinder=(px,py,pz,r,h,c)=>smoothCapsule(px,py,pz,r,h,c);
  // metal: Stores a value used by the game.
  const metal=dark?[.30,.095,.16]:[.83,.59,.21],bright=dark?[.73,.17,.24]:[1,.83,.39];
  // steel: Stores a value used by the game.
  const steel=dark?[.48,.51,.59]:[.81,.86,.91],cloth=dark?[.16,.055,.11]:[.89,.82,.70];
  // skin: Stores a value used by the game.
  const skin=[.77,.51,.38],shade=[.54,.32,.26],hair=dark?[.085,.055,.095]:[.16,.095,.065];
  // Neck, chin, cheekbones, ears, face and hair cap.
  cylinder(x,y+.49,z,.105,.31,skin);
  smoothEllipsoid(x,y+.94,z,.32,.41,.32,skin,22,32);
  smoothEllipsoid(x,y+.76,z+.19,.23,.18,.19,skin,16,24);
  orb(x-.32,y+.93,z,.075,skin);orb(x+.32,y+.93,z,.075,skin);
  smoothEllipsoid(x,y+1.18,z-.14,.35,.31,.35,hair,18,28);
  // Repeats this block for the required items or frames.
  for(let j=0;j<14;j++){
    // t: Stores a value used by the game.
    let t=j/13,a=Math.PI*(.12+.76*t),px=x+.32*Math.cos(a);
    // strand: Stores a value used by the game.
    let strand=dark?1.55:1.38;
    lathe(px,y+.02,z-.19,[[0,.045],[strand*.34,.065],[strand*.67,.078],[strand,.018]],hair,6);
  }
  // Brows, eyes, nose and mouth on forward (+z) side of the face.
  // Repeats this block for the required items or frames.
  for(const side of [-1,1]){
    orb(x+side*.135,y+.99,z+.309,.054,[.94,.91,.83]);
    orb(x+side*.135,y+.99,z+.355,.026,dark?[.69,.18,.19]:[.20,.29,.31]);
    box(x+side*.14,y+1.073,z+.302,.15,.022,.035,hair);
    orb(x+side*.22,y+.75,z+.23,.095,skin);
  }
  cone(x,y+.82,z+.355,.065,.14,skin);
  box(x,y+.685,z+.30,.15,.022,.023,shade);
  // Face sculpting pass: eyelids, lashes, iris glints, lips, chin and cheek highlights.
  // Repeats this block for the required items or frames.
  for(const side of [-1,1]){
    // ex: Stores a value used by the game.
    const ex=x+side*.135;
    orb(ex,y+.997,z+.375,.012,[.98,.97,.94]);
    box(ex,y+1.027,z+.347,.135,.012,.025,[.22,.12,.13]);
    // Repeats this block for the required items or frames.
    for(let k=0;k<3;k++){
      // lx: Stores a value used by the game.
      const lx=ex+side*(k-1)*.038;
      box(lx,y+1.034+k*.004,z+.348,.012,.045,.014,[.12,.08,.09]);
    }
    orb(x+side*.205,y+.785,z+.270,.065,[.84,.50,.42]);
    orb(x+side*.24,y+.925,z+.205,.044,skin);
  }
  orb(x,y+.63,z+.26,.092,skin);
  box(x,y+.707,z+.330,.15,.014,.022,[.48,.20,.22]);
  box(x,y+.682,z+.339,.115,.018,.020,[.70,.33,.34]);
  // Hairline and side-braids add shape visible from oblique camera angles.
  // Repeats this block for the required items or frames.
  for(const side of [-1,1])for(let j=0;j<5;j++){
    // bx: Stores a value used by the game.
    const bx=x+side*(.29+j*.013);
    orb(bx,y+.80-j*.13,z+.08,.082-j*.004,hair);
  }
  // Small diadem and central jewel match each side's armour palette.
  lathe(x,y+1.17,z,[[0,.342],[.04,.345],[.07,.31]],bright,22);
  orb(x,y+1.22,z+.318,.073,dark?[.95,.13,.19]:[.23,.72,.96]);
  // Female-character silhouette: gently tapered waist, shaped upper chest,
  // fitted torso plates and a separate layered armored skirt. Both sides use
  // this exact same character rig; only palette and wing colours differ.
  // Curved face-framing locks follow the cheeks and continue below shoulders.
  // Repeats this block for the required items or frames.
  for(const side of [-1,1]){
    // hx: Stores a value used by the game.
    const hx=x+side*.29;
    orb(hx,y+.72,z+.12,.12,hair);
    lathe(hx,y-.45,z+.04,[[0,.11],[.38,.105],[.78,.087],[1.10,.055]],hair,10);
    // Thin gold or crimson hair clasp at temple.
    orb(x+side*.30,y+1.10,z+.14,.065,dark?[.74,.16,.24]:[.98,.77,.28]);
  }
  // Breastplate, layered cuirass, shoulder pauldrons, waist and engraved ribs.
  lathe(x,y-.80,z,[[0,.23],[.22,.29],[.62,.38],[1.04,.30],[1.26,.19]],metal,22);
  // Two anatomically shaped, modest armor cups above a narrow waist.
  // They are metal armor, not skin or painted-on texture.
  // Repeats this block for the required items or frames.
  for(const side of [-1,1]){
    smoothEllipsoid(x+side*.19,y+.13,z+.19,.235,.20,.25,metal,16,24);
    orb(x+side*.19,y+.17,z+.41,.105,bright);
    box(x+side*.19,y-.045,z+.395,.26,.052,.065,bright);
  }
  orb(x,y-.39,z+.12,.255,metal);
  lathe(x,y-.68,z,[[0,.25],[.16,.235],[.31,.27]],bright,20);
  // Repeats this block for the required items or frames.
  for(let j=0;j<5;j++){
    // yy: Stores a value used by the game.
    let yy=y-.50+j*.16;
    lathe(x,yy,z,[[0,.28],[.035,.32],[.072,.29]],j%2?bright:metal,18);
  }
  box(x,y-.13,z+.32,.085,.65,.04,bright);
  orb(x,y+.24,z+.36,.13,bright);
  // Repeats this block for the required items or frames.
  for(const side of [-1,1]){
    orb(x+side*.38,y+.19,z,.22,bright);
    // Upper-arm plating, elbow joint and articulated gauntlet.
    cylinder(x+side*.42,y-.38,z,.13,.57,metal);
    box(x+side*.42,y-.16,z+.08,.19,.32,.12,bright);
    orb(x+side*.42,y-.44,z,.15,steel);
    cylinder(x+side*.44,y-.82,z,.105,.39,skin);
    orb(x+side*.44,y-.85,z,.13,skin);
    // Layered armored thighs and shin guards with pointed boots.
    cylinder(x+side*.19,y-1.72,z,.17,.82,cloth);
    cylinder(x+side*.19,y-2.23,z,.15,.55,metal);
    box(x+side*.19,y-2.25,z+.15,.32,.17,.52,steel);
    // Repeats this block for the required items or frames.
    for(let j=0;j<3;j++)box(x+side*.19,y-1.35+j*.17,z+.13,.34,.055,.11,bright);
  }
  // Sculpted hips and layered armored skirt create a distinctly feminine
  // fantasy-warrior silhouette without changing the animation anchors.
  // Repeats this block for the required items or frames.
  for(const side of [-1,1])smoothEllipsoid(x+side*.28,y-.89,z,.24,.29,.24,cloth,16,24);
  // Segmented skirt panels and decorative hem.
  cone(x,y-1.46,z,.54,.95,cloth);
  // Repeats this block for the required items or frames.
  for(let j=0;j<12;j++){
    // a: Stores a value used by the game.
    let a=j*Math.PI/6;
    box(x+.42*Math.cos(a),y-1.20,z+.42*Math.sin(a),.10,.44,.11,j%3?metal:bright);
  }
  // Fine etched edging at the skirt hem and a belt gemstone.
  lathe(x,y-1.63,z,[[0,.47],[.055,.48]],bright,24);
  orb(x,y-.67,z+.33,.12,dark?[.90,.14,.20]:[.30,.65,.95]);

}

// Independent sword meshes allow a true pivoted blade swing instead of translating
// the whole angel. The shader rotates these vertices around the right hand.
/**
 * PROJECT-AUTHORED / AI-ASSISTED: fantasy costume and hairstyle geometry.
 * This is an additional 3D overlay, NOT a copied character model.
 * It is anchored to the same moving angel as the user-supplied GLB.
 * Its alignment is approximate because the GLB has no animation clips.
 * Geometry helpers (smoothEllipsoid, lathe, box, tri) are defined above.
 * Technical references: MDN WebGL2 and Khronos GLSL ES 3.00;
 * URLs and provenance are listed in SOURCES_AND_ATTRIBUTION.md.
 */
// angelCostume(): Runs this named part of the game when called.
function angelCostume(x, y, z, dark) {
  // fabric: Stores a value used by the game.
  const fabric = dark ? [.16, .035, .085] : [.93, .87, .76];
  // trim: Stores a value used by the game.
  const trim = dark ? [.68, .12, .21] : [.96, .73, .29];
  // armour: Stores a value used by the game.
  const armour = dark ? [.19, .19, .25] : [.76, .60, .32];
  // hair: Stores a value used by the game.
  const hair = dark ? [.065, .038, .060] : [.34, .20, .11];

  // Hair: a smooth crown and many tapered, independently shaped locks.
  smoothEllipsoid(x, y + 1.18, z - .12, .34, .24, .30, hair, 18, 28);
  // Repeats this block for the required items or frames.
  for (let strand = 0; strand < 26; strand++) {
    // angle: Stores a value used by the game.
    const angle = (strand / 25) * Math.PI * 1.75 + .55;
    // sideX: Stores a value used by the game.
    const sideX = Math.cos(angle);
    // backZ: Stores a value used by the game.
    const backZ = Math.sin(angle);
    // startX: Stores a value used by the game.
    const startX = x + sideX * .30;
    // startZ: Stores a value used by the game.
    const startZ = z - .15 + backZ * .22;
    // length: Stores a value used by the game.
    const length = 1.05 + .25 * Math.sin(strand * 1.9);
    // endX: Stores a value used by the game.
    const endX = startX + sideX * .08;
    // endZ: Stores a value used by the game.
    const endZ = startZ - .09;
    // Each lock is a tapered mesh rather than a rectangular strip.
    tri([startX - .055, y + 1.18, startZ],
        [startX + .055, y + 1.18, startZ],
        [endX, y + 1.18 - length, endZ], hair);
    tri([startX + .055, y + 1.18, startZ],
        [endX + .035, y + .58 - length * .3, endZ + .035],
        [endX, y + 1.18 - length, endZ], hair);
  }

  // Curved breastplate and shoulder guards, with metallic edging.
  smoothEllipsoid(x, y + .02, z + .10, .39, .43, .30, armour, 16, 24);
  // Repeats this block for the required items or frames.
  for (const side of [-1, 1]) {
    smoothEllipsoid(x + side * .36, y + .18, z, .23, .15, .26, trim, 12, 18);
    box(x + side * .28, y - .34, z + .34, .075, .55, .06, trim);
  }
  box(x, y - .36, z + .39, .13, .43, .065, trim);

  // Dress: a tapered waist and twelve individually draped skirt panels.
  // This produces real geometry with a separate front/back surface.
  lathe(x, y - .78, z, [
    [0, .24], [.24, .29], [.50, .40], [.84, .61], [1.12, .73]
  ], fabric, 32);
  // Repeats this block for the required items or frames.
  for (let panel = 0; panel < 12; panel++) {
    // a: Stores a value used by the game.
    const a = panel * Math.PI / 6;
    // b: Stores a value used by the game.
    const b = a + Math.PI / 6;
    // top: Stores a value used by the game.
    const top = [x + .30 * Math.cos(a), y - .76, z + .30 * Math.sin(a)];
    // hem1: Stores a value used by the game.
    const hem1 = [x + .75 * Math.cos(a), y - 1.95, z + .75 * Math.sin(a)];
    // hem2: Stores a value used by the game.
    const hem2 = [x + .75 * Math.cos(b), y - 1.95, z + .75 * Math.sin(b)];
    tri(top, hem1, hem2, panel % 3 === 0 ? trim : fabric);
    // The metallic hem follows the bottom edge of each panel.
    tri(hem1, hem2,
        [hem1[0], hem1[1] + .045, hem1[2]], trim);
  }
  // Central belt buckle and small gemstone.
  smoothEllipsoid(x, y - .65, z + .37, .16, .14, .07,
      dark ? [.85, .10, .18] : [.18, .66, .88], 12, 18);
}

// angelSword(): Runs this named part of the game when called.
function angelSword(x,y,z,dark){
  // bright: Stores a value used by the game.
  const bright=dark?[.73,.17,.24]:[1,.83,.39];
  // steel: Stores a value used by the game.
  const steel=dark?[.48,.51,.59]:[.81,.86,.91];
  // Guard, leather-wrapped grip, pommel, crossguard, and tapering blade.
  // PROJECT-AUTHORED / AI-ASSISTED: move the hilt beside the right hand.
  // This is an approximate grip; it is NOT skeletal finger/hand attachment.
  // sx: Stores a value used by the game.
  const sx=x+.44,sz=z+.10;
  y-=.92;
  cylinder(sx,y+.08,sz,.064,.48,dark?[.15,.10,.12]:[.24,.17,.11]);
  orb(sx,y+.04,sz,.12,bright);
  box(sx,y+.56,sz,.53,.09,.16,bright);
  box(sx-.23,y+.53,sz,.08,.20,.10,steel);
  box(sx+.23,y+.53,sz,.08,.20,.10,steel);
  box(sx,y+1.25,sz,.13,1.34,.055,steel);
  box(sx,y+1.25,sz+.034,.035,1.34,.023,dark?[.98,.18,.13]:[1,.91,.58]);
  cone(sx,y+1.89,sz,.10,.38,steel);
  // Raised decorative central ridge and glowing runes along the blade.
  // Repeats this block for the required items or frames.
  for(let i=0;i<7;i++){
    // yy: Stores a value used by the game.
    let yy=y+.76+i*.17;
    box(sx,yy,sz+.061,.062,.045,.024,dark?[1,.17,.08]:[1,.91,.52]);
  }
}

// angelWings(): Runs this named part of the game when called.
function angelWings(x,y,z,dark){
  // base: Stores a value used by the game.
  const base=dark?[.18,.12,.21]:[.88,.83,.72];
  // mid: Stores a value used by the game.
  const mid=dark?[.37,.14,.23]:[.98,.94,.85];
  // edge: Stores a value used by the game.
  const edge=dark?[.76,.16,.21]:[1,.98,.91];
  // Each wing is layered: shoulder structure, long primary feathers,
  // shorter secondary feathers and tiny covert feathers.
  // Repeats this block for the required items or frames.
  for(const sign of [-1,1]){
    // Repeats this block for the required items or frames.
    for(let layer=0;layer<3;layer++){
      // amount: Stores a value used by the game.
      const amount=layer===0?19:layer===1?24:28;
      // Repeats this block for the required items or frames.
      for(let i=0;i<amount;i++){
        // t: Stores a value used by the game.
        const t=i/(amount-1),reach=.38+2.85*t;
        // rise: Stores a value used by the game.
        const rise=.63+1.15*Math.sin(t*Math.PI*.85)-.62*t;
        // zz: Stores a value used by the game.
        const zz=z-.12-layer*.08;
        // root: Stores a value used by the game.
        const root=[x+sign*(.22+reach*.78),y+.30+rise,zz];
        // shoulder: Stores a value used by the game.
        const shoulder=[x+sign*(.17+reach*.64),y+.58+rise*.78,zz-.025];
        // tip: Stores a value used by the game.
        const tip=[x+sign*(.31+reach*1.05),y+.18+rise-(.36+layer*.14)*t,zz+.05];
        tri(shoulder,root,tip,(i+layer)%4===0?edge:layer===0?base:mid);
        tri(root,[x+sign*(.30+reach*.89),y+.38+rise*.90,zz+.10],tip,layer===2?edge:base);
        // Central feather shaft and fine tapered barbs, all 3D triangles.
        // shaftRoot: Stores a value used by the game.
        const shaftRoot=[x+sign*(.21+reach*.70),y+.51+rise*.82,zz+.115];
        // shaftTip: Stores a value used by the game.
        const shaftTip=[x+sign*(.31+reach*1.045),y+.19+rise-(.35+layer*.14)*t,zz+.12];
        // vein: Stores a value used by the game.
        const vein=dark?[.52,.19,.26]:[.94,.87,.68];
        tri(shaftRoot,[shaftRoot[0]+sign*.018,shaftRoot[1]+.025,shaftRoot[2]],shaftTip,vein);
        // Checks a condition before running the next block.
        if(i%2===0)for(let k=1;k<=3;k++){
          // u: Stores a value used by the game.
          const u=k/4;
          // cx: Stores a value used by the game.
          const cx=shaftRoot[0]*(1-u)+shaftTip[0]*u;
          // cy: Stores a value used by the game.
          const cy=shaftRoot[1]*(1-u)+shaftTip[1]*u;
          // cz: Stores a value used by the game.
          const cz=shaftRoot[2]*(1-u)+shaftTip[2]*u;
          tri([cx,cy,cz],[cx+sign*.12*(1-u*.5),cy+.06,cz-.025],[cx+sign*.075,cy-.10,cz+.015],layer===2?edge:mid);
        }
      }
    }
    orb(x+sign*.35,y+.44,z-.15,.22,base);
  }
}
// Repeats this block for the required items or frames.
for(let dark of [false,true]){
  // x: Stores a value used by the game.
  const x=dark?3.4:-3.4,y=8.4,z=-2.2,side=dark?'black':'white';
  actor('angel-body',()=>angelBody(x,y,z,dark),{side,x,y,z,speed:1,phase:0});
  // PROJECT-AUTHORED / AI-ASSISTED: costume overlay on imported female mesh.
  actor('angel-costume',()=>angelCostume(x,y,z,dark),{side,x,y,z,speed:1,phase:0});
  actor('angel-wings',()=>angelWings(x,y,z,dark),{side,x,y,z,speed:1,phase:0});
  actor('angel-sword',()=>angelSword(x,y,z,dark),{side,x,y,z,speed:1,phase:0});
}

// Each starting chess piece owns a separate WebGL draw range and follows the rules engine.

// setup: Stores a value used by the game.
// Build six reusable piece meshes for each team, including promotion choices.
const pieceMeshes = {};
for (const team of ['white', 'black']) {
  for (const type of 'prnbqk') {
    const first = V.length / 3;
    piece(type, 0, 0, team === 'black');
    pieceMeshes[team + type] = {first, count: V.length / 3 - first};
  }
}
// Draw each active chess identity using its current type, including promoted pawns.
function drawChessPieces() {
  gl.uniform1f(loc.chessPiece, 1);
  gl.uniform1f(loc.wingEnabled, 0);
  gl.uniform1f(loc.bodyRig, 0);
  gl.uniform1f(loc.swordAngle, 0);
  for (const target of Object.values(ChessGame.actorPositions)) {
    const mesh = pieceMeshes[target.team + target.type];
    gl.uniform3f(loc.offset, (target.file - 3.5) * 1.5, 0,
      (target.row - 3.5) * 1.5);
    gl.drawArrays(gl.TRIANGLES, mesh.first, mesh.count);
  }
  gl.uniform1f(loc.chessPiece, 0);
}
// Small translucent-looking golden move markers above the physical board.
// markerFirst: Stores a value used by the game.
const markerFirst=V.length/3;
// Repeats this block for the required items or frames.
for(const [ax,az,bx,bz] of [[-.22,-.22,.22,-.22],[.22,-.22,.22,.22],[.22,.22,-.22,.22],[-.22,.22,-.22,-.22]]){
 box((ax+bx)/2,0,(az+bz)/2,Math.abs(ax-bx)+.06,.035,Math.abs(az-bz)+.06,color.gold);
}
// markerCount: Stores a value used by the game.
const markerCount=V.length/3-markerFirst;
// Preallocate genuine 3D shards in the same WebGL buffer. Each capture receives
// its own independent fragments; their draw ranges remain available until reset.
// shardActors: Stores a value used by the game.
const shardActors=[];
// Repeats this block for the required items or frames.
for(let capture=0;capture<32;capture++)for(let j=0;j<18;j++){
  // first: Stores a value used by the game.
  const first=V.length/3, angle=j*2.399963+capture*.41;
  // shade: Stores a value used by the game.
  const shade=j%3===0?color.gold:j%3===1?color.marble:color.obsidian;
  // sz: Stores a value used by the game.
  const sz=.075+(j%5)*.024;
  // Tetrahedral broken-stone chunk, centred on the origin.
  // points: Stores a value used by the game.
  const points=[[0,sz,0],[-sz,-sz,-sz*.5],[sz*.8,-sz,-sz*.3],[0,-sz,sz]];
  // Repeats this block for the required items or frames.
  for(const face of [[0,1,2],[0,2,3],[0,3,1],[1,3,2]]){
    // a: Stores a value used by the game.
    const a=points[face[0]],b=points[face[1]],c=points[face[2]];
    tri(a,b,c,shade);
  }
  shardActors.push({capture,j,first,count:V.length/3-first,angle});
}
// debris: Stores a value used by the game.
const debris=[]; // one record per completed capture, retained through the whole game
// Submit a single interleaved vertex buffer; normal vectors are face normals.
// count: Stores a value used by the game.
const count=V.length/3,buffer=gl.createBuffer(),packed=new Float32Array(count*9);for(let i=0;i<count;i++){packed.set(V.slice(i*3,i*3+3),i*9);packed.set(N.slice(i*3,i*3+3),i*9+3);packed.set(C.slice(i*3,i*3+3),i*9+6);}gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,packed,gl.STATIC_DRAW);for(let [attr,offset] of [[loc.p,0],[loc.n,3],[loc.c,6]]){gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,36,offset*4);}gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
// Create a small repeatable stone texture without external image dependencies.
const stoneTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, stoneTexture);
const stonePixels = new Uint8Array(64 * 64);
for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) {
    stonePixels[y * 64 + x] = Math.round(128 + 70 * Math.sin(x * Math.PI / 8 + 2 * Math.sin(y * Math.PI / 16)));
  }
}
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 64, 64, 0, gl.RED, gl.UNSIGNED_BYTE, stonePixels);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.generateMipmap(gl.TEXTURE_2D);
gl.uniform1i(gl.getUniformLocation(program, 'uStoneTexture'), 0);
// norm(): Runs this named part of the game when called.
function norm(v){let l=Math.hypot(...v)||1;return v.map(x=>x/l);}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0);}function matmul(a,b){let m=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)m[c*4+r]+=a[k*4+r]*b[c*4+k];return m;}
// camera(): Controls how the player views the 3D world.
function camera(eye,target){let z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
// Returns the result to the code that called this function.
function perspective(fov,aspect,near,far){let f=1/Math.tan(fov/2);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
// yaw: Stores a value used by the game.
let yaw=.05,pitch=.50,zoom=47,drag=false,px=0,py=0,moving=true,elapsed=0,last=0;
// phase: Stores a value used by the game.
let phase='intro',phaseTime=0,winner='white';let pendingCapture=null;let finishReset=false;
// story: Stores a value used by the game.
const story=document.querySelector('#story');
// setPhase(): Runs this named part of the game when called.
function setPhase(next,side='white'){
 phase=next;phaseTime=0;winner=side;
 // Checks a condition before running the next block.
 if(story)story.textContent=next==='intro'?'Opening duel — the angels clash above the chessboard':next==='game'?'Chess battlefield — both angels guard their kingdoms':next==='capture'?(side==='white'?'White':'Black')+' angel attacks a chess piece':next==='ending'?(side==='draw'?'Draw — neither angel wins':side==='white'?'White angel wins — dark angel bows':'Black angel wins — white angel bows'):'A new war begins';
}
setPhase('intro');
// draw(): Prepares or draws geometry on the screen.
function draw(now){let dt=Math.min(.05,(now-last)/1000||0);last=now;if(moving){elapsed+=dt;phaseTime+=dt;
 // Checks a condition before running the next block.
 if(phase==='intro'&&phaseTime>8)setPhase('game');
 // Checks a condition before running the next block.
 if(phase==='capture'&&phaseTime>3.3){pendingCapture=null;setPhase('game');}
 // Checks a condition before running the next block.
 if(phase==='ending'&&phaseTime>10){if(finishReset){ChessGame.restart();finishReset=false;}setPhase('intro');}
 }let w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(2,devicePixelRatio||1);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=w*dpr;canvas.height=h*dpr;gl.viewport(0,0,canvas.width,canvas.height);}gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);let a=yaw+(moving?Math.sin(elapsed*.15)*.018:0);let eye=[zoom*Math.sin(a)*Math.cos(pitch),zoom*Math.sin(pitch),zoom*Math.cos(a)*Math.cos(pitch)];gl.uniformMatrix4fv(loc.view,false,camera(eye,[0,1,0]));gl.uniformMatrix4fv(loc.projection,false,perspective(.83,w/h,.1,160));gl.uniform3fv(loc.eye,eye);gl.uniform1f(loc.time,elapsed);// Static world stays fixed; moving actors get independent world offsets.
// staticCount: Stores a value used by the game.
const staticCount=actors.length?actors[0].first:count;
gl.uniform3f(loc.offset,0,0,0);gl.uniform1f(loc.wingEnabled,0);gl.uniform1f(loc.bodyRig,0);gl.uniform1f(loc.bodyRig,0);gl.uniform1f(loc.swordAngle,0);gl.uniform3f(loc.swordPivot,0,0,0);
gl.uniform1f(loc.chessPiece,0);
gl.drawArrays(gl.TRIANGLES,0,staticCount);
// realAngelOrigins: Stores a value used by the game.
const realAngelOrigins={};
// Repeats this block for the required items or frames.
for(const actor of actors){
  // t: Stores a value used by the game.
  const t=elapsed*actor.speed+actor.phase;
  // dx: Stores a value used by the game.
  let dx=0,dy=0,dz=0;
  gl.uniform1f(loc.bodyRig,0);
  // Checks a condition before running the next block.
  if(actor.kind==='chess-piece'){
    // target: Stores a value used by the game.
    const target=ChessGame.actorPositions[actor.id];
    // Checks a condition before running the next block.
    if(!target){dy=-300;}else{dx=(target.file-(actor.id%8))*1.5;dz=(target.row-Math.floor(actor.id/8))*1.5;}
    gl.uniform1f(loc.wingEnabled,0);
  }else if(actor.kind==='angel-body'||actor.kind==='angel-costume'||actor.kind==='angel-wings'||actor.kind==='angel-sword'){
    // white: Stores a value used by the game.
    const white=actor.side==='white',sign=white?-1:1;
    // Shared central stage above the board; no cutaway location.
    // Checks a condition before running the next block.
    if(phase==='intro'){
      // clash: Stores a value used by the game.
      const clash=Math.min(1,phaseTime/2.2);
      dx=-sign*clash*2.8+Math.sin(phaseTime*5)*.20;
      dy=-2.6*clash+Math.sin(phaseTime*3)*.33;
      dz=Math.sin(phaseTime*2)*.25;
    }else if(phase==='capture'){
      // attacking: Stores a value used by the game.
      const attacking=(winner===actor.side);
      // swing: Stores a value used by the game.
      const swing=Math.sin(Math.min(1,phaseTime/3.3)*Math.PI);
      dx=attacking&&pendingCapture?((pendingCapture.file-3.5)*1.5-actor.x)*swing:sign*.5*swing;
      dy=attacking?-5.8*swing:Math.sin(elapsed*2)*.18;
      dz=attacking&&pendingCapture?((pendingCapture.row-3.5)*1.5-actor.z)*swing:0;
    }else if(phase==='ending'){
      // win: Stores a value used by the game.
      const win=winner===actor.side;
      // approach: Stores a value used by the game.
      const approach=Math.min(1,phaseTime/3);
      dx=-sign*2.65*approach+(phaseTime>4&&!win?sign*1.1:0);
      dy=-2.8*approach+(phaseTime>5?(win?1.0:-2.2):Math.sin(phaseTime*3)*.2);
      dz=0;
    }else{
      // Patrol the central board in opposite arcs, wings flapping throughout.
      // orbit: Controls how the player views the 3D world.
      const orbit=elapsed*.24+(white?Math.PI:0);
      // targetX: Stores a value used by the game.
      const targetX=5.0*Math.cos(orbit),targetZ=4.7*Math.sin(orbit);
      dx=targetX-actor.x;dz=targetZ-actor.z;
      dy=1.0+Math.sin(elapsed*2.2)*.28;
    }
    // Checks a condition before running the next block.
    if(actor.kind==='angel-body')realAngelOrigins[actor.side]=[actor.x+dx,actor.y+dy-1.1,actor.z+dz];
    // Head, breathing and arm articulation continue during patrol and combat.
    gl.uniform1f(loc.bodyRig,actor.kind==='angel-body'?1:0);
    gl.uniform1f(loc.bodyPhase,elapsed*(phase==='game'?1:2.1));
    gl.uniform3f(loc.bodyCenter,actor.x,actor.y,actor.z);
    // During intro the blades clash, during capture the attacking angel
    // delivers one overhead strike, and the ending resumes the same duel.
    // swordAngle: Stores a value used by the game.
    let swordAngle=0;
    // Checks a condition before running the next block.
    if(actor.kind==='angel-sword'){
      // Checks a condition before running the next block.
      if(phase==='intro')swordAngle=.70*Math.sin(phaseTime*5.4+(white?0:Math.PI));
      else if(phase==='capture'&&winner===actor.side){
        // hit: Stores a value used by the game.
        const hit=Math.max(0,1-Math.abs(phaseTime-1.65)/.65);
        swordAngle=-1.35*Math.sin(hit*Math.PI*.5);
      }else if(phase==='ending'){
        // win: Stores a value used by the game.
        const win=winner===actor.side;
        swordAngle=phaseTime<4?.65*Math.sin(phaseTime*5+(white?0:Math.PI)):(win?-.45:.95);
      }else swordAngle=.10*Math.sin(elapsed*1.8);
    }
    gl.uniform1f(loc.swordAngle,swordAngle);
    gl.uniform3f(loc.swordPivot,actor.x+.44,actor.y-.82,actor.z+.10);
    gl.uniform1f(loc.wingEnabled,actor.kind==='angel-wings'?1:0);
    gl.uniform1f(loc.wing,elapsed*5.5);
    gl.uniform3f(loc.wingCenter,actor.x,actor.y,actor.z);
  }else{
    gl.uniform1f(loc.wingEnabled,0);
    // Checks a condition before running the next block.
    if(actor.kind==='cloud'){
      dx=Math.sin(t)*actor.range;dy=Math.cos(t*.73)*.12;
    }else{
      // rise: Stores a value used by the game.
      const rise=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI*2);
      dy=rise*actor.range;
      dx=Math.sin(t*1.9)*.4;
      dz=Math.cos(t*1.3)*.3;
    }
  }
  // Checks a condition before running the next block.
  if(actor.kind!=='angel-sword')gl.uniform1f(loc.swordAngle,0);
  gl.uniform3f(loc.offset,dx,dy,dz);
  // Hide the original procedural angels only when BOTH real models are loaded.
  // Until then, the original figures remain as a visual fallback.
  // Imported characters replace procedural angels unconditionally.
  // Never silently show block figures when character loading fails.
  // replacingAngel: Stores a value used by the game.
  const replacingAngel = ['angel-body', 'angel-costume', 'angel-wings', 'angel-sword'].includes(actor.kind);
  // Checks a condition before running the next block.
  if (!replacingAngel) {
    // Material tag: the fragment shader textures pieces independently of the board.
    gl.uniform1f(loc.chessPiece, actor.kind === 'chess-piece' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, actor.first, actor.count);
  }
}
drawChessPieces();
// CHARACTER SYNC: publish the exact camera and angel world positions used
// by the original custom WebGL2 scene. The optional character layer reads
// this data and renders the two imported female models at matching locations.
// Integration code written for this project; no game input is intercepted.
window.CelestialChessActorPositions = ChessGame.actorPositions;
window.CelestialSceneState = {
  eye: eye.slice(),
  target: [0, 1, 0],
  fovRadians: 0.83,
  origins: realAngelOrigins,
  elapsed,
  phase,
  phaseTime,
  winner,
  moving
};
gl.uniform1f(loc.swordAngle,0);
gl.uniform1f(loc.chessPiece,0);
// Show legal target markers directly on the single 3D board.
// hl: Stores a value used by the game.
const hl=ChessGame.highlights();
// Repeats this block for the required items or frames.
for(const i of hl.targets){
 gl.uniform1f(loc.wingEnabled,0);
 gl.uniform3f(loc.offset,((i%8)-3.5)*1.5,1.045,((i>>3)-3.5)*1.5);
 gl.drawArrays(gl.TRIANGLES,markerFirst,markerCount);
}
// Render accumulated captured-piece fragments on the one physical chessboard.
// Each fragment settles at y~1.03 and stays until New Game or the final reset.
// Repeats this block for the required items or frames.
for(const d of debris){
 // age: Stores a value used by the game.
 const age=Math.max(0,elapsed-d.born);
 // Repeats this block for the required items or frames.
 for(let j=0;j<18;j++){
  // shard: Stores a value used by the game.
  const shard=shardActors[d.slot*18+j];
  // a: Stores a value used by the game.
  const a=shard.angle,spread=.12+(j%7)*.075;
  // t: Stores a value used by the game.
  const t=Math.min(1,age/1.35);
  // bounce: Stores a value used by the game.
  const bounce=Math.abs(Math.sin(age*10+j))*.32*Math.exp(-age*4);
  // x: Stores a value used by the game.
  const x=(d.file-3.5)*1.5+Math.cos(a)*spread*t;
  // z: Stores a value used by the game.
  const z=(d.row-3.5)*1.5+Math.sin(a)*spread*t;
  // y: Stores a value used by the game.
  const y=1.09+(1-t)*1.1+bounce;
  gl.uniform3f(loc.offset,x,y,z);
  gl.drawArrays(gl.TRIANGLES,shard.first,shard.count);
 }
}
gl.uniform3f(loc.offset,0,0,0);gl.uniform1f(loc.wingEnabled,0);gl.uniform1f(loc.bodyRig,0);
requestAnimationFrame(draw);}requestAnimationFrame(draw);
// squareFromPointer(): Runs this named part of the game when called.
function squareFromPointer(e){
 // rect: Stores a value used by the game.
 const rect=canvas.getBoundingClientRect(),nx=((e.clientX-rect.left)/rect.width)*2-1,ny=1-((e.clientY-rect.top)/rect.height)*2;
 // a: Stores a value used by the game.
 const a=yaw+(moving?Math.sin(elapsed*.15)*.018:0);
 // eye: Stores a value used by the game.
 const eye=[zoom*Math.sin(a)*Math.cos(pitch),zoom*Math.sin(pitch),zoom*Math.cos(a)*Math.cos(pitch)];
 // forward: Stores a value used by the game.
 const forward=norm([-eye[0],1-eye[1],-eye[2]]),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
 // aspect: Stores a value used by the game.
 const aspect=rect.width/rect.height,scale=Math.tan(.83/2);
 // ray: Stores a value used by the game.
 const ray=norm(forward.map((v,i)=>v+right[i]*nx*scale*aspect+up[i]*ny*scale));
 // Returns the result to the code that called this function.
 if(Math.abs(ray[1])<.00001)return -1;
 // Returns the result to the code that called this function.
 const t=(0.9725-eye[1])/ray[1];if(t<=0)return -1;
 // x: Stores a value used by the game.
 const x=eye[0]+ray[0]*t,z=eye[2]+ray[2]*t;
 // file: Stores a value used by the game.
 const file=Math.floor((x+6)/1.5),row=Math.floor((z+6)/1.5);
 return file>=0&&file<8&&row>=0&&row<8?row*8+file:-1;
}
// pointerStart: Stores a value used by the game.
let pointerStart=null;
canvas.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;py=e.clientY;pointerStart={x:px,y:py,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointerup',e=>{drag=false;if(pointerStart&&!pointerStart.moved){const i=squareFromPointer(e);if(i>=0)ChessGame.selectSquare(i);}pointerStart=null;});canvas.addEventListener('pointermove',e=>{if(!drag)return;if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)pointerStart.moved=true;yaw+=(e.clientX-px)*.005;pitch=Math.max(.15,Math.min(1.35,pitch+(e.clientY-py)*.004));px=e.clientX;py=e.clientY;});canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(20,Math.min(95,zoom*Math.exp(e.deltaY*.001)));},{passive:false});function reset(){yaw=.05;pitch=.50;zoom=47;}document.querySelector('#reset').onclick=reset;document.querySelector('#motion').onclick=e=>{moving=!moving;e.target.textContent=moving?'Pause motion':'Resume motion';};addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r')reset();});document.querySelector('#status').textContent=`${count.toLocaleString()} vertices · custom WebGL2 · GLB kingdom guardians, clouds and embers · custom WebGL2`;

// No manual capture/victory/draw buttons: sequences are driven by actual chess events.
document.querySelector('#intro').onclick=()=>setPhase('intro');

// Chess integration: the 2D selection panel and 3D meshes share one authoritative game state.
ChessGame.onCapture=(side,target,piece,ply)=>{
 pendingCapture=target;
 // Checks a condition before running the next block.
 if(debris.length<32)debris.push({row:target.row,file:target.file,piece,ply,slot:debris.length,born:elapsed});
 setPhase('capture',side);
};
ChessGame.onUndo=ply=>{const i=debris.findIndex(d=>d.ply===ply);if(i>=0){debris.splice(i,1);debris.forEach((d,j)=>d.slot=j);}pendingCapture=null;setPhase('game');};
ChessGame.onRestart=()=>{debris.length=0;pendingCapture=null;finishReset=false;};
ChessGame.onEnd=side=>{finishReset=true;setPhase('ending',side);};
ChessGame.onMove=()=>{if(phase==='intro')setPhase('game');};
