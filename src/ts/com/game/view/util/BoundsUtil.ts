class BoundsUtil {

    public static isInBounds(a:PIXI.Sprite, b:PIXI.Sprite, w:number, h:number):boolean {
        var aPoint:PIXI.Point = GraphicsUtil.globalPosition(a);
        var bPoint:PIXI.Point = GraphicsUtil.globalPosition(b);

        var rectangle:PIXI.Rectangle = new PIXI.Rectangle(aPoint.x, aPoint.y, w, h);

        return rectangle.contains(bPoint.x, bPoint.y);
    }

    public static globalPosition(object:PIXI.Sprite):PIXI.Point {
        return new PIXI.Point(object.worldTransform.tx, object.worldTransform.ty);
    }
}