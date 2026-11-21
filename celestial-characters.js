/*
 * ANGEL'S CHESS WAR
 * Student: Shekin David Raj
 * File: celestial-characters.js
 * Purpose: Three.js character models, guardian animation, and character integration.
 * Existing functionality is preserved; imported assets belong to their credited creators.
 */

// READABILITY NOTES: Comments explain the existing code; the game logic is unchanged.
/**
 * TWO FEMALE ANGEL WARRIORS — optional advanced character renderer.
 *
 * ORIGINAL PROJECT CODE: The chess engine, camera, board and castles are
 * implemented separately in main.js and chess.js with custom WebGL2/GLSL.
 *
 * ADAPTED PROJECT CODE: Character-loading structure was adapted from the
 * user-provided celestial_sisters_webgl(1).zip. The wing meshes, swords,
 * hand attachments, character animation and colour treatment below are
 * newly written for Angel's Chess War (AI-assisted; review for coursework).
 *
 * EXTERNAL LIBRARY (not our code): Three.js GLTFLoader and AnimationMixer.
 * https://threejs.org/docs/#examples/en/loaders/GLTFLoader
 * https://threejs.org/docs/#api/en/animation/AnimationMixer
 * MIT license: https://github.com/mrdoob/three.js/blob/master/LICENSE
 *
 * EXTERNAL ART INSPIRATION (NOT included, downloaded, or copied):
 * Celestara - Guardian of Light by Ar3Designer, Sketchfab
 * https://sketchfab.com/3d-models/celestara-guardian-of-light-3e85be6b36014c81a5f50fe6536c5e06
 * Its embedded viewer is not source code or permission to reuse its mesh.
 *
 * ACTUAL MAIN CHARACTER ASSET: models/pieta_cinematic_wings.glb,
 * supplied by the user. See SOURCES_AND_ATTRIBUTION.md for attribution.
 *
 * The transparent character layer has an independent depth buffer; character
 * occlusion against the original board is approximate. No upload UI exists.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinnedModel } from 'three/addons/utils/SkeletonUtils.js';

// canvas: Stores a value used by the game.
const canvas = document.createElement('canvas');
canvas.id = 'celestialCharacterLayer';
canvas.setAttribute('aria-hidden', 'true');
Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '1'
});
document.body.appendChild(canvas);

// scene: Stores a value used by the game.
const scene = new THREE.Scene();
// camera: Controls how the player views the 3D world.
const camera = new THREE.PerspectiveCamera(47.55, 1, 0.1, 160);
// renderer: Stores a value used by the game.
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.85; // Brighten imported GLB details.
renderer.shadowMap.enabled = false; // Avoid dark self-shadowing on imported angels.
scene.add(new THREE.HemisphereLight(0xffffff, 0xc5b7ac, 3.2));
scene.add(new THREE.AmbientLight(0xffffff, 1.35));
// keyLight: Stores a value used by the game.
const keyLight = new THREE.DirectionalLight(0xfff5e6, 4.2);
keyLight.position.set(-5, 10, 7);
scene.add(keyLight);
// edgeLight: Stores a value used by the game.
const edgeLight = new THREE.DirectionalLight(0xc9d9ff, 2.5);
edgeLight.position.set(5, 6, -6);
scene.add(edgeLight);

// Both angels use ONE identical female base mesh and outfit.
// Source: user-supplied celestial_sisters_webgl(1).zip, warrior_two.glb.
// The same model is loaded twice; only colours, hair, wings and swords differ.
// specifications: Stores a value used by the game.
const specifications = [
    {
        side: 'white',
        file: 'models/pieta_cinematic_wings.glb',
        feather: 0xfaf8f5,       // Ivory-white inner feathers
        featherShade: 0xe8d5aa,  // Warm golden feather tips
        trim: 0xeacb7a,
        blade: 0xffe9aa
    },
    {
        side: 'black',
        file: 'models/pieta_cinematic_wings.glb',
        feather: 0x100d16,       // Near-black feathers, never cream/white
        featherShade: 0x9e142f,  // Deep crimson outer feather accents
        trim: 0x8b2637,
        blade: 0xff4657
    }
];
// characters: Stores a value used by the game.
const characters = new Map();

// Walking guardians removed. Only the two main angel warriors remain.
// loader: Stores a value used by the game.
const loader = new GLTFLoader();
// clock: Stores a value used by the game.
const clock = new THREE.Clock();
window.CelestialAngels = { ready: false, loaded: 0, total: 2, errors: [], modelInfo: {} };
// Explicit status for missing dependencies or model errors (not a file uploader).
// loadingNotice: Stores a value used by the game.
const loadingNotice = document.createElement('div');
loadingNotice.id = 'characterLoadingStatus';
loadingNotice.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:9999;background:#19131de8;color:white;padding:12px 18px;border:1px solid #d2a65e;border-radius:8px;font:14px system-ui;max-width:75vw;text-align:center;pointer-events:none';
loadingNotice.textContent = 'Loading realistic female warriors (0/2). Large model files may take a minute…';
document.body.appendChild(loadingNotice);

/** Newly written geometry: a pointed, tapered feather, not a block or sphere. */
// makeFeatherGeometry(): Runs this named part of the game when called.
function makeFeatherGeometry() {
    // vertices: Stores a value used by the game.
    const vertices = new Float32Array([
        0, 0, 0,    -0.095, 0.30, 0.018,    0, 0.52, 0.035,
        0, 0, 0,     0, 0.52, 0.035,       0.095, 0.30, 0.018,
        -0.095, 0.30, 0.018,  -0.065, 0.37, -0.015, 0, 0.52, 0.035,
        0.095, 0.30, 0.018,  0, 0.52, 0.035, 0.065, 0.37, -0.015
    ]);
    // geometry: Stores a value used by the game.
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
}

