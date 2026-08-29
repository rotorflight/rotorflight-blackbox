"use strict";

// Collective color: blue for negative (descending) pitch, green for positive (climb) pitch.
// Opacity carries the magnitude, so the disc is fully transparent at zero collective and
// becomes more visible the further the stick is pushed away from center in either direction.
// Colors match the app's line/graph palette (see lineColors in grapher.js) for legibility
// against the black graph background.
const COLLECTIVE_COLOR_NEGATIVE = new THREE.Color(0x80b1d3); // Blue
const COLLECTIVE_COLOR_POSITIVE = new THREE.Color(0xb3de69); // Green
const COLLECTIVE_DISC_MAX_OPACITY = 0.75;

// The model already includes a "Cone"-named mesh at the rotor head: a wide, nearly-flat disc
// (rendered near-black at 10% opacity in the source asset) meant to represent the spinning
// main rotor's blur. Rather than place a new mesh and guess at the rotor head's position, we
// recolor that existing disc directly to indicate collective pitch.
const COLLECTIVE_DISC_NODE_NAME = "Cone";

// Cyclic (roll/pitch) gradient: on top of the uniform collective color/opacity, the disc is
// faded in per-vertex so the side of the disc the swashplate is tilting towards stays at full
// strength while the opposite side fades out, showing at a glance where the blade force is
// pointing. rcCommand[0]/[1] (roll/pitch) aren't range-scaled per-craft like collective is, so
// a fixed +-500 stick-deflection range (the standard Betaflight/Rotorflight raw scale) is used.
// The "Cone" node has no rotation of its own relative to the model root, so its local X/Z axes
// line up with model.rotation's: rotation.x is driven by pitch and rotation.z by roll, so local
// X is the lateral (roll) axis and local Z is the longitudinal (pitch) axis of the disc.
const CYCLIC_COMMAND_RANGE = 500;
const CYCLIC_GRADIENT_STRENGTH = 1.5;
const CYCLIC_GRADIENT_MIN_ALPHA = 0.1;
// Negated relative to the raw rcCommand sign: a positive (forward/right) cyclic command should
// highlight the near side of the disc rather than the far side.
const CYCLIC_ROLL_SIGN = 1;
const CYCLIC_PITCH_SIGN = -1;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

class Craft3D {
  constructor(canvas, flightLog) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    // move the camera away from the model
    this.camera.position.z = 200;
    this.scene.add(this.camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(0, 600, 800);
    this.scene.add(directionalLight);

    // modelWrapper adds an extra axis of rotation to avoid gimbal lock with the euler angles
    this.modelWrapper = new THREE.Object3D();
    this.scene.add(this.modelWrapper);

    const collectiveRange = (flightLog && flightLog.getSysConfig().collectiveRange) || [-500, 500];
    this.collectiveMin = collectiveRange[0];
    this.collectiveMax = collectiveRange[1];

    this.collectiveDisc = null;
    this.discColorAttr = null;
    this.discVertexXZ = null;

    const loader = new THREE.GLTFLoader();
    loader.load("/resources/models/bell_cw.gltf", (gltf) => {
      this.model = gltf.scene;
      this.modelWrapper.add(this.model);
      this.setupCollectiveDisc();
      this.render();
    });
  }

  // Precomputes the per-vertex data needed to color the rotor disk for collective/cyclic.
  setupCollectiveDisc() {
    const disc = this.model.getObjectByName(COLLECTIVE_DISC_NODE_NAME);
    if (!disc) return;

    this.collectiveDisc = disc;

    const geometry = disc.geometry;
    const position = geometry.attributes.position;
    const vertexCount = position.count;

    let outerRadius = 0;
    const discVertexXZ = new Float32Array(vertexCount * 2);
    for (let i = 0; i < vertexCount; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      outerRadius = Math.max(outerRadius, Math.hypot(x, z));
    }
    outerRadius = outerRadius || 1;
    for (let i = 0; i < vertexCount; i++) {
      discVertexXZ[i * 2] = position.getX(i) / outerRadius;
      discVertexXZ[i * 2 + 1] = position.getZ(i) / outerRadius;
    }
    this.discVertexXZ = discVertexXZ;

    const colors = new Float32Array(vertexCount * 4).fill(1);
    this.discColorAttr = new THREE.BufferAttribute(colors, 4);
    geometry.setAttribute("color", this.discColorAttr);
    disc.material.vertexColors = true;
    disc.material.needsUpdate = true;
  }

  rotateTo(x, y, z, collectiveRaw, cyclicRollRaw, cyclicPitchRaw) {
    if (!this.model) return;

    this.model.rotation.x = x;
    this.modelWrapper.rotation.y = y;
    this.model.rotation.z = z;

    if (this.collectiveDisc && typeof collectiveRaw === "number") {
      const isNegative = collectiveRaw < 0;
      const magnitude = Math.min(
        Math.abs(collectiveRaw) / (Math.abs(isNegative ? this.collectiveMin : this.collectiveMax) || 1),
        1,
      );

      this.collectiveDisc.material.color.copy(
        isNegative ? COLLECTIVE_COLOR_NEGATIVE : COLLECTIVE_COLOR_POSITIVE,
      );
      this.collectiveDisc.material.opacity = magnitude * COLLECTIVE_DISC_MAX_OPACITY;
    }

    if (this.discColorAttr && this.discVertexXZ) {
      const dx = CYCLIC_ROLL_SIGN * clamp((cyclicRollRaw || 0) / CYCLIC_COMMAND_RANGE, -1, 1);
      const dz = CYCLIC_PITCH_SIGN * clamp((cyclicPitchRaw || 0) / CYCLIC_COMMAND_RANGE, -1, 1);
      const colors = this.discColorAttr.array;
      const vertexCount = colors.length / 4;

      for (let i = 0; i < vertexCount; i++) {
        const alignment = this.discVertexXZ[i * 2] * dx + this.discVertexXZ[i * 2 + 1] * dz;
        colors[i * 4 + 3] = clamp(
          1 + CYCLIC_GRADIENT_STRENGTH * alignment,
          CYCLIC_GRADIENT_MIN_ALPHA,
          1,
        );
      }
      this.discColorAttr.needsUpdate = true;
    }

    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    if (this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.render();
    }
  }
}
