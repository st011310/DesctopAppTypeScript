import {CST} from "@/game/CST";

export enum AnimationType {
    Fly3 = "fly3",
    Fly2 = "fly2",
    Fly1 = "fly1",
    RaidDead = "raiddead"
}

export class Anims {
    constructor(private _scene: Phaser.Scene) {
        this._init();
    }

    private _init() {
        this._scene.anims.create({
            key: AnimationType.Fly3,
            frames: this._scene.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDER3, {
                frames: [0, 1]
            }),
            frameRate: 1,
            repeat: -1
        });

        this._scene.anims.create({
            key: AnimationType.Fly2,
            frames: this._scene.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDER2, {
                start: 0,
                end: 1
            }),
            frameRate: 1,
            repeat: -1
        });

        this._scene.anims.create({
            key: AnimationType.Fly1,
            frames: this._scene.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDER1, {
                start: 0,
                end: 1
            }),
            frameRate: 1,
            repeat: -1
        });

        this._scene.anims.create({
            key: AnimationType.RaidDead,
            frames: this._scene.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDERDEAD, {
                start: 0,
                end: 1
            }),
            frameRate: 5,
            repeat: 0,
            hideOnComplete: true
        })
    }
}