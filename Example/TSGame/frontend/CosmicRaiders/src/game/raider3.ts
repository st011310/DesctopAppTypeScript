// noinspection JSAnnotator

import { CST } from "./CST";
import { Blast } from "./blast";
import {AnimationType} from "@/game/anims";

export class Raider3 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, CST.SPRITES32x16.RAIDER3)
    }

    kill(explosion: Blast) {
        if (explosion) {
            explosion.setX(this.x);
            explosion.setY(this.y);
            explosion.play(AnimationType.RaidDead)
            // this.scene.sound.play(SoundType.InvaderKilled)
        }
        this.destroy();
    }
}