/** Newly written: two feathered wings, with articulated outer-feather groups. */
// createWings(): Runs this named part of the game when called.
function createWings(spec) {
    // Each wing pivots from the upper back and its feathers extend outward.
    // All dimensions are local to the normalized 2.35-unit-tall character.
    // root: Stores a value used by the game.
    const root = new THREE.Group();
    // halves: Stores a value used by the game.
    const halves = [];
    // featherGeometry: Stores a value used by the game.
    const featherGeometry = makeFeatherGeometry();
    // NEW: material progression from wing root to feather tips.
    // Dark angel: black roots -> oxblood -> crimson highlights.
    // White angel: ivory roots -> pearl -> soft gold tips.
    // This palette is deliberately independent of the imported GLB textures.
    // Design source: user's angel figurine images and written wing specification.
    // wingColors: Stores a value used by the game.
    const wingColors = spec.side === 'black'
        ? [0x0b0b11, 0x17111b, 0x2d1020, 0x641126, 0xa91b36]
        : [0xfaf8f5, 0xf4f0e8, 0xeee6d7, 0xe5d6b9, 0xd4b677];

    // featherMaterials: Stores a value used by the game.
    const featherMaterials = wingColors.map((color, index) =>
        new THREE.MeshStandardMaterial({
            name: `${spec.side}-feather-layer-${index}`,
            color,
            side: THREE.DoubleSide,
            roughness: 0.78,
            metalness: 0.0,
            emissive: spec.side === 'black' && index === 4
                ? 0x260009 : 0x000000,
            emissiveIntensity: spec.side === 'black' ? 0.15 : 0.0
        })
    );
    // jointMaterial: Stores a value used by the game.
    const jointMaterial = new THREE.MeshStandardMaterial({
        name: `${spec.side}-wing-shoulder-joint`,
        color: spec.side === 'black' ? 0x171019 : 0xe8d7a9,
        metalness: 0.45,
        roughness: 0.38
    });
    // Repeats this block for the required items or frames.
    for (const sign of [-1, 1]) {
        // half: Stores a value used by the game.
        const half = new THREE.Group();
        half.userData.sign = sign;
        half.position.set(sign * 0.16, 0, -0.015);
        // The base of the wing is continuous with the shoulder blades.
        // base: Stores a value used by the game.
        const base = new THREE.Mesh(
            new THREE.SphereGeometry(0.17, 14, 10),
            jointMaterial
        );
        base.scale.set(1.15, 0.65, 0.38);
        half.add(base);
        // Repeats this block for the required items or frames.
        for (let layer = 0; layer < 5; layer++) {
            // Repeats this block for the required items or frames.
            for (let i = 0; i < 28; i++) {
                // t: Stores a value used by the game.
                const t = i / 27;
                // feather: Stores a value used by the game.
                const feather = new THREE.Mesh(
                    featherGeometry,
                    featherMaterials[layer]
                );
                // Feather origins progress from the shoulder to the wing tip.
                feather.position.set(
                    sign * (0.08 + 1.32 * t),
                    0.12 + 0.48 * (1 - t) - layer * 0.047,
                    -0.015 - layer * 0.025
                );
                feather.scale.set(
                    0.72 + layer * 0.08,
                    1.0 + t * 0.85 + layer * 0.12,
                    1
                );
                // Point feather tips away from the spine, not above the head.
                // Each successive layer is a distinct dark-to-crimson or ivory-to-gold shade.
                feather.rotation.z = sign * (-1.12 - 0.20 * t);
                half.add(feather);
            }
        }
        root.add(half);
        halves.push(half);
    }
    return { root, halves };
}

/** Newly written: sword geometry; handle is placed at the right hand. */
// createSword(): Runs this named part of the game when called.
function createSword(spec) {
    // sword: Stores a value used by the game.
    const sword = new THREE.Group();
    // steel: Stores a value used by the game.
    const steel = new THREE.MeshStandardMaterial({
        color: spec.blade, metalness: 0.88, roughness: 0.19,
        emissive: spec.side === 'black' ? 0x5b0b15 : 0x33240b,
        emissiveIntensity: 0.45
    });
    // gold: Stores a value used by the game.
    const gold = new THREE.MeshStandardMaterial({
        color: spec.trim, metalness: 0.82, roughness: 0.28
    });
    // leather: Stores a value used by the game.
    const leather = new THREE.MeshStandardMaterial({
        color: 0x211820, roughness: 0.82
    });
    // blade: Stores a value used by the game.
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.095, 1.13, 0.036), steel);
    blade.position.y = 0.73;
    sword.add(blade);
    // tip: Stores a value used by the game.
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.20, 4), steel);
    tip.position.y = 1.39;
    tip.rotation.y = Math.PI / 4;
    sword.add(tip);
    // grip: Stores a value used by the game.
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.048, 0.34, 10), leather);
    grip.position.y = -0.07;
    sword.add(grip);
    // crossguard: Stores a value used by the game.
    const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.075, 0.12), gold);
    crossguard.position.y = 0.14;
    sword.add(crossguard);
    // pommel: Stores a value used by the game.
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), gold);
    pommel.position.y = -0.26;
    sword.add(pommel);
    return sword;
}

