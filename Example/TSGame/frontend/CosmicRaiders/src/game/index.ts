import Phaser from 'phaser'
import {LoadScene} from "./scenes/LoadScene"
import {MenuScene} from "./scenes/MenuScene"
import {PlayScene} from "./scenes/PlayScene"

export const getGame = () =>
  new Phaser.Game({
    title: 'Cosmic Raiders',
    type: Phaser.AUTO,
    width: 672,
    height: 768,
    // backgroundColor: 'white',
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true,
        gravity: { y: 0 }
      }
    },
    render: {
      pixelArt: true
    },
    // autoFocus: true,
    scale: {
      parent: 'app'
    },
    // scene: [new VueScene()]
      scene: [LoadScene, MenuScene, PlayScene]
  })
