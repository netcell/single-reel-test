import * as PIXI from 'pixi.js'
import { InnerReel } from './InnerReel';
import { SYMBOL_ORDER } from './SymbolAssets';
import { PlayButton } from './PlayButton';

const reelBackgroundImage     = require('../assets/reel.png');
const winBackgroundImage      = require('../assets/win_bg.png');
const playButtonImage         = require('../assets/play.png')
const playButtonDisabledImage = require('../assets/play_disabled.png')

export class Reel extends PIXI.Container {
    /**
     * The moving reel
     */
    private innerReel: InnerReel;
    private playButton: PlayButton;
    private background: PIXI.Sprite;
    private winBackgrounds: Array<PIXI.Sprite>;

    get SYMBOL_CONTAINER_SIZE() {
        return this.background.width - this.BACKGROUND_PADDING * 2;
    }

    constructor(
        /**
         * The size of the background image edges
         */
        private BACKGROUND_PADDING: number = 6,
    ) {
        super();

        new PIXI.loaders.Loader()
            .add('backgroundImage',         reelBackgroundImage    )
            .add('winBackgroundImage',      winBackgroundImage     )
            .add('playButtonImage',         playButtonImage        )
            .add('playButtonDisabledImage', playButtonDisabledImage)
            .load(this.handleResourceLoaded);
    }

    public disable() {
        this.playButton.disable();
    }

    private handleResourceLoaded = (loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        /**
         * The background of the reel
         */
        this.background = new PIXI.Sprite(resources.backgroundImage.texture);
        this.background.position.set(0, 0);
        this.addChild(this.background);
        /**
         * Creates 3 win background image each which will be displayed
         * if the symbol at that slot is a repeated symbol
         */
        this.winBackgrounds = [0, 1, 2].map(this.createWinBackgroundsCreator(resources));

        /**
         * The inner rolling container for symbols
         */
        this.innerReel = this.createInnerReel();

        this.playButton = this.createPlayButton(resources);
        /** Click to spin */
        this.playButton.on('pointerup', this.innerReel.spin);
        /** Hanlde spin start and finish */
        this.innerReel.on('started', this.onSpin, this);
        this.innerReel.on('finished', this.onFinish, this);
        this.innerReel.on('quickstop', this.playButton.stopSpin, this.playButton);
        
        this.pivot.set(
            this.background.width/2, 
            this.background.height/2,
        );
    }
    /**
     * On spin finished, display win backgrounds and animate the symbols
     * Dispatch `win` event for the UI to display
     */
    private onFinish() {
        const matches = this.innerReel.getMatches();
        this.playButton.stopSpin();
        if (matches) {
            matches.symbolIndexes.forEach(index => {
                this.winBackgrounds[index].visible = true;
            })
            matches.symbolContainers.forEach(symbolContainer => {
                symbolContainer.animate();
            })
            this.emit("win", matches.amountOfRepeats);
        } else {
            this.emit("lose");
        }
    }
    /**
     * On spin started, hide all win backgrounds
     * Dispatch `spin` event to display
     */
    private onSpin() {
        this.winBackgrounds.forEach(winBackground => {
            winBackground.visible = false;
        });
        this.playButton.spin();
        this.emit("spin");
    }
    /**
     * Create the play button which activate spins and quick stop
     */
    private createPlayButton(resources: PIXI.loaders.ResourceDictionary) {
        const background = this.background;

        const playButton = new PlayButton(
            resources.playButtonImage.texture,
            resources.playButtonDisabledImage.texture,
        );
        playButton.position.set(background.width/2, background.height + 50);
        this.addChild(playButton);

        return playButton;
    }
    /**
     * Create the win backgrounds which are displayed on spin finished
     * Generate the function to create the win background at specific position
     */
    private createWinBackgroundsCreator(resources: PIXI.loaders.ResourceDictionary) {
        const BACKGROUND_PADDING = this.BACKGROUND_PADDING;
        const SYMBOL_CONTAINER_SIZE = this.SYMBOL_CONTAINER_SIZE;
        /**
         * Create the win background for slot at `index` position
         */
        return index => {
            const winBackground = new PIXI.Sprite(resources.winBackgroundImage.texture);
            winBackground.position.set(
                BACKGROUND_PADDING,
                SYMBOL_CONTAINER_SIZE * index + BACKGROUND_PADDING,
            );
            winBackground.visible = false;
            this.addChild(winBackground);
            return winBackground;
        }
    }
    /**
     * Create the inner reel which contains all the symbols and roll
     */
    private createInnerReel() {
        const background = this.background;
        const BACKGROUND_PADDING = this.BACKGROUND_PADDING;
        const SYMBOL_CONTAINER_SIZE = this.SYMBOL_CONTAINER_SIZE;

        const innerReel = new InnerReel(
            SYMBOL_ORDER,
            SYMBOL_CONTAINER_SIZE,
            BACKGROUND_PADDING,
        );
        innerReel.position.set(BACKGROUND_PADDING, BACKGROUND_PADDING);
        this.addChild(innerReel);
        /**
         * The mask that cover the innerReel to hide out of view symbols
         */
        const mask = this.createMaskWithPadding(background.width, background.height, BACKGROUND_PADDING);
        innerReel.mask = mask;
        this.addChild(mask);

        return innerReel;
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