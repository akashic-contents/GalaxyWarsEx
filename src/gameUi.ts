// ゲームUIに関するモジュールをこのファイルにまとめた

import { Global } from "./Global";
import { Player } from "./Player";

/**
 * バーチャルゲームパッドのエンティティを生成する関数
 */
export function createGameStickEntity(
    scene: g.Scene,
    image: g.ImageAsset,
    area: g.CommonArea,
    size: g.CommonSize,
    func:(point: g.CommonOffset) => void
): g.E {
    const width = area.width > size.width ? area.width : size.width;
    const height = area.height > size.height ? area.height : size.height;
    const entity = new g.E({
        scene,
        x: area.x,
        y: area.y,
        width,
        height
    });
    const gameStickInitialX = Math.round(width / 2);
    const gameStickInitialY = Math.round(height / 2);
    const gameStickBack = new g.Sprite({
        scene,
        src: image,
        x: gameStickInitialX,
        y: gameStickInitialY,
        scaleX: width / image.width,
        scaleY: height / image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        opacity: 0.5
    });
    entity.append(gameStickBack);
    const gameStick = new g.Sprite({
        scene,
        src: image,
        x: gameStickInitialX,
        y: gameStickInitialY,
        scaleX: size.width / image.width,
        scaleY: size.height / image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        touchable: true
    });
    gameStick.onPointMove.add(ev => {
        let dx = ev.prevDelta.x;
        let dy = ev.prevDelta.y;
        if (gameStick.x + dx < 0 || gameStick.x + dx > width) {
            dx = 0;
        }
        if (gameStick.y + dy < 0 || gameStick.y + dy > height) {
            dy = 0;
        }
        gameStick.moveBy(dx, dy);
        gameStick.modified();
    });
    gameStick.onPointUp.add(_ev => {
        gameStick.moveTo(gameStickInitialX, gameStickInitialY);
        gameStick.modified();
    });
    gameStick.onUpdate.add(_ev => {
        func({ x: (gameStick.x - gameStickInitialX) / (width / 2), y: (gameStick.y - gameStickInitialY) / (height / 2) });
    });
    entity.append(gameStick);
    return entity;
}

/**
 * 必殺技ボタンのエンティティを生成する関数
 */
export function createSpecialAttackButton(scene: g.Scene, area: g.CommonArea): g.E  {
    const entity = new g.E({
        scene,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
        touchable: true
    });
    const backRect = new g.FilledRect({
        scene,
        width: area.width,
        height: area.height,
        cssColor: "gray"
    });
    entity.append(backRect);
    const label = new g.Label({
        scene,
        text: "SPECIAL",
        font: Global.bmpFont,
        fontSize: 16
    });
    entity.append(label);
    const gageRect = new g.FilledRect({
        scene,
        width: 0,
        height: area.height,
        cssColor: "green",
        opacity: 0.7
    });
    entity.append(gageRect);
    let ableButton = false;

    entity.onPointDown.add(() => {
        if (!ableButton) {
            g.game.scene().asset.getAudioById("disable").play();
            return;
        }
        ableButton = false;
        Global.gameCore.player.specialAttack();
    })
    entity.onUpdate.add(() => {
        const rate = Global.gameCore.player.sp / Player.MAX_SP;
        if (rate === 1) {
            ableButton = true;
            gageRect.opacity = ((g.game.age % 5) / 4) * 0.5 + 0.2;
        } else {
            ableButton = false;
            gageRect.opacity = 0.7;
        }
        gageRect.width = Math.round(rate * area.width);
        gageRect.modified();
    });

    return entity;
}
