import { Raider1 } from "../raider1";
import { Raider2} from "@/game/raider2";
import {Raider3} from "@/game/raider3";
import {AnimationType} from "@/game/anims";


export class RaiderManager {
    raiders: Phaser.Physics.Arcade.Group;
    speed = 0.05;
    killed = 0;


    get hasAliveRaiders(): boolean {
        return !this.raiders.children.size
    }

    constructor(private _scene: Phaser.Scene) {
        this.raiders = this._scene.physics.add.group({
            maxSize: 40,
            classType: Raider2,
            runChildUpdate: true
        });
        this.raiders.setOrigin(0, 0)
        this._sortAliens();
        // this._animate();
    }

    getRandomAliveEnemy(): Raider2 {
        let random = Phaser.Math.RND.integerInRange(1, this.raiders.children.size);
        let aliens = this.raiders.children.getArray() as Raider2[];
        return aliens[random];
    }

    reset() {
        this._sortAliens();
        // this._animate();
    }

    private _sortAliens() {
        let ORIGIN_X = 120;
        let ORIGIN_Y = 150;
        this.raiders.clear(true, true);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 10; x++) {
                if (y < 1) {
                    let alien: Raider3 = this.raiders.create(ORIGIN_X + x * 48, ORIGIN_Y + y * 50).setOrigin(0.5, 0.5);
                    alien.setScale(1.5)
                    alien.play(AnimationType.Fly3)
                    alien.setImmovable(false);
                }
                else if (y < 3) {
                    let alien: Raider2 = this.raiders.create(ORIGIN_X + x * 48, ORIGIN_Y + y * 50).setOrigin(0.5, 0.5);
                    alien.setScale(1.5)
                    alien.play(AnimationType.Fly2)
                    alien.setImmovable(false);
                }
                else {
                    let alien: Raider1 = this.raiders.create(ORIGIN_X + x * 48, ORIGIN_Y + y * 50).setOrigin(0.5, 0.5);
                    alien.setScale(1.5)
                    alien.play(AnimationType.Fly1)
                    alien.setImmovable(false);
                }
            }
        }
    }
}
