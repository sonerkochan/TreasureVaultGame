// Game.ts
import { Container, Text, Graphics, Sprite, Texture, AnimatedSprite } from "pixi.js";
import { centerObjects } from "../utils/misc";
import { SceneUtils } from "../core/App";
import Keyboard from "../core/Keyboard";
import { GameUI } from "../core/GameUI";
import { GameAudio } from "../core/GameAudio";
import { 
  DESIGN_WIDTH, 
  DESIGN_HEIGHT, 
  DESIGN_RATIO,
  UNLOCK_DURATION,
  RESET_SPIN_DURATION,
  RESET_SPIN_SPEED,
  BLINK_SPEED,
  doorTextures
} from "../core/GameConstants";

export default class Game extends Container {
  name = "Game";

  // Visual elements
  private background!: Sprite;
  private door!: Sprite;
  private doorOpen!: Sprite;  
  private doorOpenShadow!: Sprite;
  private handle!: Sprite;
  private handleShadow!: Sprite;
  private blinkEffect!: Sprite;
  private gameFrame!: Graphics;
  private animatedDoor!: AnimatedSprite;

  // Components
  private ui: GameUI;
  private audio: GameAudio;

  // Rotation tracking
  private keyboard = Keyboard.getInstance();
  private rotationSpeed = 0.03;
  private maxRotation = 3 * Math.PI;
  private fullRotations: number[] = [];
  private accumulatedRotation = 0;
  private lastDirection: 'LEFT' | 'RIGHT' | null = null;

  // Game state
  private generatedPattern: number[] = [];
  private isUnlocked = false;
  private unlockTime = 0;
  private currentTime = 0;
  private timerActive = false;
  private startTime = 0;
  private isResetting = false;
  private resetSpinSpeed = 0;
  private resetSpinDuration = 0;
  private blinkPhase = 0;

  constructor(protected utils: SceneUtils) {
    super();
    this.ui = new GameUI();
    this.audio = new GameAudio();
  }

  async load() {
    await this.utils.assetLoader.loadAssets();
    const text = new Text("Loading...", {
      fontFamily: "Verdana",
      fontSize: 50,
      fill: "white",
    });
    text.resolution = 2;
    centerObjects(text);

    const loadingBg = new Graphics()
      .beginFill(0x0b1354)
      .drawRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    this.addChild(loadingBg, text);
  }

  async start() {
    this.removeChildren();
  
    this.gameFrame = new Graphics();
    this.gameFrame.beginFill(0x000000);
    this.gameFrame.drawRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.gameFrame.endFill();
    this.addChild(this.gameFrame);
  
    this.background = new Sprite(Texture.from('assets/bg.png'));
    this.background.width = DESIGN_WIDTH;
    this.background.height = DESIGN_HEIGHT;
  
    this.door = new Sprite(Texture.from('assets/door.png'));
    this.door.anchor.set(0.5);
    this.door.position.set(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.49);
    this.door.scale.set(0.25);
  
    this.doorOpen = new Sprite(Texture.from('assets/doorOpen.png'));
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.position.set(DESIGN_WIDTH * 0.73, DESIGN_HEIGHT * 0.49);
    this.doorOpen.scale.set(0.25);
    this.doorOpen.visible = false;
  
    this.doorOpenShadow = new Sprite(Texture.from('assets/doorOpenShadow.png'));
    this.doorOpenShadow.anchor.set(0.5);
    this.doorOpenShadow.position.set(this.doorOpen.position.x + 30, this.doorOpen.position.y + 10);
    this.doorOpenShadow.scale.set(0.25);
    this.doorOpenShadow.visible = false;
  
    this.handleShadow = new Sprite(Texture.from('assets/handleShadow.png'));
    this.handleShadow.anchor.set(0.5);
    this.handleShadow.position.set(DESIGN_WIDTH * 0.485, DESIGN_HEIGHT * 0.5);
    this.handleShadow.scale.set(0.25);
  
    this.handle = new Sprite(Texture.from('assets/handle.png'));
    this.handle.anchor.set(0.5);
    this.handle.position.set(DESIGN_WIDTH * 0.485, DESIGN_HEIGHT * 0.485);
    this.handle.scale.set(0.25);

    this.blinkEffect = new Sprite(Texture.from('assets/blink.png'));
    this.blinkEffect.anchor.set(0.5);
    this.blinkEffect.position.set(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.5);
    this.blinkEffect.scale.set(0.25);
    this.blinkEffect.visible = false;
    this.blinkEffect.alpha = 0;

    this.animatedDoor = new AnimatedSprite(doorTextures.map(t => Texture.from(t)));
    this.animatedDoor.anchor.set(0.5);
    this.animatedDoor.position.set(DESIGN_WIDTH * 0.58, DESIGN_HEIGHT * 0.5);
    this.animatedDoor.scale.set(0.25);
    this.animatedDoor.animationSpeed = 0.2;
    this.animatedDoor.loop = true;
    this.animatedDoor.visible = false;

    this.gameFrame.addChild(
      this.background,
      this.door,
      this.handleShadow,
      this.handle,
      this.doorOpenShadow,
      this.doorOpen,
      this.ui.container,
      this.blinkEffect,
      this.animatedDoor
    );
  
    //this.createRotationDisplay();
    this.generatePattern();
    //this.updateRotationDisplay();
    this.startTimer();
  }

