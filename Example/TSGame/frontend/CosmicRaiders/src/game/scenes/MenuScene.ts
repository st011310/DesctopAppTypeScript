import {CST} from "../CST"

export class MenuScene extends Phaser.Scene{
    constructor(){
        super({
            key: CST.SCENES.MENU
        })
    }
    init(){
    }

    create(){
        // this.add.text(this.game.renderer.width / 2 - 200, this.game.renderer.height / 2 - 250, "Cosmic Raiders",
        //     {fontSize: 20,
        //     fontFamily: 'CRfont'})
        this.add.image(this.game.renderer.width / 2 - 225, this.game.renderer.height / 2 - 250, CST.IMAGE.LOGO).setOrigin(0, 0).setScale(0.55)
        this.add.sprite(this.game.renderer.width / 2 - 150, this.game.renderer.height / 2 - 100, CST.SPRITES32x16.RAIDER3).setOrigin(0, 0).setScale(1.5)
        this.add.image(this.game.renderer.width / 2 - 85, this.game.renderer.height / 2 - 100, CST.IMAGE.PT3).setOrigin(0, 0).setScale(0.35)

        this.add.sprite(this.game.renderer.width / 2 - 152, this.game.renderer.height / 2 - 50, CST.SPRITES32x16.RAIDER2).setOrigin(0, 0).setScale(1.5)
        this.add.image(this.game.renderer.width / 2 - 85, this.game.renderer.height / 2 - 50, CST.IMAGE.PT2).setOrigin(0, 0).setScale(0.35)

        this.add.sprite(this.game.renderer.width / 2 - 151, this.game.renderer.height / 2 - 1, CST.SPRITES32x16.RAIDER1).setOrigin(0, 0).setScale(1.5)
        this.add.image(this.game.renderer.width / 2 - 85, this.game.renderer.height / 2, CST.IMAGE.PT1).setOrigin(0, 0).setScale(0.35)

        let start = this.add.image(this.game.renderer.width / 2 - 40, this.game.renderer.height / 2 + 200, CST.IMAGE.START).setOrigin(0, 0).setScale(0.35)
        let startsprite = this.add.sprite(this.game.renderer.width / 2 - 90, this.game.renderer.height / 2 + 203, CST.SPRITES32x16.PLAYER).setOrigin(0, 0)
        startsprite.setVisible(false)
        start.setInteractive();

        start.on("pointerover", ()=>{
            startsprite.setVisible(true)
            console.log("He's gonna press it!")
        })

        start.on("pointerout", ()=>{
            startsprite.setVisible(false)
            console.log("...Or not.")
        })

        start.on("pointerup", ()=>{
            console.log("Start the game! REPEAT - START THE BLOODY GAME!")
            this.scene.start(CST.SCENES.PLAY)
        })
    }
}