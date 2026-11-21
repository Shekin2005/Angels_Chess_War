# Angel’s Chess War — Complete Project Documentation

**Student:** Shekin David Raj

This file consolidates the original project instructions, attribution, licence notices, and development notes. Each section retains its source filename so earlier notes can be distinguished from current instructions. Some historical notes may describe superseded implementations; consult the main README and actual source code for the final behavior.

## Contents

- [ANIMATION_FIX_README.md](#animationfixreadmemd)
- [README.md](#readmemd)
- [SOURCES_AND_ATTRIBUTION.md](#sourcesandattributionmd)
- [REFERENCE_PROJECT_LICENSE.txt](#referenceprojectlicensetxt)
- [BLOCK_BIRDS_REMOVED.md](#blockbirdsremovedmd)
- [BRIGHTNESS_UPDATE.md](#brightnessupdatemd)
- [CHARACTER_CUSTOMIZATION.md](#charactercustomizationmd)
- [CHESS_PIECE_VISIBILITY_FIX.md](#chesspiecevisibilityfixmd)
- [CODE_FILE_GUIDE.md](#codefileguidemd)
- [DRESS_COLOR_UPDATE.md](#dresscolorupdatemd)
- [EXACT_WING_COPY.md](#exactwingcopymd)
- [FIX_NOTES.md](#fixnotesmd)
- [GUARDIAN_ACTUAL_FIX.md](#guardianactualfixmd)
- [GUARDIAN_FLIGHT_UPDATE.md](#guardianflightupdatemd)
- [GUARDIAN_KINGDOM_AND_WINGS_FIX.md](#guardiankingdomandwingsfixmd)
- [GUARDIAN_REPLACEMENT.md](#guardianreplacementmd)
- [GUARDIAN_UPDATE.md](#guardianupdatemd)
- [GUARDIAN_VISIBILITY_FIX.md](#guardianvisibilityfixmd)
- [MAIN_ANGEL_MODEL_INTEGRATION.md](#mainangelmodelintegrationmd)
- [MEDIEVAL_TEXTURE_UPDATE.md](#medievaltextureupdatemd)
- [OTHER_GUARDIAN_MODELS.md](#otherguardianmodelsmd)
- [OVERLAP_FIX_AND_SOURCES.md](#overlapfixandsourcesmd)
- [README.txt](#readmetxt)
- [README_CHESS_PIECES.txt](#readmechesspiecestxt)
- [README_FIX.txt](#readmefixtxt)
- [README_PAWN_PROMOTION.txt](#readmepawnpromotiontxt)
- [README_WING_BACK_FIX.txt](#readmewingbackfixtxt)
- [REFERENCE_DESIGN_AND_CODE_NOTES.md](#referencedesignandcodenotesmd)
- [REFERENCE_VISUAL_MATCH_NOTES.md](#referencevisualmatchnotesmd)
- [VERIFICATION.md](#verificationmd)
- [WEBGL2_UPDATE.md](#webgl2updatemd)


---

## ANIMATION_FIX_README.md

# Main angel GLB animation fix

Both angels now play the supplied GLB animation clip `Motion` using `THREE.AnimationMixer` with continuous looping. The mixer advances every rendered frame instead of only during chess movement. No duplicate body, sword or wing geometry is created.

Run with a local HTTP server (e.g. VS Code Live Server). The Three.js CDN requires internet access. The exact movements depend on the keyframes supplied in the GLB; this does not create separate new attack clips.

---

## README.md

# Angel's Chess War — Goddess Warrior Reference Edition

A playable chess game in a custom WebGL2/GLSL fantasy battlefield, with two imported female warrior models rendered through an optional Three.js character layer.

## Run

Open this folder in VS Code and start **Live Server** on `index.html`. The characters load automatically from `models/warrior_two.glb`. There is no file-upload control. Internet access is needed for Three.js modules.

## Changes in this edition

- Both main angels share exactly the same female GLB body and face geometry.
- Replaced the previous bell-shaped ceremonial skirt overlay with reference-inspired breastplates, waist tassets, ornate greaves, arm guards, silk side sashes, and gemstone details.
- Heavenly angel: white/ivory cloth and golden metal; dark angel: black cloth, dark crimson metal and multicoloured faceted jewels.
- Wings have more layered feathers and remain attached to the local character root; both angels continue flying upright.
- Both main angels have swords attached to their detected right-hand bones when available.
- Smaller guardian angels continue circling their kingdoms.
- The chessboard, chess logic, lava, chains, persistent shatter debris, and game controls are preserved.

## Limitations

This is a reference-inspired **procedural armour overlay**, not a photorealistic sculpt matching the figurine images pixel for pixel. Some original imported clothing may show underneath the overlay. A professionally modelled replacement GLB is necessary for an exact replica. The sword grip depends on the supplied rig. Character rendering and game environment use separate depth buffers, which may cause overlap artifacts.

See `REFERENCE_DESIGN_AND_CODE_NOTES.md` and `SOURCES_AND_ATTRIBUTION.md` for credits and provenance.


## Black-and-crimson wing correction

Both main female angels share the same imported body and outfit geometry.
The heavenly angel has ivory-white feathers with warm gold outer accents.
The dark angel has near-black feathers at the shoulder and progressively
oxblood/crimson outer feathers, with dark wing joints. The same palette
is used for the smaller kingdom guardians. The wings are attached to the
character holder so they follow the body in flight.

The wing mesh and material code is in `celestial-characters.js`,
`createWings()`. It is project code based on the
user-supplied angel images and specification, not copied from Sketchfab.
The GLB character mesh remains a third-party user-supplied asset.

Run using VS Code Live Server (not by double-clicking the HTML file).
This update has not been browser-visual-tested; inspect wing placement
and proportions in your local browser.


## Medieval chess materials
See `MEDIEVAL_TEXTURE_UPDATE.md` for the new board/piece GLSL textures and attribution.

---

## SOURCES_AND_ATTRIBUTION.md

# Sources and attribution — Angel's Chess War

## Supplied source reused in this update

**Source:** User-provided archive `celestial_sisters_webgl(1).zip`, folder `angel_goddess_webgl/`.

- `angel_goddess_webgl/index.html`: **adapted** the idea of loading two GLB warriors using Three.js `GLTFLoader`, `AnimationMixer`, model normalization, lighting, and procedural feather wings. The new implementation is in `celestial-characters.js`, with detailed comments. It is **not a verbatim copy** of the original single-page example.
- `angel_goddess_webgl/models/warrior_one.glb`: copied unchanged to `models/warrior_one.glb`. The source README identifies the underlying creator as **Oscar Creativo** (`warrior_woman_free_model_3d_by_oscar_creativo.glb`). Original download URL and redistribution license were **not provided** and must be checked.
- `angel_goddess_webgl/models/warrior_two.glb`: copied unchanged to `models/warrior_two.glb`. Original creator, URL, and license were **not provided**. Verify permissions before redistribution.
- The source README also mentions `Celestara - Guardian of Light` by Ar3Designer (https://sketchfab.com/3d-models/celestara-guardian-of-light-3e85be6b36014c81a5f50fe6536c5e06) as a **visual reference only**. That model is **not** included.

## External software used by the new integration

- Three.js core, `GLTFLoader`: https://threejs.org/ and https://github.com/mrdoob/three.js — **MIT license**. Loaded from jsDelivr at runtime.
- glTF 2.0 format: https://registry.khronos.org/glTF/ — format specification, not copied application code.

## Original project code retained

- `main.js`: existing custom WebGL2/GLSL environment and chessboard rendering; modified only to expose camera/angel state and hide original block characters after real models load.
- `chess.js`: existing playable chess logic, retained.
- `style.css`: existing game UI, retained.
- `index.html`: existing game interface, updated with the character-module import map and credits.

## Integration code and source attribution

- `celestial-characters.js` is **new integration code** adapted from the user-supplied Celestial Sisters example. Its comments identify the adaptation and external library use.
- Additional state synchronization and procedural-angel fallback logic in `main.js` were implemented for this project.
- Credit original model creators and follow their licenses. Do not claim the GLB meshes or Three.js source as your own. Explain the separation between the custom WebGL2 main scene and the optional Three.js character component in the course report.

## Celestara visual reference (new request)

- **Celestara - Guardian of Light**, **Ar3Designer**, Sketchfab:
  https://sketchfab.com/3d-models/celestara-guardian-of-light-3e85be6b36014c81a5f50fe6536c5e06
- Used **as a visual reference only** for an elegant female fantasy warrior silhouette,
  face, hairstyle, wings, and sword presentation. No Celestara model, textures,
  code, or animation data were copied or downloaded from the Sketchfab embed.
  The embed HTML is a viewer link, **not character source code**.
- The supplied `warrior_woman_free_model_3d_by_oscar_creativo(1).glb`,
  `glb(1).zip` and `Female_Adult_11(2).glb` were reviewed as candidate assets.
  The game currently bundles two warrior assets inherited from the user's
  earlier `celestial_sisters_webgl(1).zip` integration. Rights and licence
  for every model must be checked before publication or submission.

## Newly authored integration code

- `celestial-characters.js`: tapered feather geometry, two-sided articulated
  wings, sword geometry, skeleton hand lookup, sword attachment, two-character
  scene synchronization, and documentation comments were implemented for this project. They are **not copied from Celestara**.
- Character loader structure was adapted from the user-provided
  `celestial_sisters_webgl(1).zip`; comments identify this provenance.
- Three.js and GLTFLoader are third-party library code under the MIT license.

## Technical limits

The imported warriors retain their own original faces, hairstyles and clothing;
code does not reconstruct the exact Celestara sculpt. Sword grip uses a right-hand
bone when present, but wrist axes and finger posing require visual tuning. This
character-only overlay has a separate depth buffer from the custom WebGL2 scene.

## Latest shared-body revision
Both angels use only the user-supplied `models/warrior_two.glb`; the unused `warrior_one.glb` is omitted. Mesh, dress and body are identical, with independent material tinting and original procedural hair/wings/swords. Model author/licence must be confirmed by the submitter.

## White/gold and black/diamond dress correction (November 9, 2026)

- `celestial-characters.js`, `addCeremonialDress()`: project-specific geometry for matching dress silhouettes and white/gold versus black/diamond visual styling. No third-party code was copied into this function.
- `loadCharacter()` material override: project-specific code that replaces only the imported model's named armour materials with distinct PBR colours; original skin, eye and hair textures are retained.
- Both characters continue to use the same **user-supplied** `models/warrior_two.glb`. The model and its textures are third-party assets; their original creator and redistribution license must be verified before publishing.
- Three.js geometry/material APIs: https://threejs.org/docs/ (reference documentation, not copied source code).


## Black/crimson feather palette update

The five-stage wing-feather palette and dark wing-joint material in
`celestial-characters.js` were implemented from
the user's explicit request and uploaded angel figurine references.
No source code or mesh geometry was copied from the Sketchfab Celestara
reference. The character GLB and Three.js have the provenance described above.

---

## REFERENCE_PROJECT_LICENSE.txt

MIT License

Copyright (c) 2026 King's Gambit contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## BLOCK_BIRDS_REMOVED.md

# Block birds removed

- Removed all 16 triangle-and-cone flying birds from `main.js`.
- Removed the unused `bird` animation branch.
- Real 3D guardians continue loading from `models/white_guardian.glb` (white kingdom) and `models/black_guardian.glb` (black kingdom) via `celestial-characters.js`.
- The two main angels continue using `models/pieta_cinematic_wings.glb`.
- No extra procedural bird/angel geometry is drawn.

Run with a local HTTP server (VS Code Live Server), not `file://`.

**Verification:** JavaScript syntax and ZIP integrity checked; browser visuals not verified.

---

## BRIGHTNESS_UPDATE.md

# Angel visibility update

In celestial-characters.js the Three.js character layer now uses brighter neutral hemisphere/ambient/key lighting, higher exposure, and softer dark-faction material tints. Existing GLB textures, mesh geometry, and embedded Motion animation remain intact. No duplicate geometry was added. Browser visual verification was not performed.

---

## CHARACTER_CUSTOMIZATION.md

# Two female angel warriors — source and customization

This edition uses **real textured female GLB meshes**, not box-built bodies.
Both are rendered automatically; there is no upload button in the game.

## Where to edit

- `celestial-characters.js` → `specifications`: white/gold and dark/crimson palette.
- `createWings`: four feather layers per wing; tune spread, length and colour.
- `createSword`: handle, guard, blade and glowing dark blade.
- `normalizeModel`: consistent 3.6-world-unit character height.
- `findBone`: names of right-hand and arm bones, so the sword moves with the hand.
- `updateSwordGrip`: wrist rotation adjustment; tune after looking at the game.
- `animate`: synchronized flying motion and wing flapping.

## Visual reference versus copied code

Celestara - Guardian of Light by Ar3Designer (Sketchfab) is a **visual reference**.
The linked iframe is not a downloadable 3D model or GLSL source code. No geometry
or textures from that Sketchfab model are bundled in this game.

## Limitations

The character meshes, faces and hair are the ones in the supplied GLB files.
To match Celestara's exact sculpt, hairstyle and outfit, a properly licensed
model asset and explicit animation rigging would be needed. A right-hand sword
attachment does not guarantee curled fingers or perfect sword alignment.

## Testing

Run via VS Code Live Server. Check that both models load, wings flap, swords
follow their right hands, and chess still works. An internet connection is
needed for Three.js from the CDN. This project uses a character-only Three.js
layer while the principal game remains custom WebGL2/GLSL.

---

## CHESS_PIECE_VISIBILITY_FIX.md

# Chess coin visual correction

Previous texture changes were too subtle at the small rendered size of the chess pieces. This update modifies the actual `piece()` geometry in `main.js` and its WebGL2 fragment shader.

- Piece stems are wider (`s=.46` rather than `.34`).
- Three raised gold/crimson metallic collars are modeled onto every chess piece.
- White piece bodies show high-contrast gray marble veins and gold striations.
- Black piece bodies show obsidian with prominent crimson veins and bands.
- Existing chess logic, board, and character files remain unchanged.

References: user-provided `rork-medieval-3d-chess-main.zip` for the medieval visual direction. Shader and mesh modifications written for this project.

Run via VS Code Live Server, and hard refresh (Ctrl+Shift+R) after opening the updated folder. No browser visual test was performed.

---

## CODE_FILE_GUIDE.md

# Angel's Chess War — Code File Guide

**Student:** Shekin David Raj

The project files have been retained with their original logic and assets. Code files include a standard identification/purpose header, whitespace cleanup, and the HTML entry point is indented for readability. JavaScript bodies have not been automatically refactored or structurally reformatted to avoid changing behavior.

## File responsibilities

- **main.js** — Core custom WebGL2 rendering, GLSL shaders, procedural chessboard and chess-piece geometry, camera, and effects.
- **chess.js** — Chess game rules, move validation, turns, captures, promotion, and gameplay controls.
- **luxury-board.js** — Three.js integration of the kingdoms, castles, celestial objects, and environment assets.
- **luxury-pieces.js** — Legacy optional GLB chess-piece renderer; not loaded by the current index.html.
- **celestial-characters.js** — Three.js character models, guardian animation, and character integration.
- **style.css** — Game layout, HUD, buttons, promotion interface, and responsive styling.
- **index.html** — Website entry point, WebGL canvas, game controls, and JavaScript dependencies.

## Running

Open `project/Angels_Chess_War` in VS Code and serve the folder with Live Server (or `python -m http.server 5500` from that folder). Open the local server URL. Do not open index.html using a file:// URL, because imported 3D models may fail to load.

## Credits

Keep `SOURCES_AND_ATTRIBUTION.md` and `REFERENCE_PROJECT_LICENSE.txt` with the submission. The student's name identifies the project files and does not imply ownership of third-party models.

---

## DRESS_COLOR_UPDATE.md

# Main angel dress colour update

The two main angels have the **same female body model and the same additional dress geometry**.

- White angel: opaque pearl-white bodice and skirt, gold embroidery and gold armour.
- Dark angel: opaque black bodice and skirt, silver trim, faceted pale diamond ornaments and near-black armour.
- Existing distinct hairstyles and swords remain unchanged.
- The same visual outfits also appear on smaller kingdom guardians.

## Source and implementation

See `celestial-characters.js` functions `addCeremonialDress()` and `loadCharacter()` (material override). These changes are project-specific. The imported GLB is supplied by the user and is not claimed as original work. Refer to `SOURCES_AND_ATTRIBUTION.md`.

## Limitation

This is a procedural costume overlay on a pre-existing warrior mesh, not a fully re-sculpted or cloth-simulated gown. Browser visual alignment has not been verified.

---

## EXACT_WING_COPY.md

# Exact main-angel wing mesh integration

The guardian wing geometry is now **cloned directly from `models/pieta_cinematic_wings.glb`** using `SkeletonUtils.clone`. The clone keeps the original skinned wing meshes, UV coordinates, textures, rig and embedded `Motion` clip. Non-wing meshes in the cloned rig are hidden, so there is no second body or sword. White guardians receive an ivory/gold material tint; black guardians receive a crimson/black tint. No procedural feather meshes are used on guardians.

The guardians still use the distinct white and black body GLBs supplied by the user, and fly in their respective kingdoms.

**Note:** The wing mesh is an exact geometry/texture copy, but its shoulder fit to the different guardian character bodies is an approximate normalized alignment, not a re-rig of the source mesh to the guardian skeleton. The wing animation plays on its own copied source skeleton. Visual browser verification is still required.

---

## FIX_NOTES.md

# Female angel alignment and matching costumes

- Same base character mesh and costume for both angels: `models/warrior_two.glb`.
- White and dark colours applied to separate material instances.
- Hair overlay differs, as do feather colours and swords.
- Both upright in Y-up coordinates, no forced 90-degree body rotation.
- Wings attached to each character's upper-back local transform.
- Removed unused other model from the package to avoid confusion and reduce size.
- Original game logic and shaders retained.

**Source:** `warrior_two.glb` from user-supplied `celestial_sisters_webgl(1).zip`. The GLTFLoader and Three.js are external MIT-licensed code; see `SOURCES_AND_ATTRIBUTION.md`.

**Limitations:** Hair and wings are procedural approximations; no hand-painted painting likeness. Browser appearance still requires user-side visual verification.

---

## GUARDIAN_ACTUAL_FIX.md

# Guardian visibility and kingdom flight correction

Updated from the user-uploaded Angels_Chess_War(1).zip.

## Root cause
The previous code used `state.origins` as kingdom centers. Those positions are the two main angels at x=-3.4 and x=+3.4, whereas the actual islands are centered at x=-17 and x=+17 (`main.js`). This put the guardians near the chessboard, not the castles.

## Changes
- White guardian patrol area: x=-25 to -10, centered at -17.
- Black guardian patrol area: x=10 to 25, centered at +17.
- Independent random destinations, speed, altitude and wing-animation offsets remain enabled.
- Guardian scale increased from 0.48 to 0.72.
- Wings remain cloned skinned meshes from `pieta_cinematic_wings.glb`, with original materials and motion clip.
- Browser console now logs each guardian and the number of source wing meshes found.

## Checking in the browser
Open DevTools Console and run `window.CelestialAngels.modelInfo`. Look for `whiteGuardians` and `blackGuardians`, with count 8 and a nonzero wingMeshesPerGuardian. If loading fails, inspect `window.CelestialAngels.errors`.

Visual testing in a browser is still necessary to confirm shoulder alignment and wing motion.

---

## GUARDIAN_FLIGHT_UPDATE.md

# Guardian flight and wing update

- Eight Mesa Prime guardians patrol the white kingdom, eight Shadowheart guardians patrol the black kingdom.
- Each guardian has an individual, deterministic multi-frequency wandering path, altitude, speed, and wing-flap phase. Paths remain centred around the guardian's own kingdom.
- Wing equipment uses the same five-layer, 28-feathers-per-layer procedural feather geometry design as the earlier main-angel wing implementation, with white/ivory/gold or black/crimson material palettes.
- The two main angels continue to use the original feather wings embedded in pieta_cinematic_wings.glb. Therefore the guardian wings are stylistically matched procedural meshes, not exact copies of the main GLB's sculpted wings or texture maps. An exact match requires extracting and re-rigging the wing meshes from the main GLB.
- The guardian T-pose models do not gain realistic arm or leg animation merely by adding wings.
- No extra guardian body mesh is created.

---

## GUARDIAN_KINGDOM_AND_WINGS_FIX.md

# Guardian kingdom and wing update

- White guardian GLBs load only from `models/white_guardian.glb`; black guardian GLBs only from `models/black_guardian.glb`.
- Patrol centers now read the matching kingdom coordinates from `window.CelestialSceneState.origins`, with a boundary preventing crossing the central chessboard.
- Guardian wings now call the same `createWings()` five-layer geometry and colour palette as the earlier main-angel procedural design: white/ivory/gold and black/crimson.
- **Limitation:** the current two main angels have their wings embedded and skinned inside `pieta_cinematic_wings.glb`. The guardian wings match the earlier procedural feather design, not the exact mesh/texture of those embedded GLB wings. Exact reuse requires extracting and retargeting the rigged wing geometry and skin weights.
- The main two angels and chess game logic are unchanged.

---

## GUARDIAN_REPLACEMENT.md

# Guardian replacement

Replaced the 16 removed procedural birds with 16 imported GLB guardian characters (8 Mesa Prime on the white kingdom, 8 Shadowheart on the black kingdom). The models are loaded from the supplied `other angles.zip`. Each instance is cloned using Three.js SkeletonUtils to preserve skinned-mesh rigging. Feather wings are separate animated accessories attached to each guardian, not duplicated bodies. The source models are T-pose and may not contain flying animations; their wings flap procedurally while the bodies hover. The two main angels remain unchanged.

Three.js / GLTFLoader / SkeletonUtils: https://threejs.org/ (MIT). Original GLB character rights should be checked before redistribution.

---

## GUARDIAN_UPDATE.md

# Kingdom Guardian Angels — Visual Update

- Three smaller **female guardian angels** circle each kingdom (six NPCs total).
- Guardians use the **same actual imported female mesh** as the two main angels, not block models.
- Main white angel has gold/white costume accents; main dark angel has black costume accents and faceted diamond-like ornaments. The same accents are used for their guardians.
- Both main angels retain identical dress and body geometry; hair and weapons remain different.
- NPCs are decorative only; they do not interfere with chess or combat.
- Code is readable and commented in `celestial-characters.js`.

## Provenance
The character mesh `models/warrior_two.glb` was supplied by the user in `celestial_sisters_webgl(1).zip`; its author and licence must be verified. Character loader uses Three.js under the MIT license (https://threejs.org/). The original WebGL2 chessboard and shaders are preserved. Guardian patrol logic and ornaments are project-specific code, not copied from the reference painting or Sketchfab.

## Limitations
Colour remapping is approximate because imported GLB material names may not label dress and skin separately. Diamond effects are faceted geometric gems, not physically accurate gemstones. Browser visual verification is still necessary.

---

## GUARDIAN_VISIBILITY_FIX.md

# Guardian visibility and patrol fix

This version is edited directly from the user-uploaded Angels_Chess_War.zip.

- Enlarged each imported guardian from 0.48 to 0.92 group scale after normalizing the model to 2m height.
- Enlarged and repositioned both procedural feathered wings on the original guardian body. No second body is created.
- Adjusted independent guardian paths to span more of their respective kingdom, with varied altitudes and speeds.
- Corrected guardian kingdom X assignments for the project camera view (white screen-right, black screen-left).
- Preserved the two original main angels, their GLB animation, chess rules and scenery.

The guardian models are T-pose assets. If their GLBs have no usable animation, their arms and legs will remain static, though their wing pivots and patrol positions animate.

Run index.html through a local HTTP server (e.g. VS Code Live Server). This patch has been syntax-checked but not visually validated in a browser.

---

## MAIN_ANGEL_MODEL_INTEGRATION.md

# Main angels: user-provided GLB integration

The two main angels now load `models/pieta_cinematic_wings.glb` from the supplied `2 main angles.zip`. This archive contained **one** GLB, so the same asset is instantiated once for each side. The dark copy receives crimson/black material tinting; the light copy retains its original materials with a subtle gold armour tint.

The imported GLB contains meshes named Armor, Cloth, Wings and Sword, and an animation called Motion. Therefore no additional procedural body, wings, dress, hair or sword is added to either main character. This avoids duplicate overlapping anatomy and equipment. The animation is not automatically played because the imported root motion could disrupt the hovering game position.

The original custom WebGL2 battlefield and chess rules remain unchanged. The additional guardian clones are disabled pending separate guardian model uploads, to avoid duplicating this large winged character around the kingdoms.

**Asset note:** The supplied ZIP contains only one character GLB, not two separate GLBs. The model appears to originate from a Sketchfab export; confirm the asset's license and creator attribution before redistributing or publishing the game.

**Testing:** JS syntax checked; full visual browser test not performed. The imported model's native facing axis and proportions may need tuning in the browser.

---

## MEDIEVAL_TEXTURE_UPDATE.md

# Medieval Chessboard and Pieces — Texture Update

## What changed

- The existing **single playable WebGL2 chessboard** now has shader-generated pale marble and dark basalt square surfaces.
- White chess pieces receive fine veined ivory-stone shading; black chess pieces receive flecked obsidian shading. Existing decorative gold/crimson parts remain.
- No texture downloads, file-upload interface, Three.js replacement, or changes to chess rules.
- Materials are generated by custom GLSL in `main.js`, using `uChessPiece` to distinguish the movable chess-piece draw calls from the static board.

## Source attribution

**Visual and procedural-material reference:** user-supplied `rork-medieval-3d-chess-main.zip`, specifically `web/src/scene/textures.ts` (`marbleTexture`, grain and veining approach). Its repository `LICENSE` states MIT, copyright (c) 2026 King's Gambit contributors.

**Implementation:** newly authored GLSL procedural texture functions integrated into the existing `Angels_Chess_War/main.js` WebGL2 shader. The TypeScript/Three.js texture-generation code was not copied verbatim.

**Original project:** `Angels_Chess_War_Single_Body_No_Overlap.zip` from the ongoing project. Existing model and dependency credits remain in `SOURCES_AND_ATTRIBUTION.md`.

## Testing

`node --check main.js` and `node --check chess.js` passed; ZIP integrity checked. Browser visual rendering has not been verified.

---

## OTHER_GUARDIAN_MODELS.md

# New guardian character models

The two **main** angels still use `models/pieta_cinematic_wings.glb` and their existing `Motion` clip.

The **three smaller guardians** on each side now load separate user-supplied assets:

- White kingdom: `models/white_guardian.glb`, from `mesa-prime-warframe-t-pose-3d-model.zip`.
- Black kingdom: `models/black_guardian.glb`, from `shadowheart-baldurs-gate-t-pose-3d-model.zip`.

The models retain their original mesh and materials; no duplicate bodies or procedural armour are added. They orbit their kingdoms and hover gently. Embedded clips play if present. T-pose models without animations remain in their authored pose; wings and wing animation are not fabricated.

**Rights:** These assets are associated with existing commercial game characters. The upload alone does not establish redistribution or public-release rights. Check their source licences before publishing the game.

Run with a local web server (e.g. VS Code Live Server), not `file://`. Three.js is loaded from a CDN and requires network access.

---

## OVERLAP_FIX_AND_SOURCES.md

# Single-body overlap correction and sources

## What was wrong

The previous `celestial-characters.js` loaded a complete female GLB character **and** called `addCeremonialDress()` and `addHairstyle()`, which created separate geometric costume/body-shaped parts at assumed coordinates. Those shapes did not follow the model's skeleton and could overlap the original figure. The guardians had the same issue.

## What changed

- Removed the calls to `addCeremonialDress()` and `addHairstyle()` for both main angels and guardians. The old functions are retained but explicitly marked **unused**, for comparison and academic transparency.
- Recoloured the actual supplied GLB armour, cuirass, arm armour, leg armour and sock materials for the white/gold and black/crimson versions. This is material replacement, not another character mesh.
- Kept the GLB's own face, body, hair, hands and clothing shape. The same model is used for both main angels. The wing and sword meshes are separate *equipment*, not duplicate bodies.
- Kept the original custom WebGL2/GLSL chess renderer and removed no chess features.

## Honest limits

The original GLB has one sculpted hairstyle and clothing design. Different hairstyles or an exact match to the reference figurine require edited/new meshes. The original garment is recoloured but not remodeled. The wing roots are still positioned against the upper back using the normalized model coordinates; visual alignment and actual skeletal animation require browser inspection. The imported characters are rendered by a transparent Three.js layer, so depth ordering with the custom WebGL2 battlefield can still be imperfect.

## Source attribution

- `warrior_two.glb`: supplied by the user in `celestial_sisters_webgl(1).zip`; retain the original artist/licence information from the supplied package and verify distribution rights before submitting.
- Character-loading structure: adapted from the user's `celestial_sisters_webgl(1).zip` with subsequent project modifications.
- Three.js, GLTFLoader, AnimationMixer: https://threejs.org/ — MIT licence, https://github.com/mrdoob/three.js/blob/master/LICENSE
- Celestara – Guardian of Light by Ar3Designer: https://sketchfab.com/3d-models/celestara-guardian-of-light-3e85be6b36014c81a5f50fe6536c5e06 — visual inspiration only, **not** a copied or downloaded mesh.
- User-supplied two angel figurine pictures and design text: reference for colours and wing shapes, not source code.
- Overlap fix: project-specific code, not copied from the reference.

---

## README.txt

Angel’s Chess War - Original celestial and white island appearance

Replace only luxury-board.js in your project. Keep all existing GLB files.

This patch removes the artificial emissive recolouring of moon.glb and sun.glb.
It does NOT alter the White Kingdom island_snow_water.glb loading, geometry, materials, texture or position.
The celestial objects retain their current scale and position, and their original GLB materials.
The game scene lighting and tone mapping are not changed by this patch; therefore the models may still look different from their original viewer.

Reload Live Server using Ctrl+Shift+R.

---

## README_CHESS_PIECES.txt

ANGEL'S CHESS WAR - ORIGINAL CHARACTER GLB CHESS PIECES

Install this PATCH into your EXISTING Angels_Chess_War folder:
1. Replace main.js, index.html and style.css.
2. Add luxury-pieces.js alongside main.js.
3. Copy the included models/chess-pieces folder into your models folder.
4. Keep your existing chess.js, luxury-board.js, celestial-characters.js, castles, and other model files.
5. Run using Live Server and hard-refresh Ctrl+Shift+R.

Imported model mapping (from the user-provided chess coins.zip):
King: King by Quaternius
Queen: brunhilda
Rook: big_guy
Bishop: IVORAE - The Faceless Queen (nested ZIP)
Knight: girl_knight
Pawn: Hooded Adventurer by Quaternius

32 copies use the original 6 GLB models. White kingdom pieces are ivory/white with gold accents; black kingdom pieces retain their original appearance with black and dark-red accents. Original diffuse textures are preserved, particularly skin, faces and eyes. Clothing/armor materials with identifiable names receive faction tint; two subtle base trim rings provide gold or dark-red accents. For single-material models, the original skin and outfit textures remain unchanged to avoid recoloring skin. Imported models are automatically resized to fit board squares.

The original custom WebGL2 pieces remain a fallback until all 6 GLBs load. Once loaded, they are hidden and the 32 imported 3D pieces follow the chess engine positions. Original rules, clicking and legal moves are unchanged.

IMPORTANT: This patch has not been visually tested in a browser with the full game. Orientation, geometry, performance, and alignment may need fine tuning. Large GLB assets can take time to load.

---

## README_FIX.txt

ANGEL’S CHESS WAR — BLACK SPACE / NO CHESSBOARD LAVA PATCH

Based on the full Angels_Chess_War(2).zip uploaded by the user.

REPLACE these 3 files in your existing Angels_Chess_War folder:
  main.js
  luxury-board.js
  style.css

Keep index.html, chess.js, all other JS files, and ALL models/assets as they are.

Changes:
- Removed custom WebGL2 board-lava geometry from main.js.
- Removed the board-lava actor animation branch.
- Changed WebGL2 clear colour to transparent black and reduced pink fog.
- Made page background pure black.
- Retained the star background with 125 moderately visible twinkling stars.
- Retained black volcano lava, castles, white island, chess pieces, and chains.

Run with Live Server and hard refresh Ctrl+Shift+R.
If your browser cached the old scripts, open DevTools > Network > Disable cache and reload.

NOTE: This patch was syntax-checked but not visually browser-tested.

---

## README_PAWN_PROMOTION.txt

PAWN PROMOTION FIX — Angel's Chess War

Replace chess.js, luxury-pieces.js, and style.css in your existing project.
Keep all GLB assets, main.js, luxury-board.js, and index.html unchanged.

When a pawn reaches the opposite end, the game pauses and shows a bottom-center chooser: Queen, Rook, Bishop, Knight. Click one to complete the legal promotion. Cancel returns to the board. The GLB chess character changes to the selected type, and undo restores the pawn model.

The chooser uses chess symbols and full character names; the 3D model changes after selection.
Refresh the browser with Ctrl+Shift+R.

---

## README_WING_BACK_FIX.txt

Replace celestial-characters.js in your existing project. This patch rotates the copied wing rig 180 degrees to face the guardian's back, aligns upper-back points, and adds setGuardianWingFit(side,{yaw,x,y,z}) for live adjustment in browser console. No GLB models included. Note: orientation is model-dependent; check side view and adjust if necessary.

---

## REFERENCE_DESIGN_AND_CODE_NOTES.md

# Reference design and code notes

## Visual references

- The two angel figurine images supplied by the student in this conversation on November 9, 2026. They define the common silhouette: ornate fitted breastplate, open midriff, pointed tassets, long side sashes, high leg armour, layered wings, and a hand-held sword. The reference images are *not* extracted as textures or converted into 3D models.
- Celestara – Guardian of Light by Ar3Designer: https://sketchfab.com/3d-models/celestara-guardian-of-light-3e85be6b36014c81a5f50fe6536c5e06 (visual reference only; no geometry copied).

## External code and assets

- `models/warrior_two.glb`: female warrior mesh from the user-supplied `celestial_sisters_webgl(1).zip`; original artist and usage licence must be confirmed before redistributing outside class. Both characters reuse the same mesh.
- Three.js, GLTFLoader, AnimationMixer: https://threejs.org/ and https://github.com/mrdoob/three.js (MIT licence). The advanced character overlay uses Three.js; the environment and chessboard are custom WebGL2/GLSL.
- `chess.js`, `main.js`, HTML/CSS: inherited from the previously supplied Angel's Chess War project; Review these files and understand their implementation before submission.
- `celestial-characters.js`: character integration adapted from earlier user-provided source and project-specific modifications. The updated `addCeremonialDress()` armour, faceted gemstones, silk hip sashes and wing geometry modifications were written specifically for this project based on the student's references. No code from the reference images was copied.

## What this version does and does not do

The two angels share the same imported female mesh and newly constructed armour geometry. The white angel uses ivory and gold; the dark angel uses black, crimson and gem colours. Both fly with wings attached to their character root. The dress is not a long skirt: it is a fitted breastplate, separate hip plates, leg armour and fabric strips. The original imported character clothing remains underneath some new armour, so the result is an approximation, not an exact sculpt of the figurines. Wings and sword are procedural and not exact replicas. The original GLB has its own mesh proportions and facial features. There is no in-game upload UI.

## Running

1. Extract the entire archive; do not open `index.html` directly as `file://`.
2. Start VS Code Live Server from the extracted project folder.
3. Keep internet access for the Three.js ES module import map.
4. Open the browser developer console if character loading fails.

## Coursework integrity

Credit the external character model, the Three.js library, any borrowed starter code, the supplied visual references, and project-specific modifications in your report. Verify asset licensing and be prepared to explain the implementation.

---

## REFERENCE_VISUAL_MATCH_NOTES.md

# Medieval reference board and pieces — visual adaptation

Reference supplied: `rork-medieval-3d-chess-main (1).zip`, screenshot `docs/board.jpg`.

The reference image shows a gold-edged, ivory/dark stone chessboard and **armoured miniature people** as the playing pieces, each with a shield-shaped rank badge and faction-coloured ring. The earlier Angels Chess War used traditional lathed chess tokens, so shader changes alone could never reproduce the reference silhouette.

This edition modifies the original `main.js` WebGL2 renderer directly: each playable piece is now a miniature armoured soldier with a helm, torso, legs, arms, shield, piece-specific equipment, and an elevated rank insignia. It adds raised gold perimeter trim and file/rank ticks to the stone board. The two main angels, custom shaders, chess rules and kingdoms remain in place.

**Not an exact asset-for-asset reproduction.** The reference project uses separate GLTF army models, which are not bundled as model files in the supplied ZIP. These pieces are original WebGL2 procedural approximations, not copies of those 3D models. For an exact match, the original licensed character GLTF assets and their textures must be available and integrated into the render pipeline.

Attribution: *King's Gambit contributors*, supplied `rork-medieval-3d-chess-main`, MIT License. Original license reproduced in `REFERENCE_PROJECT_LICENSE.txt`. No model geometry was extracted from the reference project.

---

## VERIFICATION.md

# Verification and limitations

- The old procedural angel body, costume, wings and sword draw calls are disabled in `main.js`.
- The two actual female GLB files are bundled.
- `celestial-characters.js` loads and renders the models in a transparent Three.js layer.
- The main game board and gameplay remain custom WebGL2/GLSL.
- Imported model mesh counts from GLB metadata: white 30, dark 14.
- Animation counts from GLB metadata: white 1, dark 74.
- The models require Three.js modules from jsDelivr at runtime.
- No claim of photorealistic likeness to the reference painting or browser verification.
- External assets and code must be credited; see SOURCES_AND_ATTRIBUTION.md.

---

## WEBGL2_UPDATE.md

# WebGL2 coursework-focused revision

## Run
Extract this source archive over the original project, keeping its models/ directory. Run `python -m http.server 8000` from the Angels_Chess_War folder or use VS Code Live Server. Open http://localhost:8000. Internet is needed for the existing Three.js CDN imports.

## Implementation
- main.js owns the playable board and all chess-piece drawing, with GLSL ES 3.00 shaders, an interleaved vertex buffer, model translations, view/projection matrices, lighting and a repeating GPU stone texture.
- The 64 squares and twelve reusable piece meshes are generated in JavaScript. Promotion picks the new piece mesh from the chess state. Captures, markers, camera and particle animations remain integrated.
- chess.js retains the existing rules and UI logic.
- luxury-board.js now renders only advanced imported scenery. celestial-characters.js retains imported animated characters. The old luxury-pieces.js is retained as reference but is not loaded by index.html.

The board and pieces now look different from the original GLB assets; all original GLBs may be kept in models/. Three.js still renders advanced scenery and angels in separate layers. This is a hybrid implementation, not a fully raw-WebGL renderer. Verify the instructor accepts that division  User identifies Sketchfab (https://sketchfab.com/) as the source of imported models; preserve original creator/model/license credits and verify missing entries before submission.

## Verification
JavaScript syntax checks and a Node mock-WebGL smoke test (initial draw, e2-e4 and second draw) passed. Real shader compilation, appearance, imported asset loading and full game interactions are not browser-tested. Review and test locally before submission.
