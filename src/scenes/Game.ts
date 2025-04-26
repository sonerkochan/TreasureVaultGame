import { Container, Text, Graphics, Sprite, Texture } from "pixi.js";
import { centerObjects } from "../utils/misc";
import { SceneUtils } from "../core/App";
import Keyboard from "../core/Keyboard";

export default class Game extends Container {
  name = "Game";

  // Visual elements
  private background!: Sprite;
  private door!: Sprite;
  private doorOpen!: Sprite;
  private doorOpenShadow!: Sprite;
  private handle!: Sprite;
  private handleShadow!: Sprite;
  private timerContainer!: Container;
  private timerText!: Text;
  private blinkEffect!: Sprite;

  // Rotation tracking
  private keyboard = Keyboard.getInstance();
  private rotationSpeed = 0.03;
  private maxRotation = 3 * Math.PI;
  private fullRotations: number[] = [];
  private accumulatedRotation = 0;
  private lastDirection: 'LEFT' | 'RIGHT' | null = null;

  // Unlock pattern
  private generatedPattern: number[] = [];
  private isUnlocked = false;
  private unlockTime = 0;
  private readonly UNLOCK_DURATION = 300;

  // Timer tracking
  private startTime = 0;
  private currentTime = 0;
  private timerActive = false;

  // Reset animation
  private isResetting = false;
  private resetSpinSpeed = 0;
  private resetSpinDuration = 0;
  private readonly RESET_SPIN_DURATION = 180;
  private readonly RESET_SPIN_SPEED = 0.3;

  // Blink effect
  private blinkPhase = 0;
  private readonly BLINK_SPEED = 0.1;

  // Sound effects
  private mute = false;
  private muteButton!: HTMLButtonElement;
  private muteIcon!: HTMLElement;
  private historySound = new Audio('sounds/clickSound.wav'); 
  private openDoorSound = new Audio('sounds/openDoor.wav'); 
  


  constructor(protected utils: SceneUtils) {
    super();
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
      .drawRect(0, 0, window.innerWidth, window.innerHeight);

    this.addChild(loadingBg, text);
  }

  async start() {
    this.removeChildren();
  
    // Initialize timer first
    this.initTimer();
    
    const bgTexture = Texture.from('assets/bg.png');
    this.background = new Sprite(bgTexture);
    this.background.width = window.innerWidth;
    this.background.height = window.innerHeight;
  
    const doorTexture = Texture.from('assets/door.png');
    this.door = new Sprite(doorTexture);
    this.door.anchor.set(0.5);
    this.door.position.set(window.innerWidth * 0.5, window.innerHeight * 0.49);
    this.door.scale.set(0.25);
  
    const doorOpenTexture = Texture.from('assets/doorOpen.png');
    this.doorOpen = new Sprite(doorOpenTexture);
    this.doorOpen.anchor.set(0.5);
    this.doorOpen.position.set(window.innerWidth * 0.73, window.innerHeight * 0.49);
    this.doorOpen.scale.set(0.25);
    this.doorOpen.visible = false;
  
    const doorOpenShadowTexture = Texture.from('assets/doorOpenShadow.png');
    this.doorOpenShadow = new Sprite(doorOpenShadowTexture);
    this.doorOpenShadow.anchor.set(0.5);
    this.doorOpenShadow.position.set(this.doorOpen.position.x + 30, this.doorOpen.position.y + 10);
    this.doorOpenShadow.scale.set(0.25);
    this.doorOpenShadow.visible = false;
  
    const handleShadowTexture = Texture.from('assets/handleShadow.png');
    this.handleShadow = new Sprite(handleShadowTexture);
    this.handleShadow.anchor.set(0.5);
    this.handleShadow.position.set(window.innerWidth * 0.485, window.innerHeight * 0.5);
    this.handleShadow.scale.set(0.25);
  
    const handleTexture = Texture.from('assets/handle.png');
    this.handle = new Sprite(handleTexture);
    this.handle.anchor.set(0.5);
    this.handle.position.set(window.innerWidth * 0.485, window.innerHeight * 0.485);
    this.handle.scale.set(0.25);

    const blinkTexture = Texture.from('assets/blink.png');
    this.blinkEffect = new Sprite(blinkTexture);
    this.blinkEffect.anchor.set(0.5);
    this.blinkEffect.position.set(window.innerWidth * 0.5, window.innerHeight * 0.5);
    this.blinkEffect.scale.set(0.25);
    this.blinkEffect.visible = false;
    this.blinkEffect.alpha = 0;
  
    this.addChild(
      this.background,
      this.door,
      this.handleShadow,
      this.handle,
      this.doorOpenShadow,
      this.doorOpen,
      this.timerContainer,
      this.blinkEffect
    );
  
    this.createMuteButton();
    this.createRotationDisplay();
    this.generatePattern();
    this.updateRotationDisplay();
    this.startTimer();
  }


