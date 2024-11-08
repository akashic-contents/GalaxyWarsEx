import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";
import { ItemType } from "./ItemType";
import { Item } from "./Item";

export interface EnemyParameterObject {
    pos: g.CommonOffset;
    hp: number;
    point: number;
    itemType: ItemType[];
    spr: g.Sprite;
}

export class Enemy {
    protected cntr: number;
    protected obstacles: number[];
    protected itemTypes: ItemType[];
    pos: g.CommonOffset;
    hp: number;
    point;
    spr: g.Sprite;
    type: EntityType;

    constructor(params: EnemyParameterObject) {
        this.type = EntityType.ENEMY;
        this.cntr = 0;
        this.pos = {
            x: params.pos.x,
            y: params.pos.y
        };
        this.obstacles = [
            EntityType.PLAYER
        ];
        this.hp = params.hp;
        this.point = params.point;
        this.itemTypes = params.itemType;
        this.spr = params.spr;
        Global.gameCore.gameLayer.append(this.spr);
    }

    onUpdate(): boolean {
        return true;
    }

    onDied(): void {
        if (!this.itemTypes || this.itemTypes.length === 0) {
            return;
        }
        const itemType = this.itemTypes[Math.floor(math.random() * this.itemTypes.length)];
        const item = new Item(this.pos, itemType);
        Global.gameCore.entities.push(item);
        // プレイヤーのSP値を増やす
        Global.gameCore.player.addSp(1);
    }

    update(): boolean {
        if (this.hp <= 0) {
            this.onDied();
            return false;
        }
        const result = this.onUpdate();
        this.cntr++;
        return result;
    }

    onCollision(e: Enemy): void {
        e.hp--;
    }

    destroy(): void {
        this.spr.destroy();
    }
}
