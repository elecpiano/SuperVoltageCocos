import CellController from "./CellController";
import MonsterController from "./MonsterController";
import TopBarController from "./TopBarController";
import GiftController from "./GiftController";
import * as Enums from "./Enums";
import * as Global from "./Global";
import ElectricEffect from "./ElectricEffect/ElectricEffect";
import CongratulationController from "./CongratulationController";
import BombExplosionController from "./BombExplosionController";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBoardController extends cc.Component {

    //#region Properties

        @property(TopBarController)
        topBar: TopBarController = null;

        @property(cc.Prefab)
        cellTemplate: cc.Prefab = null;

        @property(cc.Prefab)
        MonsterTemplate: cc.Prefab = null;

        @property(cc.Prefab)
        GiftTemplate: cc.Prefab = null;

        @property(cc.Prefab)
        CongratulationTemplate: cc.Prefab = null;

        @property(cc.Node)
        cellMatrixLayer: cc.Node = null;

        @property(cc.Node)
        MonsterLayer: cc.Node = null;

        @property(cc.Node)
        giftLayer: cc.Node = null;

        @property(ElectricEffect)
        electricEffect: ElectricEffect = null;

        @property(cc.Node)
        EscapeWarning: cc.Node = null;

        @property(BombExplosionController)
        BombExplosion: BombExplosionController = null;

        gamePaused = false;
        monsters: Array<MonsterController> = null;
        CurrentRoundEnemyKill = 0;
        CurrentlyTouchedCell: CellController = null;
        usePresets = false;
        escapedMonsterCount = 0;

    //#endregion

    //#region Lifecycle

    onLoad () {
        this.initCellMatrix();
    }

    start () {
        /// test
        this.startFilling();   
    }

    update (dt) {}

    //#endregion

    //#region Game State

    _CurrentGameState: Enums.GameState = Enums.GameState.Idle;
    get CurrentGameState() {
        return this._CurrentGameState;
    }
    set CurrentGameState(state: Enums.GameState) {
        this._CurrentGameState = state;
        this.Debug_CurrentGameState();
    }

    connectionTrees: CellController[][]  = new Array<Array<CellController>>();
    droppingCells: Array<CellController> = new Array<CellController>();
    cellsToFill: Array<CellController> = new Array<CellController>();
    cellsToRemove: Array<CellController> = new Array<CellController>();
    movingMonsters: Array<MonsterController> = new Array<MonsterController>();
    movingGifts: Array<GiftController> = new Array<GiftController>();

    startHint(){
        for (let cell of this.circuitTree) {
            cell.ShowHint();
        }
        this.scheduleOnce(this.hintSchedule, Global.CIRCUIT_HINT_DURATION);
        // // audio
        // Bubble.SEI_ConnectionHint.Stop();
        // Bubble.SEI_ConnectionHint.Play();

        this.CurrentGameState = Enums.GameState.Hint;
    }

    abortHint(){
        this.unschedule(this.hintSchedule);
        for (let cell of this.circuitTree) {
            cell.AbortHint();
        }
        this.CurrentGameState = Enums.GameState.Idle;
    }

    hintSchedule(){
        this.startBurn();
    }

    startBurn(){
        this.CurrentGameState = Enums.GameState.Burning;
        this.setFire(this.circuitTree);
        this.updateBurn();
    }

    BurnWithLightning(cell: CellController){
        this.CurrentGameState = Enums.GameState.Burning;
        this.setFireWithLightning(cell);
        this.updateBurn();
    }

    updateBurn(){
        this.scheduleOnce(
            ()=>{
                this.stopFire();
                this.tryCongratulateCombo();
                this.tryBombing();
            },Global.BURN_DURATION);
    }

    tryBombing(){
        if (this.triggeredBombs.length > 0) {
            let bomb = this.triggeredBombs.pop();
            this.startExplosionAt(bomb);
            this.CurrentGameState = Enums.GameState.Bombing;
            this.UpdateBombing();
        }
        else{
            this.startDropping();
        }
    }

    BombExplode(bomb: GiftController){
        this.startExplosionAt(bomb);
        this.CurrentGameState = Enums.GameState.Bombing;
        this.UpdateBombing();
    }

    UpdateBombing(){
        this.scheduleOnce(
            ()=>{
                this.stopExplosion();
                this.tryBombing(); /* a bomb explosion may trigger another bomb, so let's check again */
            },Global.BOMB_DURATION);
    }

    dropPlanMatrix: [CellController, number][][] = null;
    startDropping(){
        this.droppingCells.splice(0, this.droppingCells.length);
        this.dropPlanMatrix = new Array();
        for (let col = 0; col < Global.BOARD_COLUMN_COUNT; col++)
        {
            let emptyCellCount = 0;
            let dropPlans:[CellController, number][]= new Array();

            for (let row = 0; row < Global.BOARD_ROW_COUNT; row++)
            {
                let cell = this.cellMatrix[row][col];
                if (cell == null)
                {
                    emptyCellCount++;
                }
                else if (emptyCellCount > 0)
                {
                    let dropPlan: [CellController, number] = [cell, emptyCellCount];
                    dropPlans.push(dropPlan);
                    this.droppingCells.push(cell);
                }
            }
            this.dropPlanMatrix.push(dropPlans);
        }

        this.schedule(()=>{
            this.dropCell();
            },Global.CELL_DROP_DELAY,Global.BOARD_ROW_COUNT);
            
        this.CurrentGameState = Enums.GameState.Dropping;
        
        /* IMPORTANT ! 
        when you burn ONLY the first row of the matrix, there's nothing to drop,
        and the dropPlanMatrix array has nothing in it, in which case the updateDrop()
        may never be called. So it's necessary to call updateDrop() method explicitly here. 
        */
        this.updateDrop();
    }

    dropCell(){
        for (let col = 0; col < Global.BOARD_COLUMN_COUNT; col++) {
            let dropPlans = this.dropPlanMatrix[col];

            if (dropPlans.length > 0) {
                let dropPlan = dropPlans.shift();
                let cell = dropPlan[0];
                let dropDistance = dropPlan[1];

                //reset the status of dropping bubble
                cell.CellState = Enums.CellState.Normal;

                let targetBoardX = cell.Board_X;
                let targetBoardY = cell.Board_Y - dropDistance;
                this.cellMatrix[cell.Board_Y][cell.Board_X] = null;
                this.cellMatrix[targetBoardY][targetBoardX] = cell;
                cell.Board_Y = targetBoardY;
                cell.Board_X = targetBoardX;

                cell.MoveToWhereItShouldBe(()=>{
                    this.droppingCells.splice(this.droppingCells.indexOf(cell),1);
                    this.updateDrop();
                });
            }
        }

    }

    updateDrop(){
        if (this.CurrentGameState == Enums.GameState.Dropping){
            if (this.droppingCells.length == 0) {
                this.startFilling();
            }
        }
    }

    startFilling(){
        this.cellsToFill = this.populateCells();
        let delayIndex = 0;
        for (let cell of this.cellsToFill)
        {
            // prepare to drop by putting the cell above the starting line
            cell.GetReadyForShow();
            
            cell.scheduleOnce(()=>{
                cell.node.runAction(
                    cc.sequence(
                        cc.moveTo(Global.CELL_DROP_DURATION ,cell.WhereItShouldBe),
                        cc.callFunc(()=>{
                            // remove itself from filling list
                            this.cellsToFill.splice(this.cellsToFill.indexOf(cell),1);
                            // check if all the filling cells are done
                            this.updateFill();
                        },cell)
                    )
                );
            },delayIndex * 0.02);

            delayIndex ++;
        }
        this.CurrentGameState = Enums.GameState.Filling;
    }

    updateFill()
    {
        if (this.CurrentGameState == Enums.GameState.Filling)
        {
            if (this.cellsToFill.length == 0)
            {
                this.UpdateBoard();
                if (this.circuitTree.length > 0)
                {
                    /* setting the GameState to Chain will not halt the game forever,
                     * since the hint is shown, the Cells on the connection tree will 
                     * be calculating the hint duration and set up a fire spontaneously,
                     * setting the GameState to Burning. */
                    this.CurrentGameState = Enums.GameState.Chain;
                    /* this may also happens unexpectedly:
                     * When the game quits during the GameState.Burning state, 
                     * all the cell state is saved. And when the game is continued, 
                     * the Burning state causes successively UpdateBurning(...), StartDropping(...),
                     * UpdateDrop(...), StartFilling(...) and UpdateFill(...). Because there is actually
                     * no cells to drop and fill, these methods are executed really fast, 
                     * therefore causing this hint detection happen.
                     * That's why we are setting the GameState to Idle when the game
                     * is continued. Please refer to CoreLogic.LoadGameData() method. */
                    if (!this.ManualBurn)
                    {
                        this.ChainCount++;
                    }
                }
                else
                {
                    this.processMonster();
                    this.tryCongratulateChain();
                }
            }
        }
    }

    processMonster(){
        let monsterCount:number = 0;
        /* move existing bugs around using Lower-First principle */
        for (let row = 0; row < Global.BOARD_ROW_COUNT; row++)
        {
            for (let col = 0; col < Global.BOARD_COLUMN_COUNT; col++)
            {
                let cell = this.cellMatrix[row][col];
                if (cell != null && cell.AttachedMonster != null)
                {
                    monsterCount ++;
                    let monster = cell.AttachedMonster;
                    if (monster.ShouldMoveAround && !this.ManualBurn) {
                        let escaped = monster.MoveAround();
                        if (!escaped) {
                            this.movingMonsters.push(monster);                        
                        }
                    }
                    else{
                        // let it can move for next time
                        monster.ShouldMoveAround = true;
                    }
                }
            }
        }

        /* if it is a Lightning Burn, then check if there is any monster
         on the screen. If yes, then do NOT add new monsters. */
        if (!(this.ManualBurn && monsterCount > 0)){
            /* Add new bugs */
            let newMonsters = this.populateMonsters();
            for (let monster of newMonsters) {
                this.movingMonsters.push(monster);
            }
        }
        
        for (let monster of this.movingMonsters) {
            monster.MoveToWhereItShoudBe(
                ()=>{
                    this.movingMonsters.splice(this.movingMonsters.indexOf(monster),1);
                    this.updateMonsterMoving();
                }
            );
        }

        // prepare for next round of movement
        for (let monster of this.movingMonsters) {
            monster.AlreadyMovedAround = false;
        }

        this.CurrentGameState = Enums.GameState.MonsterMoving;
        this.updateMonsterMoving();/* in case movingMonsters array is empty */
    }

    updateMonsterMoving(){
        if (this.CurrentGameState == Enums.GameState.MonsterMoving){
            if (this.movingMonsters.length == 0) {
                this.checkGameOver();
            }
        }
    }

    checkGameOver(){
        if (this.escapedMonsterCount >= 3 ) {
            // game over
        }
        else{
            this.startGifting();
        }
    }

    startGifting(){
        let newGifts = this.getGifts();
        if (newGifts.length > 0) {
            for (let gift of newGifts)
            {
                gift.GetReadyForShow();
                gift.Award(
                    ()=>{
                        this.movingGifts.splice(this.movingGifts.indexOf(gift),1);
                        this.updateGifting();
                    }
                );
            }
            this.CurrentGameState = Enums.GameState.Gifting; 
        }
        else{
            this.goForNextRound();
        }
    }

    updateGifting(){
        if (this.CurrentGameState == Enums.GameState.Gifting){
            if (this.movingGifts.length == 0) {
                this.goForNextRound();
            }
        }
    }

    goForNextRound(){
        this.ManualBurn = false;
        this.CurrentGameState = Enums.GameState.Idle; 
    }


    //#endregion

    //#region Spark

    @property(cc.ParticleSystem)
    sparkleT: cc.ParticleSystem = null;

    @property(cc.ParticleSystem)
    sparkleL: cc.ParticleSystem = null;

    @property(cc.ParticleSystem)
    sparkleB: cc.ParticleSystem = null;

    @property(cc.ParticleSystem)
    sparkleR: cc.ParticleSystem = null;

    sparkAt(particle: cc.ParticleSystem, position: cc.Vec2){
        particle.node.setPosition(position.x, position.y);
        particle.resetSystem();
        this.scheduleOnce(()=>particle.stopSystem(), 1);
    }

    spark(cell: CellController){
        if (cell.CellState == Enums.CellState.Normal) {
            return;
        }

        if (cell.TopConnectedCell != null)
        {
            let position = new cc.Vec2(cell.node.position.x, cell.node.position.y + cell.node.height / 2);
            this.sparkAt(this.sparkleT, position);
        }
        if (cell.BottomConnectedCell != null)
        {
            let position = new cc.Vec2(cell.node.position.x, cell.node.position.y - cell.node.height / 2);
            this.sparkAt(this.sparkleB, position);
        }
        if (cell.LeftConnectedCell != null || (cell.Board_X == 0 && cell.LeftAntenna))
        {
            let position = new cc.Vec2(cell.node.position.x - cell.node.width/2, cell.node.position.y);
            this.sparkAt(this.sparkleL, position);
        }
        if (cell.RightConnectedCell != null || (cell.Board_X == Global.BOARD_COLUMN_COUNT - 1 && cell.RightAntenna))
        {
            let position = new cc.Vec2(cell.node.position.x + cell.node.width/2, cell.node.position.y);
            this.sparkAt(this.sparkleR, position);
        }
    }

    //#endregion

    //#region Cell Population

    cellMatrix: CellController[][] = null;
    freeCells: Array<CellController> = null;
    leftBorderDetected = false;
    rightBorderDetected = false;

    initCellMatrix(){
        // initialize matrix
        this.cellMatrix = new Array();
        for (let i = 0; i < Global.BOARD_ROW_COUNT; i++) {
            let row = new Array(Global.BOARD_COLUMN_COUNT);
            this.cellMatrix.push(row);
        }

        // generate cells
        this.freeCells = new Array<CellController>();
        for (let i = 0; i < (Global.BOARD_ROW_COUNT * Global.BOARD_COLUMN_COUNT); i++) {
            let cellNode = cc.instantiate(this.cellTemplate);
            this.cellMatrixLayer.addChild(cellNode);
            this.freeCells.push(cellNode.getComponent(CellController));
            cellNode.setPosition(0,0);
        }        
    }

    populateCells() : Array<CellController>{
        let cellsToAppend: Array<CellController> = null;

        //check for tutorial
        if (this.usePresets)
        {
            cellsToAppend = this.initTutorialCells();
        }
        else
        {
            cellsToAppend = new Array<CellController>();
        }

        let cell: CellController = null;
        let newcell: CellController = null;
        let connectionTree = new Array<CellController>();

        for (let i = 0; i < Global.BOARD_ROW_COUNT; i++)
        {
            for (let j = 0; j < Global.BOARD_COLUMN_COUNT; j++)
            {
                if (this.cellMatrix[i][j] != null)
                {
                    continue;
                }

                //get a random cell
                cell = this.pickUpCell(null, j, i);

                // to test if the cell is acceptable
                connectionTree.splice(0, connectionTree.length);
                this.leftBorderDetected = false;
                this.rightBorderDetected = false;
                this.getConnectionTree(cell, connectionTree);
                while (this.leftBorderDetected && this.rightBorderDetected)
                {
                    //deny the cell, loop until get a correct one
                    newcell = this.pickUpCell(cell, j, i);
                    if (newcell == cell)
                    {
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
    }

    /* 
    Get a random bubble by avoiding those denied CellTypes and Rotations. 
    Each time the 'deniedBubble' parameter is set null, this method forgets
    all the CellTypes and Rotations that has been denied so far and then 
    starts a new round of picking. So be sure to set the 'deniedBubble' parameter
    to null whenever a new round of picking is intended, and use a while loop 
    right after the method call to ask for a new random pick until you get one.
    For such examples, please refer to method 'PopulateBubbles()'.
    */
    deniedTypes = new Array<Enums.CellType>();
    deniedRotations = new Array<number>();

    pickUpCell(deniedCell: CellController, board_x: number, board_y:number) : CellController {
        let cellType = Enums.CellType.I;
        let rotation = 0;
        if (deniedCell == null)
        {
            //a new round of pick, give it a pure random
            cellType = this.pickUpCellType();
            rotation = this.pickUpRotation();
            this.deniedTypes.splice(0, this.deniedTypes.length);
            this.deniedRotations.splice(0, this.deniedRotations.length);
        }
        else if (this.deniedRotations.length == 4)//all rotations are denied, so let's pick another CellType
        {
            if (this.deniedTypes.length == 5)// all CellTypes and rotations have been tested, yet not successful
            {
                //can not find any acceptable bubble
                return deniedCell;
            }
            else
            {
                this.deniedTypes.push(deniedCell.CellType);
                cellType = this.pickUpCellType();
                while (this.deniedTypes.indexOf(cellType) > -1)
                {
                    cellType = this.pickUpCellType();
                }

                this.deniedRotations.splice(0, this.deniedRotations.length);
                rotation = this.pickUpRotation();
            }
        }
        else
        {
            this.deniedRotations.push(deniedCell.RotationQuarterCount);
            rotation = this.pickUpRotation();
            while (this.deniedRotations.indexOf(rotation) > -1)
            {
                rotation = this.pickUpRotation();
            }
        }
        
        let cell:CellController = null;
        if (deniedCell != null) {
            cell = deniedCell;
        }
        else{
            cell = this.freeCells.pop();
        } 

        cell.initCell(cellType, rotation, board_x, board_y);
        return cell;
    }
    
    cellTypePool = new Array<Enums.CellType>();
    initCellTypePool(){
        // clear the list
        this.cellTypePool.splice(0, this.cellTypePool.length);

        this.cellTypePool.push(Enums.CellType.Half);
        this.cellTypePool.push(Enums.CellType.I);
        this.cellTypePool.push(Enums.CellType.L);
        this.cellTypePool.push(Enums.CellType.T);
        this.cellTypePool.push(Enums.CellType.Cross);
        // this.cellTypePool.push(Enums.CellType.Unknown);
    }

    pickUpCellType() : Enums.CellType {
        //clear the pool
        this.cellTypePool.splice(0, this.cellTypePool.length);

        let crossCount = 0;
        let tCount = 0;
        let lCount = 0;
        let iCount = 0;
        let halfCount = 0;
        let unknownCount = 0;
        for (let rowOfCells of this.cellMatrix)
        {
            for (let cell of rowOfCells) {
                if (cell == null)
                {
                    continue;
                }
                if (cell.CellType == Enums.CellType.Cross)
                {
                    crossCount++;
                }
                else if (cell.CellType == Enums.CellType.T)
                {
                    tCount++;
                }else if (cell.CellType == Enums.CellType.L)
                {
                    lCount++;
                }
                else if (cell.CellType == Enums.CellType.I)
                {
                    iCount++;
                }
                else if (cell.CellType == Enums.CellType.Half)
                {
                    halfCount++;
                }
            }
        }

        if (crossCount < Global.MAX_CROSS_COUNT)
        {
            this.cellTypePool.push(Enums.CellType.Cross);
        }

        if (tCount < Global.MAX_T_COUNT)
        {
            this.cellTypePool.push(Enums.CellType.T);
        }

        if (lCount < Global.MAX_L_COUNT)
        {
            this.cellTypePool.push(Enums.CellType.L);
        }

        if (iCount < Global.MAX_I_COUNT)
        {
            this.cellTypePool.push(Enums.CellType.I);
        }

        if (halfCount < Global.MAX_HALF_COUNT)
        {
            this.cellTypePool.push(Enums.CellType.Half);
        }

        let idx = Math.floor(Math.random() * this.cellTypePool.length);
        return this.cellTypePool[idx];
    }

    pickUpRotation() : number {
        let rotation = Math.floor(Math.random() * 4);
        return rotation;
    }

    //#endregion

    //#region Cell Matrix Connection Tree

    circuitTree: Array<CellController> = new Array<CellController>();

    getConnectionTree(cell: CellController, connectionTree: Array<CellController>){
        connectionTree.push(cell);
        if (cell.Board_X == 0 && cell.LeftAntenna)
        {
            this.leftBorderDetected = true;
        }
        else if (cell.Board_X == (Global.BOARD_COLUMN_COUNT - 1) && cell.RightAntenna)
        {
            this.rightBorderDetected = true;
        }

        let connections = cell.GetConnections();
        if (connections.length > 0)
        {
            for (let connectedCell of connections)
            {
                if (connectionTree.indexOf(connectedCell) == -1)
                {
                    this.getConnectionTree(connectedCell, connectionTree);
                }
            }
        }
    }

    UpdateBoard(exceptFor : CellController = null) {
        let tempCellList = new Array<CellController>();
        if (exceptFor != null)
        {
            this.cellMatrix[exceptFor.Board_Y][exceptFor.Board_X] = null;
            this.abortHint();
        }

        for (let row of this.cellMatrix) {
            for (let cell of row){
                if (cell != null )
                {
                    tempCellList.push(cell);
                }
            }
        }

        while (tempCellList.length > 0)
        {
            let cell = tempCellList[0];
            if (cell == null)
            {
                continue;
            }
            let tree = new Array<CellController>();
            this.leftBorderDetected = false;
            this.rightBorderDetected = false;
            this.getConnectionTree(cell, tree);

            for (let node of tree)
            {
                node.SetState(this.leftBorderDetected, this.rightBorderDetected);
            }

            if (this.leftBorderDetected && this.rightBorderDetected)
            {
                this.circuitTree = tree;
                if (exceptFor == null) {
                    this.startHint();
                }
            }

            for (let node of tree)
            {
                tempCellList.splice(tempCellList.indexOf(node),1);
            }
        }

        if (exceptFor != null)
        {
            this.cellMatrix[exceptFor.Board_Y][exceptFor.Board_X] = exceptFor;
        }
    }

    //#endregion

    //#region Burn

    /* ManualBurn property is used to distinguish the manual burn (caused by Lightning) 
    and natural burn (caused by Cell rotation).
    If it is a Lightning burn, no Combo and Chain is counted. */
    
    ManualBurn: boolean = false;
    CellBurntByLigntning: CellController = null;

    setFire(tree: Array<CellController>){
        for (let cell of tree)
        {
            if (cell.Board_X == 0 && cell.LeftAntenna)//there must be at leat one cell connected to left power (or right power)
            {
                /* Initial fire, has no passingInFlame*/
                cell.Burn(this.electricEffect, Enums.Direction.Left, null);
                break;
            }
        }

        // Audio
        // (GamePage.Current as GamePage).PlayBurningSoundEffect();
    }

    setFireWithLightning(cell: CellController){
        this.ManualBurn = true;
        this.CellBurntByLigntning = cell;
        cell.Burn(this.electricEffect, Enums.Direction.Left, null);
    }

    stopFire(){
        this.electricEffect.ClearFlows();

        if (this.ManualBurn) {
            let tree = new Array<CellController>();
            this.getConnectionTree(this.CellBurntByLigntning, tree);
            for (let cell of tree) {
                let toRemove = cell.GetBurnt();
                if (toRemove) {
                    this.freeCells.push(cell);
                    this.cellMatrix[cell.Board_Y][cell.Board_X] = null;
                    cell.GetReadyForShow();
                }
            }

            this.CellBurntByLigntning = null;
        }
        else{
            for (let cell of this.circuitTree) {
                let toRemove = cell.GetBurnt();
                if (toRemove) {
                    this.freeCells.push(cell);
                    this.cellMatrix[cell.Board_Y][cell.Board_X] = null;
                    cell.GetReadyForShow();
                }
            }
            this.circuitTree.splice(0, this.circuitTree.length);
        }
    }

    //#endregion

    //#region Monster

    generateMonsters():Array<MonsterController>{
        let monsters = new Array<MonsterController>();

        // test
        let monsterNode = cc.instantiate(this.MonsterTemplate);
        let monster = monsterNode.getComponent(MonsterController);
        monster.InitMonster(Enums.MonsterType.Small);
        monsters.push(monster);
        this.MonsterLayer.addChild(monsterNode);

        return monsters;
    }

    populateMonsters():Array<MonsterController>{
        let newMonsters: Array<MonsterController> = new Array<MonsterController>();

        //check for tutorial
        if (this.usePresets)
        {
            newMonsters = this.initTutorialMonsters();
        }
        else
        {
            newMonsters = this.generateMonsters();

            //get empty cell in the first row
            let startingLine = new Array<CellController>();
            for (let col = 0; col < Global.BOARD_COLUMN_COUNT; col++)
            {
                let cell = this.cellMatrix[Global.BOARD_ROW_COUNT -1][col];
                if (cell.AttachedMonster == null)
                {
                    startingLine.push(cell);
                }
            }

            /* put new bugs into empty cells, until there's no more empty cells,
             * then give up */
            for (let monster of newMonsters)
            {
                if (startingLine.length <= 0)
                {
                    break;
                }

                let index = Math.floor(Math.random() * startingLine.length);
                monster.AttachToCell(startingLine[index]);
                monster.GetReadyForShow();
                startingLine.splice(index,1);
            }
        }

        return newMonsters;
    }

    removeMonster(monster: MonsterController){

    }

    restoreMonsters(){

    }

    WarnEscape(){
        this.EscapeWarning.runAction(
            cc.sequence(
                cc.fadeIn(Global.ESCAPE_WARNING_DURATION),
                cc.fadeOut(Global.ESCAPE_WARNING_DURATION),
                cc.fadeIn(Global.ESCAPE_WARNING_DURATION),
                cc.fadeOut(Global.ESCAPE_WARNING_DURATION)
            ));
    }

    //#endregion

    //#region Gift

    @property(cc.ParticleSystem)
    chargeLightning: cc.ParticleSystem = null;

    @property(cc.ParticleSystem)
    chargeBomb: cc.ParticleSystem = null;

    GiftQueue:Array<Enums.GiftType> = new Array<Enums.GiftType>();

    getGifts():Array<GiftController>{
        let gifts = new Array<GiftController>();

        //check for tutorial
        // // xxx test
        // this.usePresets = true;
        if (this.usePresets)
        {
            gifts = this.initTutorialGifts();
            // this.usePresets = false;
        }
        else
        {
            gifts = new Array<GiftController>();
            for (let giftType of this.GiftQueue)
            {
                let row = Math.floor(Math.random() * Global.BOARD_ROW_COUNT);
                let col = Math.floor(Math.random() * Global.BOARD_COLUMN_COUNT);
                let emptyCellFound = false;

                while (!emptyCellFound)
                {
                    let hasGift = this.cellMatrix[row][col].AttachedGift != null;
                    let hasMonster = this.cellMatrix[row][col].AttachedMonster != null;

                    if (hasGift || hasMonster)
                    {
                        row = Math.floor(Math.random() * Global.BOARD_ROW_COUNT);
                        col = Math.floor(Math.random() * Global.BOARD_COLUMN_COUNT);
                    }
                    else
                    {
                        emptyCellFound = true;
                    }
                }

                let cellToAttach = this.cellMatrix[row][col];
                let newGiftNode = cc.instantiate(this.GiftTemplate);
                this.giftLayer.addChild(newGiftNode);
                let gift = newGiftNode.getComponent(GiftController);
                gift.Init(giftType, cellToAttach);
                gifts.push(gift);
            }
            this.GiftQueue.splice(0, this.GiftQueue.length);
        }

        return gifts;
    }

    restoreGifts():Array<GiftController>{
        // foreach (var giftData in gameLevel.SavedGifts)
        // {
        //     Gift gift = new Gift(CurrentGamePage, giftData.GiftType, Bubbles[giftData.Board_Y, giftData.Board_X]);
        //     Gifts.Add(gift);
        //     CurrentGamePage.Components.Add(gift);
        //     gift.SetPosition(gift.WhereItShouldBe);
        // }

        return null;
    }

    initTutorialGifts():Array<GiftController>{
        let gifts = new Array<GiftController>();

        let cellToAttach = this.cellMatrix[3][2];
        let newGiftNode = cc.instantiate(this.GiftTemplate);
        this.giftLayer.addChild(newGiftNode);
        let gift = newGiftNode.getComponent(GiftController);
        gift.Init(Enums.GiftType.Bomb, cellToAttach);
        gifts.push(gift);

        return gifts;
    }

    ShowChargeEffect(type:Enums.GiftType, position: cc.Vec2){

        let particle:cc.ParticleSystem = this.chargeLightning;
        if (type == Enums.GiftType.Bomb) {
            particle = this.chargeBomb;
        }
        particle.node.setPosition(position.x, position.y);
        particle.resetSystem();
    }

    HideChargeEffect(type:Enums.GiftType){
        if (type == Enums.GiftType.Lightning) {
            this.chargeLightning.stopSystem();
        }else if (type == Enums.GiftType.Bomb) {
            this.chargeBomb.stopSystem();
        }
    }

    //#endregion

    //#region Chain

    ChainCount: number = 0;

    tryCongratulateChain()
    {
        if (this.ChainCount <= 0)
        {
            return;
        }

        /* Queue Bomb Award */
        for (let index = 0; index < this.ChainCount; index++) {
            this.GiftQueue.push(Enums.GiftType.Bomb);
        }

        /* Visual Congratulation */
        let congratulation = cc.instantiate(this.CongratulationTemplate);
        let controller = congratulation.getComponent(CongratulationController);
        controller.ShowAward(this.giftLayer, Enums.CongratulationType.Chain, this.ChainCount);

        this.ChainCount = 0;
    }

    triggeredBombs: GiftController[] = new Array<GiftController>();
    QueueTriggeredBomb(bomb: GiftController){
        this.triggeredBombs.push(bomb);
    }

    bombedCells: CellController[] = new Array<CellController>();
    ExplodingBomb: GiftController = null;

    startExplosionAt(bomb: GiftController) {
        this.ExplodingBomb = bomb;
        let bombCell: CellController = this.ExplodingBomb.attachedCell;
        this.BombExplosion.Show(bombCell);

        this.bombedCells = new Array<CellController>();

        //target cells on the horizontal
        for (let col = 0; col < Global.BOARD_COLUMN_COUNT; col++)
        {
            var target = this.cellMatrix[bombCell.Board_Y][col];
            if (target != null)//&& target != bombCell
            {
                this.bombedCells.push(target);
            }
        }

        //target cells on the vertical
        for (let row = 0; row < Global.BOARD_ROW_COUNT; row++)
        {
            var target = this.cellMatrix[row][bombCell.Board_X];
            if (target != null && target != bombCell)
            {
                this.bombedCells.push(target);
            }
        }

        for (let target of this.bombedCells)
        {
            target.Bomb();
        }
    }

    stopExplosion(){
        this.BombExplosion.Hide();
        for (let cell of this.bombedCells) {
            let toRemove = cell.GetBombed();
            if (toRemove) {
                this.freeCells.push(cell);
                this.cellMatrix[cell.Board_Y][cell.Board_X] = null;
                cell.GetReadyForShow();
            }
        }
        this.bombedCells.splice(0, this.bombedCells.length);
    }

    //#endregion

    //#region Combo

    monsterKilledInThisBurn: number = 0;

    CountMonsterKill(){
        this.monsterKilledInThisBurn ++;
    }

    tryCongratulateCombo(){
        if (!this.ManualBurn) {
            /* Queue Combo Award */
            if (this.monsterKilledInThisBurn <2){
                this.monsterKilledInThisBurn = 0;
                return;
            }
            else{
                this.GiftQueue.push(Enums.GiftType.Lightning);
            }

            /* Visual Congratulation */
            let congratulation = cc.instantiate(this.CongratulationTemplate);
            let controller = congratulation.getComponent(CongratulationController);
            controller.ShowAward(this.giftLayer, Enums.CongratulationType.Combo);
        }

        /* Reset for next round's counting */
        this.monsterKilledInThisBurn = 0;
    }

    //#endregion

    //#region Tutorial

    initTutorialCells() : Array<CellController> {
        return null;
    }

    initTutorialMonsters() : Array<MonsterController> {
        return null;
    }

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

    @property(cc.Label)
    Debug_Lable: cc.Label = null;

    Debug_CurrentGameState(){
        this.Debug_Lable.string = this.CurrentGameState.toString();
    }

    Debug_CellMatrix_Lookup(){

        this.UpdateBoard();

        this.Debug_Lable.string = "";
        for (let i = 0; i < Global.BOARD_ROW_COUNT; i++)
        {
            let str = "";
            for (let j = 0; j < Global.BOARD_COLUMN_COUNT; j++)
            {
                if (this.cellMatrix[i][j] == null)
                {
                    this.Debug_Lable.string += "[null]";
                    continue;
                }
                let cell = this.cellMatrix[i][j];
                str += "["+cell.CellType.toString() + " " + cell.RotationQuarterCount.toString()+"]";
            }
            str = str + "\n" + this.Debug_Lable.string;
            this.Debug_Lable.string = str;
        }
    }

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
