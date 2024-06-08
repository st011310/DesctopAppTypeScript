// noinspection JSAnnotator

import {CST} from "@/game/CST";

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, CST.SPRITES32X12.PATTACK);
    }

    kill() {
        this.destroy();
    }
}