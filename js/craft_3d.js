"use strict";

class Craft3D {
  constructor(canvas) {
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    // modelWrapper adds an extra axis of rotation to avoid gimbal lock with the euler angles
    this.modelWrapper = new THREE.Object3D();
    this.scene.add(this.modelWrapper);

    const loader = new THREE.GLTFLoader();
    loader.load("/resources/models/fallback.gltf", (gltf) => {
      this.model = gltf.scene;
      this.modelWrapper.add(this.model);
    });
  }

  rotateTo(x, y, z) {
    if (this.model) {
      this.model.rotation.x = x;
      this.modelWrapper.rotation.y = y;
      this.model.rotation.z = z;
    }
  }

  _render() {
    if (this.model) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  render(frame, frameFieldIndexes) {
    const x = (-frame[frameFieldIndexes["attitude[1]"]] / 1800) * Math.PI;
    const y = (-frame[frameFieldIndexes["attitude[2]"]] / 1800) * Math.PI;
    const z = (-frame[frameFieldIndexes["attitude[0]"]] / 1800) * Math.PI;
    this.rotateTo(x, y, z);
    this._render();
  }

  resize(width, height) {
    if (this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this._render();
    }
  }
}
