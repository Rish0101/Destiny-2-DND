import { Scene, GameObjects, Input } from "phaser";

export class Game extends Scene {
  private guardian!: GameObjects.Rectangle;
  private positionLabel!: GameObjects.Text;
  private destinationHighlight!: GameObjects.Rectangle;
  private selected = false;
  private readonly tileSize = 35;
  private readonly boardSize = 15;
  private readonly boardX = 200;
  private readonly boardY = 30;
  private column = 0;
  private row = 15;
  private readonly layout = [
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  ];

  constructor() {
    super("Game");
  }

  preload() {
    this.load.svg("vault-entrance", "assets/maps/vault-entrance.svg");
  }

  create() {
    this.cameras.main.setBackgroundColor("#10151f");
    this.input.mouse?.disableContextMenu();

    // Level 1: keep the entire entrance visible without stretching the map.
    const background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "vault-entrance")
      .setDepth(-1);
    const mapScale = Math.min(
      this.scale.width / background.width,
      this.scale.height / background.height,
    );
    background.setScale(mapScale);

    this.column = 0;
    this.row = 7;
    this.selected = false;
    const labelStyle = { fontSize: "20px", color: "#cbd5e1" };

    for (let row = 0; row < this.boardSize; row++) {
      for (let column = 0; column < this.boardSize; column++) {
        // Only draw walkable tiles.
        if (this.layout[row]?.[column] !== 1) continue;
        this.add
          .rectangle(
            this.boardX + (column + 0.5) * this.tileSize,
            this.boardY + (row + 0.5) * this.tileSize,
            this.tileSize,
            this.tileSize,
            (row + column) % 2 === 0 ? 0x334155 : 0x1e293b,
            0.15,
          )
          .setStrokeStyle(1, 0x64748b, 0.4);
      }
    }

    this.destinationHighlight = this.add
      .rectangle(0, 0, this.tileSize - 4, this.tileSize - 4, 0x67e8f9, 0.15)
      .setStrokeStyle(2, 0x67e8f9)
      .setVisible(false);
    this.guardian = this.add.rectangle(0, 0, 28, 28, 0x67e8f9);

    this.add.text(
      24,
      20,
      "Left-click your Guardian to select. Right-click a tile to move.\nLeft-click an empty space to deselect.",
      {
        fontSize: "20px",
        color: "#ffffff",
      },
    );
    this.positionLabel = this.add.text(
      this.boardX,
      this.boardY + this.boardSize * this.tileSize + 16,
      "",
      labelStyle,
    );
    this.placeGuardian();
    this.input.on("pointerdown", this.handleBoardClick, this);
    this.input.on("pointermove", this.previewDestination, this);
    this.input.on("gameout", this.hideDestination, this);

    // Avoid duplicate handlers if this scene restarts.
    this.events.once("shutdown", () => {
      this.input.off("pointerdown", this.handleBoardClick, this);
      this.input.off("pointermove", this.previewDestination, this);
      this.input.off("gameout", this.hideDestination, this);
    });
  }

  private tileAt(pointer: Input.Pointer) {
    const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const column = Math.floor((point.x - this.boardX) / this.tileSize);
    const row = Math.floor((point.y - this.boardY) / this.tileSize);
    if (
      column < 0 ||
      column >= this.boardSize ||
      row < 0 ||
      row >= this.boardSize
    ) {
      return null;
    }
    return { column, row };
  }

  private handleBoardClick(pointer: Input.Pointer) {
    const tile = this.tileAt(pointer);

    // Use the button that triggered this event, even if another is held.
    if (pointer.button === 0) {
      this.selected =
        tile !== null && tile.column === this.column && tile.row === this.row;
    } else if (pointer.button === 2 && this.selected && tile) {
      this.column = tile.column;
      this.row = tile.row;
      this.selected = false;
    } else {
      return;
    }

    this.placeGuardian();
    this.previewDestination(pointer);
  }

  private previewDestination(pointer: Input.Pointer) {
    const tile = this.tileAt(pointer);
    if (
      !this.selected ||
      !tile ||
      (tile.column === this.column && tile.row === this.row)
    ) {
      this.hideDestination();
      return;
    }
    this.destinationHighlight
      .setPosition(
        this.boardX + (tile.column + 0.5) * this.tileSize,
        this.boardY + (tile.row + 0.5) * this.tileSize,
      )
      .setVisible(true);
  }

  private hideDestination() {
    this.destinationHighlight.setVisible(false);
  }

  private placeGuardian() {
    this.guardian.setPosition(
      this.boardX + (this.column + 0.5) * this.tileSize,
      this.boardY + (this.row + 0.5) * this.tileSize,
    );
    this.guardian.setStrokeStyle(this.selected ? 3 : 0, 0xfacc15);
    const square = `${String.fromCharCode(65 + this.column)}${this.boardSize - this.row}`;
    this.positionLabel.setText(
      `Guardian: ${square} | ${this.selected ? "Selected — right-click to move" : "Left-click Guardian to select"}`,
    );
  }
}
