"use strict";
cc._RF.push(module, 'e577eA1bT9MM6FjW+3bj8Nh', 'ElectricFlow');
// Script/ElectricEffect/ElectricFlow.ts

Object.defineProperty(exports, "__esModule", { value: true });
var ElectricNode_1 = require("./ElectricNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ElectricFlow = /** @class */ (function (_super) {
    __extends(ElectricFlow, _super);
    function ElectricFlow() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // @property(cc.SpriteFrame)
        _this.Texture = null;
        _this.ContainerNode = null;
        _this.segments = 10; // defines how many dots(sprites) are generated between two electric nodes
        _this.lifeSpan = 0.05; // LifeSpan controls the frequency of the texture switching
        _this.age = 0; // count for lifeSpan
        _this.speedFactor = 1.5;
        // originalSpriteWidth = 0;
        _this.currentSpriteScale = 1;
        _this.sprites = new Array();
        _this.eNodes = new Array();
        return _this;
        //#endregion
    }
    //#endregion
    //#region Lifecycle
    // onLoad () {}
    /// xxx test
    ElectricFlow.prototype.addTestNode = function () {
        //this.clear();
        for (var index = 0; index < 10; index++) {
            var pos = new cc.Vec2(cc.random0To1() * 30 + 240, cc.random0To1() * 30 + 70 * index);
            var radius = Math.abs(Math.abs(index - 5) - 5) * 7;
            this.AddElectricNode(pos, radius);
        }
    };
    // update (dt) {}
    ElectricFlow.prototype.doUpdate = function (dt) {
        if (this.eNodes.length == 0) {
            return;
        }
        for (var _i = 0, _a = this.eNodes; _i < _a.length; _i++) {
            var enode = _a[_i];
            if (enode.belongToFlow = this) {
                enode.doUpdate(dt);
            }
        }
        this.drawCatmullRomCurve();
        if (this.age < this.lifeSpan) {
            this.age += dt;
        }
        else {
            this.reset();
        }
    };
    //#endregion
    ElectricFlow.prototype.Init = function (texture, container) {
        this.Texture = texture;
        this.ContainerNode = container;
    };
    ElectricFlow.prototype.reset = function () {
        this.age = 0;
        this.setRandomSize();
        this.lifeSpan = cc.random0To1() * 0.05 + 0.01;
    };
    ElectricFlow.prototype.setRandomSize = function () {
        // this.currentSpriteWidth = (cc.random0To1() + 1.0) * 0.5 * this.originalSpriteWidth;
        this.currentSpriteScale = cc.randomMinus1To1() * 0.5 + 1;
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.node.setScale(this.currentSpriteScale, this.currentSpriteScale);
        }
    };
    ElectricFlow.prototype.AddElectricNode = function (p, r) {
        if (r === void 0) { r = 10; }
        var eNode = new ElectricNode_1.default();
        eNode.init(p, r, this.speedFactor);
        eNode.belongToFlow = this;
        this.eNodes.push(eNode);
        // fill in sprites if this added ElectricNode is NOT the first one in the flow
        if (this.eNodes.length > 1) {
            for (var i = 0; i < this.segments; i++) {
                var particle = new cc.Node();
                var sprite = particle.addComponent(cc.Sprite);
                sprite.spriteFrame = this.Texture;
                sprite.dstBlendFactor = 1; //cc.BlendFactor.DST_ALPHA ;
                particle.setScale(this.currentSpriteScale, this.currentSpriteScale);
                this.ContainerNode.addChild(particle);
                this.sprites.push(sprite);
            }
        }
        return eNode;
    };
    ElectricFlow.prototype.AddExistingElectricNode = function (existingNode) {
        this.eNodes.push(existingNode);
        // fill in sprites if this added ElectricNode is NOT the first one in the flow
        if (this.eNodes.length > 1) {
            for (var i = 0; i < this.segments; i++) {
                var particle = new cc.Node();
                var sprite = particle.addComponent(cc.Sprite);
                sprite.spriteFrame = this.Texture;
                sprite.dstBlendFactor = 1; //cc.BlendFactor.DST_ALPHA ;
                particle.setScale(this.currentSpriteScale, this.currentSpriteScale);
                this.ContainerNode.addChild(particle);
                this.sprites.push(sprite);
            }
        }
    };
    ElectricFlow.prototype.Clear = function () {
        this.eNodes.splice(0, this.eNodes.length);
        this.sprites.splice(0, this.sprites.length);
        this.ContainerNode.removeAllChildren();
    };
    //#region Curve
    ElectricFlow.prototype.catmullRom = function (t, P0, P1, P2, P3) {
        return 0.5 * ((2 * P1) +
            (-P0 + P2) * t +
            (2 * P0 - 5 * P1 + 4 * P2 - P3) * Math.pow(t, 2) +
            (-P0 + 3 * P1 - 3 * P2 + P3) * Math.pow(t, 3));
    };
    ElectricFlow.prototype.drawCatmullRomCurve = function () {
        if (this.eNodes.length == 0) {
            return;
        }
        var p0 = this.eNodes[0].position;
        var p1 = this.eNodes[0].position;
        var p2 = this.eNodes[0].position;
        var p3 = this.eNodes[0].position;
        var controlPointsCount = this.eNodes.length;
        var step = 1.0 / this.segments;
        for (var i = 2; i < controlPointsCount + 1; i++) {
            var idx = i >= controlPointsCount ? controlPointsCount - 1 : i;
            p0 = this.eNodes[idx].position;
            if (i >= 1) {
                idx = (i - 1) >= controlPointsCount ? controlPointsCount - 1 : (i - 1);
                p1 = this.eNodes[idx].position;
            }
            if (i >= 2) {
                idx = (i - 2) >= controlPointsCount ? controlPointsCount - 1 : (i - 2);
                p2 = this.eNodes[idx].position;
            }
            if (i >= 3) {
                idx = (i - 3) >= controlPointsCount ? controlPointsCount - 1 : (i - 3);
                p3 = this.eNodes[idx].position;
            }
            var amount = 0.0;
            var randomOpacity = cc.random0To1() * 128 + 128;
            for (var j = 0; j < this.segments; j++) {
                var pointX = this.catmullRom(amount, p0.x, p1.x, p2.x, p3.x);
                var pointY = this.catmullRom(amount, p0.y, p1.y, p2.y, p3.y);
                var sprite = this.sprites[(i - 2) * this.segments + j];
                sprite.node.setPosition(pointX, pointY);
                sprite.node.opacity = randomOpacity;
                amount += step;
            }
        }
    };
    ElectricFlow = __decorate([
        ccclass
    ], ElectricFlow);
    return ElectricFlow;
}(cc.Component));
exports.default = ElectricFlow;

cc._RF.pop();