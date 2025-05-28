import { Global } from "./Global";
import { EntityType } from "./EntityType";
import { Bullet } from "./Bullet";

export class Shield {
    private type: EntityType;
    private obstacles: number[];
    private pos: g.CommonOffset;
    private idx: number;
    private numFellow: number;
    private hp: number;
    private cntr: number;
    private spr: g.Sprite;

    constructor(idx: number, numFellow: number) {
        this.type = EntityType.OBSTACLE;
        this.obstacles = [EntityType.ENEMY_BULLET];
        this.pos = { x: 0, y: 0 };
        this.idx = idx;
        this.numFellow = numFellow;
        this.hp = 9999;
        this.cntr = 0;

        this.spr = new g.Sprite({
            scene: Global.gameCore.scene,
            src: g.game.scene().asset.getImage("/image/shield.png")
        });
        Global.gameCore.gameLayer.append(this.spr);

        this.update();

    }
    /**
     * 状態更新
     */
    update(): boolean {
        if (Global.gameCore.player.shieldCntr <= 0) {
            return false;
        }

        const radius = 40;
        const th = this.cntr * 4 + Math.PI * 2 * (this.idx / this.numFellow);
        const cx = Global.gameCore.player.spr.x + Global.gameCore.player.spr.width / 2;
        const cy = Global.gameCore.player.spr.y + Global.gameCore.player.spr.height / 2;
        this.pos.x = cx + Math.cos(th) * radius - this.spr.width / 2;
        this.pos.y = cy + Math.sin(th) * radius - this.spr.height / 2;

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        this.cntr++;

        return true;
    }

    /**
     * 衝突イベントハンドラ
     */
    onCollision(e: Bullet): void {
        e.hp--;
    }

    /**
     * 破棄
     */
    destroy(): void {
        this.spr.destroy();
    }
}
