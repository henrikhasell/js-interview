class Bullet extends AbstractView {

    public sprite:PIXI.Sprite;
    private tween:TweenMax;
    public event:EventObject;
    public bulletStyle:string;
    public fireYPosition:number;

    constructor(position:PIXI.Point) {
        super();
        this.sprite.position = position;
    }

    public create():void {
        super.create();
        this.createBullet();
        this.addEventListeners()
    }

    public dispose():void {
        if(this.parent) {
            this.renderer.removeChild(this);
        }
    }

    public addEventListeners():void {
        this.listen(GameOverEvent.WIN, this.dispose, this);
        this.listen(GameOverEvent.LOSE, this.dispose, this);
    }

    public createBullet():void {
        this.sprite = Style.getSprite(this.bulletStyle);
        this.addChild(this.sprite);
    }

    public fire():void {
        this.renderer.addChild(this);
        this.tween = TweenMax.to(this.sprite.position, 1,
            {
                y: this.fireYPosition,
                ease: Linear.easeNone,
                onUpdate: ObjectUtil.delegate(this.handleTweenUpdate, this),
                onComplete: ObjectUtil.delegate(this.handleTweenComplete, this)
            });
    }

    private handleTweenUpdate():void {
        this.dispatch(this.event);
    }

    private handleTweenComplete():void {
        this.dispose();
    }

    public getSprite():PIXI.Sprite {
        return this.sprite;
    }
}



