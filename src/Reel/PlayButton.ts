import * as PIXI from 'pixi.js'
import { TweenLite, TimelineLite } from 'gsap';

export class PlayButton extends PIXI.Sprite {
    constructor(
        private enabledTexture: PIXI.Texture,
        private disabledTexture: PIXI.Texture,
    ) {
        super();

        this.anchor.set(0.5);
        this.enable();

        this.on('pointerover', this.handleMouseOver, this)
        this.on('pointerout', this.hanldeMouseOut, this)
        this.on('pointerdown', this.handleMouseOver, this)
        this.on('pointerup', this.hanldeMouseOut, this)
    }

    enable() {
        this.interactive = true;
        this.buttonMode = true;
        this.texture = this.enabledTexture;
    }
    disable() {
        this.interactive = false;
        this.buttonMode = false;
        this.texture = this.disabledTexture;
    }

    private handleMouseOver() {
        if (!this.interactive) return;
        TweenLite.to(this.scale, 0.2, {
            x: 1.2,
            y: 1.2,
        })
    }

    private hanldeMouseOut() {
        TweenLite.to(this.scale, 0.2, {
            x: 1,
            y: 1,
        })
    }
}