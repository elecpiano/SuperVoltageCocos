(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/GameBoardController.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f5aa2kwIaxMwK+luq/OstUo', 'GameBoardController', __filename);
// Script/GameBoardController.ts

Object.defineProperty(exports, "__esModule", { value: true });
var CellController_1 = require("./CellController");
var MonsterController_1 = require("./MonsterController");
var TopBarController_1 = require("./TopBarController");
var GiftController_1 = require("./GiftController");
var Enums = require("./Enums");
var Global = require("./Global");
var ElectricEffect_1 = require("./ElectricEffect/ElectricEffect");
var CongratulationController_1 = require("./CongratulationController");
var BombExplosionController_1 = require("./BombExplosionController");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameBoardController = /** @class */ (function (_super) {
    __extends(GameBoardController, _super);
    function GameBoardController() {
        //#region Properties
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.topBar = null;
        _this.cellTemplate = null;
        _this.MonsterTemplate = null;
        _this.GiftTemplate = null;
        _this.CongratulationTemplate = null;
        _this.cellMatrixLayer = null;
        _this.MonsterLayer = null;
        _this.giftLayer = null;
        _this.electricEffect = null;
        _this.EscapeWarning = null;
        _this.BombExplosion = null;
        _this.gamePaused = false;
        _this.monsters = null;
        _this.CurrentRoundEnemyKill = 0;
        _this.CurrentlyTouchedCell = null;
        _this.usePresets = true; //xxx test
        _this.escapedMonsterCount = 0;
        //#endregion
        //#region Game State
        _this._CurrentGameState = Enums.GameState.Idle;
        _this.connectionTrees = new Array();
        _this.droppingCells = new Array();
        _this.cellsToFill = new Array();
        _this.cellsToRemove = new Array();
        _this.movingMonsters = new Array();
        _this.movingGifts = new Array();
        _this.dropPlanMatrix = null;
        //#endregion
        //#region Spark
        _this.sparkleT = null;
        _this.sparkleL = null;
        _this.sparkleB = null;
        _this.sparkleR = null;
        //#endregion
        //#region Cell Population
        _this.cellMatrix = null;
        _this.freeCells = null;
        _this.leftBorderDetected = false;
        _this.rightBorderDetected = false;
        /*
        Get a random bubble by avoiding those denied CellTypes and Rotations.
        Each time the 'deniedBubble' parameter is set null, this method forgets
        all the CellTypes and Rotations that has been denied so far and then
        starts a new round of picking. So be sure to set the 'deniedBubble' parameter
        to null whenever a new round of picking is intended, and use a while loop
        right after the method call to ask for a new random pick until you get one.
        For such examples, please refer to method 'PopulateBubbles()'.
        */
        _this.deniedTypes = new Array();
        _this.deniedRotations = new Array();
        _this.cellTypePool = new Array();
        //#endregion
        //#region Cell Matrix Connection Tree
        _this.circuitTree = new Array();
        //#endregion
        //#region Burn
        /* If weapon is used for burning or bombing, no Combo and Chain is counted. */
        _this.WeaponUsed = false;
        // CellBurntByLigntning: CellController = null;
        _this.CellsBurntManually = new Array();
        _this.ManualBurn = false;
        //#endregion
        //#region Monster
        _this.monstersOnBoard = new Array();
        //#endregion
        //#region Gift
        _this.chargeLightning = null;
        _this.chargeBomb = null;
        _this.GiftQueue = new Array();
        //#endregion
        //#region Chain
        _this.ChainCount = 0;
        _this.triggeredBombs = new Array();
        _this.bombedCells = new Array();
        _this.ExplodingBomb = null;
        //#endregion
        //#region Combo
        _this.monsterKilledInThisBurn = 0;
        //#endregion
        //#region WX Data API
        // test_SaveData(){
        //     if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        //     }
        //     let fs = wx.getFileSystemManager();
        //     fs.writeFileSync(`${wx.env.USER_DATA_PATH}/hello.txt`, 'hello, world', 'utf8')
        // }
        // test_LoadData(){
        //     let fs = wx.getFileSystemManager();
        //     let data = fs.readFileSync(`${wx.env.USER_DATA_PATH}/hello123.txt`, 'utf8')
        // }
        //#endregion
        //#region DEBUG
        _this.Debug_Lable = null;
        return _this;
        /*
    
        debug_r = 0;
        debug_c = 0;
    
        Debug_Fill_Cell () {
    
            let cell: CellController = null;
            let newcell: CellController = null;
            this.connectionTree.splice(0, this.connectionTree.length);
    
            if (this.debug_r >= Global.BOARD_ROW_COUNT) {
                return;
            }
    
            if(this.debug_c == Global.BOARD_COLUMN_COUNT){
                this.debug_r++;
                this.debug_c = 0;
            }
    
            //get a random cell
            cell = this.pickUpCell(null, this.debug_c, this.debug_r);
    
            // to test if the cell is acceptable
            this.connectionTree.splice(0, this.connectionTree.length);
            this.leftBorderDetected = false;
            this.rightBorderDetected = false;
            this.getConnectionTree(cell);
            while (this.leftBorderDetected && this.rightBorderDetected)
            {
                //deny the cell, loop until get a correct one
                newcell = this.pickUpCell(cell, this.debug_c, this.debug_r);
                if (newcell == cell)
                {
                    //can not find any acceptable cell, let it be
                    break;
                }
                this.connectionTree.splice(0, this.connectionTree.length);
                this.leftBorderDetected = false;
                this.rightBorderDetected = false;
                this.getConnectionTree(newcell);
                cell = newcell;
            }
    
            cell.Board_X = this.debug_c;
            cell.Board_Y = this.debug_r;
            this.cellMatrix[this.debug_r][this.debug_c] = cell;
    
            this.debug_c++;
    
            // prepare to drop by putting the cell above the starting line
            cell.node.setPosition(cell.Board_X * cell.node.width + Global.BOARD_OFFSET_X, this.node.height + cell.Board_Y * cell.node.height);
            
            cell.scheduleOnce(()=>{
                cell.node.runAction(cc.moveTo(0.3,
                    new cc.Vec2(cell.Board_X * cell.node.width + Global.BOARD_OFFSET_X, cell.Board_Y * cell.node.height + Global.BOARD_OFFSET_Y)));
            },0.01);
    
            // this.Debug_CellMatrix_Lookup();
        }
    
        */
        //#endregion
    }
    //#endregion
    //#region Lifecycle
    GameBoardController.prototype.onLoad = function () {
        this.initCellMatrix();
    };
    GameBoardController.prototype.start = function () {
        /// test
        this.startFilling();
    };
    GameBoardController.prototype.update = function (dt) { };
    Object.defineProperty(GameBoardController.prototype, "CurrentGameState", {
        get: function () {
            return this._CurrentGameState;
        },
        set: function (state) {
            this._CurrentGameState = state;
            this.Debug_CurrentGameState();
        },
        enumerable: true,
        configurable: true
    });
    GameBoardController.prototype.startHint = function () {
        for (var _i = 0, _a = this.circuitTree; _i < _a.length; _i++) {
            var cell = _a[_i];
            cell.ShowHint();
        }
        this.scheduleOnce(this.hintSchedule, Global.CIRCUIT_HINT_DURATION);
        // // audio
        // Bubble.SEI_ConnectionHint.Stop();
        // Bubble.SEI_ConnectionHint.Play();
        this.CurrentGameState = Enums.GameState.Hint;
    };
    GameBoardController.prototype.abortHint = function () {
        this.unschedule(this.hintSchedule);
        for (var _i = 0, _a = this.circuitTree; _i < _a.length; _i++) {
            var cell = _a[_i];
            cell.AbortHint();
        }
        this.CurrentGameState = Enums.GameState.Idle;
    };
    GameBoardController.prototype.hintSchedule = function () {
        this.startBurn();
    };
    GameBoardController.prototype.startBurn = function () {
        this.CurrentGameState = Enums.GameState.Burning;
        this.setFire(this.circuitTree);
        this.updateBurn();
    };
    GameBoardController.prototype.ManuallyBurn = function (cells) {
        this.CurrentGameState = Enums.GameState.Burning;
        this.setFireManually(cells);
        this.updateBurn();
    };
    GameBoardController.prototype.updateBurn = function () {
        var _this = this;
        this.scheduleOnce(function () {
            _this.stopFire();
            _this.tryCongratulateCombo();
            _this.checkTriggeredBomb();
        }, Global.BURN_DURATION);
    };
    GameBoardController.prototype.ManuallyExplode = function (bomb) {
        this.startExplosionAt(bomb);
        this.CurrentGameState = Enums.GameState.Bombing;
        this.UpdateBombing();
    };
    GameBoardController.prototype.checkTriggeredBomb = function () {
        if (this.triggeredBombs.length > 0) {
            var bomb = this.triggeredBombs.pop();
            this.startExplosionAt(bomb);
            this.CurrentGameState = Enums.GameState.Bombing;
            this.UpdateBombing();
        }
        else {
            this.startDropping();
        }
    };
    GameBoardController.prototype.UpdateBombing = function () {
        var _this = this;
        this.scheduleOnce(function () {
            _this.stopExplosion();
            _this.checkTriggeredBomb(); /* a bomb explosion may trigger another bomb, so let's check again */
        }, Global.BOMB_DURATION);
    };
    GameBoardController.prototype.startDropping = function () {
        var _this = this;
        this.droppingCells.splice(0, this.droppingCells.length);
        this.dropPlanMatrix = new Array();
        for (var col = 0; col < Global.BOARD_COLUMN_COUNT; col++) {
            var emptyCellCount = 0;
            var dropPlans = new Array();
            for (var row = 0; row < Global.BOARD_ROW_COUNT; row++) {
                var cell = this.cellMatrix[row][col];
                if (cell == null) {
                    emptyCellCount++;
                }
                else if (emptyCellCount > 0) {
                    var dropPlan = [cell, emptyCellCount];
                    dropPlans.push(dropPlan);
                    this.droppingCells.push(cell);
                }
            }
            this.dropPlanMatrix.push(dropPlans);
        }
        this.schedule(function () {
            _this.dropCell();
        }, Global.CELL_DROP_DELAY, Global.BOARD_ROW_COUNT);
        this.CurrentGameState = Enums.GameState.Dropping;
        /* IMPORTANT !
        when you burn ONLY the first row of the matrix, there's nothing to drop,
        and the dropPlanMatrix array has nothing in it, in which case the updateDrop()
        may never be called. So it's necessary to call updateDrop() method explicitly here.
        */
        this.updateDrop();
    };
    GameBoardController.prototype.dropCell = function () {
        var _this = this;
        var _loop_1 = function (col) {
            var dropPlans = this_1.dropPlanMatrix[col];
            if (dropPlans.length > 0) {
                var dropPlan = dropPlans.shift();
                var cell_1 = dropPlan[0];
                var dropDistance = dropPlan[1];
                //reset the status of dropping bubble
                cell_1.CellState = Enums.CellState.Normal;
                var targetBoardX = cell_1.Board_X;
                var targetBoardY = cell_1.Board_Y - dropDistance;
                this_1.cellMatrix[cell_1.Board_Y][cell_1.Board_X] = null;
                this_1.cellMatrix[targetBoardY][targetBoardX] = cell_1;
                cell_1.Board_Y = targetBoardY;
                cell_1.Board_X = targetBoardX;
                cell_1.MoveToWhereItShouldBe(function () {
                    _this.droppingCells.splice(_this.droppingCells.indexOf(cell_1), 1);
                    _this.updateDrop();
                });
            }
        };
        var this_1 = this;
        for (var col = 0; col < Global.BOARD_COLUMN_COUNT; col++) {
            _loop_1(col);
        }
    };
    GameBoardController.prototype.updateDrop = function () {
        if (this.CurrentGameState == Enums.GameState.Dropping) {
            if (this.droppingCells.length == 0) {
                this.startFilling();
            }
        }
    };
    GameBoardController.prototype.startFilling = function () {
        var _this = this;
        this.cellsToFill = this.populateCells();
        var delayIndex = 0;
        var _loop_2 = function (cell) {
            // prepare to drop by putting the cell above the starting line
            cell.GetReadyForShow();
            cell.scheduleOnce(function () {
                cell.node.runAction(cc.sequence(cc.moveTo(Global.CELL_DROP_DURATION, cell.WhereItShouldBe), cc.callFunc(function () {
                    // remove itself from filling list
                    _this.cellsToFill.splice(_this.cellsToFill.indexOf(cell), 1);
                    // check if all the filling cells are done
                    _this.updateFill();
                }, cell)));
            }, delayIndex * 0.02);
            delayIndex++;
        };
        for (var _i = 0, _a = this.cellsToFill; _i < _a.length; _i++) {
            var cell = _a[_i];
            _loop_2(cell);
        }
        this.CurrentGameState = Enums.GameState.Filling;
    };
    GameBoardController.prototype.updateFill = function () {
        if (this.CurrentGameState == Enums.GameState.Filling) {
            if (this.cellsToFill.length == 0) {
                this.UpdateBoard();
                if (this.circuitTree.length > 0) {
                    /* setting the GameState to Chain will not halt the game forever,
                     * since the hint is shown, the Cells on the connection tree will
                     * be calculating the hint duration and set up a fire spontaneously,
                     * setting the GameState to Burning. */
                    this.CurrentGameState = Enums.GameState.Chain;
                    /* this may also happens unexpectedly:
                     * When the game quits during the GameState.Burning state,
                     * all the cell state is saved. And when the game is continued,
                     * the Burning state causes successively Update-Burning(...), Start-Dropping(...),
                     * Update-Drop(...), Start-Filling(...) and Update-Fill(...). Because there is actually
                     * no cells to drop and fill, these methods are executed really fast,
                     * therefore causing this hint detection happen.
                     * That's why we are setting the GameState to Idle when the game
                     * is continued. Please refer to CoreLogic.LoadGameData() method. */
                    if (!this.WeaponUsed) {
                        this.ChainCount++;
                    }
                }
                else {
                    this.processMonster();
                    this.tryCongratulateChain();
                }
            }
        }
    };
    GameBoardController.prototype.processMonster = function () {
        var _this = this;
        var monsterCount = 0;
        /* move existing bugs around using Lower-First principle */
        for (var row = 0; row < Global.BOARD_ROW_COUNT; row++) {
            for (var col = 0; col < Global.BOARD_COLUMN_COUNT; col++) {
                var cell = this.cellMatrix[row][col];
                if (cell != null && cell.AttachedMonster != null) {
                    monsterCount++;
                    var monster = cell.AttachedMonster;
                    if (monster.ShouldMoveAround && !this.WeaponUsed) {
                        var escaped = monster.MoveAround();
                        if (!escaped) {
                            this.movingMonsters.push(monster);
                        }
                    }
                    else {
                        // let it can move for next time
                        monster.ShouldMoveAround = true;
                    }
                }
            }
        }
        /* if it is a Lightning Burn, then check if there is any monster
         on the screen. If yes, then do NOT add new monsters. */
        if (!(this.WeaponUsed && monsterCount > 0)) {
            /* Add new bugs */
            var newMonsters = this.populateMonsters();
            for (var _i = 0, newMonsters_1 = newMonsters; _i < newMonsters_1.length; _i++) {
                var monster = newMonsters_1[_i];
                this.movingMonsters.push(monster);
            }
        }
        var _loop_3 = function (monster) {
            monster.MoveToWhereItShoudBe(function () {
                _this.movingMonsters.splice(_this.movingMonsters.indexOf(monster), 1);
                _this.updateMonsterMoving();
            });
        };
        for (var _a = 0, _b = this.movingMonsters; _a < _b.length; _a++) {
            var monster = _b[_a];
            _loop_3(monster);
        }
        // prepare for next round of movement
        for (var _c = 0, _d = this.movingMonsters; _c < _d.length; _c++) {
            var monster = _d[_c];
            monster.AlreadyMovedAround = false;
        }
        this.CurrentGameState = Enums.GameState.MonsterMoving;
        this.updateMonsterMoving(); /* in case movingMonsters array is empty */
    };
    GameBoardController.prototype.updateMonsterMoving = function () {
        if (this.CurrentGameState == Enums.GameState.MonsterMoving) {
            if (this.movingMonsters.length == 0) {
                this.checkMonsterGiftCollision();
            }
        }
    };
    GameBoardController.prototype.checkMonsterGiftCollision = function () {
        var collisionHappened = false;
        var bombCollisionCells = new Array();
        var lightningCollisionCells = new Array();
        for (var _i = 0, _a = this.monstersOnBoard; _i < _a.length; _i++) {
            var monster = _a[_i];
            var collision = monster.CheckGiftCollision();
            if (collision) {
                if (monster.attachedCell.AttachedGift.GiftType == Enums.GiftType.Bomb) {
                    bombCollisionCells.push(monster.attachedCell);
                }
                else if (monster.attachedCell.AttachedGift.GiftType == Enums.GiftType.Lightning) {
                    lightningCollisionCells.push(monster.attachedCell);
                }
                collisionHappened = true;
            }
        }
        if (bombCollisionCells.length > 0) {
            for (var _b = 0, bombCollisionCells_1 = bombCollisionCells; _b < bombCollisionCells_1.length; _b++) {
                var cell = bombCollisionCells_1[_b];
                cell.AttachedGift.TriggerAsBomb();
            }
            this.checkTriggeredBomb();
        }
        else if (lightningCollisionCells.length > 0) {
            this.ManuallyBurn(lightningCollisionCells);
        }
        else {
            this.checkGameOver();
        }
    };
    GameBoardController.prototype.checkGameOver = function () {
        if (this.escapedMonsterCount >= 3) {
            // game over
        }
        else {
            this.startGifting();
        }
    };
    GameBoardController.prototype.startGifting = function () {
        var _this = this;
        var newGifts = this.getGifts();
        if (newGifts.length > 0) {
            var _loop_4 = function (gift) {
                gift.GetReadyForShow();
                gift.Award(function () {
                    _this.movingGifts.splice(_this.movingGifts.indexOf(gift), 1);
                    _this.updateGifting();
                });
            };
            for (var _i = 0, newGifts_1 = newGifts; _i < newGifts_1.length; _i++) {
                var gift = newGifts_1[_i];
                _loop_4(gift);
            }
            this.CurrentGameState = Enums.GameState.Gifting;
        }
        else {
            this.goForNextRound();
        }
    };
    GameBoardController.prototype.updateGifting = function () {
        if (this.CurrentGameState == Enums.GameState.Gifting) {
            if (this.movingGifts.length == 0) {
                this.goForNextRound();
            }
        }
    };
    GameBoardController.prototype.goForNextRound = function () {
        this.usePresets = false;
        this.WeaponUsed = false;
        this.CurrentGameState = Enums.GameState.Idle;
    };
    GameBoardController.prototype.sparkAt = function (particle, position) {
        particle.node.setPosition(position.x, position.y);
        particle.resetSystem();
        this.scheduleOnce(function () { return particle.stopSystem(); }, 1);
    };
    GameBoardController.prototype.spark = function (cell) {
        if (cell.CellState == Enums.CellState.Normal) {
            return;
        }
        if (cell.TopConnectedCell != null) {
            var position = new cc.Vec2(cell.node.position.x, cell.node.position.y + cell.node.height / 2);
            this.sparkAt(this.sparkleT, position);
        }
        if (cell.BottomConnectedCell != null) {
            var position = new cc.Vec2(cell.node.position.x, cell.node.position.y - cell.node.height / 2);
            this.sparkAt(this.sparkleB, position);
        }
        if (cell.LeftConnectedCell != null || (cell.Board_X == 0 && cell.LeftAntenna)) {
            var position = new cc.Vec2(cell.node.position.x - cell.node.width / 2, cell.node.position.y);
            this.sparkAt(this.sparkleL, position);
        }
        if (cell.RightConnectedCell != null || (cell.Board_X == Global.BOARD_COLUMN_COUNT - 1 && cell.RightAntenna)) {
            var position = new cc.Vec2(cell.node.position.x + cell.node.width / 2, cell.node.position.y);
            this.sparkAt(this.sparkleR, position);
        }
    };
    GameBoardController.prototype.initCellMatrix = function () {
        // initialize matrix
        this.cellMatrix = new Array();
        for (var i = 0; i < Global.BOARD_ROW_COUNT; i++) {
            var row = new Array(Global.BOARD_COLUMN_COUNT);
            this.cellMatrix.push(row);
        }
        // generate cells
        this.freeCells = new Array();
        for (var i = 0; i < (Global.BOARD_ROW_COUNT * Global.BOARD_COLUMN_COUNT); i++) {
            var cellNode = cc.instantiate(this.cellTemplate);
            this.cellMatrixLayer.addChild(cellNode);
            this.freeCells.push(cellNode.getComponent(CellController_1.default));
            cellNode.setPosition(0, 0);
        }
    };
    GameBoardController.prototype.populateCells = function () {
        var cellsToAppend = null;
        //check for tutorial
        if (this.usePresets) {
            cellsToAppend = this.initTutorialCells();
        }
        else {
            cellsToAppend = new Array();
        }
        var cell = null;
        var newcell = null;
        var connectionTree = new Array();
        for (var i = 0; i < Global.BOARD_ROW_COUNT; i++) {
            for (var j = 0; j < Global.BOARD_COLUMN_COUNT; j++) {
                if (this.cellMatrix[i][j] != null) {
                    continue;
                }
                //get a random cell
                cell = this.pickUpCell(null, j, i);
                // to test if the cell is acceptable
                connectionTree.splice(0, connectionTree.length);
                this.leftBorderDetected = false;
                this.rightBorderDetected = false;
                this.getConnectionTree(cell, connectionTree);
                while (this.leftBorderDetected && this.rightBorderDetected) {
                    //deny the cell, loop until get a correct one
                    newcell = this.pickUpCell(cell, j, i);
                    if (newcell == cell) {
                        //can not find any acceptable cell, let it be
                        break;
                    }
                    connectionTree.splice(0, connectionTree.length);
                    this.leftBorderDetected = false;
                    this.rightBorderDetected = false;
                    this.getConnectionTree(newcell, connectionTree);
                    cell = newcell;
                }
                cell.Board_X = j;
                cell.Board_Y = i;
                this.cellMatrix[i][j] = cell;
                cellsToAppend.push(cell);
            }
        }
        /* Set Materials */
        //CurrentGameLevel.SetMaterialTypes(cellsToAppend);
        return cellsToAppend;
    };
    GameBoardController.prototype.pickUpCell = function (deniedCell, board_x, board_y) {
        var cellType = Enums.CellType.I;
        var rotation = 0;
        if (deniedCell == null) {
            //a new round of pick, give it a pure random
            cellType = this.pickUpCellType();
            rotation = this.pickUpRotation();
            this.deniedTypes.splice(0, this.deniedTypes.length);
            this.deniedRotations.splice(0, this.deniedRotations.length);
        }
        else if (this.deniedRotations.length == 4) //all rotations are denied, so let's pick another CellType
         {
            if (this.deniedTypes.length == 5) // all CellTypes and rotations have been tested, yet not successful
             {
                //can not find any acceptable bubble
                return deniedCell;
            }
            else {
                this.deniedTypes.push(deniedCell.CellType);
                cellType = this.pickUpCellType();
                while (this.deniedTypes.indexOf(cellType) > -1) {
                    cellType = this.pickUpCellType();
                }
                this.deniedRotations.splice(0, this.deniedRotations.length);
                rotation = this.pickUpRotation();
            }
        }
        else {
            this.deniedRotations.push(deniedCell.RotationQuarterCount);
            rotation = this.pickUpRotation();
            while (this.deniedRotations.indexOf(rotation) > -1) {
                rotation = this.pickUpRotation();
            }
        }
        var cell = null;
        if (deniedCell != null) {
            cell = deniedCell;
        }
        else {
            cell = this.freeCells.pop();
        }
        cell.initCell(cellType, rotation, board_x, board_y);
        return cell;
    };
    GameBoardController.prototype.initCellTypePool = function () {
        // clear the list
        this.cellTypePool.splice(0, this.cellTypePool.length);
        this.cellTypePool.push(Enums.CellType.Half);
        this.cellTypePool.push(Enums.CellType.I);
        this.cellTypePool.push(Enums.CellType.L);
        this.cellTypePool.push(Enums.CellType.T);
        this.cellTypePool.push(Enums.CellType.Cross);
        // this.cellTypePool.push(Enums.CellType.Unknown);
    };
    GameBoardController.prototype.pickUpCellType = function () {
        //clear the pool
        this.cellTypePool.splice(0, this.cellTypePool.length);
        var crossCount = 0;
        var tCount = 0;
        var lCount = 0;
        var iCount = 0;
        var halfCount = 0;
        var unknownCount = 0;
        for (var _i = 0, _a = this.cellMatrix; _i < _a.length; _i++) {
            var rowOfCells = _a[_i];
            for (var _b = 0, rowOfCells_1 = rowOfCells; _b < rowOfCells_1.length; _b++) {
                var cell = rowOfCells_1[_b];
                if (cell == null) {
                    continue;
                }
                if (cell.CellType == Enums.CellType.Cross) {
                    crossCount++;
                }
                else if (cell.CellType == Enums.CellType.T) {
                    tCount++;
                }
                else if (cell.CellType == Enums.CellType.L) {
                    lCount++;
                }
                else if (cell.CellType == Enums.CellType.I) {
                    iCount++;
                }
                else if (cell.CellType == Enums.CellType.Half) {
                    halfCount++;
                }
            }
        }
        if (crossCount < Global.MAX_CROSS_COUNT) {
            this.cellTypePool.push(Enums.CellType.Cross);
        }
        if (tCount < Global.MAX_T_COUNT) {
            this.cellTypePool.push(Enums.CellType.T);
        }
        if (lCount < Global.MAX_L_COUNT) {
            this.cellTypePool.push(Enums.CellType.L);
        }
        if (iCount < Global.MAX_I_COUNT) {
            this.cellTypePool.push(Enums.CellType.I);
        }
        if (halfCount < Global.MAX_HALF_COUNT) {
            this.cellTypePool.push(Enums.CellType.Half);
        }
        var idx = Math.floor(Math.random() * this.cellTypePool.length);
        return this.cellTypePool[idx];
    };
    GameBoardController.prototype.pickUpRotation = function () {
        var rotation = Math.floor(Math.random() * 4);
        return rotation;
    };
    GameBoardController.prototype.getConnectionTree = function (cell, connectionTree) {
        connectionTree.push(cell);
        if (cell.Board_X == 0 && cell.LeftAntenna) {
            this.leftBorderDetected = true;
        }
        else if (cell.Board_X == (Global.BOARD_COLUMN_COUNT - 1) && cell.RightAntenna) {
            this.rightBorderDetected = true;
        }
        var connections = cell.GetConnections();
        if (connections.length > 0) {
            for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
                var connectedCell = connections_1[_i];
                if (connectionTree.indexOf(connectedCell) == -1) {
                    this.getConnectionTree(connectedCell, connectionTree);
                }
            }
        }
    };
    GameBoardController.prototype.UpdateBoard = function (exceptFor) {
        if (exceptFor === void 0) { exceptFor = null; }
        var tempCellList = new Array();
        if (exceptFor != null) {
            this.cellMatrix[exceptFor.Board_Y][exceptFor.Board_X] = null;
            this.abortHint();
        }
        for (var _i = 0, _a = this.cellMatrix; _i < _a.length; _i++) {
            var row = _a[_i];
            for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                var cell = row_1[_b];
                if (cell != null) {
                    tempCellList.push(cell);
                }
            }
        }
        while (tempCellList.length > 0) {
            var cell = tempCellList[0];
            if (cell == null) {
                continue;
            }
            var tree = new Array();
            this.leftBorderDetected = false;
            this.rightBorderDetected = false;
            this.getConnectionTree(cell, tree);
            for (var _c = 0, tree_1 = tree; _c < tree_1.length; _c++) {
                var node = tree_1[_c];
                node.SetState(this.leftBorderDetected, this.rightBorderDetected);
            }
            if (this.leftBorderDetected && this.rightBorderDetected) {
                this.circuitTree = tree;
                if (exceptFor == null) {
                    this.startHint();
                }
            }
            for (var _d = 0, tree_2 = tree; _d < tree_2.length; _d++) {
                var node = tree_2[_d];
                tempCellList.splice(tempCellList.indexOf(node), 1);
            }
        }
        if (exceptFor != null) {
            this.cellMatrix[exceptFor.Board_Y][exceptFor.Board_X] = exceptFor;
        }
    };
    GameBoardController.prototype.setFire = function (tree) {
        this.ManualBurn = false;
        for (var _i = 0, tree_3 = tree; _i < tree_3.length; _i++) {
            var cell = tree_3[_i];
            if (cell.Board_X == 0 && cell.LeftAntenna) //there must be at leat one cell connected to left power (or right power)
             {
                /* Initial fire, has no passingInFlame*/
                cell.Burn(this.electricEffect, Enums.Direction.Left, null);
                break;
            }
        }
        // Audio
        // (GamePage.Current as GamePage).PlayBurningSoundEffect();
    };
    GameBoardController.prototype.setFireManually = function (cells) {
        this.ManualBurn = true;
        this.WeaponUsed = true;
        for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
            var cell = cells_1[_i];
            this.CellsBurntManually.push(cell);
            cell.Burn(this.electricEffect, Enums.Direction.Left, null);
        }
        // this.CellBurntByLigntning = cell;
    };
    GameBoardController.prototype.stopFire = function () {
        this.electricEffect.ClearFlows();
        if (this.CellsBurntManually.length > 0) {
            while (this.CellsBurntManually.length > 0) {
                var cell = this.CellsBurntManually.pop();
                var tree = new Array();
                this.getConnectionTree(cell, tree);
                for (var _i = 0, tree_4 = tree; _i < tree_4.length; _i++) {
                    var cell_2 = tree_4[_i];
                    var toRemove = cell_2.GetBurnt();
                    if (toRemove) {
                        this.freeCells.push(cell_2);
                        this.cellMatrix[cell_2.Board_Y][cell_2.Board_X] = null;
                        cell_2.GetReadyForShow();
                    }
                }
            }
        }
        else {
            for (var _a = 0, _b = this.circuitTree; _a < _b.length; _a++) {
                var cell = _b[_a];
                var toRemove = cell.GetBurnt();
                if (toRemove) {
                    this.freeCells.push(cell);
                    this.cellMatrix[cell.Board_Y][cell.Board_X] = null;
                    cell.GetReadyForShow();
                }
            }
            this.circuitTree.splice(0, this.circuitTree.length);
        }
        this.ManualBurn = false;
    };
    GameBoardController.prototype.generateMonsters = function () {
        var monsters = new Array();
        // test
        var monsterNode = cc.instantiate(this.MonsterTemplate);
        var monster = monsterNode.getComponent(MonsterController_1.default);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);
        return monsters;
    };
    GameBoardController.prototype.populateMonsters = function () {
        var newMonsters = new Array();
        //check for tutorial
        if (this.usePresets) {
            newMonsters = this.initTutorialMonsters();
        }
        else {
            newMonsters = this.generateMonsters();
        }
        //get empty cell in the first row
        var startingLine = new Array();
        for (var col = 0; col < Global.BOARD_COLUMN_COUNT; col++) {
            var cell = this.cellMatrix[Global.BOARD_ROW_COUNT - 1][col];
            if (cell.AttachedMonster == null) {
                startingLine.push(cell);
            }
        }
        /* put new bugs into empty cells, until there's no more empty cells,
            * then give up */
        for (var _i = 0, newMonsters_2 = newMonsters; _i < newMonsters_2.length; _i++) {
            var monster = newMonsters_2[_i];
            if (startingLine.length <= 0) {
                break;
            }
            var index = Math.floor(Math.random() * startingLine.length);
            monster.AttachToCell(startingLine[index]);
            monster.GetReadyForShow();
            startingLine.splice(index, 1);
            this.monstersOnBoard.push(monster);
        }
        return newMonsters;
    };
    GameBoardController.prototype.RemoveMonsterFromBoard = function (monster) {
        this.monstersOnBoard.splice(this.monstersOnBoard.indexOf(monster), 1);
    };
    GameBoardController.prototype.removeMonster = function (monster) {
    };
    GameBoardController.prototype.restoreMonsters = function () {
    };
    GameBoardController.prototype.WarnEscape = function () {
        this.EscapeWarning.runAction(cc.sequence(cc.fadeIn(Global.ESCAPE_WARNING_DURATION), cc.fadeOut(Global.ESCAPE_WARNING_DURATION), cc.fadeIn(Global.ESCAPE_WARNING_DURATION), cc.fadeOut(Global.ESCAPE_WARNING_DURATION)));
    };
    GameBoardController.prototype.getGifts = function () {
        var gifts = new Array();
        //check for tutorial
        if (this.usePresets) {
            gifts = this.initTutorialGifts();
        }
        else {
            gifts = new Array();
            for (var _i = 0, _a = this.GiftQueue; _i < _a.length; _i++) {
                var giftType = _a[_i];
                var row = Math.floor(Math.random() * Global.BOARD_ROW_COUNT);
                var col = Math.floor(Math.random() * Global.BOARD_COLUMN_COUNT);
                var emptyCellFound = false;
                while (!emptyCellFound) {
                    var hasGift = this.cellMatrix[row][col].AttachedGift != null;
                    var hasMonster = this.cellMatrix[row][col].AttachedMonster != null;
                    if (hasGift || hasMonster) {
                        row = Math.floor(Math.random() * Global.BOARD_ROW_COUNT);
                        col = Math.floor(Math.random() * Global.BOARD_COLUMN_COUNT);
                    }
                    else {
                        emptyCellFound = true;
                    }
                }
                var cellToAttach = this.cellMatrix[row][col];
                var newGiftNode = cc.instantiate(this.GiftTemplate);
                this.giftLayer.addChild(newGiftNode);
                var gift = newGiftNode.getComponent(GiftController_1.default);
                gift.Init(giftType, cellToAttach);
                gifts.push(gift);
            }
            this.GiftQueue.splice(0, this.GiftQueue.length);
        }
        return gifts;
    };
    GameBoardController.prototype.restoreGifts = function () {
        // foreach (var giftData in gameLevel.SavedGifts)
        // {
        //     Gift gift = new Gift(CurrentGamePage, giftData.GiftType, Bubbles[giftData.Board_Y, giftData.Board_X]);
        //     Gifts.Add(gift);
        //     CurrentGamePage.Components.Add(gift);
        //     gift.SetPosition(gift.WhereItShouldBe);
        // }
        return null;
    };
    GameBoardController.prototype.initTutorialGifts = function () {
        var gifts = new Array();
        var cellToAttach = null;
        var newGiftNode = null;
        var gift = null;
        cellToAttach = this.cellMatrix[6][0];
        newGiftNode = cc.instantiate(this.GiftTemplate);
        this.giftLayer.addChild(newGiftNode);
        gift = newGiftNode.getComponent(GiftController_1.default);
        gift.Init(Enums.GiftType.Lightning, cellToAttach);
        gifts.push(gift);
        cellToAttach = this.cellMatrix[6][1];
        newGiftNode = cc.instantiate(this.GiftTemplate);
        this.giftLayer.addChild(newGiftNode);
        gift = newGiftNode.getComponent(GiftController_1.default);
        gift.Init(Enums.GiftType.Lightning, cellToAttach);
        gifts.push(gift);
        cellToAttach = this.cellMatrix[6][2];
        newGiftNode = cc.instantiate(this.GiftTemplate);
        this.giftLayer.addChild(newGiftNode);
        gift = newGiftNode.getComponent(GiftController_1.default);
        gift.Init(Enums.GiftType.Lightning, cellToAttach);
        gifts.push(gift);
        cellToAttach = this.cellMatrix[6][3];
        newGiftNode = cc.instantiate(this.GiftTemplate);
        this.giftLayer.addChild(newGiftNode);
        gift = newGiftNode.getComponent(GiftController_1.default);
        gift.Init(Enums.GiftType.Lightning, cellToAttach);
        gifts.push(gift);
        cellToAttach = this.cellMatrix[6][4];
        newGiftNode = cc.instantiate(this.GiftTemplate);
        this.giftLayer.addChild(newGiftNode);
        gift = newGiftNode.getComponent(GiftController_1.default);
        gift.Init(Enums.GiftType.Lightning, cellToAttach);
        gifts.push(gift);
        return gifts;
    };
    GameBoardController.prototype.ShowChargeEffect = function (type, position) {
        var particle = this.chargeLightning;
        if (type == Enums.GiftType.Bomb) {
            particle = this.chargeBomb;
        }
        particle.node.setPosition(position.x, position.y);
        particle.resetSystem();
    };
    GameBoardController.prototype.HideChargeEffect = function (type) {
        if (type == Enums.GiftType.Lightning) {
            this.chargeLightning.stopSystem();
        }
        else if (type == Enums.GiftType.Bomb) {
            this.chargeBomb.stopSystem();
        }
    };
    GameBoardController.prototype.tryCongratulateChain = function () {
        if (this.ChainCount <= 0) {
            return;
        }
        /* Queue Bomb Award */
        for (var index = 0; index < this.ChainCount; index++) {
            this.GiftQueue.push(Enums.GiftType.Bomb);
        }
        /* Visual Congratulation */
        var congratulation = cc.instantiate(this.CongratulationTemplate);
        var controller = congratulation.getComponent(CongratulationController_1.default);
        controller.ShowAward(this.giftLayer, Enums.CongratulationType.Chain, this.ChainCount);
        this.ChainCount = 0;
    };
    GameBoardController.prototype.QueueTriggeredBomb = function (bomb) {
        this.triggeredBombs.push(bomb);
    };
    GameBoardController.prototype.startExplosionAt = function (bomb) {
        this.WeaponUsed = true;
        this.ExplodingBomb = bomb;
        var bombCell = this.ExplodingBomb.attachedCell;
        this.BombExplosion.Show(bombCell);
        this.bombedCells = new Array();
        //target cells on the horizontal
        for (var col = 0; col < Global.BOARD_COLUMN_COUNT; col++) {
            var target = this.cellMatrix[bombCell.Board_Y][col];
            if (target != null) //&& target != bombCell
             {
                this.bombedCells.push(target);
            }
        }
        //target cells on the vertical
        for (var row = 0; row < Global.BOARD_ROW_COUNT; row++) {
            var target = this.cellMatrix[row][bombCell.Board_X];
            if (target != null && target != bombCell) {
                this.bombedCells.push(target);
            }
        }
        for (var _i = 0, _a = this.bombedCells; _i < _a.length; _i++) {
            var target_1 = _a[_i];
            target_1.Bomb();
        }
    };
    GameBoardController.prototype.stopExplosion = function () {
        this.BombExplosion.Hide();
        for (var _i = 0, _a = this.bombedCells; _i < _a.length; _i++) {
            var cell = _a[_i];
            var toRemove = cell.GetBombed();
            if (toRemove) {
                this.freeCells.push(cell);
                this.cellMatrix[cell.Board_Y][cell.Board_X] = null;
                cell.GetReadyForShow();
            }
        }
        this.bombedCells.splice(0, this.bombedCells.length);
    };
    GameBoardController.prototype.CountMonsterKill = function () {
        this.monsterKilledInThisBurn++;
    };
    GameBoardController.prototype.tryCongratulateCombo = function () {
        if (!this.WeaponUsed) {
            /* Queue Combo Award */
            if (this.monsterKilledInThisBurn < 2) {
                this.monsterKilledInThisBurn = 0;
                return;
            }
            else {
                this.GiftQueue.push(Enums.GiftType.Lightning);
            }
            /* Visual Congratulation */
            var congratulation = cc.instantiate(this.CongratulationTemplate);
            var controller = congratulation.getComponent(CongratulationController_1.default);
            controller.ShowAward(this.giftLayer, Enums.CongratulationType.Combo);
        }
        /* Reset for next round's counting */
        this.monsterKilledInThisBurn = 0;
    };
    //#endregion
    //#region Tutorial
    GameBoardController.prototype.initTutorialCells = function () {
        var cells = new Array();
        return cells;
    };
    GameBoardController.prototype.initTutorialMonsters = function () {
        var monsters = new Array();
        // xxx test
        var monsterNode = null;
        var monster = null;
        monsterNode = cc.instantiate(this.MonsterTemplate);
        monster = monsterNode.getComponent(MonsterController_1.default);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);
        monsterNode = cc.instantiate(this.MonsterTemplate);
        monster = monsterNode.getComponent(MonsterController_1.default);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);
        monsterNode = cc.instantiate(this.MonsterTemplate);
        monster = monsterNode.getComponent(MonsterController_1.default);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);
        monsterNode = cc.instantiate(this.MonsterTemplate);
        monster = monsterNode.getComponent(MonsterController_1.default);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);
        monsterNode = cc.instantiate(this.MonsterTemplate);
        monster = monsterNode.getComponent(MonsterController_1.default);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);
        return monsters;
    };
    GameBoardController.prototype.Debug_CurrentGameState = function () {
        this.Debug_Lable.string = this.CurrentGameState.toString();
    };
    GameBoardController.prototype.Debug_CellMatrix_Lookup = function () {
        this.UpdateBoard();
        this.Debug_Lable.string = "";
        for (var i = 0; i < Global.BOARD_ROW_COUNT; i++) {
            var str = "";
            for (var j = 0; j < Global.BOARD_COLUMN_COUNT; j++) {
                if (this.cellMatrix[i][j] == null) {
                    this.Debug_Lable.string += "[null]";
                    continue;
                }
                var cell = this.cellMatrix[i][j];
                str += "[" + cell.CellType.toString() + " " + cell.RotationQuarterCount.toString() + "]";
            }
            str = str + "\n" + this.Debug_Lable.string;
            this.Debug_Lable.string = str;
        }
    };
    __decorate([
        property(TopBarController_1.default)
    ], GameBoardController.prototype, "topBar", void 0);
    __decorate([
        property(cc.Prefab)
    ], GameBoardController.prototype, "cellTemplate", void 0);
    __decorate([
        property(cc.Prefab)
    ], GameBoardController.prototype, "MonsterTemplate", void 0);
    __decorate([
        property(cc.Prefab)
    ], GameBoardController.prototype, "GiftTemplate", void 0);
    __decorate([
        property(cc.Prefab)
    ], GameBoardController.prototype, "CongratulationTemplate", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "cellMatrixLayer", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "MonsterLayer", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "giftLayer", void 0);
    __decorate([
        property(ElectricEffect_1.default)
    ], GameBoardController.prototype, "electricEffect", void 0);
    __decorate([
        property(cc.Node)
    ], GameBoardController.prototype, "EscapeWarning", void 0);
    __decorate([
        property(BombExplosionController_1.default)
    ], GameBoardController.prototype, "BombExplosion", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], GameBoardController.prototype, "sparkleT", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], GameBoardController.prototype, "sparkleL", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], GameBoardController.prototype, "sparkleB", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], GameBoardController.prototype, "sparkleR", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], GameBoardController.prototype, "chargeLightning", void 0);
    __decorate([
        property(cc.ParticleSystem)
    ], GameBoardController.prototype, "chargeBomb", void 0);
    __decorate([
        property(cc.Label)
    ], GameBoardController.prototype, "Debug_Lable", void 0);
    GameBoardController = __decorate([
        ccclass
    ], GameBoardController);
    return GameBoardController;
}(cc.Component));
exports.default = GameBoardController;

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
        //# sourceMappingURL=GameBoardController.js.map
        