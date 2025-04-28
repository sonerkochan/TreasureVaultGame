import { Sprite, AnimatedSprite, Texture, Graphics } from "pixi.js";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "../core/GameConstants";
import { doorTextures } from "../core/GameConstants";

export class GameObjects {
  static createBackground(): Sprite {
    const background = new Sprite(Texture.from('assets/bg.png'));
    background.width = DESIGN_WIDTH;
    background.height = DESIGN_HEIGHT;
    return background;
  }

  static createDoor(): Sprite {
    const door = new Sprite(Texture.from('assets/door.png'));
    door.anchor.set(0.5);
    door.position.set(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.49);
    door.scale.set(0.25);
    return door;
  }

  static createDoorOpen(): Sprite {
    const doorOpen = new Sprite(Texture.from('assets/doorOpen.png'));
    doorOpen.anchor.set(0.5);
    doorOpen.position.set(DESIGN_WIDTH * 0.73, DESIGN_HEIGHT * 0.49);
    doorOpen.scale.set(0.25);
    doorOpen.visible = false;
    return doorOpen;
  }

  static createDoorOpenShadow(): Sprite {
    const doorOpenShadow = new Sprite(Texture.from('assets/doorOpenShadow.png'));
    doorOpenShadow.anchor.set(0.5);
    doorOpenShadow.position.set(DESIGN_WIDTH * 0.73 + 30, DESIGN_HEIGHT * 0.49 + 10);
    doorOpenShadow.scale.set(0.25);
    doorOpenShadow.visible = false;
    return doorOpenShadow;
  }

  static createHandleShadow(): Sprite {
    const handleShadow = new Sprite(Texture.from('assets/handleShadow.png'));
    handleShadow.anchor.set(0.5);
    handleShadow.position.set(DESIGN_WIDTH * 0.485, DESIGN_HEIGHT * 0.5);
    handleShadow.scale.set(0.25);
    return handleShadow;
  }

  static createHandle(): Sprite {
    const handle = new Sprite(Texture.from('assets/handle.png'));
    handle.anchor.set(0.5);
    handle.position.set(DESIGN_WIDTH * 0.485, DESIGN_HEIGHT * 0.485);
    handle.scale.set(0.25);
    return handle;
  }

  static createBlinkEffect(): Sprite {
    const blinkEffect = new Sprite(Texture.from('assets/blink.png'));
    blinkEffect.anchor.set(0.5);
    blinkEffect.position.set(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.5);
    blinkEffect.scale.set(0.25);
    blinkEffect.visible = false;
    blinkEffect.alpha = 0;
    return blinkEffect;
  }

  static createAnimatedDoor(): AnimatedSprite {
    const animatedDoor = new AnimatedSprite(doorTextures.map(t => Texture.from(t)));
    animatedDoor.anchor.set(0.5);
    animatedDoor.position.set(DESIGN_WIDTH * 0.58, DESIGN_HEIGHT * 0.5);
    animatedDoor.scale.set(0.25);
    animatedDoor.visible = false;
    return animatedDoor;
  }

  static createGameFrame(): Graphics {
    const gameFrame = new Graphics();
    gameFrame.beginFill(0x000000);
    gameFrame.drawRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    gameFrame.endFill();
    return gameFrame;
  }
}
