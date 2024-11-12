import { Global } from "./Global";
import { GameCore } from "./GameCore";
import { GameOverLogo } from "./GameOverLogo";
import { Player } from "./Player";

//
// ゲームシーン生成
//
export function createGameScene(): g.Scene {
    const scene = new g.Scene({ game: g.game });

    scene.onLoad.add(() => {

        Global.gameCore = new GameCore(scene);

        // player input
        let clicked = false;
        scene.onPointDownCapture.add(() => {
            clicked = true;
        });
        scene.onPointMoveCapture.add((ev) => {
            if (!clicked) {
                return;
            }
            Global.gameCore.player.move(ev.prevDelta.x, ev.prevDelta.y);
        });
        scene.onPointUpCapture.add(() => {
            clicked = false;
        });
        // 自機操作方法としてバーチャルスティックも追加
        const gameStickBackSize = 100;
		const gameStickSize = 72;
        const gameStick = createGameStickEntity(
			scene,
            Global.gameCore.scene.asset.getImageById("gameStick"),
			{ x: g.game.width - gameStickBackSize - 12, y: g.game.height - gameStickBackSize - 12, width: gameStickBackSize, height: gameStickBackSize },
			{ width: gameStickSize, height: gameStickSize },
			(offset) => {
				const speed = Global.gameCore.player.getSpeed();
				let dx = Math.round(offset.x * speed);
				let dy = Math.round(offset.y * speed);
                // バーチャルスティックが使われている時は既存の入力法を使わないように
                if (dx !== 0 || dy !== 0) {
                    clicked = false;
                }
				Global.gameCore.player.move(dx, dy);
			}
        );
        scene.append(gameStick);
        // Specialボタンの追加
        const specialButtonWidth = 120;
        const specialButtonHeight = 30;
        const specialButton = createSpecialAttackButton(
            scene,
            { 
                x: g.game.width - specialButtonWidth - 12,
                y: g.game.height - gameStickBackSize - specialButtonHeight - 24,
                width: specialButtonWidth,
                height: specialButtonHeight
            }
        );
        scene.append(specialButton);

        const timeGaugeWidth = g.game.width;
        const timeGauge = new g.FilledRect({
            scene: scene,
            width: timeGaugeWidth,
            height: 4,
            cssColor: "green"
        });
        scene.append(timeGauge);

        // 残り時間表示ラベル
        const timeLabel = new g.Label({
            scene: Global.gameCore.scene,
            text: "",
            font: Global.bmpFont,
            fontSize: 16,
            x: g.game.width - (16 * 9 + 4), y: 4
        });
        scene.append(timeLabel);

        // ステージBGM再生
        let stageBgm = scene.asset.getAudioById("bgm_normal");
        stageBgm.play();

        // game loop
        let showResultUI = false;
        let startCountDownBgm = false; // BGM変更用フラグ
        scene.onUpdate.add(() => {
            Global.gameCore.update();

            g.game.vars.gameState.score = Global.gameCore.player.score;

            const maxPlayTimeInFPS = GameCore.MAX_PLAYTIME * g.game.fps;
            const remainTimeRate = Math.max(maxPlayTimeInFPS - Global.gameCore.cntr, 0) / maxPlayTimeInFPS;
            // 残り時間によってバーやラベルの色を変えてプレイヤーの危機感を煽るように
            if (remainTimeRate < 0.2) {
                timeGauge.cssColor = "red";
                timeLabel.textColor = "red";
                // 残り時間が少なくなったらBGMを変える
                if (Global.gameCore.player.hp > 0 && !startCountDownBgm) {
                    startCountDownBgm = true;
                    stageBgm.stop();
                    stageBgm = scene.asset.getAudioById("bgm_near_timeout");
                    stageBgm.play();
                }
            } else if (remainTimeRate < 0.5) {
                timeGauge.cssColor = "yellow";
            }
            timeGauge.width = timeGaugeWidth * remainTimeRate;
            timeGauge.modified();
            const remainTime = Math.floor(GameCore.MAX_PLAYTIME - Global.gameCore.cntr / g.game.fps);
            timeLabel.text = `TIME: ${remainTime > 0 ? remainTime : 0}`;
            timeLabel.invalidate();

            if (!showResultUI && Global.gameCore.player.hp <= 0) {
                // ゲームオーバー処理なのでここでゲームオーバー用BGM(ループなし)を鳴らす
                stageBgm.stop();
                g.game.scene().asset.getAudioById("bgm_gameover").play();

                scene.onPointDownCapture.removeAll();
                scene.onPointMoveCapture.removeAll();
                scene.onPointUpCapture.removeAll();

                scene.setTimeout(() => {
                    const logoEntity = new GameOverLogo();
                    Global.gameCore.entities.push(logoEntity);
                }, 1000);
                showResultUI = true;

                g.game.vars.gameState.isFinished = true;
            }

            if (Global.gameCore.cntr === maxPlayTimeInFPS + g.game.fps * 6) {
                console.log("👍 done with " + JSON.stringify(g.game.vars.gameState));
            }
        });

        Global.gameCore.start();
    });

    return scene;
}

function createGameStickEntity(
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

function createSpecialAttackButton(scene: g.Scene, area: g.CommonArea): g.E  {
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
