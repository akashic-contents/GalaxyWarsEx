import { Global } from "./Global";
import { EntityType } from "./EntityType";
import { ItemType } from "./ItemType";

export class Item {
    private originX: number;
    private pos: g.CommonOffset;
    private cntr: number;
    private spr: g.Sprite;
    itemType: ItemType;
    type: number;
    hp: number;

    static itemImageNames = [
        "item01",
        "item02",
        "item03",
        "item04",
        "item05",
        "item06",
        "itemNew04"
    ];

    constructor(pos: g.CommonOffset, itemType: ItemType) {
        this.type = EntityType.ITEM;
        this.itemType = itemType;
        this.originX = pos.x;
        this.pos = { x: pos.x, y: pos.y };
        this.cntr = 0;
        this.hp = 1;
        this.spr = new g.Sprite({
            scene: Global.gameCore.scene,
            src: g.game.scene().asset.getImageById(Item.itemImageNames[itemType]),
            x: this.pos.x,
            y: this.pos.y
        });
        Global.gameCore.gameLayer.append(this.spr);
    }

    /**
      * 状態更新
      */
    update(): boolean {
        if (this.hp <= 0) {
            return false;
        }

        this.pos.x = this.originX + Math.sin(Math.PI * this.cntr / 18) * 48;
        this.pos.y += 3;
        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.modified();

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
