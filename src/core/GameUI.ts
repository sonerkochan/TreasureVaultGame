// GameUI.ts
import { Container, Text } from "pixi.js";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "./GameConstants";

export class GameUI {
  private timerContainer: Container;
  private timerText: Text;

  constructor() {
    this.timerContainer = new Container();
    this.timerText = new Text("00.00", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ffffff",
      fontWeight: "bold"
    });
    this.initTimer();
  }

  private initTimer() {
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(75, 25);
    this.timerContainer.addChild(this.timerText);
    this.positionTimer();
  }

  private positionTimer() {
    this.timerContainer.position.set(
      DESIGN_WIDTH * 0.28,
      DESIGN_HEIGHT * 0.435
    );
    this.timerContainer.scale.set(0.5);
  }

  public updateTimerText(time: number) {
    const formattedTime = time.toFixed(2).padStart(5, '0');
    this.timerText.text = formattedTime;
  }

  public get container(): Container {
    return this.timerContainer;
  }

  public set visible(value: boolean) {
    this.timerContainer.visible = value;
  }
}