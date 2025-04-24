import { Container, Text, Graphics, Sprite, Texture } from "pixi.js";
import { centerObjects } from "../utils/misc";
import { SceneUtils } from "../core/App";

export default class Game extends Container {
  name = "Game";

  private background!: Sprite;
  private door!: Sprite;
  private handle!: Sprite;
  private shadow!: Sprite;

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

    // Create and position background
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
    this.door.scale.set(0.28);

    // Create handle shadow
    const shadowTexture = Texture.from('public/assets/handleShadow.png');
    this.shadow = new Sprite(shadowTexture);
    this.shadow.anchor.set(0.5);
    this.shadow.position.set(
      window.innerWidth * 0.485,
      window.innerHeight * 0.5
    );
    this.shadow.scale.set(0.25);

    // Create handle
    const handleTexture = Texture.from('public/assets/handle.png');
    this.handle = new Sprite(handleTexture);
    this.handle.anchor.set(0.5);
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
  }

  onResize(width: number, height: number) {
    // Resize background
    if (this.background) {
      this.background.width = width;
      this.background.height = height;
    }

    // Reposition door elements
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

  update(delta: number) {
    // Empty update method (kept for consistency)
  }
}