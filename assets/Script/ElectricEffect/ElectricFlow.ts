import ElectricNode from "./ElectricNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ElectricFlow extends cc.Component {

    //#region Properties

    // @property(cc.SpriteFrame)
    Texture: cc.SpriteFrame = null;

    ContainerNode: cc.Node = null;

    segments = 10;// defines how many dots(sprites) are generated between two electric nodes
    lifeSpan = 0.05;// LifeSpan controls the frequency of the texture switching
    age = 0; // count for lifeSpan
    speedFactor = 1.5;
    // originalSpriteWidth = 0;
    currentSpriteScale = 1;
    sprites: Array<cc.Sprite> = new Array<cc.Sprite>();
    eNodes: Array<ElectricNode> = new Array<ElectricNode>();

    //#endregion

    //#region Lifecycle

    // onLoad () {}

    /// xxx test
    addTestNode(){
        //this.clear();
        for (let index = 0; index < 10; index++) {
            let pos = new cc.Vec2(cc.random0To1() * 30 + 240, cc.random0To1() * 30 + 70 * index);
            let radius = Math.abs(Math.abs(index - 5) - 5) * 7;
            this.AddElectricNode(pos, radius);
        }
    }

    // update (dt) {}
    doUpdate (dt) {
        if (this.eNodes.length == 0) {
            return;
        }
        
        for (let enode of this.eNodes)
        {
            if (enode.belongToFlow = this) {
                enode.doUpdate(dt);
            }
        }

        this.drawCatmullRomCurve();

        if (this.age < this.lifeSpan)
        {
            this.age += dt;
        }
        else
        {
            this.reset()
        }
    }

    //#endregion
    
    Init(texture: cc.SpriteFrame, container: cc.Node){
        this.Texture = texture;
        this.ContainerNode = container;
    }

    reset(){
        this.age = 0;
        this.setRandomSize();
        this.lifeSpan = cc.random0To1() * 0.05 + 0.01;
    }

    setRandomSize(){
        // this.currentSpriteWidth = (cc.random0To1() + 1.0) * 0.5 * this.originalSpriteWidth;
        this.currentSpriteScale = cc.randomMinus1To1() * 0.5 +  1;
        for (const sprite of this.sprites) {
            sprite.node.setScale(this.currentSpriteScale,this.currentSpriteScale);
        }
    }

    AddElectricNode(p: cc.Vec2, r: number = 10 ): ElectricNode {
        let eNode = new ElectricNode();
        eNode.init(p, r, this.speedFactor);
        eNode.belongToFlow = this;
        this.eNodes.push(eNode);

        // fill in sprites if this added ElectricNode is NOT the first one in the flow
        if (this.eNodes.length>1) {
            for (let i = 0; i<this.segments; i++) {
                let particle = new cc.Node();
                let sprite = particle.addComponent(cc.Sprite);
                sprite.spriteFrame = this.Texture;
                sprite.dstBlendFactor = 1;//cc.BlendFactor.DST_ALPHA ;
                particle.setScale(this.currentSpriteScale, this.currentSpriteScale);
                this.ContainerNode.addChild(particle);
                this.sprites.push(sprite);
            }    
        }

        return eNode;
    }

    AddExistingElectricNode(existingNode: ElectricNode){
        this.eNodes.push(existingNode);

        // fill in sprites if this added ElectricNode is NOT the first one in the flow
        if (this.eNodes.length>1) {
            for (let i = 0; i<this.segments; i++) {
                let particle = new cc.Node();
                let sprite = particle.addComponent(cc.Sprite);
                sprite.spriteFrame = this.Texture;
                sprite.dstBlendFactor = 1;//cc.BlendFactor.DST_ALPHA ;
                particle.setScale(this.currentSpriteScale, this.currentSpriteScale);
                this.ContainerNode.addChild(particle);
                this.sprites.push(sprite);
            }    
        }
    }

    Clear(){
        this.eNodes.splice(0, this.eNodes.length);
        this.sprites.splice(0, this.sprites.length);
        this.ContainerNode.removeAllChildren();
    }

    //#region Curve

    catmullRom(t:number, P0:number, P1:number, P2:number, P3:number){
        return 0.5 * ((2 * P1) + 
               (-P0 + P2) * t +
               (2*P0 - 5*P1 + 4*P2 - P3) * Math.pow(t, 2) +
               (-P0 + 3*P1- 3*P2 + P3) * Math.pow(t, 3));
    }

    drawCatmullRomCurve(){
        if (this.eNodes.length == 0) {
            return;
        }
        
        let p0 = this.eNodes[0].position;
        let p1 = this.eNodes[0].position;
        let p2 = this.eNodes[0].position;
        let p3 = this.eNodes[0].position;
        
        let controlPointsCount = this.eNodes.length;
        let step = 1.0 / this.segments;
        
        for (let i = 2; i < controlPointsCount + 1; i++)
        {
            let idx = i >= controlPointsCount ? controlPointsCount - 1 : i;
            p0 = this.eNodes[idx].position;
            
            if (i >= 1)
            {
                idx = (i - 1) >= controlPointsCount ? controlPointsCount - 1 : (i - 1);
                p1 = this.eNodes[idx].position;
            }
            
            if (i >= 2)
            {
                idx = (i - 2) >= controlPointsCount ? controlPointsCount - 1 : (i - 2);
                p2 = this.eNodes[idx].position;
            }
            if (i >= 3)
            {
                idx = (i - 3) >= controlPointsCount ? controlPointsCount - 1 : (i - 3);
                p3 = this.eNodes[idx].position;
            }
            
            let amount = 0.0;
            let randomOpacity = cc.random0To1() * 128 + 128;
            for (let j = 0; j < this.segments; j++)
            {
                let pointX = this.catmullRom(amount, p0.x, p1.x, p2.x, p3.x);
                let pointY = this.catmullRom(amount, p0.y, p1.y, p2.y, p3.y);
                let sprite = this.sprites[(i - 2) * this.segments + j];
                sprite.node.setPosition(pointX,pointY);
                sprite.node.opacity = randomOpacity;
                amount += step;
            }
        }
    }

    //#endregion

    




}
