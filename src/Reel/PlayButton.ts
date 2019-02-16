import * as PIXI from 'pixi.js'
import { TweenLite, TweenMax, Linear } from 'gsap';

export class PlayButton extends PIXI.Sprite {
    private spinTween: TweenLite;

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

    public spin() {
        this.spinTween = TweenMax.to(this, 0.5, {
            rotation: 2 * Math.PI,
            repeat: -1,
            ease: Linear.easeNone,
        })
    }

    public stopSpin() {
        this.spinTween && this.spinTween.kill();
        this.spinTween = TweenMax.to(this, 0.5, {
            rotation: 0,
        })
    }

    public enable() {
        this.interactive = true;
        this.buttonMode = true;
        this.texture = this.enabledTexture;
    }
    public disable() {
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