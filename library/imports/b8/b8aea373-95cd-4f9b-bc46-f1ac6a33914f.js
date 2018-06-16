"use strict";
cc._RF.push(module, 'b8aeaNzlc1Pm7xG8axqM5FP', 'BombExplosionController');
// Script/BombExplosionController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var BombExplosionController = /** @class */ (function (_super) {
    __extends(BombExplosionController, _super);
    function BombExplosionController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ExplosionH = null;
        _this.ExplosionV = null;
        _this.ExplosionAudio = null;
        _this.flash_count = 0;
        _this.BOMB_FLASH_SCALE = 0.9;
        _this.BOMB_FLASH_INTERVAL = 0.05;
        // BOMB_FLASH_COUNT_MAX:number = 10;
        _this.flashing = false;
        return _this;
    }
    BombExplosionController.prototype.onLoad = function () {
        this.ExplosionH.enabled = false;
        this.ExplosionV.enabled = false;
    };
    BombExplosionController.prototype.Show = function (cell) {
        console.log("xxx - BombExplosion.Show ");
        this.ExplosionH.enabled = true;
        this.ExplosionV.enabled = true;
        this.ExplosionH.node.setPosition(320, cell.node.position.y);
        this.ExplosionV.node.setPosition(cell.node.position.x, 480);
        this.flash_count = 0;
        this.flashing = true;
        this.flash();
        this.ExplosionAudio.play();
    };
    BombExplosionController.prototype.flash = function () {
        var _this = this;
        if (this.flashing) {
            this.flash_count++;
            var scale = (this.flash_count % 2) == 0 ? 1 : this.BOMB_FLASH_SCALE;
            this.ExplosionH.node.scaleY = scale;
            this.ExplosionV.node.scaleX = scale;
            this.scheduleOnce(function () {
                _this.flash();
            }, this.BOMB_FLASH_INTERVAL);
        }
        // else{
        //     this.flash_count = 0;
        //     this.Hide();
        // }
    };
    BombExplosionController.prototype.Hide = function () {
        this.flashing = false;
        this.ExplosionH.enabled = false;
        this.ExplosionV.enabled = false;
    };
    __decorate([
        property(cc.Sprite)
    ], BombExplosionController.prototype, "ExplosionH", void 0);
    __decorate([
        property(cc.Sprite)
    ], BombExplosionController.prototype, "ExplosionV", void 0);
    __decorate([
        property(cc.AudioSource)
    ], BombExplosionController.prototype, "ExplosionAudio", void 0);
    BombExplosionController = __decorate([
        ccclass
    ], BombExplosionController);
    return BombExplosionController;
}(cc.Component));
exports.default = BombExplosionController;

cc._RF.pop();