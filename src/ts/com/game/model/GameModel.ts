class GameModel extends EventDispatcher {

    private config:ConfigData;
    private numEnemies:number;
    private numLives:number;
    private numShields:number;
    private enemiesLeft:number;
    private score:number;
    private lastEnemyDeadTime:number;
    private level:number;
    private enemySpeed:number;
    private highScores:number[];

    constructor(config:ConfigData) {
        super();
        this.config = config;
        this.reset();
        this.highScores = [0, 0, 0];
    }

    public reset():void {
        this.numEnemies = this.config.getNumEnemies();
        this.numLives = this.config.getNumLives();
        this.numShields = this.config.getNumShields();
        this.enemiesLeft = this.config.getNumEnemies();
        this.enemySpeed = this.config.getEnemySpeed();
        this.score = 0;
        this.lastEnemyDeadTime = 0;
        this.level = 1;
        this.enemySpeed = this.config.getEnemySpeed();
    }

    public nextLevel():void {
        this.level += 1;
        this.numEnemies += 1;
        this.enemiesLeft = this.numEnemies;
        this.enemySpeed += 2;
        this.numLives = this.config.getNumLives();
    }

    public enemyShipDead():void {
        this.enemiesLeft--;
    }

    public highScoreUpdate():void {
        this.highScores.push(this.score);
        this.highScores = this.highScores.sort(function(a, b){return b-a});
    }

    public playerShipDead():void {
        this.numLives--;
    }

    public updateScore():void {
        var enemyDeadInterval:number = Date.now() - this.lastEnemyDeadTime;
        this.lastEnemyDeadTime = Date.now();
        if (enemyDeadInterval > 1000) {
            this.score += 100;
        } else {
            this.score += ((1000 - enemyDeadInterval) + 100);
        }
    }

    public getEnemiesLeft(): number {
        return this.enemiesLeft;
    }

    public getScore(): number {
        return this.score;
    }

    public getNumLives():number {
        return this.numLives;
    }

    public getNumEnemies():number {
        return this.numEnemies;
    }

    public getNumShields():number {
        return this.numShields;
    }

    public getEnemySpeed():number {
        return this.enemySpeed;
    }

    public getLevel():number {
        return this.level;
    }

    public getHighScores():number[] {
        return this.highScores;
    }

}