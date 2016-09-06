var Game = (function () {
    function Game() {
        this.createRenderer();
        this.createLoader();
    }
    Game.prototype.createRenderer = function () {
        this.renderer = AbstractRenderer.getInstance().initialise(new PIXI.Point(300, 350));
    };
    Game.prototype.createLoader = function () {
        this.loader = new Loader("xml/Config.xml");
        this.loader.addEventListener(EventType.COMPLETE, this.handleLoadComplete, this);
        this.loader.load();
    };
    Game.prototype.createModel = function () {
        this.model = new GameModel(this.loader.getConfig());
    };
    Game.prototype.createController = function () {
        this.controller = new GameController(this.model);
    };
    Game.prototype.createView = function () {
        this.view = new GameView(this.model);
        this.renderer.addChild(this.view);
    };
    Game.prototype.handleLoadComplete = function () {
        this.createModel();
        this.createController();
        this.createView();
    };
    return Game;
})();
var GameController = (function () {
    function GameController(model) {
        this.model = model;
        this.create();
        this.addEventListeners();
    }
    GameController.prototype.create = function () {
        this.createEventBus();
    };
    GameController.prototype.createEventBus = function () {
        this.eventBus = EventBus.getInstance();
    };
    GameController.prototype.addEventListeners = function () {
        this.listen(EnemyShipEvent.DEAD, this.handleEnemyShipDead, this);
        this.listen(PlayerShipEvent.DEAD, this.handlePlayerShipDead, this);
        this.listen(GameOverEvent.WIN, this.handleGameWin, this);
        this.listen(GameOverEvent.LOSE, this.handleGameOver, this);
        this.listen(GameOverEvent.NEW, this.handleNewGame, this);
    };
    GameController.prototype.handleEnemyShipDead = function (event) {
        this.model.enemyShipDead();
        this.model.updateScore();
        this.dispatchEvent(new PlayerScoreUpdatedEvent());
        if (this.model.getEnemiesLeft() == 0) {
            this.dispatchEvent(new GameOverEvent(GameOverEvent.WIN));
        }
    };
    GameController.prototype.handlePlayerShipDead = function (event) {
        this.model.playerShipDead();
        if (this.model.getNumLives() > 0) {
            this.dispatchEvent(new PlayerLivesUpdatedEvent());
            this.dispatchEvent(new PlayerShipEvent(PlayerShipEvent.REVIVE));
        }
        else {
            this.dispatchEvent(new GameOverEvent(GameOverEvent.LOSE));
        }
    };
    GameController.prototype.handleGameWin = function (event) {
        this.model.nextLevel();
        this.dispatchEvent(new PlayerLivesUpdatedEvent());
        this.dispatchEvent(new GameViewEvent(GameViewEvent.LEVEL));
    };
    GameController.prototype.handleGameOver = function (event) {
        this.model.highScoreUpdate();
        this.dispatchEvent(new GameViewEvent(GameViewEvent.OVER));
    };
    GameController.prototype.handleNewGame = function (event) {
        this.model.reset();
        setTimeout(this.dispatchEvent(new GameViewEvent(GameViewEvent.START)), 1000);
    };
    GameController.prototype.listen = function (type, handler, scope) {
        this.eventBus.addEventListener(type, handler, scope);
    };
    GameController.prototype.remove = function (type, scope) {
        this.eventBus.removeEventListener(type, scope);
    };
    GameController.prototype.dispatchEvent = function (event) {
        this.eventBus.dispatchEvent(event);
    };
    return GameController;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameOverEvent = (function (_super) {
    __extends(GameOverEvent, _super);
    function GameOverEvent(type) {
        _super.call(this, type);
    }
    GameOverEvent.WIN = "GameOverEvent.WIN";
    GameOverEvent.LOSE = "GameOverEvent.LOSE";
    GameOverEvent.NEW = "GameOverEvent.NEW";
    return GameOverEvent;
})(EventObject);
var PlayerLivesUpdatedEvent = (function (_super) {
    __extends(PlayerLivesUpdatedEvent, _super);
    function PlayerLivesUpdatedEvent() {
        _super.call(this, PlayerLivesUpdatedEvent.UPDATED);
    }
    PlayerLivesUpdatedEvent.UPDATED = "PlayerLivesUpdatedEvent.UPDATED";
    return PlayerLivesUpdatedEvent;
})(EventObject);
var PlayerScoreUpdatedEvent = (function (_super) {
    __extends(PlayerScoreUpdatedEvent, _super);
    function PlayerScoreUpdatedEvent() {
        _super.call(this, PlayerScoreUpdatedEvent.UPDATED);
    }
    PlayerScoreUpdatedEvent.UPDATED = "PlayerScoreUpdatedEvent.UPDATED";
    return PlayerScoreUpdatedEvent;
})(EventObject);
var GameModel = (function (_super) {
    __extends(GameModel, _super);
    function GameModel(config) {
        _super.call(this);
        this.config = config;
        this.reset();
        this.highScores = [0, 0, 0];
    }
    GameModel.prototype.reset = function () {
        this.numEnemies = this.config.getNumEnemies();
        this.numLives = this.config.getNumLives();
        this.numShields = this.config.getNumShields();
        this.enemiesLeft = this.config.getNumEnemies();
        this.enemySpeed = this.config.getEnemySpeed();
        this.score = 0;
        this.lastEnemyDeadTime = 0;
        this.level = 1;
        this.enemySpeed = this.config.getEnemySpeed();
    };
    GameModel.prototype.nextLevel = function () {
        this.level += 1;
        this.numEnemies += 1;
        this.enemiesLeft = this.numEnemies;
        this.enemySpeed += 2;
        this.numLives = this.config.getNumLives();
    };
    GameModel.prototype.enemyShipDead = function () {
        this.enemiesLeft--;
    };
    GameModel.prototype.highScoreUpdate = function () {
        this.highScores.push(this.score);
        this.highScores = this.highScores.sort(function (a, b) { return b - a; });
    };
    GameModel.prototype.playerShipDead = function () {
        this.numLives--;
    };
    GameModel.prototype.updateScore = function () {
        var enemyDeadInterval = Date.now() - this.lastEnemyDeadTime;
        this.lastEnemyDeadTime = Date.now();
        if (enemyDeadInterval > 1000) {
            this.score += 100;
        }
        else {
            this.score += ((1000 - enemyDeadInterval) + 100);
        }
    };
    GameModel.prototype.getEnemiesLeft = function () {
        return this.enemiesLeft;
    };
    GameModel.prototype.getScore = function () {
        return this.score;
    };
    GameModel.prototype.getNumLives = function () {
        return this.numLives;
    };
    GameModel.prototype.getNumEnemies = function () {
        return this.numEnemies;
    };
    GameModel.prototype.getNumShields = function () {
        return this.numShields;
    };
    GameModel.prototype.getEnemySpeed = function () {
        return this.enemySpeed;
    };
    GameModel.prototype.getLevel = function () {
        return this.level;
    };
    GameModel.prototype.getHighScores = function () {
        return this.highScores;
    };
    return GameModel;
})(EventDispatcher);
var AbstractView = (function (_super) {
    __extends(AbstractView, _super);
    function AbstractView() {
        _super.call(this);
        this.create();
        this.addEventListeners();
    }
    AbstractView.prototype.create = function () {
        this.createEventBus();
        this.createRenderer();
    };
    AbstractView.prototype.createRenderer = function () {
        this.renderer = AbstractRenderer.getInstance();
    };
    AbstractView.prototype.createEventBus = function () {
        this.eventBus = EventBus.getInstance();
    };
    AbstractView.prototype.listen = function (type, handler, scope) {
        this.eventBus.addEventListener(type, handler, scope);
    };
    AbstractView.prototype.remove = function (type, scope) {
        this.eventBus.removeEventListener(type, scope);
    };
    AbstractView.prototype.dispatch = function (event) {
        this.eventBus.dispatchEvent(event);
    };
    AbstractView.prototype.addEventListeners = function () {
    };
    AbstractView.prototype.removeEventListeners = function () {
    };
    return AbstractView;
})(PIXI.Container);
var GameView = (function (_super) {
    __extends(GameView, _super);
    function GameView(model) {
        this.model = model;
        this.highScoreList = [];
        _super.call(this);
    }
    GameView.prototype.create = function () {
        _super.prototype.create.call(this);
        this.createBackground();
        this.createPlayerShip();
        this.createEnemyShips();
        this.createShields();
        this.createFields();
    };
    GameView.prototype.addEventListeners = function () {
        this.listen(PlayerLivesUpdatedEvent.UPDATED, this.handlePlayerLivesUpdate, this);
        this.listen(PlayerScoreUpdatedEvent.UPDATED, this.handlePlayerScoreUpdate, this);
        this.listen(GameViewEvent.LEVEL, this.nextLevel, this);
        this.listen(GameViewEvent.OVER, this.handleGameOver, this);
        this.listen(PlayerShipEvent.REVIVE, this.handlePlayerRevive, this);
        this.listen(GameViewEvent.START, this.handleNewGame, this);
    };
    GameView.prototype.createBackground = function () {
        this.background = GraphicsUtil.createRectangle(this.renderer.getGameSize());
        this.addChild(this.background);
    };
    GameView.prototype.createPlayerShip = function () {
        this.playerShip = new PlayerShip();
        this.addChild(this.playerShip);
    };
    GameView.prototype.createEnemyShips = function () {
        this.enemyShips = [];
        this.enemySpeed = this.model.getEnemySpeed();
        var ship;
        for (var i = 0; i < this.model.getNumEnemies(); i++) {
            ship = new EnemyShip(this.enemySpeed);
            this.enemyShips.push(ship);
            this.renderer.addChild(ship);
        }
    };
    GameView.prototype.removeEnemyShips = function () {
        for (var _i = 0, _a = this.enemyShips; _i < _a.length; _i++) {
            var ship = _a[_i];
            ship.dispose();
        }
    };
    GameView.prototype.createShields = function () {
        var shieldPosition = new PIXI.Point(17, this.renderer.getGameSize().y - (this.renderer.getGameSize().y / 5));
        this.shields = [];
        var shield;
        for (var i = 0; i < this.model.getNumShields(); i++) {
            shield = new Shield();
            shield.position = shieldPosition;
            shieldPosition = new PIXI.Point(shieldPosition.x + (this.renderer.getGameSize().x / this.model.getNumShields()), shieldPosition.y);
            this.addChild(shield);
            this.shields.push(shield);
        }
    };
    GameView.prototype.removeShields = function () {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            this.removeChild(shield);
        }
    };
    GameView.prototype.createFields = function () {
        this.createScoreLabel();
        this.createScore();
        this.createLivesLabel();
        this.createLives();
        this.createLevelLabel();
        this.createLevel();
    };
    GameView.prototype.removeFields = function () {
        this.removeChild(this.livesLabel);
        this.removeChild(this.lives);
        this.removeChild(this.scoreLabel);
        this.removeChild(this.score);
        this.removeChild(this.levelLabel);
        this.removeChild(this.level);
    };
    GameView.prototype.createScoreLabel = function () {
        this.scoreLabel = new PIXI.extras.BitmapText("score", { font: Font.HELVETICA, align: "right" });
        this.scoreLabel.position = new PIXI.Point(75, this.renderer.getGameSize().y - 20);
        this.addChild(this.scoreLabel);
    };
    GameView.prototype.createScore = function () {
        this.score = new PIXI.extras.BitmapText(this.model.getScore().toString(), {
            font: Font.HELVETICA,
            align: "left"
        });
        this.score.position = new PIXI.Point(115, this.renderer.getGameSize().y - 20);
        this.addChild(this.score);
    };
    GameView.prototype.createLivesLabel = function () {
        this.livesLabel = new PIXI.extras.BitmapText("lives", { font: Font.HELVETICA, align: "right" });
        this.livesLabel.position = new PIXI.Point(5, this.renderer.getGameSize().y - 20);
        this.addChild(this.livesLabel);
    };
    GameView.prototype.createLives = function () {
        this.lives = new PIXI.extras.BitmapText(this.model.getNumLives().toString(), {
            font: Font.HELVETICA,
            align: "left"
        });
        this.lives.position = new PIXI.Point(40, this.renderer.getGameSize().y - 20);
        this.addChild(this.lives);
    };
    GameView.prototype.createLevel = function () {
        this.level = new PIXI.extras.BitmapText(this.model.getLevel().toString(), {
            font: Font.HELVETICA,
            align: "left"
        });
        this.level.position = new PIXI.Point(260, this.renderer.getGameSize().y - 20);
        this.addChild(this.level);
    };
    GameView.prototype.createLevelLabel = function () {
        this.levelLabel = new PIXI.extras.BitmapText("Level:", { font: Font.HELVETICA, align: "right" });
        this.levelLabel.position = new PIXI.Point(210, this.renderer.getGameSize().y - 20);
        this.addChild(this.levelLabel);
    };
    GameView.prototype.levelLabelUpdate = function () {
        this.level.text = this.model.getLevel().toString();
    };
    GameView.prototype.createGameOverLabel = function () {
        this.gameOverLabel = new PIXI.extras.BitmapText("GAME OVER", { font: Font.GAMEOVER, align: "center", tint: 0xFF0000 });
        this.gameOverLabel.position = new PIXI.Point(100, 175);
        this.addChild(this.gameOverLabel);
    };
    GameView.prototype.createHighScoreLabel = function () {
        this.highScoreLabel = new PIXI.extras.BitmapText("1st:" + "\n2nd:" + "\n3rd:", {
            font: Font.HELVETICA,
            align: "left"
        });
        this.highScoreLabel.position = new PIXI.Point(100, 225);
        this.addChild(this.highScoreLabel);
    };
    GameView.prototype.createHighScores = function () {
        this.highScores = new PIXI.extras.BitmapText(this.highScoreList[0].toString() + "\n" +
            this.highScoreList[1].toString() + "\n" +
            this.highScoreList[2].toString(), {
            font: Font.HELVETICA,
            align: "right"
        });
        this.highScores.position = new PIXI.Point(150, 225);
        this.addChild(this.highScores);
    };
    GameView.prototype.createGameOverScreen = function () {
        this.highScoreList = this.model.getHighScores();
        this.createGameOverLabel();
        this.createHighScoreLabel();
        this.createHighScores();
    };
    GameView.prototype.removeGameOver = function () {
        this.removeChild(this.gameOverLabel);
        this.removeChild(this.highScoreLabel);
        this.removeChild(this.highScores);
    };
    GameView.prototype.nextLevel = function (event) {
        this.removeShields();
        this.removeEnemyShips();
        this.createEnemyShips();
        this.createShields();
        this.levelLabelUpdate();
    };
    GameView.prototype.handleGameOver = function (event) {
        this.removeShields();
        this.removeEnemyShips();
        var stage = this.renderer.getStage();
        this.removeFields();
        this.createGameOverScreen();
        MouseUtil.addMouseDown(stage, this.handleNewGameSelected, this);
    };
    GameView.prototype.handleNewGameSelected = function () {
        var stage = this.renderer.getStage();
        MouseUtil.removeMouseDown(stage, this.handleNewGameSelected);
        this.dispatch(new GameViewEvent(GameOverEvent.NEW));
    };
    GameView.prototype.handleNewGame = function (event) {
        this.removeGameOver();
        this.createPlayerShip();
        this.createEnemyShips();
        this.createShields();
        this.createFields();
    };
    GameView.prototype.handlePlayerScoreUpdate = function (event) {
        this.score.text = this.model.getScore().toString();
    };
    GameView.prototype.handlePlayerLivesUpdate = function (event) {
        this.lives.text = this.model.getNumLives().toString();
    };
    GameView.prototype.handlePlayerRevive = function (event) {
        this.playerShip.revive();
    };
    return GameView;
})(AbstractView);
var Style = (function () {
    function Style() {
    }
    Style.addPath = function (filePath) {
        Style.map[filePath.id] = filePath;
    };
    Style.getPath = function (id) {
        return Style.map[id];
    };
    Style.getSprite = function (id) {
        var path = this.getPath(id);
        return PIXI.Sprite.fromImage(path.url);
    };
    Style.getMovieClip = function (id) {
        var path = this.getPath(id);
        var textures = [];
        for (var i = 0; i < path.frames; i++) {
            var texture = PIXI.Texture.fromFrame(path.id + Style.formatTexture(i));
            textures.push(texture);
        }
        return new PIXI.extras.MovieClip(textures);
    };
    Style.formatTexture = function (num) {
        var r = num.toString();
        while (r.length < 4) {
            r = "0" + r;
        }
        return r;
    };
    Style.PLAYER_SHIP = "PlayerShip";
    Style.PLAYER_BULLET = "PlayerBullet";
    Style.ENEMY_SHIP = "EnemyShip";
    Style.ENEMY_BULLET = "EnemyBullet";
    Style.SHIELD = "Shield";
    Style.map = new Dictionary();
    return Style;
})();
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(position) {
        _super.call(this);
        this.sprite.position = position;
    }
    Bullet.prototype.create = function () {
        _super.prototype.create.call(this);
        this.createBullet();
        this.addEventListeners();
    };
    Bullet.prototype.dispose = function () {
        if (this.parent) {
            this.renderer.removeChild(this);
        }
    };
    Bullet.prototype.addEventListeners = function () {
        this.listen(GameOverEvent.WIN, this.dispose, this);
        this.listen(GameOverEvent.LOSE, this.dispose, this);
    };
    Bullet.prototype.createBullet = function () {
        this.sprite = Style.getSprite(this.bulletStyle);
        this.addChild(this.sprite);
    };
    Bullet.prototype.fire = function () {
        this.renderer.addChild(this);
        this.tween = TweenMax.to(this.sprite.position, 1, {
            y: this.fireYPosition,
            ease: Linear.easeNone,
            onUpdate: ObjectUtil.delegate(this.handleTweenUpdate, this),
            onComplete: ObjectUtil.delegate(this.handleTweenComplete, this)
        });
    };
    Bullet.prototype.handleTweenUpdate = function () {
        this.dispatch(this.event);
    };
    Bullet.prototype.handleTweenComplete = function () {
        this.dispose();
    };
    Bullet.prototype.getSprite = function () {
        return this.sprite;
    };
    return Bullet;
})(AbstractView);
var EnemyBullet = (function (_super) {
    __extends(EnemyBullet, _super);
    function EnemyBullet(position) {
        this.bulletStyle = Style.ENEMY_BULLET;
        this.event = new EnemyBulletEvent(this);
        _super.call(this, position);
        this.fireYPosition = this.renderer.getGameSize().y;
    }
    return EnemyBullet;
})(Bullet);
var EnemyShip = (function (_super) {
    __extends(EnemyShip, _super);
    function EnemyShip(enemySpeed) {
        this.enemySpeed = enemySpeed;
        _super.call(this);
    }
    EnemyShip.prototype.setFireSpeed = function () {
        this.fireSpeed = 60000 / this.enemySpeed;
    };
    EnemyShip.prototype.setMoveSpeed = function () {
        this.moveSpeed = 40000 / this.enemySpeed;
    };
    EnemyShip.prototype.create = function () {
        _super.prototype.create.call(this);
        this.setFireSpeed();
        this.setMoveSpeed();
        this.createShip();
        this.createStartPoint(this.randomPoint);
        this.createTweens();
        this.startMoveTimer();
        this.startFireTimer();
    };
    EnemyShip.prototype.dispose = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.moveTimer.removeEventListener(TimerEvent.TIMER, this);
        this.fireTimer.removeEventListener(TimerEvent.TIMER, this);
    };
    EnemyShip.prototype.addEventListeners = function () {
        this.listen(PlayerBulletEvent.MOVE, this.handlePlayerBullet, this);
    };
    EnemyShip.prototype.createShip = function () {
        this.ship = Style.getMovieClip(Style.ENEMY_SHIP);
        this.ship.play();
        this.addChild(this.ship);
    };
    EnemyShip.prototype.createStartPoint = function (point) {
        this.ship.position.x = point.x;
    };
    EnemyShip.prototype.createTweens = function () {
        this.tweens = new Dictionary();
    };
    EnemyShip.prototype.startMoveTimer = function () {
        this.moveTimer = new Timer(this.moveSpeed);
        this.moveTimer.addEventListener(TimerEvent.TIMER, this.handleMoveTimerUpdate, this);
        this.moveTimer.start();
    };
    EnemyShip.prototype.startFireTimer = function () {
        this.fireTimer = new Timer(this.fireSpeed);
        this.fireTimer.addEventListener(TimerEvent.TIMER, this.handleFireTimeUpdate, this);
        this.fireTimer.start();
    };
    EnemyShip.prototype.handleMoveTimerUpdate = function (event) {
        this.move(this.randomPoint);
    };
    EnemyShip.prototype.handleFireTimeUpdate = function (event) {
        new EnemyBullet(this.ship.position.clone()).fire();
    };
    EnemyShip.prototype.handlePlayerBullet = function (event) {
        var blockWidth = 16;
        var blockHeight = 16;
        if (BoundsUtil.isInBounds(this.ship, event.getBullet().getSprite(), blockWidth, blockHeight)) {
            this.remove(PlayerBulletEvent.MOVE, this);
            this.dispatch(new EnemyShipEvent());
            this.dispose();
        }
    };
    EnemyShip.prototype.move = function (point) {
        this.tweens.setValue("x", TweenMax.to(this.ship.position, 1, { "x": point.x, ease: Linear.easeIn }));
        this.tweens.setValue("y", TweenMax.to(this.ship.position, 1, { "y": point.y, ease: Linear.easeIn }));
    };
    Object.defineProperty(EnemyShip.prototype, "randomPoint", {
        get: function () {
            var x = Math.random() * (this.renderer.getGameSize().x - this.ship.width);
            var y = Math.random() * (this.renderer.getGameSize().y - this.ship.height - 150);
            return new PIXI.Point(x, y);
        },
        enumerable: true,
        configurable: true
    });
    return EnemyShip;
})(AbstractView);
var PlayerBullet = (function (_super) {
    __extends(PlayerBullet, _super);
    function PlayerBullet(position) {
        this.bulletStyle = Style.PLAYER_BULLET;
        _super.call(this, position);
        this.event = new PlayerBulletEvent(this);
        this.fireYPosition = 0;
    }
    return PlayerBullet;
})(Bullet);
var PlayerShip = (function (_super) {
    __extends(PlayerShip, _super);
    function PlayerShip() {
        _super.apply(this, arguments);
    }
    PlayerShip.prototype.create = function () {
        _super.prototype.create.call(this);
        this.createShip();
    };
    PlayerShip.prototype.createShip = function () {
        this.ship = Style.getSprite(Style.PLAYER_SHIP);
        this.ship.interactive = true;
        this.addChild(this.ship);
        this.ship.position = new PIXI.Point(125, this.renderer.getGameSize().y - (this.renderer.getGameSize().y / 8));
    };
    PlayerShip.prototype.dispose = function () {
        if (this.ship.parent) {
            this.removeChild(this.ship);
        }
        this.removeEventListeners();
        this.dispatch(new PlayerShipEvent(PlayerShipEvent.DEAD));
    };
    PlayerShip.prototype.addEventListeners = function () {
        var stage = this.renderer.getStage();
        MouseUtil.setInteractive(stage, true);
        MouseUtil.addMouseMove(stage, this.handleMouseMove, this);
        MouseUtil.addMouseDown(stage, this.handleMouseDown, this);
        this.listen(EnemyBulletEvent.MOVE, this.handleEnemyBulletMove, this);
    };
    PlayerShip.prototype.removeEventListeners = function () {
        var stage = this.renderer.getStage();
        MouseUtil.removeMouseMove(stage, this.handleMouseMove);
        MouseUtil.removeMouseDown(stage, this.handleMouseDown);
        this.remove(EnemyBulletEvent.MOVE, this);
    };
    PlayerShip.prototype.handleMouseDown = function () {
        var x = this.ship.position.x + (this.ship.width / 2);
        var y = this.ship.position.y;
        var bulletPosition = new PIXI.Point(x, y);
        new PlayerBullet(bulletPosition).fire();
    };
    PlayerShip.prototype.handleMouseMove = function (event) {
        var data = event.data;
        if (data.global.x < 265 && data.global.x > 0) {
            this.ship.position = new PIXI.Point(data.global.x, this.ship.position.y);
        }
    };
    PlayerShip.prototype.handleEnemyBulletMove = function (event) {
        var blockWidth = 18;
        var blockHeight = 18;
        if (BoundsUtil.isInBounds(this.ship, event.getBullet().getSprite(), blockWidth, blockHeight)) {
            this.dispose();
        }
    };
    PlayerShip.prototype.revive = function () {
        var stage = this.renderer.getStage();
        MouseUtil.setInteractive(stage, true);
        MouseUtil.addMouseMove(stage, this.handleMouseMove, this);
        MouseUtil.addMouseDown(stage, this.handleMouseDown, this);
        this.startFlashTimer();
        this.addChild(this.ship);
    };
    PlayerShip.prototype.startFlashTimer = function () {
        var flashTimer = new Timer(300, 5);
        flashTimer.addEventListener(TimerEvent.TIMER, this.handleFlashTimerUpdate, this);
        flashTimer.addEventListener(TimerEvent.COMPLETE, this.handleFlashTimerComplete, this);
        flashTimer.start();
    };
    PlayerShip.prototype.handleFlashTimerUpdate = function (event) {
        this.ship.visible = !this.ship.visible;
    };
    PlayerShip.prototype.handleFlashTimerComplete = function (event) {
        this.ship.visible = true;
        this.listen(EnemyBulletEvent.MOVE, this.handleEnemyBulletMove, this);
    };
    return PlayerShip;
})(AbstractView);
var Shield = (function (_super) {
    __extends(Shield, _super);
    function Shield() {
        _super.apply(this, arguments);
    }
    Shield.prototype.create = function () {
        _super.prototype.create.call(this);
        this.createBlocks();
    };
    Shield.prototype.addEventListeners = function () {
        this.listen(PlayerBulletEvent.MOVE, this.handlePlayerBulletMove, this);
        this.listen(EnemyBulletEvent.MOVE, this.handleEnemyBulletMove, this);
    };
    Shield.prototype.createBlocks = function () {
        this.blocks = [];
        for (var i = 0; i < Shield.STRUCTURE.length; i++) {
            var range = Shield.STRUCTURE[i];
            var block;
            for (var j = range.x; j < range.y; j++) {
                block = this.createBlock(j, i);
                this.addChild(block);
                this.blocks.push(block);
            }
        }
    };
    Shield.prototype.createBlock = function (x, y) {
        var block = Style.getSprite(Style.SHIELD);
        block.position = new PIXI.Point(x * block.width, y * block.height);
        return block;
    };
    Shield.prototype.handlePlayerBulletMove = function (event) {
        var bullet = event.getBullet();
        var block = this.checkBlockBounds(bullet.getSprite());
        if (block) {
            block.visible = false;
            bullet.dispose();
        }
    };
    Shield.prototype.handleEnemyBulletMove = function (event) {
        var bullet = event.getBullet();
        var block = this.checkBlockBounds(bullet.getSprite());
        if (block) {
            block.visible = false;
            bullet.dispose();
        }
    };
    Shield.prototype.checkBlockBounds = function (bullet) {
        var blockWidth = 6;
        var blockHeight = 6;
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            if (block.visible && BoundsUtil.isInBounds(block, bullet, blockWidth, blockHeight)) {
                return block;
            }
        }
        return null;
    };
    Shield.STRUCTURE = [new PIXI.Point(0, 10), new PIXI.Point(1, 9), new PIXI.Point(2, 8)];
    return Shield;
})(AbstractView);
var EnemyBulletEvent = (function (_super) {
    __extends(EnemyBulletEvent, _super);
    function EnemyBulletEvent(data) {
        _super.call(this, EnemyBulletEvent.MOVE);
        this.bullet = data;
    }
    EnemyBulletEvent.prototype.getBullet = function () {
        return this.bullet;
    };
    EnemyBulletEvent.MOVE = 'EnemyBulletEvent.MOVE';
    return EnemyBulletEvent;
})(EventObject);
var EnemyShipEvent = (function (_super) {
    __extends(EnemyShipEvent, _super);
    function EnemyShipEvent() {
        _super.call(this, EnemyShipEvent.DEAD);
    }
    EnemyShipEvent.DEAD = 'EnemyShipEvent.DEAD';
    return EnemyShipEvent;
})(EventObject);
var GameViewEvent = (function (_super) {
    __extends(GameViewEvent, _super);
    function GameViewEvent(type) {
        _super.call(this, type);
    }
    GameViewEvent.LEVEL = "GameViewEvent.LEVEL";
    GameViewEvent.OVER = "GameViewEvent.OVER";
    GameViewEvent.NEW = "GameViewEvent.NEW";
    GameViewEvent.START = "GameViewEvent.START";
    return GameViewEvent;
})(EventObject);
var PlayerBulletEvent = (function (_super) {
    __extends(PlayerBulletEvent, _super);
    function PlayerBulletEvent(data) {
        _super.call(this, PlayerBulletEvent.MOVE);
        this.bullet = data;
    }
    PlayerBulletEvent.prototype.getBullet = function () {
        return this.bullet;
    };
    PlayerBulletEvent.MOVE = 'PlayerBulletEvent.MOVE';
    return PlayerBulletEvent;
})(EventObject);
var PlayerShipEvent = (function (_super) {
    __extends(PlayerShipEvent, _super);
    function PlayerShipEvent(type) {
        _super.call(this, type);
    }
    PlayerShipEvent.DEAD = 'PlayerShipEvent.DEAD';
    PlayerShipEvent.REVIVE = "PlayerShipEvent.REVIVE";
    return PlayerShipEvent;
})(EventObject);
var Font = (function () {
    function Font() {
    }
    Font.HELVETICA = "12px Helvetica";
    Font.GAMEOVER = "18px Helvetica";
    return Font;
})();
var BoundsUtil = (function () {
    function BoundsUtil() {
    }
    BoundsUtil.isInBounds = function (a, b, w, h) {
        var aPoint = GraphicsUtil.globalPosition(a);
        var bPoint = GraphicsUtil.globalPosition(b);
        var rectangle = new PIXI.Rectangle(aPoint.x, aPoint.y, w, h);
        return rectangle.contains(bPoint.x, bPoint.y);
    };
    BoundsUtil.globalPosition = function (object) {
        return new PIXI.Point(object.worldTransform.tx, object.worldTransform.ty);
    };
    return BoundsUtil;
})();
var Loader = (function (_super) {
    __extends(Loader, _super);
    function Loader(url) {
        _super.call(this);
        this.url = url;
    }
    Loader.prototype.load = function () {
        var request = new ConfigRequest(this.url);
        request.addEventListener(EventType.COMPLETE, this.handleConfigComplete, this);
        request.load();
    };
    Loader.prototype.handleConfigComplete = function (event) {
        var request = event.currentTarget;
        this.config = request.getConfig();
        var files = request.getConfig().getFiles();
        var values = files.getValues();
        var filesToLoad = [];
        var filePath;
        for (var i = 0; i < values.length; i++) {
            filePath = values[i];
            filesToLoad.push(filePath.url);
            Style.addPath(filePath);
        }
        this.loader = new PIXI.loaders.Loader();
        this.loader.add(filesToLoad);
        this.loader.once("complete", ObjectUtil.delegate(this.handleFilesComplete, this));
        this.loader.load();
    };
    Loader.prototype.handleFilesComplete = function () {
        this.dispatchEvent(new EventObject(EventType.COMPLETE));
    };
    Loader.prototype.getConfig = function () {
        return this.config;
    };
    return Loader;
})(EventDispatcher);
var ConfigData = (function () {
    function ConfigData(document) {
        this.document = document;
        this.numShields = parseInt($(document).find("NumShields").text());
        this.numEnemies = parseInt($(document).find("NumEnemies").text());
        this.numLives = parseInt($(document).find("NumLives").text());
        this.enemySpeed = parseInt($(document).find("EnemySpeed").text());
        this.processFiles();
    }
    ConfigData.prototype.processFiles = function () {
        this.files = new Dictionary();
        var fileQuery = $(this.document).find("Files");
        var files = fileQuery.children();
        files.each(ObjectUtil.delegate(this.processFile, this));
    };
    ConfigData.prototype.processFile = function (index, element) {
        var type = element.nodeName;
        var id = element.getAttribute("id");
        var filePath = ObjectUtil.reflect(window, type + FilePath.PREFIX, element);
        this.files.setValue(id, filePath);
    };
    ConfigData.prototype.getNumEnemies = function () {
        return this.numEnemies;
    };
    ConfigData.prototype.getEnemySpeed = function () {
        return this.enemySpeed;
    };
    ConfigData.prototype.getNumLives = function () {
        return this.numLives;
    };
    ConfigData.prototype.getNumShields = function () {
        return this.numShields;
    };
    ConfigData.prototype.getFiles = function () {
        return this.files;
    };
    return ConfigData;
})();
var ConfigRequest = (function (_super) {
    __extends(ConfigRequest, _super);
    function ConfigRequest(url) {
        _super.call(this);
        this.url = url;
    }
    ConfigRequest.prototype.load = function () {
        $.get(this.url, null, ObjectUtil.delegate(this.handleConfigComplete, this), "xml");
    };
    ConfigRequest.prototype.handleConfigComplete = function (document) {
        this.config = new ConfigData(document);
        this.dispatchEvent(new EventObject(EventType.COMPLETE, this));
    };
    ConfigRequest.prototype.getConfig = function () {
        return this.config;
    };
    return ConfigRequest;
})(EventDispatcher);
/* 3rd Party Definitions */
///<reference path='../d/jquery.d.ts'/>
///<reference path='../d/pixi.d.ts'/>
///<reference path='../d/greensock.d.ts'/>
///<reference path='../d/js-interview-core.d.ts'/>
/// <reference path="../ts/com/game/Game.ts" />
/// <reference path="../ts/com/game/controller/GameController.ts" />
/// <reference path="../ts/com/game/controller/event/GameOverEvent.ts" />
/// <reference path="../ts/com/game/controller/event/PlayerLivesUpdatedEvent.ts" />
/// <reference path="../ts/com/game/controller/event/PlayerScoreUpdatedEvent.ts" />
/// <reference path="../ts/com/game/model/GameModel.ts" />
/// <reference path="../ts/com/game/view/AbstractView.ts" />
/// <reference path="../ts/com/game/view/GameView.ts" />
/// <reference path="../ts/com/game/view/Style.ts" />
/// <reference path="../ts/com/game/view/display/Bullet.ts" />
/// <reference path="../ts/com/game/view/display/EnemyBullet.ts" />
/// <reference path="../ts/com/game/view/display/EnemyShip.ts" />
/// <reference path="../ts/com/game/view/display/PlayerBullet.ts" />
/// <reference path="../ts/com/game/view/display/PlayerShip.ts" />
/// <reference path="../ts/com/game/view/display/Shield.ts" />
/// <reference path="../ts/com/game/view/event/EnemyBulletEvent.ts" />
/// <reference path="../ts/com/game/view/event/EnemyShipEvent.ts" />
/// <reference path="../ts/com/game/view/event/GameViewEvent.ts" />
/// <reference path="../ts/com/game/view/event/PlayerBulletEvent.ts" />
/// <reference path="../ts/com/game/view/event/PlayerShipEvent.ts" />
/// <reference path="../ts/com/game/view/style/Font.ts" />
/// <reference path="../ts/com/game/view/util/BoundsUtil.ts" />
/// <reference path="../ts/com/loading/Loader.ts" />
/// <reference path="../ts/com/loading/data/ConfigData.ts" />
/// <reference path="../ts/com/loading/request/ConfigRequest.ts" />
