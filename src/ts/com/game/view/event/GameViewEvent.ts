class GameViewEvent extends EventObject {

    public static LEVEL:string = "GameViewEvent.LEVEL";
    public static OVER:string = "GameViewEvent.OVER";
    public static NEW:string = "GameViewEvent.NEW";
    public static START:string = "GameViewEvent.START";

    constructor(type: string) {
        super(type);
    }
}