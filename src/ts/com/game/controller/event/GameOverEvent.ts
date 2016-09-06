class GameOverEvent extends EventObject {

    public static WIN:string = "GameOverEvent.WIN";
    public static LOSE:string = "GameOverEvent.LOSE";
    public static NEW:string = "GameOverEvent.NEW";

    constructor(type: string) {
        super(type);
    }
}