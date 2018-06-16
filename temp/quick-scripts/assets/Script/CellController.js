(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/CellController.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '3eb5a3ksQtEg7vsxr15bgMW', 'CellController', __filename);
// Script/CellController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameBoardController_1 = require("./GameBoardController");
var Enums = require("./Enums");
var Global = require("./Global");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var CellController = /** @class */ (function (_super) {
    __extends(CellController, _super);
    function CellController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.CellColor = null;
        _this.CellBody = null;
        _this.CellHint = null;
        _this.X_Texture = null;
        _this.X_Hint_Texture = null;
        _this.T_Texture = null;
        _this.T_Hint_Texture = null;
        _this.L_Texture = null;
        _this.L_Hint_Texture = null;
        _this.I_Texture = null;
        _this.I_Hint_Texture = null;
        _this.H_Texture = null;
        _this.H_Hint_Texture = null;
        // @property({type: cc.Enum(Enums.CellState)})
        _this._CellState = Enums.CellState.Normal;
        _this.CellType = Enums.CellType.Cross;
        _this.gameBoard = null;
        _this.isBusy = false;
        _this.rotateMinScale = 0.35;
        // CELL_PRESSED_SCALE = 0.9;
        _this.targetAngle = 0;
        _this.backupAngle = 0;
        _this.currentColor = 0; // state: 0-white, 1-blue, 2-yellow, 3-green, 4-black
        _this.Board_X = 0;
        _this.Board_Y = 0;
        _this.RotationQuarterCount = 0;
        _this._WhereItShouldBe = new cc.Vec2(0, 0);
        //#endregion
        //#region Connection
        _this.TopAntenna = false;
        _this.BottomAntenna = false;
        _this.LeftAntenna = false;
        _this.RightAntenna = false;
        _this.TopConnectedCell = null;
        _this.LeftConnectedCell = null;
        _this.BottomConnectedCell = null;
        _this.RightConnectedCell = null;
        _this.hintAction = null;
        //#endregion
        //#region Monster
        _this.AttachedMonster = null;
        //#endregion
        //#region Gift
        _this.AttachedGift = null;
        //#endregion
        //#region Burn
        _this.electricEffect = null;
        _this.flowAtTop = null;
        _this.flowAtBottom = null;
        _this.flowAtLeft = null;
        _this.flowAtRight = null;
        //#endregion
        //#endregion Long Press
        _this.longpressCounting = false;
        _this.longpressTimespan = 0;
        _this.longpressLevel = 0;
        return _this;
        //#endregion
    }
    Object.defineProperty(CellController.prototype, "CellState", {
        get: function () {
            return this._CellState;
        },
        set: function (state) {
            this._CellState = state;
            this.setColor(state);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CellController.prototype, "WhereItShouldBe", {
        get: function () {
            this._WhereItShouldBe.x = this.Board_X * this.node.width + Global.BOARD_OFFSET_X;
            this._WhereItShouldBe.y = this.Board_Y * this.node.height + Global.BOARD_OFFSET_Y;
            return this._WhereItShouldBe;
        },
        enumerable: true,
        configurable: true
    });
    //#endregion
    //#region Lifecycle
    CellController.prototype.onLoad = function () {
        this.registerTouchEvent();
        this.gameBoard = cc.find("Canvas").getComponent(GameBoardController_1.default);
    };
    CellController.prototype.update = function (dt) {
        if (this.longpressCounting) {
            this.longpressTimespan += dt;
            if (this.longpressTimespan >= Global.GIFT_LONGPRESS_DURATION
                && this.longpressLevel == 1) {
                this.longPressed(2);
            }
            else if (this.longpressTimespan >= Global.GIFT_LONGPRESS_THESHOLD
                && this.longpressLevel == 0) {
                this.longPressed(1);
            }
        }
    };
    //#endregion
    //#region initialization
    CellController.prototype.initCell = function (cellType, rotation, board_x, board_y) {
        this.CellType = cellType;
        this.Board_X = board_x;
        this.Board_Y = board_y;
        /* it is very important to reset the RotationQuarterCount to zero,
        because when the cell is reused, it may come with legacy value */
        this.RotationQuarterCount = 0;
        this.node.rotation = rotation * -90;
        this.RotateAntennas(rotation);
        /* these values may stay affected from previous touch which happened right before burn */
        this.node.scale = 1;
        this.CellHint.node.opacity = 0;
        if (this.gameBoard.CurrentlyTouchedCell == this) {
            this.gameBoard.CurrentlyTouchedCell = null;
        }
        switch (cellType) {
            case Enums.CellType.Cross:
                this.CellBody.spriteFrame = this.X_Texture;
                this.CellHint.spriteFrame = this.X_Hint_Texture;
                break;
            case Enums.CellType.T:
                this.CellBody.spriteFrame = this.T_Texture;
                this.CellHint.spriteFrame = this.T_Hint_Texture;
                break;
            case Enums.CellType.L:
                this.CellBody.spriteFrame = this.L_Texture;
                this.CellHint.spriteFrame = this.L_Hint_Texture;
                break;
            case Enums.CellType.I:
                this.CellBody.spriteFrame = this.I_Texture;
                this.CellHint.spriteFrame = this.I_Hint_Texture;
                break;
            case Enums.CellType.Half:
                this.CellBody.spriteFrame = this.H_Texture;
                this.CellHint.spriteFrame = this.H_Hint_Texture;
                break;
            default:
                break;
        }
    };
    //#endregion
    //#region Touch Event
    CellController.prototype.registerTouchEvent = function () {
        var _this = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            if ((_this.gameBoard.CurrentGameState == Enums.GameState.Hint && _this.gameBoard.circuitTree.indexOf(_this) >= 0)
                || _this.gameBoard.CurrentGameState == Enums.GameState.Idle) {
                if (_this.gameBoard.CurrentlyTouchedCell != null) {
                    return;
                }
                if (_this.isBusy) {
                    return;
                }
                _this.gameBoard.CurrentlyTouchedCell = _this;
                _this.longPressStart();
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (e) {
            if (_this.gameBoard.CurrentGameState == Enums.GameState.Burning) {
                return;
            }
            if (_this.gameBoard.CurrentlyTouchedCell != _this) {
                return;
            }
            if (_this.isBusy) {
                return;
            }
            _this.longPressCancel();
            /* longpressLevel greater than zero, meaning this round of touch
            should be considered as a LongPress, rather than a Tap */
            if (_this.longpressLevel > 0) {
                _this.gameBoard.CurrentlyTouchedCell = null;
                return;
            }
            if (_this.AttachedMonster != null) {
                _this.AttachedMonster.GetAngry();
                _this.gameBoard.CurrentlyTouchedCell = null;
            }
            else {
                _this.Rotate();
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (e) {
            if (_this.gameBoard.CurrentlyTouchedCell != _this) {
                return;
            }
            if (_this.isBusy) {
                return;
            }
            _this.longPressCancel();
            _this.gameBoard.CurrentlyTouchedCell = null;
            _this.isBusy = false;
        }, this);
    };
    //#endregion
    //#region Rotation
    CellController.prototype.Rotate = function () {
        var _this = this;
        this.isBusy = true;
        this.CellState = Enums.CellState.Normal;
        this.gameBoard.UpdateBoard(this);
        this.node.runAction(cc.rotateBy(Global.CELL_ROTATE_DURATION * 0.5, -90));
        this.node.runAction(cc.sequence(cc.scaleTo(Global.CELL_ROTATE_DURATION * 0.5, this.rotateMinScale, this.rotateMinScale), cc.scaleTo(Global.CELL_ROTATE_DURATION * 0.5, 1, 1), cc.callFunc(function () {
            _this.RotateAntennas();
            _this.isBusy = false;
            _this.gameBoard.CurrentlyTouchedCell = null;
            _this.gameBoard.UpdateBoard();
            _this.gameBoard.spark(_this);
        }, this)));
    };
    CellController.prototype.RotateAntennas = function (quarters) {
        if (quarters === void 0) { quarters = 1; }
        this.RotationQuarterCount += quarters;
        this.RotationQuarterCount = this.RotationQuarterCount % 4;
        switch (this.CellType) {
            case Enums.CellType.I:
                if (this.RotationQuarterCount == 0 || this.RotationQuarterCount == 2) {
                    this.TopAntenna = this.BottomAntenna = true;
                    this.LeftAntenna = this.RightAntenna = false;
                }
                else if (this.RotationQuarterCount == 1 || this.RotationQuarterCount == 3) {
                    this.TopAntenna = this.BottomAntenna = false;
                    this.LeftAntenna = this.RightAntenna = true;
                }
                break;
            case Enums.CellType.L:
                if (this.RotationQuarterCount == 0) {
                    this.TopAntenna = this.RightAntenna = true;
                    this.BottomAntenna = this.LeftAntenna = false;
                }
                else if (this.RotationQuarterCount == 1) {
                    this.TopAntenna = this.LeftAntenna = true;
                    this.BottomAntenna = this.RightAntenna = false;
                }
                else if (this.RotationQuarterCount == 2) {
                    this.TopAntenna = this.RightAntenna = false;
                    this.BottomAntenna = this.LeftAntenna = true;
                }
                else if (this.RotationQuarterCount == 3) {
                    this.TopAntenna = this.LeftAntenna = false;
                    this.BottomAntenna = this.RightAntenna = true;
                }
                break;
            case Enums.CellType.T:
                if (this.RotationQuarterCount == 0) {
                    this.LeftAntenna = this.RightAntenna = this.BottomAntenna = true;
                    this.TopAntenna = false;
                }
                else if (this.RotationQuarterCount == 1) {
                    this.TopAntenna = this.RightAntenna = this.BottomAntenna = true;
                    this.LeftAntenna = false;
                }
                else if (this.RotationQuarterCount == 2) {
                    this.LeftAntenna = this.RightAntenna = this.TopAntenna = true;
                    this.BottomAntenna = false;
                }
                else if (this.RotationQuarterCount == 3) {
                    this.LeftAntenna = this.TopAntenna = this.BottomAntenna = true;
                    this.RightAntenna = false;
                }
                break;
            case Enums.CellType.Cross:
                this.LeftAntenna = this.RightAntenna = this.TopAntenna = this.BottomAntenna = true;
                break;
            case Enums.CellType.Half:
                if (this.RotationQuarterCount == 0) {
                    this.RightAntenna = this.TopAntenna = this.LeftAntenna = false;
                    this.BottomAntenna = true;
                }
                else if (this.RotationQuarterCount == 1) {
                    this.TopAntenna = this.LeftAntenna = this.BottomAntenna = false;
                    this.RightAntenna = true;
                }
                else if (this.RotationQuarterCount == 2) {
                    this.LeftAntenna = this.BottomAntenna = this.RightAntenna = false;
                    this.TopAntenna = true;
                }
                else if (this.RotationQuarterCount == 3) {
                    this.BottomAntenna = this.RightAntenna = this.TopAntenna = false;
                    this.LeftAntenna = true;
                }
                break;
            default:
                break;
        }
    };
    //#endregion
    //#region Movement
    CellController.prototype.GetReadyForShow = function () {
        this.node.setPosition(this.Board_X * this.node.width + Global.BOARD_OFFSET_X, this.node.height * Global.BOARD_ROW_COUNT + Global.STARTING_LINE_OFFSET);
        this.CellState = Enums.CellState.Normal;
    };
    CellController.prototype.MoveToWhereItShouldBe = function (selector) {
        this.node.runAction(cc.sequence(cc.moveTo(Global.CELL_DROP_DURATION, this.WhereItShouldBe), cc.callFunc(selector, this)));
        if (this.AttachedMonster != null) {
            /*tag bug's dropping status*/
            this.AttachedMonster.ShouldMoveAround = false;
            this.AttachedMonster.node.runAction(cc.moveTo(Global.CELL_DROP_DURATION, this.WhereItShouldBe));
        }
        if (this.AttachedGift != null) {
            this.AttachedGift.node.runAction(cc.moveTo(Global.CELL_DROP_DURATION, this.WhereItShouldBe));
        }
    };
    CellController.prototype.GetConnections = function () {
        this.TopConnectedCell = null;
        this.LeftConnectedCell = null;
        this.BottomConnectedCell = null;
        this.RightConnectedCell = null;
        var connections = new Array();
        if (this.TopAntenna && this.Board_Y < (Global.BOARD_ROW_COUNT - 1)) {
            var topCell = this.gameBoard.cellMatrix[this.Board_Y + 1][this.Board_X];
            if (topCell != null && topCell.BottomAntenna) //|| topCell.CellType == Enums.CellType.Unknown))
             {
                connections.push(topCell);
                this.TopConnectedCell = topCell;
            }
        }
        if (this.LeftAntenna && this.Board_X > 0) {
            var leftCell = this.gameBoard.cellMatrix[this.Board_Y][this.Board_X - 1];
            if (leftCell != null && leftCell.RightAntenna) //|| leftCell.CellType == Enums.CellType.Unknown))
             {
                connections.push(leftCell);
                this.LeftConnectedCell = leftCell;
            }
        }
        if (this.BottomAntenna && this.Board_Y > 0) {
            var bottomCell = this.gameBoard.cellMatrix[this.Board_Y - 1][this.Board_X];
            if (bottomCell != null && bottomCell.TopAntenna) //|| bottomCell.CellType == Enums.CellType.Unknown))
             {
                connections.push(bottomCell);
                this.BottomConnectedCell = bottomCell;
            }
        }
        if (this.RightAntenna && this.Board_X < (Global.BOARD_COLUMN_COUNT - 1)) {
            var rightCell = this.gameBoard.cellMatrix[this.Board_Y][this.Board_X + 1];
            if (rightCell != null && rightCell.LeftAntenna) //|| rightCell.CellType == Enums.CellType.Unknown))
             {
                connections.push(rightCell);
                this.RightConnectedCell = rightCell;
            }
        }
        return connections;
    };
    //#endregion
    //#region Cell State
    CellController.prototype.SetState = function (leftBorderDetected, rightBorderDetected) {
        var state = Enums.CellState.Normal;
        if (!leftBorderDetected && !rightBorderDetected) {
            state = Enums.CellState.Normal;
        }
        else if (leftBorderDetected && !rightBorderDetected) {
            state = Enums.CellState.LeftBorderConnected;
        }
        else if (!leftBorderDetected && rightBorderDetected) {
            state = Enums.CellState.RightBorderConnected;
        }
        else if (leftBorderDetected && rightBorderDetected) {
            state = Enums.CellState.Hint;
        }
        this.CellState = state;
    };
    CellController.prototype.setColor = function (state) {
        switch (state) {
            case Enums.CellState.Normal:
                this.CellColor.node.color = cc.color(204, 204, 204);
                break;
            case Enums.CellState.LeftBorderConnected:
                this.CellColor.node.color = cc.color(147, 205, 221);
                break;
            case Enums.CellState.RightBorderConnected:
                this.CellColor.node.color = cc.color(234, 200, 93);
                break;
            case Enums.CellState.Hint:
                this.CellColor.node.color = cc.color(184, 203, 145);
                break;
            case Enums.CellState.Burnt:
                this.CellColor.node.color = cc.color(64, 64, 64);
                break;
            default:
                break;
        }
    };
    CellController.prototype.ShowHint = function () {
        this.hintAction = this.CellHint.node.runAction(cc.sequence(cc.fadeIn(Global.CIRCUIT_HINT_DURATION * 0.3), cc.fadeOut(Global.CIRCUIT_HINT_DURATION * 0.7)));
        // this.hintAction = this.CellHint.node.runAction(cc.fadeIn(Global.CIRCUIT_HINT_DURATION * 1));
        // this.CellHint.node.opacity = 255;
    };
    CellController.prototype.AbortHint = function () {
        if (this.hintAction != null) {
            this.CellHint.node.stopAction(this.hintAction);
            this.CellHint.node.opacity = 0;
        }
    };
    CellController.prototype.Bomb = function () {
        this.CellState = Enums.CellState.Burnt;
        //process attachments
        if (this.AttachedGift != null) {
            this.AttachedGift.Burn();
        }
        if (this.AttachedMonster != null) {
            this.AttachedMonster.Shock();
        }
    };
    CellController.prototype.GetBombed = function () {
        var toRemove = true;
        if (this.AttachedGift != null) {
            if (this.AttachedGift.BombTriggered) {
                if (this.AttachedGift == this.gameBoard.ExplodingBomb) {
                    this.AttachedGift.Remove();
                    this.gameBoard.ExplodingBomb = null;
                }
                else {
                    toRemove = false;
                }
            }
        }
        if (this.AttachedMonster != null) {
            /* no matter how strong the enemy is, kill it! */
            this.AttachedMonster.Die();
        }
        return toRemove;
    };
    CellController.prototype.Burn = function (EE, burningFrom, sourceFlow) {
        if (this.CellState == Enums.CellState.Burnt) {
            return;
        }
        this.CellState = Enums.CellState.Burnt;
        this.flowAtTop = this.flowAtBottom = this.flowAtLeft = this.flowAtRight = null;
        this.electricEffect = EE;
        var neighbours = this.GetConnections();
        //process attachments
        if (this.AttachedGift != null) {
            this.AttachedGift.Burn();
        }
        if (this.AttachedMonster != null) {
            this.AttachedMonster.Shock();
        }
        //add electric effect
        if (sourceFlow == null) {
            sourceFlow = this.electricEffect.AddFlow();
            //flow starts from left by default
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x - this.node.width * 0.5, this.node.position.y), 0);
        }
        //add a node at center point 
        var centerENode = sourceFlow.AddElectricNode(this.node.position, Global.ELECTRIC_NODE_RADIUS);
        if (this.RightAntenna && burningFrom != Enums.Direction.Right) {
            var radius = this.Board_X == (Global.BOARD_COLUMN_COUNT - 1) ? 0 : Global.ELECTRIC_NODE_RADIUS;
            if (this.Board_X == Global.BOARD_COLUMN_COUNT - 1) {
                radius = 0;
            }
            else {
                radius = this.RightConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            }
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x + this.node.width / 2, this.node.position.y), radius);
            this.flowAtRight = sourceFlow;
            sourceFlow = null;
        }
        if (this.TopAntenna && burningFrom != Enums.Direction.Top) {
            if (sourceFlow == null) {
                sourceFlow = this.electricEffect.AddFlow(centerENode);
                // sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y), Global.ELECTRIC_NODE_RADIUS);
            }
            var radius = this.TopConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y + this.node.height / 2), radius);
            this.flowAtTop = sourceFlow;
            sourceFlow = null;
        }
        if (this.BottomAntenna && burningFrom != Enums.Direction.Bottom) {
            if (sourceFlow == null) {
                sourceFlow = this.electricEffect.AddFlow(centerENode);
                // sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y), Global.ELECTRIC_NODE_RADIUS);
            }
            var radius = this.BottomConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y - this.node.height / 2), radius);
            this.flowAtBottom = sourceFlow;
            sourceFlow = null;
        }
        if (this.LeftAntenna && burningFrom != Enums.Direction.Left) {
            if (sourceFlow == null) {
                sourceFlow = this.electricEffect.AddFlow(centerENode);
                // sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x, this.node.position.y), Global.ELECTRIC_NODE_RADIUS);
            }
            var radius = this.LeftConnectedCell == null ? 0 : Global.ELECTRIC_NODE_RADIUS;
            sourceFlow.AddElectricNode(new cc.Vec2(this.node.position.x - this.node.width / 2, this.node.position.y), radius);
            this.flowAtLeft = sourceFlow;
            sourceFlow = null;
        }
        // burn neighbours
        for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
            var cell = neighbours_1[_i];
            var passingInFlow = null;
            var fromWhichSide = Enums.Direction.Top;
            if (cell == this.TopConnectedCell && burningFrom != Enums.Direction.Top) {
                fromWhichSide = Enums.Direction.Bottom;
                passingInFlow = this.flowAtTop;
            }
            else if (cell == this.LeftConnectedCell && burningFrom != Enums.Direction.Left) {
                fromWhichSide = Enums.Direction.Right;
                passingInFlow = this.flowAtLeft;
            }
            else if (cell == this.BottomConnectedCell && burningFrom != Enums.Direction.Bottom) {
                fromWhichSide = Enums.Direction.Top;
                passingInFlow = this.flowAtBottom;
            }
            else if (cell == this.RightConnectedCell && burningFrom != Enums.Direction.Right) {
                fromWhichSide = Enums.Direction.Left;
                passingInFlow = this.flowAtRight;
            }
            cell.Burn(EE, fromWhichSide, passingInFlow);
        }
    };
    CellController.prototype.GetBurnt = function () {
        var toRemove = true;
        /* Let's delay this cell's removal to the bomb explosion. */
        if (this.AttachedGift != null && this.AttachedGift.GiftType == Enums.GiftType.Bomb) {
            toRemove = false;
            this.CellState = Enums.CellState.Burnt;
        }
        if (this.AttachedMonster != null) {
            var dead = this.AttachedMonster.Wound();
            if (dead == false) {
                toRemove = false;
                this.CellState = Enums.CellState.Normal;
            }
        }
        return toRemove;
    };
    CellController.prototype.longPressStart = function () {
        this.longpressLevel = 0;
        this.longpressTimespan = 0;
        this.longpressCounting = true;
    };
    CellController.prototype.longPressed = function (level) {
        this.longpressLevel = level;
        if (level == 1) {
            if (this.AttachedGift != null) {
                this.AttachedGift.ShowLongPressHint();
            }
        }
        else if (level == 2) {
            if (this.AttachedGift != null) {
                this.AttachedGift.LongPressFire();
            }
        }
    };
    CellController.prototype.longPressCancel = function () {
        this.longpressCounting = false;
        if (this.AttachedGift != null) {
            this.AttachedGift.StopLongPressHint();
        }
    };
    __decorate([
        property(cc.Sprite)
    ], CellController.prototype, "CellColor", void 0);
    __decorate([
        property(cc.Sprite)
    ], CellController.prototype, "CellBody", void 0);
    __decorate([
        property(cc.Sprite)
    ], CellController.prototype, "CellHint", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "X_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "X_Hint_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "T_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "T_Hint_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "L_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "L_Hint_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "I_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "I_Hint_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "H_Texture", void 0);
    __decorate([
        property(cc.SpriteFrame)
    ], CellController.prototype, "H_Hint_Texture", void 0);
    CellController = __decorate([
        ccclass
    ], CellController);
    return CellController;
}(cc.Component));
exports.default = CellController;

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
        //# sourceMappingURL=CellController.js.map
        