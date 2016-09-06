class PlayerBullet extends Bullet {

    public fireYPosition:number;

    constructor(position: PIXI.Point) {
        this.bulletStyle = Style.PLAYER_BULLET;
        super(position);
        this.event = new PlayerBulletEvent(this);
        this.fireYPosition = 0;
    }
}
