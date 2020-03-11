import { CanvasTexture, DoubleSide, EventDispatcher, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from 'three';
import { RenderOrder } from '../../three/render-order';
import { createOffscreenCanvas } from 'rl-loadout-lib/dist/utils/offscreen-canvas';
import { XRControllerModel } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { HtcViveMapping } from '../../util/vr';

const SIZE = 1024;
const DEAD_ZONE_RADIUS = 128;
const RING_WIDTH = SIZE / 2 - DEAD_ZONE_RADIUS;

export class RingControl extends EventDispatcher {

  plane: Mesh;
  texture: CanvasTexture;
  canvas: OffscreenCanvas | HTMLCanvasElement;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  controller: Object3D;
  buttonMapping = HtcViveMapping;

  selectedOption = -1;
  selectionWidth = 2 * Math.PI;

  constructor(private options: string[]) {
    super();
    this.canvas = createOffscreenCanvas(SIZE, SIZE);
    this.context = this.canvas.getContext('2d');
    this.texture = new CanvasTexture(this.canvas as HTMLCanvasElement);

    const geometry = new PlaneGeometry(1, 1, 1, 1);
    const material = new MeshBasicMaterial({side: DoubleSide, transparent: true, depthWrite: false, map: this.texture});
    this.plane = new Mesh(geometry, material);
    this.plane.renderOrder = RenderOrder.VR_RING_CONTROL;
    this.plane.visible = false;

    if (options) {
      this.selectionWidth = 2 * Math.PI / this.options.length;
    }
    this.draw();
  }

  setOptions(options: string[]) {
    this.options = options;
    if (options) {
      this.selectionWidth = 2 * Math.PI / this.options.length;
    } else {
      this.selectionWidth = 2 * Math.PI;
    }
    this.draw();
  }

  addToController(controller: Object3D) {
    this.controller = controller;
    this.plane.scale.setScalar(0.18);
    this.plane.rotation.x = -Math.PI / 2 - 0.32;
    this.plane.position.z = -0.034;
    this.plane.position.y = 0.007;
    controller.add(this.plane);
  }

  draw() {
    this.context.clearRect(0, 0, SIZE, SIZE);

    // the circle
    this.context.strokeStyle = 'rgba(0,0,0,0.5)';
    this.context.lineWidth = RING_WIDTH;
    this.context.beginPath();
    this.context.arc(SIZE / 2, SIZE / 2, DEAD_ZONE_RADIUS + RING_WIDTH / 2, 0, Math.PI * 2);
    this.context.stroke();

    // highlight selection
    if (this.selectedOption >= 0) {
      this.context.strokeStyle = 'rgba(0,219,255,0.4)';
      this.context.beginPath();
      this.context.arc(SIZE / 2, SIZE / 2, DEAD_ZONE_RADIUS + RING_WIDTH / 2, this.selectedOption * this.selectionWidth,
        this.selectedOption * this.selectionWidth + this.selectionWidth);
      this.context.stroke();
    }

    this.context.strokeStyle = 'rgba(0,255,255,0.5)';
    this.context.lineWidth = 5;
    this.context.beginPath();
    this.context.arc(SIZE / 2, SIZE / 2, DEAD_ZONE_RADIUS, 0, Math.PI * 2);
    this.context.stroke();
    this.context.beginPath();
    this.context.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2.5, 0, Math.PI * 2);
    this.context.stroke();

    // the texts
    this.context.fillStyle = 'white';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.font = `bold 72px Rajdhani`;
    for (let i = 0; i < this.options.length; i++) {
      let angle = i * this.selectionWidth + this.selectionWidth / 2;
      const x = SIZE / 2 + (DEAD_ZONE_RADIUS + RING_WIDTH / 2) * Math.cos(angle);
      const y = SIZE / 2 + (DEAD_ZONE_RADIUS + RING_WIDTH / 2) * Math.sin(angle);

      this.context.fillText(this.options[i].toUpperCase(), x, y, RING_WIDTH);

      // separator
      angle = i * this.selectionWidth;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      this.context.beginPath();
      this.context.moveTo(SIZE / 2 * (1 + cos), SIZE / 2 * (1 + sin));
      this.context.lineTo(SIZE / 2 + (SIZE / 2 - RING_WIDTH) * cos, SIZE / 2 + (SIZE / 2 - RING_WIDTH) * sin);
      this.context.stroke();
    }

    this.texture.needsUpdate = true;
  }

  update() {
    const xrModel = this.controller.children[0] as XRControllerModel;
    const motionController = xrModel.motionController;

    if (motionController == undefined) {
      return;
    }

    const xrInputSource = motionController.xrInputSource;
    const gamepad: Gamepad = xrInputSource.gamepad;

    const button = gamepad.buttons[this.buttonMapping.touchpad];

    let redraw = false;
    let dispatch = false;

    if (button.pressed && !this.plane.visible) {
      redraw = true;
    }
    if (!button.pressed && this.plane.visible) {
      dispatch = true;
    }
    this.plane.visible = button.pressed;

    let selected = -1;
    if (button.pressed) {
      const len = Math.sqrt(Math.pow(gamepad.axes[0], 2) + Math.pow(gamepad.axes[1], 2));

      if (len > 0.5) {
        let angle = Math.atan2(gamepad.axes[1], gamepad.axes[0]);
        if (angle < 0) {
          angle += Math.PI * 2;
        }
        selected = Math.floor(angle / this.selectionWidth);
      }
    }

    if (this.selectedOption !== selected) {
      this.selectedOption = selected;
      redraw = true;
    }

    if (redraw) {
      this.draw();
    }

    if (dispatch && this.selectedOption >= 0) {
      this.dispatchEvent({type: 'select', option: this.selectedOption});
    }
  }
}
