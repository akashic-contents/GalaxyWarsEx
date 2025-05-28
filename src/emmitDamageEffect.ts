import { Global } from "./Global";
import * as math from "./Math";
import { Particle } from "./Particle";
import { Player } from "./Player";

//
// 被弾エフェクト（大）
//
export function emmitDamageEffect(entity: Player | Particle): void {
    const th = math.random() * Math.PI * 2;
    const spd = 750;
    const imageAsset = Global.gameCore.scene.asset.getImage("/image/particle.png");

    const p = new Particle({
        pos: { x: entity.pos.x + entity.spr.width / 2, y: entity.pos.y + entity.spr.height / 2 },
        vel: { x: spd * Math.cos(th), y: spd * Math.sin(th) },
        drag: 4,
        grav: 500,
        life: g.game.fps,
        asset: imageAsset,
        onUpdate: (p) => {
            if (p.vel.y > 0) {
                p.spr.opacity *= 0.9;
            }
            if (p.cntr % 3 === 0) {
                const p2 = new Particle({
                    pos: p.pos,
                    vel: { x: 0, y: 0 },
                    drag: 0,
                    grav: 0,
                    life: 8,
                    asset: imageAsset,
                    onUpdate: (p) => {
                        p.spr.opacity *= 0.9;
                        p.spr.modified();
                    }
                });
                p2.spr.opacity = p.spr.opacity;
                Global.gameCore.entities.push(p2);
            }
        }
    });
    p.spr.scaleX = 2.0;
    p.spr.scaleY = 2.0;
    p.spr.modified();

    Global.gameCore.entities.push(p);
}
