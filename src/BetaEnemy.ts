import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";
import { ItemType } from "./ItemType";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";


export class BetaEnemy extends Enemy {
    private dropPointY: number;
    private origin: g.CommonOffset;
    private cntrOffset: number;
    private moveDown: boolean;

    constructor() {
        const imageAsset = Global.gameCore.scene.asset.getImageById("betaEnemy");
        const x = math.random() * (g.game.width - imageAsset.width);
        const y = -40;
        const itemTypes = [
            ItemType.SHIELD,
            ItemType.HOMING,
            ItemType.RAPIDFIRE,
            ItemType.BULLETSPEED,
            ItemType.PIERCING,
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

        this.dropPointY = math.random() * (g.game.height / 3) + 32;
        this.origin = { x: this.pos.x, y: this.pos.y };
        this.cntrOffset = math.random() * 30 | 0;
        this.moveDown = true;
    }

    /**
     * 状態更新
     */
    onUpdate(): boolean {
        const imageAsset = Global.gameCore.scene.asset.getImageById("betaEnemy");
        if (this.moveDown) {
            this.origin.y += 8;
            if (this.pos.y >= this.dropPointY) {
                this.moveDown = false;
            }
        }
        const cntr = this.cntr + this.cntrOffset;
        this.pos.x = this.origin.x + Math.sin(cntr / 45 * Math.PI) * 80;
        this.pos.y = this.origin.y + Math.sin(cntr / 20 * Math.PI) * 24;

        if (this.cntr % 3 === 0 && math.random() < 0.1) {
            const b = new Bullet({
                type: EntityType.ENEMY_BULLET,
                obstacles: [EntityType.PLAYER],
                pos: { x: this.pos.x + imageAsset.width / 2, y: this.pos.y + imageAsset.height },
                vel: { x: 0, y: +8 },
                hp:2,
                homing: false,
                imageAsset: Global.gameCore.scene.asset.getImageById("ball")
            });
            Global.gameCore.entities.push(b);
        }

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        this.cntr++;

        return true;
    }

    onDied(): void {
        super.onDied();
        // 撃破SEを鳴らす
        g.game.scene().asset.getAudioById("enemy_burst").play();
    }
}
