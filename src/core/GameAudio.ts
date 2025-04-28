// GameAudio.ts
export class GameAudio {
  private mute = false;
  private muteButton: HTMLButtonElement;
  private muteIcon: HTMLElement;
  private historySound = new Audio('sounds/clickSound.wav');
  private openDoorSound = new Audio('sounds/openDoor.wav');

  constructor() {
    this.muteButton = document.createElement('button');
    this.muteIcon = document.createElement('i');
    this.createMuteButton();
  }

  private createMuteButton() {
    this.muteButton.style.position = 'fixed';
    this.muteButton.style.top = '20px';
    this.muteButton.style.left = '20px';
    this.muteButton.style.background = 'transparent';
    this.muteButton.style.border = 'none';
    this.muteButton.style.cursor = 'pointer';
    this.muteButton.style.zIndex = '1001';
    this.muteButton.style.fontSize = '32px';
    this.muteButton.style.color = 'white';

    this.muteIcon.className = 'fa-solid fa-volume-high';
    this.muteButton.appendChild(this.muteIcon);

    this.muteButton.addEventListener('click', () => this.toggleMute());
    document.body.appendChild(this.muteButton);
  }

  public toggleMute() {
    this.mute = !this.mute;
    if (this.mute) {
      this.muteIcon.className = 'fa-solid fa-volume-xmark';
    } else {
      this.muteIcon.className = 'fa-solid fa-volume-high';
    }
  }

  public playClickSound() {
    if (!this.mute) {
      this.historySound.currentTime = 0;
      this.historySound.play();
    }
  }

  public playOpenDoorSound() {
    if (!this.mute) {
      this.openDoorSound.currentTime = 0;
      this.openDoorSound.play();
    }
  }

  public updatePosition(offsetX: number, offsetY: number, scale: number) {
    this.muteButton.style.right = `${offsetX / scale + 20}px`;
    this.muteButton.style.top = `${offsetY / scale + 20}px`;
  }
}