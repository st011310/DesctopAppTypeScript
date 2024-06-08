// noinspection JSAnnotator

import { CST} from "./CST";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, CST.SPRITES32X12.PATTACK);
    }

    shoot(x: number, y: number) {
        // this.scene.sound.play(SoundType.Shoot)
        this.setPosition(x, y);
        this.setVelocityY(-500);
    }

    kill() {
        this.destroy();
    }
}