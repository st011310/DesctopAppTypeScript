import {CST} from "../CST"
import patblast from "@/assets/sprites/patblast.png"
import rattack1 from "@/assets/sprites/rattack1.png"
import rattack2 from "@/assets/sprites/rattack2.png"
import rattack3 from "@/assets/sprites/rattack3.png"


export class LoadScene extends Phaser.Scene{
    constructor(){
        super({
            key: CST.SCENES.LOAD
        })
    }
    init(){

    }

    loadImage(){
        this.load.setPath("./src/assets/image");

        for (let prop in CST.IMAGE){
            this.load.image(CST.IMAGE[prop], CST.IMAGE[prop]);
        }
    }

    loadSprites32x16(frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig){
        this.load.setPath("./src/assets/sprites");

        for (let prop in CST.SPRITES32x16){
            this.load.spritesheet(CST.SPRITES32x16[prop], CST.SPRITES32x16[prop], frameConfig);
        }
    }

    loadSprites32x12(frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig){
        this.load.setPath("./src/assets/sprites");

        for (let prop in CST.SPRITES32x12){
            this.load.spritesheet(CST.SPRITES32X12[prop], CST.SPRITES32X12[prop], frameConfig);
        }
        this.load.setPath("./");
    }

    preload(){
        this.loadImage();
        this.loadSprites32x16({
            frameHeight: 16,
            frameWidth: 32
        });
        this.loadSprites32x12({
            frameHeight: 12,
            frameWidth: 32
        });
        // this.load.image("meme", meme)
        this.load.spritesheet("patblast", patblast, {
            frameHeight: 32,
            frameWidth: 32
        })
        // this.load.image("logo", logo)
        // this.load.image("1pt", pt1)
        // this.load.image("2pt", pt2)
        // this.load.image("3pt", pt3)
        // this.load.image("play", play)

        let loadingBar = this.add.graphics({
            fillStyle:{
                color: 0xffffff
            }
        })

        this.load.on("progress", (percent: number)=>{
            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
            console.log(percent);
        })

        this.load.on("load", (file: Phaser.Loader.File)=>{
            console.log(file.src)
        })

        this.load.on("complete", ()=>{
            console.log("READY!")
            this.scene.start(CST.SCENES.MENU);
        })
    }
    create(){
    }
}