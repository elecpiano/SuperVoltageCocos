(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/ElectricEffect/ElectricEffect.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '65873YIsu1IfITlljhAsxYH', 'ElectricEffect', __filename);
// Script/ElectricEffect/ElectricEffect.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ElectricFlow_1 = require("./ElectricFlow");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ElectricEffect = /** @class */ (function (_super) {
    __extends(ElectricEffect, _super);
    function ElectricEffect() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Texture = null;
        _this.electricFlows = new Array();
        return _this;
    }
    //#endregion
    // onLoad () {}
    // start () {}
    ElectricEffect.prototype.update = function (dt) {
        for (var _i = 0, _a = this.electricFlows; _i < _a.length; _i++) {
            var eflow = _a[_i];
            eflow.doUpdate(dt);
        }
    };
    ElectricEffect.prototype.AddFlow = function (fromElectricNode) {
        if (fromElectricNode === void 0) { fromElectricNode = null; }
        var eFlow = new ElectricFlow_1.default();
        eFlow.Init(this.Texture, this.node);
        if (fromElectricNode != null) {
            eFlow.AddExistingElectricNode(fromElectricNode);
        }
        this.electricFlows.push(eFlow);
        return eFlow;
    };
    ElectricEffect.prototype.ClearFlows = function () {
        for (var _i = 0, _a = this.electricFlows; _i < _a.length; _i++) {
            var eflow = _a[_i];
            eflow.Clear();
        }
        this.electricFlows.splice(0, this.electricFlows.length);
    };
    __decorate([
        property(cc.SpriteFrame)
    ], ElectricEffect.prototype, "Texture", void 0);
    ElectricEffect = __decorate([
        ccclass
    ], ElectricEffect);
    return ElectricEffect;
}(cc.Component));
exports.default = ElectricEffect;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=ElectricEffect.js.map
        