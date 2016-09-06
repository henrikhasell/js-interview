class PlayerShipEvent extends EventObject {

    public static DEAD:string = 'PlayerShipEvent.DEAD';
    public static REVIVE:string = "PlayerShipEvent.REVIVE";

    constructor(type: string) {
        super(type);
    }
}