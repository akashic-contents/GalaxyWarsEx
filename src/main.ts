import { Global } from "./Global";
import { createTitleScene } from "./titleScene";

//
// エントリーポイント
//
export = function () {
    Global.bmpFont = new g.BitmapFont({
        src: g.game.scene().asset.getImageById("font16"),
        map: g.game.scene().asset.getJSONContentById("glyph_area"),
        defaultGlyphWidth: 16,
        defaultGlyphHeight: 16
    });

    const scene = createTitleScene();

    scene.onMessage.add((e) => {
        if (e.data.type === "start") {
            console.log("param: " + JSON.stringify(e.data.parameters));
            Global.params = e.data.parameters; // 起動パラメータ保存
        }
    });

    g.game.vars.gameState = {
        score: 0,
        isFinished: false
    };

    g.game.pushScene(scene);
};