/**
 * ORIGINAL CUSTOMIZATION CODE: procedural hair added over the shared GLB.
 * It changes only the hairstyle, not the face, body or dress mesh.
 */
// addHairstyle(): Runs this named part of the game when called.
function addHairstyle(holder, side) {
    // dark: Stores a value used by the game.
    const dark = side === 'black';
    // material: Controls the surface appearance of an object.
    const material = new THREE.MeshStandardMaterial({
        color: dark ? 0x170d19 : 0xd7a56a,
        roughness: 0.89,
        metalness: 0.03
    });
    // group: Stores a value used by the game.
    const group = new THREE.Group();
    // Long loose hair for the heavenly angel, tied-back locks for dark angel.
    // locks: Stores a value used by the game.
    const locks = dark ? 8 : 14;
    // Repeats this block for the required items or frames.
    for (let i = 0; i < locks; i++) {
        // theta: Stores a value used by the game.
        const theta = (i / locks) * Math.PI * 1.55 + Math.PI * 0.72;
        // strand: Stores a value used by the game.
        const strand = new THREE.Mesh(
            new THREE.CapsuleGeometry(dark ? 0.038 : 0.048,
                dark ? 0.42 : 0.65, 4, 8),
            material
        );
        strand.position.set(
            0.14 * Math.cos(theta),
            dark ? 1.87 : 1.72,
            -0.045 + 0.13 * Math.sin(theta)
        );
        strand.rotation.z = 0.16 * Math.cos(theta);
        group.add(strand);
    }
    holder.add(group);
}

/**
 * LEGACY UNUSED CODE — overlapping costume geometry (NOT CALLED).
 * This is an additional fitted ceremonial overskirt, not a replacement for
 * the licensed GLB body. Its material is deliberately opaque so the white
 * angel actually appears white instead of inheriting dark texture colours.
 * SOURCE: newly authored procedural Three.js geometry (AI-assisted).
 */
