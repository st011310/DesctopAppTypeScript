import {CST} from "../CST";
import {Bullet} from "@/game/bullet";
import {Blast} from "@/game/blast";
import {AssetManager} from "@/game/managers/assetManager";
import {EnemyBullet} from "@/game/enbullet";
import {RaiderManager} from "@/game/managers/raiderManager";
import {Anims} from "@/game/anims";
import {Raider2} from "@/game/raider2";
import {ScoreManager} from "@/game/managers/scoreManager";
import {GameState} from "@/game/scenes/states";

export class PlayScene extends Phaser.Scene{
    state: GameState
    assman: AssetManager
    raidman: RaiderManager
    animer: Anims
    scoreman: ScoreManager
    firingTimer = 0;
    bulletTime = 0;
    keyboard: {[index: string]: Phaser.Input.Keyboard.Key};
    player!: Phaser.Physics.Arcade.Sprite;
    patblast!: Phaser.Physics.Arcade.Group;
    fire!: Phaser.Input.Keyboard.Key;


    constructor(){
        super({
            key: CST.SCENES.PLAY});
    }
    preload(){
        this.anims.create({
            key: "playerdead",
            frameRate: 15,
            repeat: 3,
            frames: this.anims.generateFrameNumbers(CST.SPRITES32x16.PLAYER, {
                frames: [1, 2]
            }),
        });

        this.anims.create({
            key: "patblast",
            frameRate: 5,
            repeat: 0,
            frames: this.anims.generateFrameNumbers("patblast", {
                frames: [0, 1]
            })

        });

        this.anims.create({
            key: "r3move",
            frameRate: 1,
            repeat: -1,
            frames: this.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDER3, {
                frames: [0, 1]
            })
        });

        // this.anims.create({
        //     key: "r2shoot",
        //     frameRate: 15,
        //     repeat: -1,
        //     frames: this.anims.generateFrameNumbers(CST.SPRITES32X12.RATTACK2, {
        //         frames: [0, 1, 2, 3]
        //     })
        // });

        this.anims.create({
            key: "r2move",
            frameRate: 1,
            repeat: -1,
            frames: this.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDER2, {
                frames: [0, 1]
            })
        });

        this.anims.create({
            key: "r1move",
            frameRate: 1,
            repeat: -1,
            frames: this.anims.generateFrameNumbers(CST.SPRITES32x16.RAIDER1, {
                frames: [0, 1]
            })
        });
    }
    create(){
        this.state = GameState.Playing;
        this.assman= new AssetManager(this);
        this.raidman = new RaiderManager(this);
        this.animer = new Anims(this)
        this.scoreman = new ScoreManager(this)
        this.add.image(this.game.renderer.width / 2 - 225, this.game.renderer.height / 2 - 350, CST.IMAGE.SCORE).setScale(0.30);
        this.player = this.physics.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2 + 300, CST.SPRITES32x16.PLAYER).setOrigin(0, 0).setScale(1.5);

        this.keyboard = this.input.keyboard.createCursorKeys();
        this.fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.player.setCollideWorldBounds(true);

        this.fire.on("down", () => {
            switch (this.state) {
                case GameState.Win:
                case GameState.GameOver:
                    this.restart();
                    break;
            }
        })
        this.raidman.reset();
    }

    update(time: number, delta: number){
        if (this.time.now > this.firingTimer) {
            this.enshoot();
        }

        if(this.keyboard.left.isDown){
            this.player.setVelocityX(-200)
        }

        else if(this.keyboard.right.isDown){
            this.player.setVelocityX(200)
        }

        else if(this.keyboard.down.isDown){
            this.assman.bullets.setVelocityY(0)
        }

        else {
            this.player.setVelocityX(0)
            this.player.setFrame(0)
        }

        if (this.fire.isDown){
            this.pshoot();
        }

        this.physics.overlap(
            this.assman.bullets,
            this.raidman.raiders,
            this.hitRaider,
            null,
            this
        );
        this.physics.overlap(
            this.assman.enemyBullets,
            this.player,
            this.hitPlayer,
            null,
            this
        );
    }

    // private patWall(bullet: Bullet){
    //     bullet.setVelocityY(0);
    //     console.log("До стены долетела, и...");
    //     let boom: Blast = this.assman.explosions.get();
    //     boom.setPosition(bullet.x, bullet.y + 7);
    //     bullet.destroy();
    //     boom.play("patblast");
    //     this.plazer = false;
    // }

    private pshoot(){
        if (!this.player.active) {
            return;
        }

        if (this.time.now > this.bulletTime){
            let lazer: Bullet = this.assman.bullets.get().setScale(0.60)
            if(lazer){
                lazer.shoot(this.player.x + 24.2, this.player.y + 5);
                this.bulletTime = this.time.now + 1000;
            }
        }
    }

    private enshoot(){
        if (!this.player.active) {
            return;
        }
        let enBullet: EnemyBullet = this.assman.enemyBullets.get();
        // enBullet.play("r2shoot")
        let randomEnemy = this.raidman.getRandomAliveEnemy();
        if (enBullet && randomEnemy) {
            enBullet.setPosition(randomEnemy.x, randomEnemy.y);
            enBullet.setVelocityY(200)
            this.firingTimer = this.time.now + 2750;
        }
    }

    private hitRaider(bullet: Bullet, alien: Raider2){
        let explosion: Blast = this.assman.explosions.get();
        bullet.kill()
        alien.kill(explosion);
        this.scoreman.increaseScore();
        this.raidman.killed += 1;
        if (this.raidman.hasAliveRaiders){
            this.scoreman.setWinText();
            this.assman.gameOver();
            this.state = GameState.Win;
        }
    }

    private hitPlayer(ship, enemyBullet: EnemyBullet) {
        // let explosion: Blast = this.assman.explosions.get();
        enemyBullet.kill();
        let live: Phaser.GameObjects.Sprite = this.scoreman.lives.getFirstAlive();
        if (live) {
            live.setActive(false).setVisible(false);
        }

        // explosion.setPosition(this.player.x, this.player.y);
        this.player.play("playerdead")
        // this.sound.play(SoundType.Kaboom)
        if (this.scoreman.noMoreLives) {
            this.scoreman.setGameOverText();
            this.assman.gameOver();
            this.state = GameState.GameOver;
            this.player.disableBody(true, true);
        }

    }

    restart() {
        if (this.state == GameState.GameOver){
            this.scoreman.setHighScore(this.state);
            console.log(this.scoreman.highScore, ' - is the hi-score')
            this.player.enableBody(true, this.player.x, this.player.y, true, true);
            this.scoreman.resetLives();
        }
        this.state = GameState.Playing;
        this.scoreman.setHighScore(this.state);
        this.scoreman.hideText();
        this.raidman.reset();
        this.assman.reset();
    }
}