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
        const y = -20;
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
        const speed = 7;
        const target = Global.gameCore.player.pos;
        const x = target.x - this.pos.x;
        const y = target.y - this.pos.y;
        const radian = Math.atan2(y, x);
        const dx = speed * Math.cos(radian);
        const dy = speed * Math.sin(radian);
        this.pos.x += dx;
        this.pos.y += dy;

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        // 撃破されなければ7秒間は生存する
        return this.cntr < g.game.fps * 7;
    }

    onDied(): void {
        super.onDied();
        // 撃破SEを鳴らす
        g.game.scene().asset.getAudioById("enemy_burst").play();
    }
}
