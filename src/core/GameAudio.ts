import { Graphics, Text, Container } from "pixi.js";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "../core/GameConstants";

export class GameAudio {
  private mute = false;
  private muteButton: Graphics;
  private muteIcon: Text;
  private historySound = new Audio('sounds/clickSound.wav');
  private openDoorSound = new Audio('sounds/openDoor.wav');
  public container: Container;

  constructor() {
    this.container = new Container();
    this.muteButton = new Graphics();
    this.muteIcon = new Text('', {
      fontFamily: 'FontAwesome', // Set the font family to FontAwesome
      fontSize: 32,
      fill: 'white',
    });
    this.createMuteButton();
  }

  private createMuteButton() {
    // Create button background
    this.muteButton.beginFill(0x000000, 0.6);
    this.muteButton.drawRoundedRect(0, 0, 50, 50, 10);
    this.muteButton.endFill();
    this.muteButton.interactive = true;
    this.muteButton.cursor = 'pointer';
    this.muteButton.position.set(20, 20);  // Adjust button position

    // Set the mute icon as Font Awesome icon for volume
    this.muteIcon.text = '\uf028'; // Font Awesome icon code for "volume-up"
    this.muteIcon.anchor.set(0.5);
    this.muteIcon.position.set(25, 25);  // Center icon in the button

    this.muteButton.addChild(this.muteIcon);

    // Add click handler to toggle mute state
    this.muteButton.on('pointerdown', () => this.toggleMute());

    // Add mute button to the container
    this.container.addChild(this.muteButton);

    this.updateMuteIcon();
  }

  private toggleMute() {
    this.mute = !this.mute;
    this.updateMuteIcon();
  }

  private updateMuteIcon() {
    if (this.mute) {
      this.muteIcon.text = '\uf026';
    } else {
      this.muteIcon.text = '\uf028';
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
}
