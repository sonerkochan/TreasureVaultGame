import { Container, Text, Graphics } from "pixi.js";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "../core/GameConstants";

export class HelpUI {
  public container: Container;
  private isHelpVisible = false;

  constructor() {
    this.container = new Container();
    this.createHelpButton();
    this.createInstructions();
  }

  private createHelpButton() {
    const helpButtonBg = new Graphics();
    helpButtonBg.beginFill(0x000000, 0.6);
    helpButtonBg.drawRoundedRect(0, 0, 100, 40, 10);
    helpButtonBg.endFill();
    helpButtonBg.interactive = true;
    helpButtonBg.cursor = 'pointer';
    helpButtonBg.position.set(DESIGN_WIDTH - 120, 20);

    const helpButtonText = new Text('Help', {
      fontFamily: 'Verdana',
      fontSize: 24,
      fill: 'white',
    });
    helpButtonText.anchor.set(0.5);
    helpButtonText.position.set(50, 20);

    helpButtonBg.addChild(helpButtonText);
    this.container.addChild(helpButtonBg);

    return helpButtonBg;
  }

  private createInstructions() {
    const instructions = new Text('Controls:\nA - Rotate Left\nD - Rotate Right\n Press `Help` button to close this window', {
      fontFamily: 'Verdana',
      fontSize: 24,
      fill: 'white',
      align: 'center',
    });
    instructions.anchor.set(0.5);
    instructions.position.set(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);

    const instructionBg = new Graphics();
    instructionBg.beginFill(0x808080);
    instructionBg.drawRoundedRect(0, 0, instructions.width + 40, instructions.height + 40, 20);
    instructionBg.endFill();
    instructionBg.position.set((DESIGN_WIDTH - instructionBg.width) / 2, (DESIGN_HEIGHT - instructionBg.height) / 2);

    const instructionContainer = new Container();
    instructionContainer.addChild(instructionBg);
    instructionContainer.addChild(instructions);
    instructionContainer.visible = false;
    this.container.addChild(instructionContainer);

    const helpButton = this.container.children[0] as Graphics;
    helpButton.on('pointerdown', () => {
      this.isHelpVisible = !this.isHelpVisible;
      instructionContainer.visible = this.isHelpVisible;
    });

    return instructionContainer;
  }
}