// addCeremonialDress(): Runs this named part of the game when called.
function addCeremonialDress(holder, side) {
    // REFERENCE: two user-supplied angel figurine photographs, Nov 9 2026.
    // Newly authored procedural overlay; no source mesh or code copied from
    // the reference photos. Same geometry for both female warriors.
    // IMPORTANT: The reference has an open midriff, plated bodice, hip tassets,
    // ornate thigh-high greaves, long silk hip sashes, and NO bell-shaped skirt.
    // light: Controls lighting or celestial objects in the scene.
    const light = side === 'white';
    // primary: Stores a value used by the game.
    const primary = new THREE.MeshStandardMaterial({
        color: light ? 0xf9f5ed : 0x11121a,
        roughness: 0.48,
        metalness: 0.15,
        side: THREE.DoubleSide
    });
    // trim: Stores a value used by the game.
    const trim = new THREE.MeshStandardMaterial({
        color: light ? 0xe9c568 : 0x55202e,
        metalness: 0.88,
        roughness: 0.22,
        side: THREE.DoubleSide
    });
    // edge: Stores a value used by the game.
    const edge = new THREE.MeshStandardMaterial({
        color: light ? 0xffe7a0 : 0x9ca3b8,
        metalness: 0.92,
        roughness: 0.17,
        side: THREE.DoubleSide
    });
    // gemColors: Stores a value used by the game.
    const gemColors = light
        ? [0xf8e7b0, 0xffffff, 0x7bb9ed]
        : [0xe82b4c, 0x3579e8, 0x27bb82, 0xf2cf4c, 0xe8e8ff];
    // gems: Stores a value used by the game.
    const gems = gemColors.map((color) => new THREE.MeshPhysicalMaterial({
        color, roughness: 0.08, metalness: 0.05,
        clearcoat: 1, clearcoatRoughness: 0.04
    }));
    // outfit: Stores a value used by the game.
    const outfit = new THREE.Group();

    // plate(): Runs this named part of the game when called.
    function plate(name, position, scale, material = trim, detail = 1) {
        // mesh: Prepares or draws geometry on the screen.
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), material);
        mesh.name = name;
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        mesh.rotation.z = detail * 0.06;
        outfit.add(mesh);
        return mesh;
    }
    // jewel(): Runs this named part of the game when called.
    function jewel(x, y, z, radius, index) {
        // stone: Stores a value used by the game.
        const stone = new THREE.Mesh(
            new THREE.OctahedronGeometry(radius, 0),
            gems[index % gems.length]
        );
        stone.name = 'faceted-gemstone';
        stone.position.set(x, y, z);
        stone.rotation.y = Math.PI / 4;
        outfit.add(stone);
    }

    // Ornate sculpted breastplate, leaving the midriff uncovered like the
    // reference figurines. Gold/white and black/diamond share one silhouette.
    // Repeats this block for the required items or frames.
    for (const sign of [-1, 1]) {
        plate('curved-breastplate', [sign * 0.115, 1.69, 0.155],
              [0.138, 0.105, 0.075], trim, sign);
        plate('breastplate-inlay', [sign * 0.115, 1.704, 0.221],
              [0.097, 0.065, 0.022], primary, sign);
        plate('ornate-shoulder-guard', [sign * 0.255, 1.77, 0.005],
              [0.12, 0.055, 0.12], edge, sign);
        // Small shoulder crest and upper-arm bands.
        plate('shoulder-crest', [sign * 0.295, 1.80, 0.03],
              [0.07, 0.095, 0.09], trim, sign);
        plate('gold-or-obsidian-bracer', [sign * 0.36, 1.31, 0.055],
              [0.075, 0.20, 0.068], trim, sign);

        // Hip tassets: individual pointed metal plates, not a block skirt.
        plate('hip-guard', [sign * 0.19, 1.12, 0.065],
              [0.125, 0.12, 0.08], edge, sign);
        // tasset: Stores a value used by the game.
        const tasset = new THREE.Mesh(
            new THREE.ConeGeometry(0.11, 0.37, 5), trim
        );
        tasset.name = 'pointed-waist-tasset';
        tasset.position.set(sign * 0.20, 0.95, 0.12);
        tasset.rotation.z = Math.PI + sign * 0.10;
        outfit.add(tasset);

        // High greaves and raised knee armour; legs remain visibly separate.
        plate('ornate-knee-guard', [sign * 0.13, 0.58, 0.145],
              [0.105, 0.11, 0.09], edge, sign);
        plate('high-metal-greave', [sign * 0.13, 0.36, 0.11],
              [0.095, 0.24, 0.078], trim, sign);
        plate('greave-inlay', [sign * 0.13, 0.39, 0.18],
              [0.062, 0.19, 0.025], primary, sign);
        plate('boot-toe', [sign * 0.13, 0.10, 0.16],
              [0.105, 0.065, 0.16], edge, sign);

        // Long flowing silk hip drapes, attached to the waist. They are not
        // the same as the giant cylindrical skirt in the previous version.
        // points: Stores a value used by the game.
        const points = [];
        // sashWidth: Stores a value used by the game.
        const sashWidth = 0.12;
        // x: Stores a value used by the game.
        const x = sign * 0.26;
        // Repeats this block for the required items or frames.
        for (let i = 0; i <= 12; i++) {
            // t: Stores a value used by the game.
            const t = i / 12;
            // y: Stores a value used by the game.
            const y = 1.11 - t * 0.90;
            // sway: Stores a value used by the game.
            const sway = sign * (0.10 * t + 0.05 * Math.sin(t * Math.PI));
            // z: Stores a value used by the game.
            const z = 0.04 + 0.07 * Math.sin(t * Math.PI);
            points.push(x + sway - sashWidth, y, z,
                        x + sway + sashWidth, y, z);
        }
        // indices: Stores a value used by the game.
        const indices = [];
        // Repeats this block for the required items or frames.
        for (let i = 0; i < 12; i++) {
            // k: Stores a value used by the game.
            const k = i * 2;
            indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        }
        // geometry: Stores a value used by the game.
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        // sash: Stores a value used by the game.
        const sash = new THREE.Mesh(geometry, primary);
        sash.name = 'flowing-hip-sash';
        sash.userData.sash = true;
        outfit.add(sash);

        // Repeats this block for the required items or frames.
        for (let i = 0; i < 5; i++) {
            jewel(sign * 0.13, 0.28 + i * 0.082, 0.211,
                  light ? 0.023 : 0.035, i);
        }
        jewel(sign * 0.115, 1.72, 0.245, 0.040, sign + 2);
        jewel(sign * 0.21, 1.08, 0.195, 0.043, sign + 3);
    }

    // Narrow jewelled waist guard and decorative central chest ornament.
    // belt: Stores a value used by the game.
    const belt = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.025, 10, 36), edge
    );
    belt.position.y = 1.15;
    belt.rotation.x = Math.PI / 2;
    outfit.add(belt);
    jewel(0, 1.15, 0.23, 0.067, 2);
    jewel(0, 1.75, 0.245, 0.052, 0);
    holder.add(outfit);
    return outfit;
}

/**
 * LEGACY UNUSED CODE: ceremonial dress ornaments (NOT CALLED).
 * The existing imported dress mesh remains identical on both characters.
 * Dark dress: black gemstone belt and diamond details.
 * White dress: pearl-white and gold belt and gold details.
 */
