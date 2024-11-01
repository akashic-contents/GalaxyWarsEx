import { Enemy }from "./Enemy";
import { ItemType } from "./ItemType";
import { Global } from "./Global";
import * as math from "./Math";

/**
 * 自機に特攻してくる敵
 */
export class SelfDestructionEnemy extends Enemy {
    constructor() {
        const imageAsset = Global.gameCore.scene.asset.getImageById("selfDestructionEnemy");
        const x = math.random() * (g.game.width - imageAsset.width);
        const y = -40;
        const itemTypes = [
            ItemType.CHARGE
        ];

        super({
            pos: { x: x, y: y },
            hp: 1,
            point: 10,
            itemType: itemTypes,
            spr: new g.Sprite({
                scene: Global.gameCore.scene,
                src: imageAsset,
                x: x,
                y: y
            })
        });
    }

    /**
     * 状態更新
     */
    onUpdate(): boolean {
        // TODO: 追尾できる感じにする
        //this.pos.x = Global.gameCore.player.pos.x;
        //this.pos.y = Global.gameCore.player.pos.y

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        return 0 < this.pos.y && this.pos.y < g.game.height;
    }
}
