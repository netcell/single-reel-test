import * as PIXI from 'pixi.js'
import { TimelineLite } from 'gsap';

export class SymbolContainer extends PIXI.Container {
    /**
     * The actual symbol sprite
     */
    symbol: PIXI.Sprite

    constructor(
        private texture: PIXI.Texture,
        /**
         * The size of the symbol container (square)
         */
        size: number,
    ) {
        super();

        this.width = size;
        this.height = size;
        
        this.symbol = new PIXI.Sprite(texture);
        this.symbol.position.set(size/2, size/2);
        this.symbol.anchor.set(0.5);
        this.addChild(this.symbol);
    }
    /**
     * Animate when win
     */
    animate(delay: number = 0) {
        new TimelineLite()
        .to(this.symbol.scale, 0.5, {
            x: 1.3,
            y: 1.3,
            delay
        })
        .to(this.symbol, 0.25, {
            rotation: Math.PI/6,
            delay
        }, 0)
        .to(this.symbol, 0.25, {
            rotation: -Math.PI/6,
            delay
        }, 0.25)
        .to(this.symbol, 0.25, {
            rotation: 0,
            delay
        }, 0.5)
        .to(this.symbol.scale, 0.5, {
            x: 1,
            y: 1
        }, 0.5)
        
    }
}