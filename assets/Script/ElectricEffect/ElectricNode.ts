import ElectricFlow from "./ElectricFlow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ElectricNode extends cc.Component {

    //#region Properties

    position: cc.Vec2 = null;
    fiducialPoint: cc.Vec2 = null;
    radius = 0;
    velocity: cc.Vec2 = null;
    speedFactor = 1;
    belongToFlow: ElectricFlow = null;

    //#endregion

    //#region Initialization

    init(p: cc.Vec2, r: number, sf: number){
        this.position = p;
        this.fiducialPoint = p;
        this.radius = r;
        this.speedFactor = sf;

        this.reset();
    }

    //#endregion

    //#region update

    doUpdate (dt) {
        // if (this.movementX < this.targetX && this.movementY < this.targetY && this.movementTime < this.movementDuration) {
        if (this.movementTime < this.movementDuration) {
            let fraction = dt/this.movementDuration;
            let deltaX = this.velocity.x * fraction;
            let deltaY = this.velocity.y * fraction;
            this.position = new cc.Vec2(this.position.x + deltaX, this.position.y + deltaY);

            this.movementTime += dt;
        }
        else{
            this.reset();
        }
    }

    //#endregion

    //#region movement

    velocityMin = 1.0;
    movementTime = 0;
    movementDuration = 0;
    targetX = 0;
    targetY = 0;
    // movementX = 0;
    // movementY = 0;

    reset(){
        // reset position
        this.position = this.fiducialPoint;

        // random angle
        let radian = cc.randomMinus1To1() * Math.PI;

        // target point
        this.targetX = this.radius * Math.cos(radian);
        this.targetY = this.radius * Math.sin(radian);

        // velocity
        let speedToDistance = (cc.random0To1() + this.velocityMin) * this.speedFactor;
        let velocityX = speedToDistance * this.targetX;
        let velocityY = speedToDistance * this.targetY;
        this.velocity = new cc.Vec2(velocityX, velocityY);

        //duration
        this.movementDuration = 1 / speedToDistance;
        this.movementTime = 0;
    }

    //#endregion

}
