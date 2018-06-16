"use strict";
cc._RF.push(module, 'd174cAh5DxNQZlMUtt4E1+X', 'CongratulationController');
// Script/CongratulationController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Enums = require("./Enums");
var Global = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var CongratulationController = /** @class */ (function (_super) {
    __extends(CongratulationController, _super);
    function CongratulationController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Panel = null;
        _this.Label = null;
        _this.ComboTexture = null;
        _this.ChainTexture = null;
        return _this;
    }
    //#endregion
    CongratulationController.prototype.ShowAward = function (container, type, count) {
        var _this = this;
        if (type == Enums.CongratulationType.Combo) {
            this.Panel.spriteFrame = this.ComboTexture;
        }
        else if (type == Enums.CongratulationType.Chain) {
            this.Panel.spriteFrame = this.ChainTexture;
        }
        if (count != null) {
            this.Label.string = "X" + count.toString();
        }
        else {
            this.Label.string = "";
        }
        container.addChild(this.node);
        this.node.scale = 0;
        this.node.runAction(cc.sequence(cc.scaleTo(Global.CONGRATULATE_DURATION, 1.2), cc.spawn(cc.scaleTo(Global.CONGRATULATE_DURATION, 1), cc.fadeTo(Global.CONGRATULATE_DURATION, 128)), cc.callFunc(function () { return container.removeChild(_this.node); })));
    };
    __decorate([
        property(cc.Sprite)
    ], CongratulationController.prototype, "Panel", void 0);
    __decorate([
        property(cc.Label)
    ], CongratulationController.prototype, "Label", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CongratulationController.prototype, "ComboTexture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CongratulationController.prototype, "ChainTexture", void 0);
    CongratulationController = __decorate([
        ccclass
    ], CongratulationController);
    return CongratulationController;
}(cc.Component));
exports.default = CongratulationController;

cc._RF.pop();