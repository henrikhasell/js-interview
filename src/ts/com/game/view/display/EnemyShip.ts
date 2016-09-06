class EnemyShip extends AbstractView {

    private ship:PIXI.extras.MovieClip;
    private moveTimer:Timer;
    private fireTimer:Timer;
    private tweens:Dictionary<string, TweenMax>;
    private fireSpeed:number;
    private moveSpeed:number;
    private enemySpeed:number;

    constructor(enemySpeed:number) {
        this.enemySpeed = enemySpeed;
        super();
    }

    private setFireSpeed() {
        this.fireSpeed = 60000 / this.enemySpeed;
    }

    private setMoveSpeed() {
        this.moveSpeed = 40000 / this.enemySpeed;
    }

    public create():void {
        super.create();
        this.setFireSpeed();
        this.setMoveSpeed();
        this.createShip();
        this.createStartPoint(this.randomPoint);
        this.createTweens();
        this.startMoveTimer();
        this.startFireTimer();
    }

    public dispose():void {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.moveTimer.removeEventListener(TimerEvent.TIMER, this);
        this.fireTimer.removeEventListener(TimerEvent.TIMER, this);
    }

    public addEventListeners():void {
        this.listen(PlayerBulletEvent.MOVE, this.handlePlayerBullet, this);
        // this.listen(GameOverEvent.LOSE, this.dispose, this);
    }

    private createShip():void {
        this.ship = Style.getMovieClip(Style.ENEMY_SHIP);
        this.ship.play();
        this.addChild(this.ship);
    }

    private createStartPoint(point:PIXI.Point):void {
        this.ship.position.x = point.x;
        // this.ship.position.y = point.y;
    }

    private createTweens():void {
        this.tweens = new Dictionary<string, TweenMax>();
    }

    private startMoveTimer():void {
        this.moveTimer = new Timer(this.moveSpeed);
        this.moveTimer.addEventListener(TimerEvent.TIMER, this.handleMoveTimerUpdate, this);
        this.moveTimer.start();
    }

    private startFireTimer():void {
        this.fireTimer = new Timer(this.fireSpeed);
        this.fireTimer.addEventListener(TimerEvent.TIMER, this.handleFireTimeUpdate, this);
        this.fireTimer.start();
    }

    private handleMoveTimerUpdate(event:TimerEvent):void {
        this.move(this.randomPoint);
    }

    private handleFireTimeUpdate(event:TimerEvent):void {
        new EnemyBullet(this.ship.position.clone()).fire();
    }

    private handlePlayerBullet(event:PlayerBulletEvent):void {
        var blockWidth:number = 16;
        var blockHeight:number = 16;
        if (BoundsUtil.isInBounds(this.ship, event.getBullet().getSprite(), blockWidth, blockHeight)) {
            this.remove(PlayerBulletEvent.MOVE, this);
            this.dispatch(new EnemyShipEvent());
            this.dispose();
        }
    }

    private move(point:PIXI.Point):void {
        this.tweens.setValue("x", TweenMax.to(this.ship.position, 1, {"x": point.x, ease: Linear.easeIn}));
        this.tweens.setValue("y", TweenMax.to(this.ship.position, 1, {"y": point.y, ease: Linear.easeIn}));
    }

    private get randomPoint():PIXI.Point {
        var x:number = Math.random() * (this.renderer.getGameSize().x - this.ship.width);
        var y:number = Math.random() * (this.renderer.getGameSize().y - this.ship.height - 150);
        return new PIXI.Point(x, y);
    }
}