// addDressOrnaments(): Runs this named part of the game when called.
function addDressOrnaments(holder, side) {
    // dark: Stores a value used by the game.
    const dark = side === 'black';
    // trimMaterial: Stores a value used by the game.
    const trimMaterial = new THREE.MeshStandardMaterial({
        color: dark ? 0x191725 : 0xe9cb77,
        metalness: dark ? 0.55 : 0.85,
        roughness: dark ? 0.21 : 0.29
    });
    // jewelMaterial: Stores a value used by the game.
    const jewelMaterial = new THREE.MeshPhysicalMaterial({
        color: dark ? 0xadb8d9 : 0xfff2c7,
        metalness: 0.18,
        roughness: 0.07,
        transmission: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06
    });
    // ornaments: Stores a value used by the game.
    const ornaments = new THREE.Group();
    // Waist trim and hanging jewel shapes, relative to 2.35-unit body.
    // belt: Stores a value used by the game.
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 32), trimMaterial);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 1.16;
    ornaments.add(belt);
    // Repeats this block for the required items or frames.
    for (let i = 0; i < 11; i++) {
        // a: Stores a value used by the game.
        const a = i / 11 * Math.PI * 2;
        // gem: Stores a value used by the game.
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(dark ? 0.045 : 0.034, 0), jewelMaterial);
        gem.position.set(Math.sin(a) * 0.245, 1.13, Math.cos(a) * 0.245);
        gem.scale.y = 1.6;
        ornaments.add(gem);
    }
    // chestGem: Stores a value used by the game.
    const chestGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), jewelMaterial);
    chestGem.position.set(0, 1.67, 0.20);
    ornaments.add(chestGem);
    holder.add(ornaments);
}

/**
 * ORIGINAL CODE: build non-interactive patrol angels around each kingdom.
 * Clones share the real female GLB geometry, textures, dress and wings.
 * The NPCs have independent wing joints and smaller scale.
 */
// findBone(): Runs this named part of the game when called.
function findBone(model, expressions) {
    // bones: Stores a value used by the game.
    const bones = [];
    model.traverse((node) => { if (node.isBone) bones.push(node); });
    // Repeats this block for the required items or frames.
    for (const expression of expressions) {
        // match: Stores a value used by the game.
        const match = bones.find((bone) => expression.test(bone.name));
        // Returns the result to the code that called this function.
        if (match) return match;
    }
    return null;
}

/** Normalize unknown model units to a consistent human-scale height. */
// normalizeModel(): Runs this named part of the game when called.
function normalizeModel(model, targetHeight) {
    model.updateMatrixWorld(true);
    // bounds: Stores a value used by the game.
    const bounds = new THREE.Box3().setFromObject(model);
    // dimensions: Stores a value used by the game.
    const dimensions = bounds.getSize(new THREE.Vector3());
    // centre: Stores a value used by the game.
    const centre = bounds.getCenter(new THREE.Vector3());
    // factor: Stores a value used by the game.
    const factor = targetHeight / Math.max(0.01, dimensions.y);
    model.scale.setScalar(factor);
    model.position.set(-centre.x * factor, -bounds.min.y * factor, -centre.z * factor);
}

