import { Global } from "./Global";
import { EntityType } from "./EntityType";
import { ItemType } from "./ItemType";
import { Shield } from "./Shield";
import { Bullet } from "./Bullet";
import { emmitDamageEffect } from "./emmitDamageEffect";

export class Player {
    static MAX_HP = 10; // プレイヤー最大HP

    private obstacles: number[];
    private type: EntityType;
    private homingCntr = 0;
    private piercingCntr = 0;
    private rapidFireCntr = 0;
    private bulletSpeedCntr = 0;
    private bulletCntr = 0;
    private bulletInterval = 10;
    pos: g.CommonOffset;
    spr: g.Sprite;
    shieldCntr = 0;
    score = 0;
    hp = 0;

    constructor() {
        this.reset();

        this.obstacles = [
            EntityType.ENEMY,
            EntityType.ENEMY_BULLET,
            EntityType.ITEM
        ];

        this.spr = new g.Sprite({
            scene: Global.gameCore.scene,
            src: g.game.scene().asset.getImage("/image/player.png"),
            x: this.pos.x,
            y: this.pos.y
        });

        Global.gameCore.gameLayer.append(this.spr);
    }

    /**
     * 衝突イベントハンドラ
     */
    onCollision(e: any): void {
        if (e.type === EntityType.ITEM) {
            e.hp = 0;
            const effectTime = g.game.fps * 10;
            let getter;
            switch (e.itemType) {
                case ItemType.SHIELD:
                    if (this.shieldCntr <= 0) {
                        for (let i = 0; i < 8; i++) {
                            Global.gameCore.entities.push(new Shield(i, 8));
                        }
                        getter = () => { return this.shieldCntr; };
                    }
                    this.shieldCntr = effectTime;
                    break;

                case ItemType.HOMING:
                    if (this.homingCntr <= 0) {
                        getter = () => { return this.homingCntr; };
                    }
                    this.homingCntr = effectTime;
                    break;

                case ItemType.PIERCING:
                    if (this.piercingCntr <= 0) {
                        getter = () => { return this.piercingCntr; };
                    }
                    this.piercingCntr = effectTime;
                    break;

                case ItemType.RAPIDFIRE:
                    if (this.rapidFireCntr <= 0) {
                        getter = () => { return this.rapidFireCntr; };
                    }
                    this.rapidFireCntr = effectTime;
                    break;

                case ItemType.BULLETSPEED:
                    if (this.bulletSpeedCntr <= 0) {
                        getter = () => { return this.bulletSpeedCntr; };
                    }
                    this.bulletSpeedCntr = effectTime;
                    break;

                case ItemType.RECOVER:
                    if (this.hp < Player.MAX_HP) this.hp++;
                    break;

                default:
            }

            if (getter) {
                Global.gameCore.itemGaugeTray.addItem(e.itemType, effectTime, getter);
            }
            Global.gameCore.itemGaugeTray.showItemName(e.itemType);
        } else {
            Global.gameCore.vibrationCntr = 10;
            for (let i = 0; i < 3; i++) {
                emmitDamageEffect(this);
            }
        }
    }

    /**
     * Player初期化
     */
    reset(): void {
        this.type = EntityType.PLAYER;
        const imgAsset = g.game.scene().asset.getImage("/image/player.png");
        this.pos = {
            x: (g.game.width - imgAsset.width) / 2,
            y: g.game.height - imgAsset.height * 2
        };
        this.hp = Player.MAX_HP;
        this.score = 0;
        this.bulletCntr = 0;
        this.bulletInterval = 10;
        this.shieldCntr = 0;
        this.homingCntr = 0;
        this.rapidFireCntr = 0;
        this.bulletSpeedCntr = 0;
        this.piercingCntr = 0;
    }

    /**
     * Player移動
     */
    move(dx: number, dy: number): void {
        this.pos.x += dx;
        this.pos.y += dy;
        this.pos.x = Math.max(0, Math.min(g.game.width - this.spr.width, this.pos.x));
        this.pos.y = Math.max(0, Math.min(g.game.height - this.spr.height, this.pos.y));
    }
    /**
     * Player状態更新
     */
    update(): boolean {
        if (this.hp <= 0) {
            return false;
        }

        const bulletInterval = this.rapidFireCntr > 0 ? this.bulletInterval / 2 : this.bulletInterval;
        const bulletSpeed = this.bulletSpeedCntr > 0 ? 16 : 8;
        const bulletHP = this.piercingCntr > 0 ? 3 : 1;
        const bulletHoming = this.homingCntr > 0;
        if (this.bulletCntr % bulletInterval === 0) {
            const b = new Bullet({
                type: EntityType.PLAYER_BULLET,
                obstacles: [EntityType.ENEMY],
                pos: { x: this.pos.x + this.spr.width / 2, y: this.pos.y },
                vel: { x: 0, y: -bulletSpeed },
                hp: bulletHP,
                homing: bulletHoming,
                imageAsset: g.game.scene().asset.getImage("/image/missle.png")
            });
            Global.gameCore.entities.push(b);
        }

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        this.bulletCntr++;

        if (this.shieldCntr > 0) this.shieldCntr--;
        if (this.homingCntr > 0) this.homingCntr--;
        if (this.rapidFireCntr > 0) this.rapidFireCntr--;
        if (this.bulletSpeedCntr > 0) this.bulletSpeedCntr--;
        if (this.piercingCntr > 0) this.piercingCntr--;

        return true;
    }

    /**
     *  Player破棄
     */
    destroy(): void {
        this.spr.destroy();
    }
}
