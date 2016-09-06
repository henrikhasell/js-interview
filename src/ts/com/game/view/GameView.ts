class GameView extends AbstractView {

    private model:GameModel;

    private background:PIXI.Graphics;

    private playerShip:PlayerShip;
    private enemyShips:EnemyShip[];
    private shields:Shield[];

    private scoreLabel:PIXI.extras.BitmapText;
    private score:PIXI.extras.BitmapText;

    private livesLabel:PIXI.extras.BitmapText;
    private lives:PIXI.extras.BitmapText;

    private levelLabel:PIXI.extras.BitmapText;
    private level:PIXI.extras.BitmapText;

    private gameOverLabel:PIXI.extras.BitmapText;
    private highScoreLabel:PIXI.extras.BitmapText;
    private highScores:PIXI.extras.BitmapText;
    private highScoreList:number[];

    private enemySpeed:number;


    constructor(model: GameModel) {
        this.model = model;
        this.highScoreList = [];
        super();
    }

    public create():void {
        super.create();
        this.createBackground();
        this.createPlayerShip();
        this.createEnemyShips();
        this.createShields();
        this.createFields();
    }

    public addEventListeners():void {
        this.listen(PlayerLivesUpdatedEvent.UPDATED, this.handlePlayerLivesUpdate, this);
        this.listen(PlayerScoreUpdatedEvent.UPDATED, this.handlePlayerScoreUpdate, this);
        this.listen(GameViewEvent.LEVEL, this.nextLevel, this);
        this.listen(GameViewEvent.OVER, this.handleGameOver, this);
        this.listen(PlayerShipEvent.REVIVE, this.handlePlayerRevive, this);
        this.listen(GameViewEvent.START, this.handleNewGame, this);
    }

    private createBackground():void {
        this.background = GraphicsUtil.createRectangle(this.renderer.getGameSize());
        this.addChild(this.background);
    }

    private createPlayerShip():void {
        this.playerShip = new PlayerShip();
        this.addChild(this.playerShip);
    }

    private createEnemyShips():void {
        this.enemyShips = [];
        this.enemySpeed = this.model.getEnemySpeed();
        var ship:EnemyShip;
        for (var i:number = 0; i < this.model.getNumEnemies(); i++) {
            ship = new EnemyShip(this.enemySpeed);
            this.enemyShips.push(ship);
            this.renderer.addChild(ship);
        }
    }

    private removeEnemyShips():void {
        for (let ship of this.enemyShips) {
            ship.dispose();
        }
    }

    private createShields():void {
        var shieldPosition:PIXI.Point = new PIXI.Point(17, this.renderer.getGameSize().y - (this.renderer.getGameSize().y / 5));
        this.shields = [];
        var shield:Shield;
        for (var i:number = 0; i < this.model.getNumShields(); i++) {
            shield = new Shield();
            shield.position = shieldPosition;
            shieldPosition = new PIXI.Point(shieldPosition.x + (this.renderer.getGameSize().x / this.model.getNumShields()), shieldPosition.y);
            this.addChild(shield);
            this.shields.push(shield);
        }
    }

    private removeShields():void {
        for (let shield of this.shields) {
            this.removeChild(shield)
        }
    }

    private createFields():void {
        this.createScoreLabel();
        this.createScore();
        this.createLivesLabel();
        this.createLives();
        this.createLevelLabel();
        this.createLevel();
    }

    private removeFields():void {
        this.removeChild(this.livesLabel);
        this.removeChild(this.lives);
        this.removeChild(this.scoreLabel);
        this.removeChild(this.score);
        this.removeChild(this.levelLabel);
        this.removeChild(this.level);
    }

    private createScoreLabel():void {
        this.scoreLabel = new PIXI.extras.BitmapText("score", {font: Font.HELVETICA, align: "right"});
        this.scoreLabel.position = new PIXI.Point(75, this.renderer.getGameSize().y - 20);
        this.addChild(this.scoreLabel);
    }

    private createScore():void {
        this.score = new PIXI.extras.BitmapText(this.model.getScore().toString(), {
            font: Font.HELVETICA,
            align: "left"
        });
        this.score.position = new PIXI.Point(115, this.renderer.getGameSize().y - 20);
        this.addChild(this.score);
    }

    private createLivesLabel():void {
        this.livesLabel = new PIXI.extras.BitmapText("lives", {font: Font.HELVETICA, align: "right"});
        this.livesLabel.position = new PIXI.Point(5, this.renderer.getGameSize().y - 20);
        this.addChild(this.livesLabel);
    }

    private createLives():void {
        this.lives = new PIXI.extras.BitmapText(this.model.getNumLives().toString(), {
            font: Font.HELVETICA,
            align: "left"
        });
        this.lives.position = new PIXI.Point(40, this.renderer.getGameSize().y - 20);
        this.addChild(this.lives);
    }

    private createLevel():void {
        this.level = new PIXI.extras.BitmapText(this.model.getLevel().toString(),{
            font: Font.HELVETICA,
            align: "left"
        });
        this.level.position = new PIXI.Point(260, this.renderer.getGameSize().y - 20);
        this.addChild(this.level);
    }

    private createLevelLabel():void {
        this.levelLabel = new PIXI.extras.BitmapText("Level:", {font: Font.HELVETICA, align: "right"});
        this.levelLabel.position = new PIXI.Point(210, this.renderer.getGameSize().y - 20);
        this.addChild(this.levelLabel);
    }



    private levelLabelUpdate():void {
        this.level.text = this.model.getLevel().toString();
    }

    private createGameOverLabel():void {
        this.gameOverLabel = new PIXI.extras.BitmapText("GAME OVER", {font: Font.GAMEOVER, align: "center", tint: 0xFF0000});
        this.gameOverLabel.position = new PIXI.Point(100, 175);
        this.addChild(this.gameOverLabel);
    }

    private createHighScoreLabel():void {
        this.highScoreLabel = new PIXI.extras.BitmapText(
            "1st:" + "\n2nd:" +"\n3rd:",{
                font: Font.HELVETICA,
                align: "left"
            });
        this.highScoreLabel.position = new PIXI.Point(100, 225);
        this.addChild(this.highScoreLabel);
    }

    private createHighScores():void {
        this.highScores = new PIXI.extras.BitmapText(
            this.highScoreList[0].toString() + "\n" +
            this.highScoreList[1].toString() + "\n" +
            this.highScoreList[2].toString(), {
                font: Font.HELVETICA,
                align: "right"
            });
        this.highScores.position = new PIXI.Point(150, 225);
        this.addChild(this.highScores);
    }
    private createGameOverScreen():void {
        this.highScoreList = this.model.getHighScores();
        this.createGameOverLabel();
        this.createHighScoreLabel();
        this.createHighScores();
    }

    private removeGameOver():void {
        this.removeChild(this.gameOverLabel);
        this.removeChild(this.highScoreLabel);
        this.removeChild(this.highScores);
    }

    private nextLevel(event: GameViewEvent):void {
        this.removeShields();
        this.removeEnemyShips();
        this.createEnemyShips();
        this.createShields();
        this.levelLabelUpdate();
    }


    private handleGameOver(event: GameViewEvent):void {
        this.removeShields();
        this.removeEnemyShips();
        var stage:PIXI.Container = this.renderer.getStage();
        this.removeFields();
        this.createGameOverScreen();
        MouseUtil.addMouseDown(stage, this.handleNewGameSelected, this);
    }

    private handleNewGameSelected():void {
        var stage:PIXI.Container = this.renderer.getStage();
        MouseUtil.removeMouseDown(stage, this.handleNewGameSelected);
        this.dispatch(new GameViewEvent(GameOverEvent.NEW));
    }



    private handleNewGame(event: GameViewEvent):void {
        this.removeGameOver();
        this.createPlayerShip();
        this.createEnemyShips();
        this.createShields();
        this.createFields();
    }

    private handlePlayerScoreUpdate(event: PlayerScoreUpdatedEvent):void {
        this.score.text = this.model.getScore().toString();
    }

    private handlePlayerLivesUpdate(event: PlayerLivesUpdatedEvent):void {
        this.lives.text = this.model.getNumLives().toString();
    }

    private handlePlayerRevive(event: PlayerShipEvent):void {
        this.playerShip.revive();
    }
}