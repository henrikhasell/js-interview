class EnemyBullet extends Bullet {

    public fireYPosition:number;

    constructor(position: PIXI.Point) {
        this.bulletStyle = Style.ENEMY_BULLET;
        this.event = new EnemyBulletEvent(this);
        super(position);
        this.fireYPosition = this.renderer.getGameSize().y ;
    }
}

