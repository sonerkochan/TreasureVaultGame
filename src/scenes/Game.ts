import { Container, Text, Graphics, Sprite, Texture } from "pixi.js";
import { centerObjects } from "../utils/misc";
import { SceneUtils } from "../core/App";
import Keyboard from "../core/Keyboard";

export default class Game extends Container {
  name = "Game";

  // Visual elements
  private background!: Sprite;
  private door!: Sprite;
  private handle!: Sprite;
  private shadow!: Sprite;
  
  // Rotation tracking
  private keyboard = Keyboard.getInstance();
  private rotationSpeed = 0.05;
  private maxRotation = 18 * Math.PI; // 9 full rotations
  private fullRotations: number[] = [];
  private currentRotation = 0;
  private accumulatedRotation = 0;
  private lastDirection: 'LEFT' | 'RIGHT' | null = null;

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    // Load all assets
    await this.utils.assetLoader.loadAssets();

    // Create loading screen
    const text = new Text("Loading...", {
      fontFamily: "Verdana",
      fontSize: 50,
      fill: "white",
    });
    text.resolution = 2;
    centerObjects(text);

    const loadingBg = new Graphics()
      .beginFill(0x0b1354)
      .drawRect(0, 0, window.innerWidth, window.innerHeight);

    this.addChild(loadingBg, text);
  }

  async start() {
    this.removeChildren();

    // Background
    const bgTexture = Texture.from('public/assets/bg.png');
    this.background = new Sprite(bgTexture);
    this.background.width = window.innerWidth;
    this.background.height = window.innerHeight;
    this.background.position.set(0, 0);

    // Create door
    const doorTexture = Texture.from('public/assets/door.png');
    this.door = new Sprite(doorTexture);
    this.door.anchor.set(0.5);
    this.door.position.set(
      window.innerWidth * 0.5,
      window.innerHeight * 0.49
    );
    this.door.scale.set(0.25);

    // Create handle shadow
    const shadowTexture = Texture.from('public/assets/handleShadow.png');
    this.shadow = new Sprite(shadowTexture);
    this.shadow.anchor.set(0.5);
    this.shadow.position.set(
      window.innerWidth * 0.485,
      window.innerHeight * 0.5
    );
    this.shadow.scale.set(0.25);

    // Create handle with centered pivot point for rotation
    const handleTexture = Texture.from('public/assets/handle.png');
    this.handle = new Sprite(handleTexture);
    this.handle.anchor.set(0.5, 0.5); // 0.5 Y isright so it rotates from center!
    this.handle.position.set(
      window.innerWidth * 0.485,
      window.innerHeight * 0.485
    );
    this.handle.scale.set(0.25);

    // Add all elements in proper z-order
    this.addChild(
      this.background,
      this.door,
      this.shadow,
      this.handle
    );

    // Create rotation display element
    this.createRotationDisplay();
  }

  private createRotationDisplay() {
    const style = document.createElement('style');
    style.textContent = `
      #rotation-display {
        position: fixed;
        top: 20px;
        left: 20px;
        color: white;
        font-family: Arial;
        background: rgba(0,0,0,0.7);
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
      }
    `;
    document.head.appendChild(style);

    const display = document.createElement('div');
    display.id = 'rotation-display';
    document.body.appendChild(display);
  }

  update(delta: number) {
    const fullRotation = 2 * Math.PI;
    let rotationAmount = 0;

    // Handle rotation input
    if (this.keyboard.getAction("LEFT")) {
      rotationAmount = -this.rotationSpeed * delta;
      this.lastDirection = 'LEFT';
    } 
    else if (this.keyboard.getAction("RIGHT")) {
      rotationAmount = this.rotationSpeed * delta;
      this.lastDirection = 'RIGHT';
    }
    else {
      this.handle.rotation *= 0.9;
      this.shadow.rotation = this.handle.rotation;
      return;
    }

    this.handle.rotation += rotationAmount;
    this.shadow.rotation = this.handle.rotation;
    
    this.currentRotation += rotationAmount;
    this.accumulatedRotation += Math.abs(rotationAmount);

    // Full rotation
    const completedRotations = Math.floor(this.accumulatedRotation / fullRotation);
    if (completedRotations > 0) {
      for (let i = 0; i < completedRotations; i++) {
        this.fullRotations.push(this.lastDirection === 'LEFT' ? -1 : 1);
      }
      this.accumulatedRotation %= fullRotation;
      this.updateRotationDisplay();
    }
  }

  private updateRotationDisplay() {
    const display = document.getElementById('rotation-display');
    if (!display) return;
  
    const rotationText = this.fullRotations.map(r => 
      r === 1 ? '↻' : '↺'
    ).join(' ');
  
    display.innerHTML = `
      <div>Total Rotations: ${this.fullRotations.length}</div>
      <div>History: ${rotationText}</div>
      <div>Current: ${this.lastDirection === 'LEFT' ? '↺' : '↻'}</div>
    `;
  }

  onResize(width: number, height: number) {
    // Background
    if (this.background) {
      this.background.width = width;
      this.background.height = height;
    }

    // Door elements
    if (this.door) {
      this.door.position.set(width * 0.5, height * 0.49);
    }
    if (this.shadow) {
      this.shadow.position.set(width * 0.485, height * 0.5);
    }
    if (this.handle) {
      this.handle.position.set(width * 0.485, height * 0.485);
    }
  }
}