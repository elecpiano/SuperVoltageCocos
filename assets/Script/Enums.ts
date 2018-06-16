
// declare enum CellState{
export enum CellState{    
    Normal=0,
    LeftBorderConnected=1,
    RightBorderConnected=2,
    Hint=3,
    Burnt=4
}

export enum GameState{
    Idle = "Idle",
    Hint = "Hint",
    Burning = "Burning",
    Bombing = "Bombing",
    Dropping = "Dropping",
    Filling = "Filling",
    Chain = "Chain",
    MonsterMoving = "MonsterMoving",
    Gifting = "Gifting"
}

export enum CellType{
    Half = "H",
    I = "i",
    L = "L",
    T = "T",
    Cross = "X"
    // Unknown = 5
}

export enum Direction{
    Top,
    Left,
    Bottom,
    Right
}

export enum GiftType{
    Lightning,
    Bomb
}

export enum CongratulationType{
    Combo,
    Chain
}

export enum MonsterType{
    Small = "S",/* each time moves one step vertically */
    Drunk = "D",/* each time moves one step vertically, and one step horizontally*/
    Fast = "F", /* each time moves two steps vertically */
    Large_2 = "L2", /* each time moves one step vertically,
                * when shocked for the first time, turns into a Large_1 bug, 
                * and the cell below will NOT get burnt */
    Large_1 = "L1", /* each time movew one step vertically*/
    Queen = "Q", /* each time moves one steps vertically, and one step horizontally,
                * when socked for the first time, turns into a random bug of Samll, Drunk, Fast or Large, 
                * and the cell below will NOT get burnt */
    King_2 = "K2", /* each time moves two steps vertically, and one step horizontally,
                * when socked for the first time, turns into a King_1 bug, 
                * and the cell below will NOT get burnt */
    King_1 = "K1" /* each time moves two steps vertically, and one step horizontally */
    
}