// loadCharacter(): Runs this named part of the game when called.
function loadCharacter(spec) {
    return new Promise((resolve, reject) => {
        loader.load(spec.file, (gltf) => {
            // holder: Stores a value used by the game.
            const holder = new THREE.Group();
            // SOURCE: imported GLB supplied by the user. Never replace it with geometric bodies.
            // model: Stores a value used by the game.
            const model = gltf.scene;

            // SOURCE: user-provided GLB assets. Some Sketchfab exports contain
            // presentation stages/backgrounds, which are NOT part of the warrior.
            // The second asset includes a huge mesh literally named 'Plane'.
            // Remove it before calculating the character's bounding box.
            // unwanted: Stores a value used by the game.
            const unwanted = [];
            model.traverse((node) => {
                // Checks a condition before running the next block.
                if (node.isMesh && /^(plane|floor|ground|background|backdrop)$/i.test(node.name.trim())) {
                    unwanted.push(node);
                }
            });
            unwanted.forEach((node) => node.parent?.remove(node));

            // The first supplied warrior was authored Z-up; the second is Y-up.
            // Convert Z-up to the WebGL scene's Y-up orientation BEFORE scaling.
            // This shared female model is already Y-up. Do not rotate it
            // onto its side; both angels must stay upright while hovering.
            model.rotation.set(0, 0, 0);
            holder.add(model);
            // Both figures are now the same real-world height (2.35 scene units).
            // This also avoids the first figure towering over the chessboard.
            normalizeModel(model, 2.35);
            // This uploaded GLB ALREADY includes armor, cloth, feathered wings,
            // and a sword. Never add procedural copies of those parts.
            model.traverse((object) => {
                // Returns the result to the code that called this function.
                if (!object.isMesh) return;
                object.frustumCulled = false;
                // tint: Stores a value used by the game.
                const tint = (material) => {
                    // copy: Stores a value used by the game.
                    const copy = material.clone();
                    const name = `${object.name} ${material.name}`.toLowerCase();
                    // Preserve all original PBR texture maps and surface detail.
                    // Material tint is applied to the actual imported meshes only.
                    // Checks a condition before running the next block.
                    if (spec.side === 'black') {
                        // Checks a condition before running the next block.
                        if (/wing/.test(name)) copy.color.multiply(new THREE.Color(0xb34a60));
                        else if (/armor/.test(name)) copy.color.multiply(new THREE.Color(0xa3424d));
                        else if (/cloth/.test(name)) copy.color.multiply(new THREE.Color(0xb55b68));
                    } else {
                        // Checks a condition before running the next block.
                        if (/armor/.test(name)) copy.color.multiply(new THREE.Color(0xffe9b6));
                    }
                    // Retain source textures; modest emissive lift helps dark fabric and
                    // feathers remain readable without making them flat white.
                    // Checks a condition before running the next block.
                    if (copy.isMeshStandardMaterial || copy.isMeshPhysicalMaterial) {
                        copy.roughness = Math.max(0.32, copy.roughness ?? 0.65);
                        // Checks a condition before running the next block.
                        if (/wing|armor|cloth|fabric|dress|body/.test(name)) {
                            copy.emissive = new THREE.Color(spec.side === 'black' ? 0x2c0c12 : 0x25221c);
                            copy.emissiveIntensity = 0.18;
                        }
                    }
                    copy.side = THREE.DoubleSide;
                    copy.needsUpdate = true;
                    return copy;
                };
                object.material = Array.isArray(object.material)
                    ? object.material.map(tint) : tint(object.material);
            });
            // wings: Stores a value used by the game.
            const wings = { halves: [] }; // Wings are already in the GLB.
            // sword: Stores a value used by the game.
            const sword = null;           // Sword is already in the GLB.
            scene.add(holder);

            // Use actual embedded animation when present; otherwise use
            // small procedural upper-body movements without distorting the face.
            // mixer: Stores a value used by the game.
            const mixer = gltf.animations.length
                ? new THREE.AnimationMixer(model) : null;
            // Play the animation embedded in the supplied GLB. Its clip is
            // named "Motion", not "idle". This animates the existing rigged
            // body, wings and sword-related bones without duplicating meshes.
            // motionClip: Stores a value used by the game.
            const motionClip = gltf.animations.find((clip) =>
                clip.name === 'Motion') || gltf.animations[0];
            // Checks a condition before running the next block.
            if (mixer && motionClip) {
                // action: Stores a value used by the game.
                const action = mixer.clipAction(motionClip);
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.reset();
                action.play();
            }

            // rightHand: Stores a value used by the game.
            const rightHand = findBone(model, [
                /CC_Base_R_Hand/i, /right.?hand/i, /r.?hand/i,
                /Bip01 R Hand/i
            ]);
            // rightArm: Stores a value used by the game.
            const rightArm = findBone(model, [
                /CC_Base_R_Upperarm/i, /right.?upper.?arm/i, /Bip01 R UpperArm/i
            ]);
            // entry: Stores a value used by the game.
            const entry = { holder, model, wings, sword, mixer,
                rightHand, rightArm, side: spec.side };
            characters.set(spec.side, entry);
            // Do not duplicate this complete winged character as a guardian.
            // Additional guardians can be integrated from their own GLBs later.
            window.CelestialAngels.loaded += 1;
            window.CelestialAngels.modelInfo[spec.side] = {
                meshes: (() => { let count = 0; model.traverse(o => { if (o.isMesh) count++; }); return count; })(),
                animations: gltf.animations.map(clip => clip.name),
                handBone: rightHand ? rightHand.name : null
            };
            loadingNotice.textContent = `Loaded ${window.CelestialAngels.loaded}/2 real female warriors…`;
            resolve(entry);
        }, (event) => {
            // Checks a condition before running the next block.
            if (event.total > 0) {
                // percent: Stores a value used by the game.
                const percent = Math.min(100, Math.round(event.loaded / event.total * 100));
                loadingNotice.textContent = `Loading ${spec.side} warrior: ${percent}% (${window.CelestialAngels.loaded}/2 ready)`;
            }
        }, (error) => {
            console.error(`Failed to load ${spec.file}`, error);
            reject(error);
        });
    });
}


// Decorative angels cloned from the ORIGINAL user-supplied Pieta winged GLB.
// These are not walking guardians: they hover in fixed, dispersed territories.
// KINGDOM_ANGELS_PER_SIDE: Stores a value used by the game.
const KINGDOM_ANGELS_PER_SIDE = 12;
// kingdomAngels: Stores a value used by the game.
const kingdomAngels = [];
// angelSource: Stores a value used by the game.
const angelSource = new Promise((resolve, reject) =>
    loader.load('models/pieta_cinematic_wings.glb', resolve, undefined, reject));

