import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";
import { ItemType } from "./ItemType";
import { Bullet } from "./Bullet";
import { Enemy }from "./Enemy";

export class AlphaEnemy extends Enemy {
    private targetPosition: g.CommonOffset;

    constructor() {
        const imageAsset = Global.gameCore.scene.asset.getImageById("alphaEnemy");
        const pos = {
            x: math.random() * (g.game.width - imageAsset.width),
            y: math.random() * -32 - 32
        };
        const itemType = [
            ItemType.RECOVER
        ];

        super({
            pos: pos,
            hp: 4,
            point: 20,
            itemType: itemType,
            spr: new g.Sprite({
                scene: Global.gameCore.scene,
                src: imageAsset,
                x: pos.x,
                y: pos.y
            })
        });
        this.targetPosition = null;
    }

    /**
     * 状態更新
     */
    onUpdate(): boolean {
        if (this.cntr < g.game.fps) {
            this.pos.y += 4;
        } else if (this.cntr < g.game.fps * 3) {
            if (this.cntr === g.game.fps) {
                this.targetPosition = { x: Global.gameCore.player.pos.x, y: Global.gameCore.player.pos.y };
            }
            if (this.cntr % 3 === 0) {
                this.fire(this.targetPosition);
            }
        } else {
            this.pos.y += 8;
        }

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        return this.pos.y < g.game.height;
    }

    /**
     * 通常弾射出
     */
    fire(targetPosition: g.CommonOffset): void {
        const imageAsset = Global.gameCore.scene.asset.getImageById("alphaEnemy");
        let dx = targetPosition.x - this.pos.x;
        let dy = targetPosition.y - this.pos.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > 0) {
            dx /= len;
            dy /= len;
            const b = new Bullet({
                type: EntityType.ENEMY_BULLET,
                obstacles: [EntityType.PLAYER],
                pos: { x: this.pos.x + imageAsset.width / 2, y: this.pos.y + imageAsset.height },
                vel: { x: dx * 8, y: dy * 8 },
                hp: 2,
                homing: false,
                imageAsset: Global.gameCore.scene.asset.getImageById("ball")
            });
            Global.gameCore.entities.push(b);
        }
    }

    onDied(): void {
        super.onDied();
        // 撃破SEを鳴らす
        g.game.scene().asset.getAudioById("enemy_burst").play();
    }
}

