import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";

export class Background {
    private type: EntityType;
    private cntr: number;
    private spr: g.FilledRect;

    constructor() {
        this.type = EntityType.EFFECT;
        this.cntr = 0;
        this.spr = new g.FilledRect({
            scene: Global.gameCore.scene,
            cssColor: "#1E90FF",
            width: g.game.width,
            height: g.game.height,
            opacity: 0.7
        });
        Global.gameCore.backgroundLayer.append(this.spr);
    }

    /**
     * 状態更新
     */
    update(): boolean {
        if (this.cntr <= 60) {
            const t = Math.min(1, this.cntr / 60);
            const R = Math.round(0x00 * t + 0x1E * (1 - t));
            const G = Math.round(0x00 * t + 0x90 * (1 - t));
            const B = Math.round(0x20 * t + 0xFF * (1 - t));
            this.spr.cssColor = "#" + ("000000" + ((R << 16) | (G << 8) | B).toString(16)).slice(-6);
            this.spr.modified();
        }

        if (this.cntr % 4 === 0 && math.random() < 0.5) {
            const front = math.random() < 0.25;
            const imageAsset = Global.gameCore.scene.asset.getImageById(front ? "star01" : "star02");
            const star = new g.Sprite({
                scene: Global.gameCore.scene,
                src: imageAsset,
                x: math.random() * (g.game.width - imageAsset.width),
                y: -imageAsset.height
            });
            star.modified();
            star.onUpdate.add(() => {
                const t = Math.min(1, this.cntr / 60);
                let dy = front ? 8 : 4;
                dy += dy * 2.5 * (1 - t);
                star.y += dy;
                star.modified();
                if (star.y >= g.game.height) {
                    star.destroy();
                }
            });
            this.spr.append(star);
        }

        this.cntr++;

        return true;
    }

    /**
     * 破棄
     */
    destroy(): void {
        this.spr.destroy();
    }
}
