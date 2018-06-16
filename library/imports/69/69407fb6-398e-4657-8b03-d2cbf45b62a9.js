"use strict";
cc._RF.push(module, '69407+2OY5GV4sD0sv0W2Kp', 'GiftController');
// Script/GiftController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var Enums = require("./Enums");
var Global = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GiftController = /** @class */ (function (_super) {
    __extends(GiftController, _super);
    function GiftController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.GiftBody = null;
        _this.LongpressHint = null;
        _this.Lightning_1 = null;
        _this.Lightning_2 = null;
        _this.Bomb = null;
        _this.BombStart = null;
        _this.BombStripe = null;
        _this._GiftType = Enums.GiftType.Lightning;
        //#endregion
        //#region flicker
        _this.flicker_fadeout = true;
        //#endregion
        //#region Cell Attachment
        _this.attachedCell = null;
        _this._WhereItShouldBe = new cc.Vec2(0, 0);
        //#endregion
        //#region Move
        _this.GIFT_MOVE_DURATION = 1;
        //#endregion
        //#region Bomb
        _this.BombTriggered = false;
        //#endregion
        //#endregion Long Press
        _this.longpressHintAction = null;
        _this.longpressHintShown = false;
        return _this;
        //#endregion
    }
    Object.defineProperty(GiftController.prototype, "GiftType", {
        get: function () {
            return this._GiftType;
        },
        set: function (type) {
            this._GiftType = type;
            if (type == Enums.GiftType.Lightning) {
                this.GiftBody.spriteFrame = this.Lightning_1;
                this.LongpressHint.spriteFrame = this.Lightning_1;
            }
            else if (type == Enums.GiftType.Bomb) {
                this.GiftBody.spriteFrame = this.Bomb;
                this.LongpressHint.spriteFrame = this.Bomb;
            }
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Lifecycle
    // onLoad () {}
    // start () {}
    // update (dt) {}
    //#endregion
    //#region GameBoard Activity
    GiftController.prototype.Init = function (giftType, cellToAttach) {
        this.GiftType = giftType;
        this.AttachToCell(cellToAttach);
    };
    GiftController.prototype.Burn = function () {
        if (this.GiftType == Enums.GiftType.Bomb) {
            this.TriggerAsBomb();
            return;
        }
        if (this.GiftType == Enums.GiftType.Lightning) {
            this.discard();
        }
        // var distance_x = (double)(Global.BOARD_COLUMN_COUNT - 1)/2 - this.AttachedToCell.Board_X;
        // var distance_y = this.AttachedToCell.Board_Y + 1;
        // var distance = Math.Sqrt(distance_x * distance_x + distance_y * distance_y);
        // TimeSpan movementDuration = TimeSpan.FromMilliseconds( Global.GIFT_MOVEMENT_DURATION.TotalMilliseconds*distance/3);
        // _Twinkle = PickUpATwinkle();
        // CoreLogic.Gifts.Remove(this);
        // MoveTo(CoreLogic.TopBar.Battery.Position, movementDuration,
        //     (sender) =>
        //     {
        //         AttachedToCell = null;
        //         ReturnATwinkle(_Twinkle);
        //         _Twinkle = null;
        //         this.GamePage.Components.Remove(this);
        //         //Charge
        //         CoreLogic.TopBar.Battery.Charge(this.ElectricQuantity);
        //     });
        // PlayGiftCollectionSoundeEffect();
    };
    GiftController.prototype.flicker = function () {
        var _this = this;
        var action = this.flicker_fadeout ?
            cc.fadeTo(Global.GIFT_FLICKER_INTERVAL, 64) :
            cc.fadeTo(Global.GIFT_FLICKER_INTERVAL, 255);
        this.node.runAction(action);
        this.scheduleOnce(function () {
            _this.flicker();
        }, Global.GIFT_FLICKER_INTERVAL);
        this.flicker_fadeout = !this.flicker_fadeout;
    };
    Object.defineProperty(GiftController.prototype, "WhereItShouldBe", {
        get: function () {
            if (this.attachedCell != null) {
                return this.attachedCell.WhereItShouldBe;
            }
            return this._WhereItShouldBe;
        },
        enumerable: true,
        configurable: true
    });
    GiftController.prototype.AttachToCell = function (cell) {
        this.attachedCell = cell;
        cell.AttachedGift = this;
    };
    GiftController.prototype.detachFromCell = function () {
        if (this.attachedCell != null && this.attachedCell.AttachedGift == this) {
            this.attachedCell.AttachedGift = null;
            this.attachedCell = null;
        }
    };
    GiftController.prototype.Remove = function () {
        this.unschedule(this.flicker);
        this.detachFromCell();
        this.node.parent.removeChild(this.node);
    };
    GiftController.prototype.GetReadyForShow = function () {
        this.node.setPosition(this.attachedCell.Board_X * this.attachedCell.node.width + Global.BOARD_OFFSET_X, this.attachedCell.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
    };
    GiftController.prototype.Award = function (selector) {
        if (selector == null) {
            this.node.runAction(cc.moveTo(this.GIFT_MOVE_DURATION, this.WhereItShouldBe));
        }
        else {
            this.node.runAction(cc.sequence(cc.moveTo(this.GIFT_MOVE_DURATION, this.WhereItShouldBe), cc.callFunc(selector, this)));
        }
        this.flicker();
    };
    GiftController.prototype.TriggerAsBomb = function () {
        if (this.BombTriggered) {
            return;
        }
        this.BombTriggered = true;
        this.GiftBody.spriteFrame = this.BombStart;
        this.GiftBody.node.runAction(cc.scaleTo(Global.GIFT_MOVEMENT_DURATION, 0.5));
        this.attachedCell.gameBoard.QueueTriggeredBomb(this);
    };
    //#endregion
    //#region Lightning
    GiftController.prototype.discard = function () {
        var _this = this;
        this.node.runAction(cc.sequence(cc.scaleTo(Global.GIFT_MOVEMENT_DURATION, 0), cc.callFunc(function () { return _this.Remove(); })));
    };
    GiftController.prototype.ShowLongPressHint = function () {
        var _this = this;
        if (this.longpressHintAction == null) {
            this.longpressHintAction =
                cc.sequence(cc.callFunc(function () {
                    _this.LongpressHint.node.setScale(1);
                    _this.LongpressHint.node.opacity = 255;
                }), cc.spawn(cc.fadeOut(Global.GIFT_LONGPRESS_HINT_INTERVAL), cc.scaleTo(Global.GIFT_LONGPRESS_HINT_INTERVAL, 3)), cc.callFunc(function () {
                    _this.LongpressHint.node.setScale(1);
                    _this.LongpressHint.node.opacity = 255;
                }), cc.spawn(cc.fadeOut(Global.GIFT_LONGPRESS_HINT_INTERVAL), cc.scaleTo(Global.GIFT_LONGPRESS_HINT_INTERVAL, 3)));
        }
        this.LongpressHint.node.runAction(this.longpressHintAction);
        this.longpressHintShown = true;
    };
    GiftController.prototype.StopLongPressHint = function () {
        if (this.longpressHintShown) {
            this.LongpressHint.node.stopAction(this.longpressHintAction);
        }
        this.LongpressHint.node.setScale(1);
        this.LongpressHint.node.opacity = 255;
    };
    GiftController.prototype.LongPressFire = function () {
        if (this.GiftType == Enums.GiftType.Lightning) {
            this.attachedCell.gameBoard.BurnWithLightning(this.attachedCell);
        }
        else if (this.GiftType == Enums.GiftType.Bomb) {
            this.BombTriggered = true;
            this.attachedCell.gameBoard.BombExplode(this);
        }
    };
    __decorate([
        property(cc.Sprite)
    ], GiftController.prototype, "GiftBody", void 0);
    __decorate([
        property(cc.Sprite)
    ], GiftController.prototype, "LongpressHint", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "Lightning_1", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "Lightning_2", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "Bomb", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "BombStart", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], GiftController.prototype, "BombStripe", void 0);
    GiftController = __decorate([
        ccclass
    ], GiftController);
    return GiftController;
}(cc.Component));
exports.default = GiftController;

cc._RF.pop();