// loadKingdomAngels(): Runs this named part of the game when called.
function loadKingdomAngels() {
    return angelSource.then(gltf => {
        // source: Stores a value used by the game.
        const source = gltf.scene;
        // unwanted: Stores a value used by the game.
        const unwanted = [];
        source.traverse(node => {
            // Checks a condition before running the next block.
            if (node.isMesh && /^(plane|floor|ground|background|backdrop)$/i.test(node.name.trim())) unwanted.push(node);
        });
        unwanted.forEach(node => node.parent?.remove(node));
        // Six angular sectors per ring keep angels spread across each island.
        // Repeats this block for the required items or frames.
        for (const side of ['white', 'black']) {
            // Repeats this block for the required items or frames.
            for (let i = 0; i < KINGDOM_ANGELS_PER_SIDE; i++) {
                // holder: Stores a value used by the game.
                const holder = new THREE.Group();
                // model: Stores a value used by the game.
                const model = cloneSkinnedModel(source);
                holder.add(model);
                scene.add(holder);
                normalizeModel(model, 1.0 + (i % 3) * 0.12);
                // dark: Stores a value used by the game.
                const dark = side === 'black';
                // palette: Stores a value used by the game.
                const palette = dark
                    ? [0x171922, 0x252833, 0x343a49, 0x525a6b]
                    : [0xfff7dc, 0xf3dfac, 0xffe8a6, 0xe6c46e];
                model.traverse(node => {
                    // Returns the result to the code that called this function.
                    if (!node.isMesh) return;
                    node.frustumCulled = false;
                    // recolor: Stores a value used by the game.
                    const recolor = material => {
                        // m: Stores a value used by the game.
                        const m = material.clone();
                        const isWing = /wing|feather/i.test(`${node.name} ${node.geometry?.name} ${material.name}`);
                        // Keep the original geometry, UVs and PBR textures.
                        // Multiply colours gently; white faction also brightens with emissive.
                        // Checks a condition before running the next block.
                        if (m.color) {
                            // Checks a condition before running the next block.
                            if (dark) m.color.multiply(new THREE.Color(palette[i % palette.length]));
                            else m.color.lerp(new THREE.Color(palette[i % palette.length]), isWing ? 0.60 : 0.38);
                        }
                        // Checks a condition before running the next block.
                        if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
                            m.metalness = Math.min(0.8, Math.max(m.metalness || 0, dark ? 0.35 : 0.22));
                            // Checks a condition before running the next block.
                            if (dark) {
                                m.emissive = new THREE.Color(0x18202b);
                                m.emissiveIntensity = isWing ? 0.16 : 0.10;
                            } else {
                                m.emissive = new THREE.Color(0x4a3513);
                                m.emissiveIntensity = 0.12;
                            }
                        }
                        m.side = THREE.DoubleSide;
                        return m;
                    };
                    node.material = Array.isArray(node.material)
                        ? node.material.map(recolor) : recolor(node.material);
                });
                // sector: Stores a value used by the game.
                const sector = i % 6;
                // ring: Stores a value used by the game.
                const ring = Math.floor(i / 6);
                // angle: Stores a value used by the game.
                const angle = (sector + ring * 0.5) * Math.PI / 3 + (dark ? 0.18 : 0);
                // radius: Stores a value used by the game.
                const radius = ring === 0 ? 4.2 : 8.0;
                // centerX: Stores a value used by the game.
                const centerX = dark ? 17 : -17;
                // x: Stores a value used by the game.
                const x = centerX + Math.cos(angle) * radius;
                // z: Stores a value used by the game.
                const z = -0.8 + Math.sin(angle) * radius * 0.75;
                // y: Stores a value used by the game.
                const y = 1.55 + (i % 4) * 0.36;
                holder.position.set(x, y, z);
                holder.rotation.y = angle + Math.PI;
                // clip: Stores a value used by the game.
                const clip = gltf.animations.find(c => c.name === 'Motion') || gltf.animations[0];
                // mixer: Stores a value used by the game.
                const mixer = clip ? new THREE.AnimationMixer(model) : null;
                // Checks a condition before running the next block.
                if (mixer) {
                    // Source animation may include root movement. Use bone-only tracks
                    // to prevent the decorative angel drifting from its assigned area.
                    // bones: Stores a value used by the game.
                    const bones = new Set();
                    model.traverse(n => { if (n.isBone) bones.add(n.name); });
                    // tracks: Stores a value used by the game.
                    const tracks = clip.tracks.filter(t => bones.has(t.name.split('.')[0]));
                    // Checks a condition before running the next block.
                    if (tracks.length) {
                        // safeClip: Stores a value used by the game.
                        const safeClip = new THREE.AnimationClip('DecorativeMotion', clip.duration, tracks);
                        // action: Stores a value used by the game.
                        const action = mixer.clipAction(safeClip);
                        action.setLoop(THREE.LoopRepeat, Infinity);
                        action.play();
                        action.time = (i / KINGDOM_ANGELS_PER_SIDE) * clip.duration;
                    }
                }
                kingdomAngels.push({holder, mixer, baseY:y, phase:i * 1.9 + (dark ? 1 : 0)});
            }
        }
        window.CelestialAngels.modelInfo.decorativeAngels = {
            source:'models/pieta_cinematic_wings.glb', white:KINGDOM_ANGELS_PER_SIDE,
            black:KINGDOM_ANGELS_PER_SIDE, movement:'dispersed hovering, no walking'
        };
    });
}
loadKingdomAngels().catch(error => {
    console.error('Decorative angels failed to load:', error);
    window.CelestialAngels.errors.push('Decorative angels: ' + String(error));
});

Promise.allSettled(specifications.map(loadCharacter)).then((results) => {
    // failed: Stores a value used by the game.
    const failed = results.filter((result) => result.status === 'rejected');
    // Checks a condition before running the next block.
    if (failed.length) {
        window.CelestialAngels.errors = failed.map((result) => String(result.reason));
        console.error('Could not load both female character models:', failed);
        loadingNotice.textContent = 'Character loading failed: ' + window.CelestialAngels.errors.join(' | ') + '. Check Live Server, internet access and browser console.';
        return;
    }
    window.CelestialAngels.ready = true;
    loadingNotice.remove();
    console.info('Real female warrior models loaded:', window.CelestialAngels.modelInfo);
});