  private startTimer() {
    this.startTime = performance.now();
    this.currentTime = 0;
    this.timerActive = true;
  }

  private stopTimer() {
    this.timerActive = false;
  }

  private generatePattern() {
    const pattern: number[] = [];
    let currentDirection = Math.random() > 0.5 ? 1 : -1;
  
    for (let i = 0; i < 3; i++) {
      const times = Math.floor(Math.random() * 9) + 1;
      for (let j = 0; j < times; j++) {
        pattern.push(currentDirection);
      }
      currentDirection *= -1;
    }
  
    this.generatedPattern = pattern;
  
    const result = [];
    let current = pattern[0];
    let count = 1;
  
    for (let i = 1; i < pattern.length; i++) {
      if (pattern[i] === current) {
        count++;
      } else {
        result.push(`${count}${current === 1 ? 'R' : 'L'}`);
        current = pattern[i];
        count = 1;
      }
    }
    result.push(`${count}${current === 1 ? 'R' : 'L'}`);
  
    console.log(`Secret password: ${result.join(', ')}`);
    this.currentTime = 0;
  }

  private hasInputError(): boolean {
    if (this.fullRotations.length < 2) return false;

    const compareLength = Math.min(this.fullRotations.length, this.generatedPattern.length);
    const userInput = this.fullRotations.slice(-compareLength);
    const patternPart = this.generatedPattern.slice(0, compareLength);

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== patternPart[i]) {
        return true;
      }
    }

    return false;
  }

  private startReset() {
    this.isResetting = true;
    this.resetSpinSpeed = RESET_SPIN_SPEED * (Math.random() > 0.5 ? 1 : -1);
    this.resetSpinDuration = RESET_SPIN_DURATION;

    new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 3000);
    }).then(() => {
        this.startTimer();
    });

  }

  private handleResetSpin(delta: number) {
    this.handle.rotation += this.resetSpinSpeed * delta;
    this.handleShadow.rotation = this.handle.rotation;

    this.resetSpinDuration -= delta;

    if (this.resetSpinDuration <= 0) {
      this.isResetting = false;
      this.fullRotations = [];
      this.accumulatedRotation = 0;
      this.handle.rotation = 0;
      this.handleShadow.rotation = 0;
      this.generatePattern();
      //this.updateRotationDisplay();
    }
  }


  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async  unlockVault() {
    this.isUnlocked = true;
    this.unlockTime = UNLOCK_DURATION;

    this.door.visible = false;
    this.handle.visible = false;
    this.handleShadow.visible = false;
    this.animatedDoor.visible = true;
    this.animatedDoor.play();

    await this.delay(1000);
      this.doorOpen.visible = true;
      this.doorOpenShadow.visible = true;
      this.blinkEffect.visible = true;
      this.blinkPhase = 0;
      this.animatedDoor.visible = false;

    this.audio.playOpenDoorSound();
    this.stopTimer();
    
    //this.updateRotationDisplay();
  }

  private updateBlinkEffect(delta: number) {
    if (!this.blinkEffect.visible) return;
    
    this.blinkPhase += BLINK_SPEED * delta;
    this.blinkEffect.alpha = Math.abs(Math.sin(this.blinkPhase)) * 0.5 + 0.5;
  }

  private handleUnlockCountdown(delta: number) {
    this.unlockTime -= delta;
    this.updateBlinkEffect(delta);
    //this.updateRotationDisplay();
  }

  private resetAfterUnlock() {
    this.isUnlocked = false;
    this.door.visible = true;
    this.handle.visible = true;
    this.handleShadow.visible = true;
    this.doorOpen.visible = false;
    this.doorOpenShadow.visible = false;
    this.blinkEffect.visible = false;
    
    this.startReset();

    new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 3000);
    }).then(() => {
        this.startTimer();
    });

}


  update(delta: number) {
    if (this.isResetting) {
      this.ui.visible = false;
    } else {
      this.ui.visible = true;
    }

    if (this.timerActive && !this.isUnlocked) {
      this.currentTime = (performance.now() - this.startTime) / 1000;
      this.ui.updateTimerText(this.currentTime);
    }

    if (this.isUnlocked) {
      this.handleUnlockCountdown(delta);
      if (this.unlockTime <= 0) {
        this.resetAfterUnlock();
      }
      return;
    }

    if (this.isResetting) {
      this.handleResetSpin(delta);
      return;
    }

    const fullRotation = Math.PI / 3;
    let rotationAmount = 0;

    if (this.keyboard.getAction("LEFT")) {
      rotationAmount = -this.rotationSpeed * delta;
      this.lastDirection = 'LEFT';
    } else if (this.keyboard.getAction("RIGHT")) {
      rotationAmount = this.rotationSpeed * delta;
      this.lastDirection = 'RIGHT';
    } else {
      this.handle.rotation *= 0.9;
      this.handleShadow.rotation = this.handle.rotation;
      return;
    }

    const newRotation = this.handle.rotation + rotationAmount;

    const currentFullRotations = Math.floor(Math.abs(this.handle.rotation) / fullRotation);

    if (currentFullRotations >= 9 &&
      ((rotationAmount > 0 && newRotation > this.handle.rotation) ||
        (rotationAmount < 0 && newRotation < this.handle.rotation))) {
      const maxRotationSign = newRotation > 0 ? 1 : -1;
      this.handle.rotation = maxRotationSign * this.maxRotation;
      this.handleShadow.rotation = this.handle.rotation;
      return;
    }

    this.handle.rotation = newRotation;
    this.handleShadow.rotation = this.handle.rotation;

    this.accumulatedRotation += Math.abs(rotationAmount);

    while (this.accumulatedRotation >= fullRotation) {
      if (this.lastDirection) {
        this.fullRotations.push(this.lastDirection === 'LEFT' ? -1 : 1);
        this.accumulatedRotation -= fullRotation;

        this.audio.playClickSound();

        if (this.hasInputError()) {
          this.startReset();
          return;
        }
      }
    }

    const patternStr = this.generatedPattern.join(',');
    const historyStr = this.fullRotations.slice(-this.generatedPattern.length).join(',');

    if (patternStr === historyStr) {
      this.unlockVault();
    } /*else {
      this.updateRotationDisplay();
    }*/
  }


  // createRotationDisplay and updateRotationDisplay were for testing, purposes. 
  /*
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
        max-width: 300px;
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);

    const display = document.createElement('div');
    display.id = 'rotation-display';
    document.body.appendChild(display);
  }*/

  /*
  private updateRotationDisplay() {
    const display = document.getElementById('rotation-display');
    if (!display) return;

    const rotationText = this.fullRotations.map(r => r === 1 ? '↻' : '↺').join('');
    const passwordText = this.generatedPattern.map(r => r === 1 ? '↻' : '↺').join('');

    if (this.isUnlocked) {
      const secondsLeft = Math.ceil(this.unlockTime/60);
      display.innerHTML = `
        <div style="color: #4CAF50; font-weight: bold;">✅ Vault Unlocked in ${this.currentTime.toFixed(2)}s!</div>
        <div>Auto-closing in ${secondsLeft} second${secondsLeft !== 1 ? 's' : ''}...</div>
      `;
    } else {
      display.innerHTML = `
        <div><strong>Password:</strong> ${passwordText}</div>
        <div><strong>History:</strong> ${rotationText}</div>
        <div><strong>Total:</strong> ${this.fullRotations.length}</div>
        <div><strong>Current:</strong> ${this.lastDirection === 'LEFT' ? '↺' : '↻'}</div>
        <div><strong>Status:</strong> ${this.isResetting ? 'Resetting' : '❌ Still locked'}</div>
      `;
    }
  }
  */

  onResize(width: number, height: number) {
    const windowRatio = width / height;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (windowRatio > DESIGN_RATIO) {
      scale = height / DESIGN_HEIGHT;
      offsetX = (width - DESIGN_WIDTH * scale) / 2;
    } else {
      scale = width / DESIGN_WIDTH;
      offsetY = (height - DESIGN_HEIGHT * scale) / 2;
    }

    this.gameFrame.scale.set(scale);
    this.gameFrame.position.set(offsetX, offsetY);

    this.audio.updatePosition(offsetX, offsetY, scale);

    const display = document.getElementById('rotation-display');
    if (display) {
      display.style.left = `${offsetX / scale + 20}px`;
      display.style.top = `${offsetY / scale + 20}px`;
    }
  }
}