  private playClickSound() {
    if (!this.mute) {
      this.historySound.currentTime = 0;
      this.historySound.play();
    }
  }

  private playOpenDoorSound() {
    if (!this.mute) {
      this.openDoorSound.currentTime = 0;
      this.openDoorSound.play();
    }
  }

  private createMuteButton() {
    this.muteButton = document.createElement('button');
    this.muteButton.style.position = 'fixed';
    this.muteButton.style.top = '20px';
    this.muteButton.style.right = '20px';
    this.muteButton.style.background = 'transparent';
    this.muteButton.style.border = 'none';
    this.muteButton.style.cursor = 'pointer';
    this.muteButton.style.zIndex = '1001';
    this.muteButton.style.fontSize = '32px';
    this.muteButton.style.color = 'white';
  
    this.muteIcon = document.createElement('i');
    this.muteIcon.className = 'fa-solid fa-volume-high'; // start unmuted
    this.muteButton.appendChild(this.muteIcon);
  
    this.muteButton.addEventListener('click', () => this.toggleMute());
  
    document.body.appendChild(this.muteButton);
  }
  
  private toggleMute() {
    this.mute = !this.mute;
    if (this.mute) {
      this.muteIcon.className = 'fa-solid fa-volume-xmark'; // muted
    } else {
      this.muteIcon.className = 'fa-solid fa-volume-high'; // unmuted
    }
  }
  

  private initTimer() {
    this.timerContainer = new Container();
    
    this.timerText = new Text("00.00", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ffffff",
      fontWeight: "bold"
    });
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(75, 25);
    
