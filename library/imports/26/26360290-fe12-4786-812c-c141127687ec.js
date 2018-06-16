"use strict";
cc._RF.push(module, '26360KQ/hJHhoEswUESdofs', 'ElectricNode');
// Script/ElectricEffect/ElectricNode.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ElectricNode = /** @class */ (function (_super) {
    __extends(ElectricNode, _super);
    function ElectricNode() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.position = null;
        _this.fiducialPoint = null;
        _this.radius = 0;
        _this.velocity = null;
        _this.speedFactor = 1;
        _this.belongToFlow = null;
        //#endregion
        //#region movement
        _this.velocityMin = 1.0;
        _this.movementTime = 0;
        _this.movementDuration = 0;
        _this.targetX = 0;
        _this.targetY = 0;
        return _this;
        //#endregion
    }
    //#endregion
    //#region Initialization
    ElectricNode.prototype.init = function (p, r, sf) {
        this.position = p;
        this.fiducialPoint = p;
        this.radius = r;
        this.speedFactor = sf;
        this.reset();
    };
    //#endregion
    //#region update
    ElectricNode.prototype.doUpdate = function (dt) {
        // if (this.movementX < this.targetX && this.movementY < this.targetY && this.movementTime < this.movementDuration) {
        if (this.movementTime < this.movementDuration) {
            var fraction = dt / this.movementDuration;
            var deltaX = this.velocity.x * fraction;
            var deltaY = this.velocity.y * fraction;
            this.position = new cc.Vec2(this.position.x + deltaX, this.position.y + deltaY);
            this.movementTime += dt;
        }
        else {
            this.reset();
        }
    };
    // movementX = 0;
    // movementY = 0;
    ElectricNode.prototype.reset = function () {
        // reset position
        this.position = this.fiducialPoint;
        // random angle
        var radian = cc.randomMinus1To1() * Math.PI;
        // target point
        this.targetX = this.radius * Math.cos(radian);
        this.targetY = this.radius * Math.sin(radian);
        // velocity
        var speedToDistance = (cc.random0To1() + this.velocityMin) * this.speedFactor;
        var velocityX = speedToDistance * this.targetX;
        var velocityY = speedToDistance * this.targetY;
        this.velocity = new cc.Vec2(velocityX, velocityY);
        //duration
        this.movementDuration = 1 / speedToDistance;
        this.movementTime = 0;
    };
    ElectricNode = __decorate([
        ccclass
    ], ElectricNode);
    return ElectricNode;
}(cc.Component));
exports.default = ElectricNode;

cc._RF.pop();