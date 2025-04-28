import { Sprite, AnimatedSprite } from "pixi.js";
import { GameAudio } from "../core/GameAudio";
import { BLINK_SPEED, UNLOCK_DURATION } from "../core/GameConstants";

export class UnlockEffect {
  private door: Sprite;
  private doorOpen: Sprite;
  private doorOpenShadow: Sprite;
  private handle: Sprite;
  private handleShadow: Sprite;
  private blinkEffect: Sprite;
  private animatedDoor: AnimatedSprite;
  private audio: GameAudio;

  private isUnlocked = false;
  private unlockTime = 0;
  private blinkPhase = 0;

  constructor(
    door: Sprite,
    doorOpen: Sprite,
    doorOpenShadow: Sprite,
    handle: Sprite,
    handleShadow: Sprite,
    blinkEffect: Sprite,
    animatedDoor: AnimatedSprite,
    audio: GameAudio
  ) {
    this.door = door;
    this.doorOpen = doorOpen;
    this.doorOpenShadow = doorOpenShadow;
    this.handle = handle;
    this.handleShadow = handleShadow;
    this.blinkEffect = blinkEffect;
    this.animatedDoor = animatedDoor;
    this.audio = audio;

    this.animatedDoor.animationSpeed = 0.2;
    this.animatedDoor.loop = true;
  }

  public async unlockVault() {
    this.isUnlocked = true;
    this.unlockTime = UNLOCK_DURATION;

    this.door.visible = false;
    this.handle.visible = false;
    this.handleShadow.visible = false;
    this.animatedDoor.visible = true;
    this.animatedDoor.play();

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.doorOpen.visible = true;
    this.doorOpenShadow.visible = true;
    this.blinkEffect.visible = true;
    this.blinkPhase = 0;
    this.animatedDoor.visible = false;

    this.audio.playOpenDoorSound();
  }

  public updateBlinkEffect(delta: number) {
    if (!this.blinkEffect.visible) return;
    
    this.blinkPhase += BLINK_SPEED * delta;
    this.blinkEffect.alpha = Math.abs(Math.sin(this.blinkPhase)) * 0.5 + 0.5;
  }

  public handleUnlockCountdown(delta: number) {
    this.unlockTime -= delta;
    this.updateBlinkEffect(delta);
  }

  public resetAfterUnlock() {
    this.isUnlocked = false;
    this.door.visible = true;
    this.handle.visible = true;
    this.handleShadow.visible = true;
    this.doorOpen.visible = false;
    this.doorOpenShadow.visible = false;
    this.blinkEffect.visible = false;
    this.blinkEffect.alpha = 0;
  }

  public get isUnlockedState(): boolean {
    return this.isUnlocked;
  }

  public get unlockTimeLeft(): number {
    return this.unlockTime;
  }
}