    this.timerContainer.addChild(this.timerText);
    this.positionTimer();
  }

  private positionTimer() {
    this.timerContainer.position.set(
      window.innerWidth * 0.28,
      window.innerHeight * 0.435
    );
    this.timerContainer.scale.set(0.5);
  }

  private startTimer() {
    this.startTime = performance.now();
    this.currentTime = 0;
    this.timerActive = true;
    this.updateTimerText();
  }

  private stopTimer() {
    this.timerActive = false;
  }

  private resetTimer() {
    this.startTime = performance.now();
    this.currentTime = 0;
    this.updateTimerText();
  }

  private updateTimerText() {
    if (!this.timerText) return;
    const formattedTime = this.currentTime.toFixed(2).padStart(5, '0');
    this.timerText.text = formattedTime;
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
        max-width: 300px;
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);

    const display = document.createElement('div');
    display.id = 'rotation-display';
    document.body.appendChild(display);

    this.updateRotationDisplay();
  }

  private generatePattern() {
    const pattern: number[] = [];
    let currentDirection = Math.random() > 0.5 ? 1 : -1;

    for (let i = 0; i < 3; i++) {
      const times = Math.floor(Math.random() * 4); // Reduced to 3 for easier testing.
      for (let j = 0; j < times; j++) {
        pattern.push(currentDirection);
      }
      currentDirection *= -1;
    }

    this.generatedPattern = pattern;
    this.resetTimer();
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
    this.resetSpinSpeed = this.RESET_SPIN_SPEED * (Math.random() > 0.5 ? 1 : -1);
    this.resetSpinDuration = this.RESET_SPIN_DURATION;
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
      this.updateRotationDisplay();
    }
  }

  private unlockVault() {
    this.isUnlocked = true;
    this.unlockTime = this.UNLOCK_DURATION;

    // Delay for opening door to make the UX better.
    setTimeout(() => {
    this.door.visible = false;
    this.handle.visible = false;
    this.handleShadow.visible = false;
    this.doorOpen.visible = true;
    this.doorOpenShadow.visible = true;
    // Blinking effect start
    this.blinkEffect.visible = true;
    this.blinkPhase = 0;
    }, 1000);  

    
    this.playOpenDoorSound();


    this.stopTimer();
    
    
    const display = document.getElementById('rotation-display');
    if (display) {
      display.innerHTML = `
        <div style="color: #4CAF50; font-weight: bold;">✅ Vault Unlocked in ${this.currentTime.toFixed(2)}s!</div>
        <div>Auto-closing in ${Math.ceil(this.unlockTime/60)} seconds...</div>
      `;
    }
  }

  private updateBlinkEffect(delta: number) {
    if (!this.blinkEffect.visible) return;
    
    this.blinkPhase += this.BLINK_SPEED * delta;
    this.blinkEffect.alpha = Math.abs(Math.sin(this.blinkPhase)) * 0.5 + 0.5; // Oscillates between 0.5 and 1.0
  }

  private handleUnlockCountdown(delta: number) {
    this.unlockTime -= delta;
    this.updateBlinkEffect(delta);
    
    const display = document.getElementById('rotation-display');
    if (display) {
      const secondsLeft = Math.ceil(this.unlockTime/60);
      display.innerHTML = `
        <div style="color: #4CAF50; font-weight: bold;">✅ Vault Unlocked in ${this.currentTime.toFixed(2)}s!</div>
        <div>Auto-closing in ${secondsLeft} second${secondsLeft !== 1 ? 's' : ''}...</div>
      `;
    }

    if (this.unlockTime <= 0) {
      this.resetAfterUnlock();
    }
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
    this.startTimer();
    this.updateRotationDisplay();
  }

  update(delta: number) {
    // Hide the timer when resetting
    if (this.isResetting) {
      this.timerContainer.visible = false;
    } else {
      this.timerContainer.visible = true;
    }

    // Update timer
    if (this.timerActive && !this.isUnlocked) {
      this.currentTime = (performance.now() - this.startTime) / 1000;
      this.updateTimerText();
    }

    if (this.isUnlocked) {
      this.handleUnlockCountdown(delta);
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

        this.playClickSound();

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
    } else {
      this.updateRotationDisplay();
    }
  }

  private updateRotationDisplay() {
    const display = document.getElementById('rotation-display');
    if (!display) return;

    const rotationText = this.fullRotations.map(r => r === 1 ? '↻' : '↺').join('');
    const passwordText = this.generatedPattern.map(r => r === 1 ? '↻' : '↺').join('');

    display.innerHTML = `
      <div><strong>Password:</strong> ${passwordText}</div>
      <div><strong>History:</strong> ${rotationText}</div>
      <div><strong>Total:</strong> ${this.fullRotations.length}</div>
      <div><strong>Current:</strong> ${this.lastDirection === 'LEFT' ? '↺' : '↻'}</div>
      <div><strong>Status:</strong> ${this.isResetting ? 'Resetting' : '❌ Still locked'}</div>
    `;
  }

  onResize(width: number, height: number) {
    if (this.background) {
      this.background.width = width;
      this.background.height = height;
    }
    if (this.timerContainer) {
      this.positionTimer();
    }
    if (this.door) {
      this.door.position.set(width * 0.5, height * 0.49);
    }
    if (this.handleShadow) {
      this.handleShadow.position.set(width * 0.485, height * 0.5);
    }
    if (this.handle) {
      this.handle.position.set(width * 0.485, height * 0.485);
    }
    if (this.doorOpen) {
      this.doorOpen.position.set(width * 0.73, height * 0.49);
    }
    if (this.doorOpenShadow) {
      this.doorOpenShadow.position.set(width * 0.73 + 10, height * 0.49 + 10);
    }
    if (this.blinkEffect) {
      this.blinkEffect.position.set(width * 0.5, height * 0.5);
    }
  }
}