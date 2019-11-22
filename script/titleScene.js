var Global = require("./Global");
var ScreenEffector = require("./ScreenEffector");
var createGameScene = require("./gameScene");
var math = require("./Math");

var game = g.game;

// タイトルシーン表示時間
var TIME_LIMIT = 4;

//
// さざなみ発生
//
function ripple(heights, frame) {
    var hn = heights[(frame + 2) % 3];
    var hc = heights[(frame + 1) % 3];
    var hp = heights[(frame + 0) % 3];

    var c = 0.25;
    for (var y = 0; y < hn.length; y++) {
        for (var x = 0; x < hn[y].length; x++) {
            var yp = Math.max(0, y - 1);
            var yn = Math.min(hn.length - 1, y + 1);
            var xp = Math.max(0, x - 1);
            var xn = Math.min(hn[y].length - 1, x + 1);
            hn[y][x] = 2 * hc[y][x] + c * (hc[y][xp] + hc[y][xn] + hc[yp][x] + hc[yn][x] - 4 * hc[y][x]) - hp[y][x];
            hn[y][x] *= 0.95;
        }
    }

    return hn;
}

//
// さざなみの高さを矩形の色に反映
//
function updateCellColor(cells, hc) {
    for (var i = 0; i < hc.length; i++) {
        for (var j = 0; j < hc[i].length; j++) {
            var intensity = Math.min(1.0, Math.max(0, (hc[i][j] + 1) / 2));
            var cell = cells[i][j];
            var R = (0x10 + 0x10 * intensity) | 0;
            var G = (0x10 + 0x10 * intensity) | 0;
            var B = 0xFF * intensity | 0;
            cell.cssColor = "#" + ("000000" + ((R << 16) | (G << 8) | B).toString(16)).slice(-6);
            cell.modified();
        }
    }
}

//
// さざなみ描画のための矩形群生成
//
function createCells(scene, root, cellSize) {
    var cells = [];

    for (var i = 0; i < game.height / cellSize; i++) {
        var row = [];
        for (var j = 0; j < game.width / cellSize; j++) {
            var cell = new g.FilledRect({
                scene: scene,
                cssColor: "#000020",
                width: cellSize,
                height: cellSize,
                x: cellSize * j,
                y: cellSize * i
            });
            row.push(cell);
            root.append(cell);
        }
        cells.push(row);
    }

    return cells;
}

//
// さざなみ計算用バッファ生成
//
function createHeightBuffer(cellSize) {
    var heights = [];
    for (var i = 0; i < 3; i++) {
        var col = [];
        for (var j = 0; j < game.height / cellSize; j++) {
            col.push(Array(game.width / cellSize).fill(0));
        }
        heights.push(col);
    }
    return heights;
}

//
// タイトルシーン生成
//
function createTitleScene() {
    var scene = new g.Scene({ game: game, assetIds: ["version"] });

    scene.loaded.handle(function() {

        var root = new ScreenEffector({
            scene: scene,
            width: game.width,
            height: game.height,
            touchable: true,
            mosaicLevel: 60
        });
        scene.append(root);

        var cellSize = 16;
        var cells = createCells(scene, root, cellSize);
        var heights = createHeightBuffer(cellSize);

        var titleImageAsset = game.assets["title"];
        var title = new g.Sprite({
            scene: scene,
            src: titleImageAsset,
            x: (game.width - titleImageAsset.width) / 2,
            y: (game.height - titleImageAsset.height) / 2,
            touchable: true
        });
        root.append(title);

        var timerLabel = new g.Label({
            scene: scene,
            text: "-.--",
            font: Global.bmpFont,
            fontSize: 16,
            x: game.width - (16 * 4 + 4),
            y: game.height - (16 + 4)
        });
        root.append(timerLabel);

        var cntr = 0;
        scene.update.handle(function() {
            if (root.mosaicLevel > 1) {
                root.mosaicLevel--;
            } else {
                if (math.random() < 0.05) {
                    var x = cells[0].length * math.random() | 0;
                    var y = cells.length * math.random() | 0;
                    heights[(cntr + 1) % 3][y][x] = 2.0;
                }
            }

            updateCellColor(cells, ripple(heights, cntr));

            var remainInSec = Math.max(0, TIME_LIMIT - cntr / game.fps);
            timerLabel.text = remainInSec === 0 ? "0.00" : (((remainInSec * 100) | 0) / 100) + "";
            timerLabel.invalidate();

            if (cntr === game.fps * TIME_LIMIT) {
                root.startBlur();
                scene.setTimeout(1000, function() {
                    game.replaceScene(createGameScene());
                });
            }

            cntr++;
        });
    });

    return scene;
}

module.exports = createTitleScene;
