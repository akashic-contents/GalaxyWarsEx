import { Global } from "./Global";
import { Player } from "./Player";

export class PlayerStatus {
    private scoreLabel: g.Label;
    private hiScoreLabel: g.Label;
    private hpGauge: g.E;

    constructor() {
        this.scoreLabel = new g.Label({
            scene: Global.gameCore.scene,
            text: "",
            font: Global.bmpFont,
            fontSize: 16,
            x: 4, y: 4
        });
        Global.gameCore.hudLayer.append(this.scoreLabel);

        this.hiScoreLabel = new g.Label({
            scene: Global.gameCore.scene,
            text: "",
            font: Global.bmpFont,
            fontSize: 16,
            x: g.game.width - (16 * 9 + 4), y: 4
        });
        // ハイスコア表示を消す
        //Global.gameCore.hudLayer.append(this.hiScoreLabel);

        this.hpGauge = new g.E({ scene: Global.gameCore.scene });

        // trick
        const m = this.hpGauge.getMatrix()._matrix;
        this.hpGauge.angle = 0.001; // dummy value to apply following matrix
        const sk = -Math.PI / 6;
        m[0] = Math.cos(sk);
        m[1] = 0;
        m[2] = Math.sin(sk);
        m[3] = 1;
        this.hpGauge.getMatrix().update = () => {}; // to prevent hpGauge from overwriting matrix

        let x = 28;
        for (let i = 0; i < Player.MAX_HP; i++) {
            const scale = new g.FilledRect({
                scene: Global.gameCore.scene,
                width: 8,
                height: 16,
                x: x,
                y: 24,
                cssColor: "Yellow"
            });
            x += scale.width + 4;
            this.hpGauge.append(scale);
        }
        Global.gameCore.hudLayer.append(this.hpGauge);
    }

    /**
     * 状態更新
     */
    update(): boolean {
        this.scoreLabel.text = "SCORE " + ("00000" + Global.gameCore.player.score).slice(-6);
        this.scoreLabel.invalidate();
        this.hiScoreLabel.text = "HI " + ("00000" + Global.hiScore).slice(-6);
        this.hiScoreLabel.invalidate();

        const scales = this.hpGauge.children;
        for (let i = 0; i < scales.length; i++) {
            const scale = scales[i] as g.FilledRect;
            scale.cssColor = (i < Global.gameCore.player.hp) ? "Yellow" : "Red";
            scale.modified();
        }

        return true;
    }

    /**
     * 破棄
     */
    destroy(): void {
        this.scoreLabel.destroy();
        this.hiScoreLabel.destroy();
        this.hpGauge.destroy();
    }
}