// resize(): Runs this named part of the game when called.
function resize() {
    // width: Stores a value used by the game.
    const width = Math.max(1, canvas.clientWidth);
    // height: Stores a value used by the game.
    const height = Math.max(1, canvas.clientHeight);
    // pixelRatio: Stores a value used by the game.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    // Checks a condition before running the next block.
    if (canvas.width !== Math.round(width * pixelRatio) ||
        canvas.height !== Math.round(height * pixelRatio)) {
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// handWorld: Stores a value used by the game.
const handWorld = new THREE.Vector3();
// holderWorld: Stores a value used by the game.
const holderWorld = new THREE.Vector3();
// handRotation: Stores a value used by the game.
const handRotation = new THREE.Quaternion();

/** Place sword handle at the character's right hand in world space. */
// updateSwordGrip(): Runs this named part of the game when called.
function updateSwordGrip(entry, time) {
    const { holder, rightHand, sword } = entry;
    holder.updateMatrixWorld(true);
    // Checks a condition before running the next block.
    if (rightHand) {
        rightHand.getWorldPosition(handWorld);
        rightHand.getWorldQuaternion(handRotation);
        holderWorld.copy(handWorld);
        holder.worldToLocal(holderWorld);
        sword.position.copy(holderWorld);
        // Imported rigs use different wrist axes. Apply a grip correction;
        // tune this quaternion if the sword points sideways in your model.
        // parentWorld: Stores a value used by the game.
        const parentWorld = new THREE.Quaternion();
        holder.getWorldQuaternion(parentWorld);
        sword.quaternion.copy(parentWorld.invert().multiply(handRotation));
        sword.rotateX(-Math.PI / 2);
        sword.rotateZ(0.22);
    } else {
        // Fallback when an asset has no named hand bone.
        sword.position.set(0.40, 1.35, 0.20);
        sword.rotation.set(-0.2, 0, -0.12);
    }
    sword.rotation.z += Math.sin(time * 2.1) * 0.025;
}

/** Render imported models in sync with the custom WebGL2 battlefield. */
// animate(): Updates the scene over time for animation.
function animate() {
    requestAnimationFrame(animate);
    // dt: Stores a value used by the game.
    const dt = Math.min(clock.getDelta(), 0.05);
    // state: Stores a value used by the game.
    const state = window.CelestialSceneState;
    resize();
    // Draw whichever GLB models are ready. Do not replace them with the old blocks.
    // Checks a condition before running the next block.
    if (!state || window.CelestialAngels.loaded === 0) {
        renderer.clear();
        return;
    }

    camera.fov = THREE.MathUtils.radToDeg(state.fovRadians);
    camera.position.set(...state.eye);
    camera.lookAt(...state.target);
    camera.updateProjectionMatrix();

    // Repeats this block for the required items or frames.
    for (const spec of specifications) {
        // entry: Stores a value used by the game.
        const entry = characters.get(spec.side);
        // origin: Stores a value used by the game.
        const origin = state.origins[spec.side];
        // Checks a condition before running the next block.
        if (!entry || !origin) continue;
        // Place the human model at the same world-space location as the angel.
        // The original actor anchor was high above the board; lower it slightly.
        entry.holder.position.set(origin[0], origin[1] - 0.25, origin[2]);
        // Face the rival angel, not the viewer. Recalculate every frame because
        // the two angels move during patrol, capture, and combat animations.
        // opponent: Stores a value used by the game.
        const opponent = state.origins[spec.side === 'white' ? 'black' : 'white'];
        // Checks a condition before running the next block.
        if (opponent) {
            // dx: Stores a value used by the game.
            const dx = opponent[0] - origin[0];
            // dz: Stores a value used by the game.
            const dz = opponent[2] - origin[2];
            // Three.js character forward is +Z; yaw turns its face toward the rival.
            // targetYaw: Stores a value used by the game.
            const targetYaw = Math.atan2(dx, dz);
            entry.holder.rotation.y = targetYaw;
        }
        // Advance the skeleton every frame, even when the chess game is idle.
        entry.mixer?.update(dt);

        // Wing motion: inner and outer feathers sweep together in flight.
        entry.wings.halves.forEach((half) => {
            // sign: Stores a value used by the game.
            const sign = half.userData.sign;
            half.rotation.z = sign * (0.04 + 0.12 * Math.sin(state.elapsed * 3.4));
            half.rotation.y = sign * (0.06 * Math.sin(state.elapsed * 3.4));
        });
        // Upright flight: gentle bank on the HOLDER, never tip the body sideways.
        entry.holder.rotation.z = 0.025 * Math.sin(state.elapsed * 1.6 +
            (spec.side === 'white' ? 0 : Math.PI));
        // Checks a condition before running the next block.
        if (entry.sword) updateSwordGrip(entry, state.elapsed);
    }
    // Repeats this block for the required items or frames.
    for (const angel of kingdomAngels) {
        angel.mixer?.update(dt);
        angel.holder.position.y = angel.baseY + 0.12 * Math.sin(state.elapsed * 1.1 + angel.phase);
        angel.holder.rotation.y += dt * 0.045;
    }
    renderer.render(scene, camera);
}
animate();
