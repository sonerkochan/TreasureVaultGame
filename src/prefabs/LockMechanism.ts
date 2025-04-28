import { Sprite } from "pixi.js";
import { GameAudio } from "../core/GameAudio";
import { RESET_SPIN_DURATION, RESET_SPIN_SPEED } from "../core/GameConstants";

export class LockMechanism {
  private handle: Sprite;
  private handleShadow: Sprite;
  private audio: GameAudio;

  // Rotation tracking
  private rotationSpeed = 0.03;
  private maxRotation = 3 * Math.PI;
  private fullRotations: number[] = [];
  private accumulatedRotation = 0;
  private lastDirection: 'LEFT' | 'RIGHT' | null = null;

  // Game state
  private generatedPattern: number[] = [];
  private isResetting = false;
  private resetSpinSpeed = 0;
  private resetSpinDuration = 0;

  constructor(handle: Sprite, handleShadow: Sprite, audio: GameAudio) {
    this.handle = handle;
    this.handleShadow = handleShadow;
    this.audio = audio;
  }

  public generatePattern() {
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
  }

  public startReset() {
    this.isResetting = true;
    this.resetSpinSpeed = RESET_SPIN_SPEED * (Math.random() > 0.5 ? 1 : -1);
    this.resetSpinDuration = RESET_SPIN_DURATION;
    this.fullRotations = [];
    this.accumulatedRotation = 0;
  }

  public handleResetSpin(delta: number) {
    this.handle.rotation += this.resetSpinSpeed * delta;
    this.handleShadow.rotation = this.handle.rotation;

    this.resetSpinDuration -= delta;

    if (this.resetSpinDuration <= 0) {
      this.isResetting = false;
      this.handle.rotation = 0;
      this.handleShadow.rotation = 0;
      this.generatePattern();
    }
  }

  public hasInputError(): boolean {
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

  public update(delta: number, leftPressed: boolean, rightPressed: boolean) {
    if (this.isResetting) {
      this.handleResetSpin(delta);
      return;
    }

    const fullRotation = Math.PI / 3;
    let rotationAmount = 0;

    if (leftPressed) {
      rotationAmount = -this.rotationSpeed * delta;
      this.lastDirection = 'LEFT';
    } else if (rightPressed) {
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
  }

  public isPatternMatched(): boolean {
    const patternStr = this.generatedPattern.join(',');
    const historyStr = this.fullRotations.slice(-this.generatedPattern.length).join(',');
    return patternStr === historyStr;
  }

  public get isResettingState(): boolean {
    return this.isResetting;
  }
}