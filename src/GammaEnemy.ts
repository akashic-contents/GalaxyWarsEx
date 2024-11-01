import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";
import { Particle } from "./Particle";
import { emmitDamageEffect } from "./emmitDamageEffect";

export class GammaEnemy extends Enemy {
    static numInstance = 0;

    constructor() {
        const imageAsset = g.game.scene().asset.getImageById("gammaEnemy");
        const width = imageAsset.width;
        const height = imageAsset.height;
        const x = (g.game.width - width) / 2;
        const y = -height;

        super({
            pos: { x: x, y: y },
            hp: 9999,
            point: 100,
            itemType: [],
            spr: new g.Sprite({
                scene: Global.gameCore.scene,
                src: imageAsset,
                x: x,
                y: y
            })
        });

        GammaEnemy.numInstance++;
    }

    onDied(): void {
        super.onDied();
        // 撃破SEを鳴らす
        g.game.scene().asset.getAudioById("burst").play();

        const imageAsset = g.game.scene().asset.getImageById("gammaEnemy");
        const split = 8;
        const fragmentWidth = imageAsset.width / split;
        const fragmentHeight = imageAsset.height / split;
        for (let i = 0; i < split; i++) {
            const y = fragmentHeight * i;
            for (let j = 0; j < split; j++) {
                const spd = 150 + 250 * math.random();
                const th = math.random() * Math.PI * 2;
                const x = fragmentWidth * j;
                const offset = Math.PI * 2 * math.random();
                const scale = 1 + math.random();
                const p = new Particle({
                    pos: { x: this.pos.x + x, y: this.pos.y + y },
                    vel: { x: spd * Math.cos(th), y: spd * Math.sin(th) },
                    life: (g.game.fps * 1.2) | 0,
                    asset: imageAsset,
                    width: fragmentWidth,
                    height: fragmentHeight,
                    srcX: x,
                    srcY: y,
                    onUpdate: (p) => {
                        const th = Math.PI * 2 / g.game.fps * p.cntr + offset;
                        p.spr.scaleX = scale * Math.cos(th);
                        p.spr.scaleY = scale * Math.sin(th);
                        const remain = p.life - p.cntr;
                        if (remain < 8) {
                            p.spr.opacity = remain / 8;
                        }
                        p.spr.modified();
                    }
                });
                p.spr.compositeOperation = "source-over";
                if (i % 2 === 0) {
                    p.spr.scaleX = 4;
                    p.spr.scaleY = 4;
                }
                Global.gameCore.entities.push(p);
                emmitDamageEffect(p);
            }
        }
    }

    onUpdate(): boolean {
        const progressTime = 50;
        if (this.cntr < progressTime) {
            this.pos.y += 4;
        } else {
            if (this.cntr === progressTime) {
                this.hp = 16;
            }

            const cntr = (this.cntr - progressTime) % (180 * 3);
            if (cntr < 180) {
                if (cntr % 3 === 0) {
                    let th = Math.PI * 2 / 180 * cntr;
                    const b = new Bullet({
                        type: EntityType.ENEMY_BULLET,
                        obstacles: [EntityType.PLAYER],
                        pos: { x: this.pos.x + this.spr.width / 2, y: this.pos.y + this.spr.height / 2 },
                        vel: { x: 8 * Math.sin(th), y: 8 * Math.cos(th) },
                        hp: 2,
                        homing: false,
                        imageAsset: g.game.scene().asset.getImageById("ball")
                    });
                    Global.gameCore.entities.push(b);
                    th = -th;
                    const b1 = new Bullet({
                        type: EntityType.ENEMY_BULLET,
                        obstacles: [EntityType.PLAYER],
                        pos: { x: this.pos.x + this.spr.width / 2, y: this.pos.y + this.spr.height / 2 },
                        vel: { x: 8 * Math.sin(th), y: 8 * Math.cos(th) },
                        hp:2,
                        homing: false,
                        imageAsset: g.game.scene().asset.getImageById("ball")
                    });
                    Global.gameCore.entities.push(b1);
                }
            } else if (cntr < 180 * 2) {
                if (cntr % 60 === 0) {
                    const b1 = new Bullet({
                        type: EntityType.ENEMY,
                        obstacles: [EntityType.PLAYER],
                        pos: { x: this.pos.x + this.spr.width / 8, y: this.pos.y },
                        vel: { x: 0, y: 4 },
                        hp: 1,
                        homing: true,
                        imageAsset: g.game.scene().asset.getImageById("enemyMissile"),
                        life: g.game.fps * 5, // life
                        th: Math.PI / 4
                    });
                    Global.gameCore.entities.push(b1);

                    const b2 = new Bullet({
                        type: EntityType.ENEMY,
                        obstacles: [EntityType.PLAYER],
                        pos: { x: this.pos.x + this.spr.width / 8 * 7, y: this.pos.y },
                        vel: { x: 0, y: 4 },
                        hp: 1,
                        homing: true,
                        imageAsset: g.game.scene().asset.getImageById("enemyMissile"),
                        life: g.game.fps * 5, // life
                        th: -Math.PI / 4
                    });
                    Global.gameCore.entities.push(b2);
                }
            } else {
                //  nothing to do
            }
        }

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

        this.cntr++;

        return true;
    }

    //
    // 破棄
    //
    destroy(): void {
        GammaEnemy.numInstance--;
        super.destroy();
    }
}
