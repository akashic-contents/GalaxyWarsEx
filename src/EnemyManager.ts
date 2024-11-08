import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";
import { AlphaEnemy } from "./AlphaEnemy";
import { BetaEnemy } from "./BetaEnemy";
import { GammaEnemy } from "./GammaEnemy";
import { SelfDestructionEnemy } from "./SelfDestructionEnemy";

export class EnemyManager {
    cntr: number;

    constructor() {
        this.cntr = 0;
    }

    /**
     * 敵総数カウント
     */
    countEnemy(): number {
        let count = 0;
        for (let i = 0; i < Global.gameCore.entities.length; i++) {
            const e = Global.gameCore.entities[i];
            if (e && e.type === EntityType.ENEMY) {
                count++;
            }
        }
        return count;
    }

    /**
     * 状態更新
     */
    update(): boolean {
        if (this.cntr === g.game.fps * 3) { // tutorial 1
            for (let i = 0; i < 4; i++) {
                Global.gameCore.entities.push(new BetaEnemy());
            }
        } else if (this.cntr === g.game.fps * 9) { // tutorial 2
            for (let i = 0; i < 4; i++) {
                Global.gameCore.entities.push(new AlphaEnemy());
            }
            Global.gameCore.entities.push(new AlphaEnemy());
        } else if (this.cntr === g.game.fps * 14) {
            for (let i = 0; i < 4; i++) {
                Global.gameCore.entities.push(new SelfDestructionEnemy());
            }
        } else if (this.cntr === g.game.fps * 21) {
            Global.gameCore.entities.push(new BetaEnemy());
            Global.gameCore.entities.push(new AlphaEnemy());
            Global.gameCore.entities.push(new SelfDestructionEnemy());
            Global.gameCore.entities.push(new BetaEnemy());
            Global.gameCore.entities.push(new AlphaEnemy());
            Global.gameCore.entities.push(new SelfDestructionEnemy());
        } else if (this.cntr >= g.game.fps * 28) {
            const enemyCount = this.countEnemy();
            if (enemyCount < 2 || (enemyCount < 5 && math.random() < 0.5)) {
                const rnd = math.random();
                let enemy = null;
                if (rnd < 0.05) {
                    if (GammaEnemy.numInstance === 0 && rnd < 0.025) {
                        enemy = new GammaEnemy();
                    } else {
                        enemy = new BetaEnemy();
                    }
                } else if (rnd < 0.1) {
                    enemy = new AlphaEnemy();
                } else if (rnd < 0.15) {
                    enemy = new SelfDestructionEnemy();
                }
                if (enemy) {
                    Global.gameCore.entities.push(enemy);
                }
            }
        }
        this.cntr++;

        return true;
    }

    /**
     * 破棄
     */
    destroy(): void {
        // nothing to do
    }
}
