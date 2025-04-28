import { Container, Text, Graphics, Sprite } from "pixi.js";
import { centerObjects, after } from "../utils/misc";
import { SceneUtils } from "../core/App";
import Keyboard from "../core/Keyboard";
import { GameUI } from "../core/GameUI";
import { GameAudio } from "../core/GameAudio";
import { 
  DESIGN_WIDTH, 
  DESIGN_HEIGHT, 
  DESIGN_RATIO,
} from "../core/GameConstants";
import { HelpUI } from "../prefabs/HelpUI";
import { LockMechanism } from "../prefabs/LockMechanism";
import { UnlockEffect } from "../prefabs/UnlockEffect";
import { GameObjects } from "../prefabs/GameObjects";

export default class Game extends Container {
  name = "Game";

  // Visual elements
  private background!: Sprite;
  private gameFrame!: Graphics;

  // Components
  private ui: GameUI;
  private audio: GameAudio;
  private helpUI: HelpUI;
  private lockMechanism!: LockMechanism;
  private unlockEffect!: UnlockEffect;

  // Game state
  private timerActive = false;
  private startTime = 0;
  private currentTime = 0;

  constructor(protected utils: SceneUtils) {
    super();
    this.ui = new GameUI();
    this.audio = new GameAudio();
    this.helpUI = new HelpUI();
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
    
    this.gameFrame = GameObjects.createGameFrame();
    this.addChild(this.gameFrame);
    
    this.background = GameObjects.createBackground();
    const door = GameObjects.createDoor();
    const doorOpen = GameObjects.createDoorOpen();
    const doorOpenShadow = GameObjects.createDoorOpenShadow();
    const handleShadow = GameObjects.createHandleShadow();
    const handle = GameObjects.createHandle();
    const blinkEffect = GameObjects.createBlinkEffect();
    const animatedDoor = GameObjects.createAnimatedDoor();
    
    this.gameFrame.addChild(
      this.background,
      door,
      handleShadow,
      handle,
      doorOpenShadow,
      doorOpen,
      this.ui.container,
      blinkEffect,
      animatedDoor,
      this.helpUI.container
    );
    
    this.lockMechanism = new LockMechanism(handle, handleShadow, this.audio);
    this.unlockEffect = new UnlockEffect(
      door,
      doorOpen,
      doorOpenShadow,
      handle,
      handleShadow,
      blinkEffect,
      animatedDoor,
      this.audio
    );
    
    this.lockMechanism.generatePattern();
    this.startTimer();
  
    this.addChild(this.audio.container);
  }
  

  private startTimer() {
    this.startTime = performance.now();
    this.currentTime = 0;
    this.timerActive = true;
  }

  private stopTimer() {
    this.timerActive = false;
  }

  update(delta: number) {
    const keyboard = Keyboard.getInstance();
    const leftPressed = keyboard.getAction("LEFT");
    const rightPressed = keyboard.getAction("RIGHT");

    if (this.unlockEffect.isUnlockedState) {
      this.unlockEffect.handleUnlockCountdown(delta);
      if (this.unlockEffect.unlockTimeLeft <= 0) {
        this.unlockEffect.resetAfterUnlock();
        this.lockMechanism.startReset();
        after(3, () => {
          this.startTimer();
        });
      }
      return;
    }

    if (this.lockMechanism.isResettingState) {
      this.ui.visible = false;
      this.lockMechanism.handleResetSpin(delta);
      return;
    } else {
      this.ui.visible = true;
    }

    if (this.timerActive && !this.unlockEffect.isUnlockedState) {
      this.currentTime = (performance.now() - this.startTime) / 1000;
      this.ui.updateTimerText(this.currentTime);
    }

    this.lockMechanism.update(delta, leftPressed, rightPressed);

    if (this.lockMechanism.isPatternMatched()) {
      this.unlockEffect.unlockVault();
      this.stopTimer();
    }
  }
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
  }
}