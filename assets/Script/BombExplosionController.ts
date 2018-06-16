import CellController from "./CellController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BombExplosionController extends cc.Component {

    @property(cc.Sprite)
    ExplosionH: cc.Sprite = null;

    @property(cc.Sprite)
    ExplosionV: cc.Sprite = null;

    @property(cc.AudioSource)
    ExplosionAudio: cc.AudioSource = null;

    onLoad () {
        // this.ExplosionH.enabled = false;
        // this.ExplosionV.enabled = false;
        this.node.opacity = 0;
    }

    update (dt) {
        if (this.flashing) {
            this.falsh_elapse_time += dt;
            if (this.falsh_elapse_time > this.BOMB_FLASH_INTERVAL) {
                this.flashNew();
                this.falsh_elapse_time = 0;
            }
        }
    }

    Show(cell: CellController){
        // this.ExplosionH.enabled = true;
        // this.ExplosionV.enabled = true;
        this.node.opacity = 255;

        this.ExplosionH.node.setPosition(320,cell.node.position.y);
        this.ExplosionV.node.setPosition(cell.node.position.x,480);
        
        this.flash_count = 0;
        this.flashing = true;
        // this.flash();

        this.ExplosionAudio.play();
    }

    flash_count: number = 0;
    BOMB_FLASH_SCALE:number = 0.8;
    BOMB_FLASH_INTERVAL: number = 0.05;
    falsh_elapse_time: number = 0;
    flashing: boolean = false;
    flash(){
        if (this.flashing) {
            this.flash_count++;
            let scale = (this.flash_count % 2) == 0 ? 1 : this.BOMB_FLASH_SCALE;
            this.ExplosionH.node.scaleY = scale;
            this.ExplosionV.node.scaleY = scale;
            this.scheduleOnce(
                ()=>{
                    this.flash();
                },this.BOMB_FLASH_INTERVAL);
        }
        // else{
        //     this.flash_count = 0;
        //     this.Hide();
        // }
    }

    flashNew(){
        this.flash_count++;
        let scale = (this.flash_count % 2) == 0 ? 1 : this.BOMB_FLASH_SCALE;
        this.ExplosionH.node.scaleY = scale;
        this.ExplosionV.node.scaleY = scale;
    }

    Hide(){
        this.flashing = false;
        this.node.opacity = 0;
        // this.ExplosionH.enabled = false;
        // this.ExplosionV.enabled = false;
    }

}
