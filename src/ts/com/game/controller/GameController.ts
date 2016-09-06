class GameController {

    private eventBus: EventBus;
    private model: GameModel;

    constructor(model: GameModel) {
        this.model = model;
        this.create();
        this.addEventListeners();
    }

    private create(): void {
        this.createEventBus();
    }

    private createEventBus(): void {
        this.eventBus = EventBus.getInstance();
    }

    private addEventListeners(): void {
        this.listen(EnemyShipEvent.DEAD, this.handleEnemyShipDead, this);
        this.listen(PlayerShipEvent.DEAD, this.handlePlayerShipDead, this);
        this.listen(GameOverEvent.WIN, this.handleGameWin, this);
        this.listen(GameOverEvent.LOSE, this.handleGameOver, this);
        this.listen(GameOverEvent.NEW, this.handleNewGame, this);
    }

    private handleEnemyShipDead(event: EnemyShipEvent): void {
        this.model.enemyShipDead();
        this.model.updateScore();
        this.dispatchEvent(new PlayerScoreUpdatedEvent());
        if (this.model.getEnemiesLeft() == 0) {
            this.dispatchEvent(new GameOverEvent(GameOverEvent.WIN));
        }
    }

    private handlePlayerShipDead(event: PlayerShipEvent): void {
        this.model.playerShipDead();
        if (this.model.getNumLives() > 0) {
            this.dispatchEvent(new PlayerLivesUpdatedEvent());
            this.dispatchEvent(new PlayerShipEvent(PlayerShipEvent.REVIVE));}
        else { this.dispatchEvent(new GameOverEvent(GameOverEvent.LOSE))
        }
    }

    private handleGameWin(event: GameOverEvent): void {
        this.model.nextLevel();
        this.dispatchEvent(new PlayerLivesUpdatedEvent());
        this.dispatchEvent(new GameViewEvent(GameViewEvent.LEVEL));
    }

    private handleGameOver(event: GameOverEvent): void {
        this.model.highScoreUpdate()
        this.dispatchEvent(new GameViewEvent(GameViewEvent.OVER))
    }

    private handleNewGame(event: GameOverEvent): void {
        this.model.reset();
        setTimeout(this.dispatchEvent(new GameViewEvent(GameViewEvent.START)), 1000)
    }


    public listen(type: string, handler: Function, scope: Object): void {
        this.eventBus.addEventListener(type, handler, scope);
    }

    public remove(type: string, scope: Object): void {
        this.eventBus.removeEventListener(type, scope);
    }

    public dispatchEvent(event: EventObject): void {
        this.eventBus.dispatchEvent(event);
    }
}