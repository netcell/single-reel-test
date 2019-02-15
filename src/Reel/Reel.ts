import * as PIXI from 'pixi.js'
import { InnerReel } from './InnerReel';
import { SYMBOL_ORDER } from './SymbolAssets';

const reelBackgroundImage     = require('../assets/reel.png');

export class Reel extends PIXI.Container {
    /**
     * The moving reel
     */
    public innerReel: InnerReel;

    constructor(
        /**
         * The size of the background image edges
         */
        private BACKGROUND_PADDING: number = 6,
    ) {
        super();

        new PIXI.loaders.Loader()
            .add('backgroundImage', reelBackgroundImage)
            .load(this.handleResourceLoaded);
    }

    private handleResourceLoaded = (loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        const BACKGROUND_PADDING = this.BACKGROUND_PADDING;
        /**
         * The background of the reel
         */
        const background = new PIXI.Sprite(resources.backgroundImage.texture);
        background.position.set(0, 0);
        this.addChild(background);
        /**
         * The inner rolling container for symbols
         */
        this.innerReel = new InnerReel(
            SYMBOL_ORDER,
            background.width - BACKGROUND_PADDING * 2,
            BACKGROUND_PADDING
        );
        this.innerReel.position.set(BACKGROUND_PADDING, BACKGROUND_PADDING);
        this.addChild(this.innerReel);
        /**
         * The mask that cover the innerReel to hide out of view symbols
         */
        const mask = this.createMaskWithPadding(background.width, background.height, BACKGROUND_PADDING);
        this.innerReel.mask = mask;
        this.addChild(mask);
        
        this.pivot.set(
            background.width/2, 
            background.height/2,
        );
    }
    /**
     * Create a rectangle mask to cover the innerReel
     */
    private createMaskWithPadding(
        width: number,
        height: number,
        padding: number,
    ): PIXI.Graphics {
        const mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF);
        mask.drawRect(
            padding, 
            padding, 
            width - padding * 2, 
            height - padding * 2,
        );
        mask.endFill();
        return mask;
    }
}