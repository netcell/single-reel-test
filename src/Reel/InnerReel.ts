import * as PIXI from 'pixi.js'
import { each, random, countBy, toPairs, maxBy } from 'lodash'
import { SymbolContainer } from './Symbol';
import { SYMBOL_IMAGES } from './SymbolAssets';
import { Expo, TimelineLite } from 'gsap';

export class InnerReel extends PIXI.Container {
    /**
     * Current symbol index of the reel
     * only set when the reel completed rolling
     */
    private currentIndex: number = 0;
    /**
     * Current animation timeline of the reel
     */
    private currentTimeline: TimelineLite;
    /**
     * Value to calculate wrap positioning
     */
    private wrapTopPosition: number;
    private wrapLength: number;

    private symbolContainers: Array<SymbolContainer> = [];

    constructor(
        /**
         * Order of symbols on the reel
         */
        private symbolOrder: Array<string>,
        /**
         * The width of the symbols on of the innerReel
         */
        private size: number,
        /**
         * Vertical offset of this container from its parent
         */
        private offset: number,
    ) {
        super();
        /**
         * Start wrapping at 3 symbols above the first symbol
         * (as wrapping, meaning the last 3 symbols in the symbolOrder)
         * 
         * Those symbols appear above the first symbol so that when we scroll down, 
         * where the first symbol is not out of reel yet, we can still render its neighbors.
         * 
         * See method `handleResourceLoaded`
        */
        this.wrapTopPosition = this.getScrollPositionFromIndex(-3);
        this.wrapLength = symbolOrder.length * size;
        
        const loader = new PIXI.loaders.Loader();
        /** Get the list of symbol and load the assets */
        each(SYMBOL_IMAGES, (imageUrl, symbolName) => {
            loader.add(symbolName, imageUrl);
        })
        loader.load(this.handleResourceLoaded);
    }
    /**
     * Take a random position and spinning to that position
     */
    public spin = () => {
        const randomIndex = random(this.symbolOrder.length);
        return this.scrollTo(randomIndex);
    }
    /**
     * Quick stop
     */
    public fastForward(timeScale: number = 5) {
        this.emit("quickstop");
        this.currentTimeline.timeScale(timeScale);
    }
    /**
     * Create and start a GSAP timeline that animate rolling the inner reel
     * from a symbol to another symbol
     * @param toIndex Target symbol
     * @param numberOfRounds [Optional] Number of rounds to roll, the higher this value, the faster the reel rolls
     * @param duration [Optional] Duration to roll, the lower this value, the faster the reel rolls
     * @param fromIndex [Optional] Original index, default to the current index
     * 
     * @returns A GSAP TimelineLite instance that is used to animate the roll
     */
    public scrollTo(
        /** Target symbol */
        toIndex: number,
        /** Number of rounds to roll, the higher this value, the faster the reel rolls */
        numberOfRounds: number = 0,
        /** Duration to roll, the lower this value, the faster the reel rolls */
        duration: number = 3,
        /** Original index, default to the current index */
        fromIndex: number = this.currentIndex,
    ): TimelineLite {
        this.emit("disabled")
        if (this.currentTimeline && this.currentTimeline.progress() != 1) {
            this.fastForward();
            return this.currentTimeline;
        }
        /**
         * Offset the `toIndex` value to make the target scrollPosition far away for scrolling
         */
        let nextIndexWithRounds = toIndex - numberOfRounds * this.symbolOrder.length;
        if (fromIndex - nextIndexWithRounds < this.symbolOrder.length) {
            nextIndexWithRounds -= this.symbolOrder.length
        }
        this.currentTimeline = new TimelineLite()
            .add(() => this.emit("started"))
            .set(this, {
                scrollPositiony: this.getScrollPositionFromIndex(fromIndex)
            })
            .to(this, duration * 1.5, {
                scrollPosition: this.getScrollPositionFromIndex(nextIndexWithRounds),
                ease: Expo.easeOut
            })
            .set(this, {
                currentIndex: toIndex
            })
            .add(() => this.emit("finished"))
            .add(() => this.emit("enabled"))
            .add(() => this.emit("enabled"), 0.5);

        return this.currentTimeline;
    }
    /**
     * Get the list of visible symbols at the current index
     */
    public getSymbols(): Array<string> {
        return this.getSymbolAtIndex(this.currentIndex);
    }
    /**
     * Return the repeated symbol at the current index
     * @returns.repeatedSymbolName - The symbol that is repeated on the reel
     * @returns.amountOfRepeats    - The amount of that symbol visible on the reel
     * @returns.symbolIndexes      - The index (0-2) of that symbol on the visible reel
     * @returns.symbolContainers   - The symbol container of that symbol on the visible reel
     */
    public getMatches(): {
        repeatedSymbolName: string, 
        amountOfRepeats: number,
        symbolIndexes: Array<number>,
        symbolContainers: Array<SymbolContainer>,
    } {
        const symbols = this.getSymbols();
        const counts = countBy(symbols);
        /**
         * Find the repeated symbol
         */
        const [repeatedSymbolName, amountOfRepeats] = maxBy(toPairs(counts), 1);
        if (amountOfRepeats < 2) {
            return null;
        }
        /**
         * Find the indexes of the repeated symbol
         */
        const symbolIndexes = symbols.reduce<Array<number>>((indexes, symbolName, index) => {
            if (symbolName == repeatedSymbolName) {
                return [
                    ...indexes,
                    index
                ];
            } else {
                return indexes;
            }
        }, []);
        /**
         * Symbol containers of repeated symbols
         */
        const symbolContainers = symbolIndexes.map(index => {
            return this.symbolContainers[(this.currentIndex + index) % this.symbolOrder.length]
        })

        return {
            repeatedSymbolName, 
            amountOfRepeats,
            symbolIndexes,
            symbolContainers,
        };
    }

    /**
     * `scrollPosition` = negative of the innerReel y position (since it is rolling down)
     * the set method the y position for when the value is out of renderring content
     * by calculating wrapping position.
     * 
     * each method take the offset of this container from parent into consideration
     */
    private get scrollPosition(): number {
        return -(this.y - this.offset);
    }
    private set scrollPosition(value: number) {
        /**
         * y = value + wrapLength * offset where y >= wrapTopPosition
         * hence offset = ceil( (wrapTopPosition - value) / wrapLength )
         */
        const offset = Math.ceil((this.wrapTopPosition - value)/this.wrapLength)
        this.y = -(value + offset * this.wrapLength) + this.offset;
    }
    /**
     * Calculate the scroll position from symbol index
     * @param index the symbol index
     * @returns scroll position of the symbol index
     */
    private getScrollPositionFromIndex(index: number): number {
        return index * this.size;
    }
    /**
     * Get the list of symbols displaying at an index
     * @param index the index to calculate
     * @returns an array of 3 strings, each represent a symbol
     */
    private getSymbolAtIndex(index: number): Array<string> {
        const symbolOrder = this.symbolOrder;
        if (index < symbolOrder.length - 2) {
            return symbolOrder.slice(index, index + 3);
        } else {
            return [
                ...symbolOrder.slice(index),
                ...symbolOrder.slice(0, 3 - (symbolOrder.length - index)),
            ]
        }
    }
    /**
     * Create the symbols when the resources are completely loaded
     */
    private handleResourceLoaded = (loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        const symbolContainerCreator = this.createSymbolContainerCreator(resources, 3);
        /**
         * Prepend clones of the last 3 symbols to the end
         * so that when we render the first 3 symbols, 
         * we will see those 3 as wrap effect
         */
        const symbolContainers = [
            ...this.symbolOrder.slice(-3),
            ...this.symbolOrder,
        ]
        /**
         * Create the SymbolContainer for each symbol
         */
        .map(symbolContainerCreator);

        this.symbolContainers = symbolContainers.slice(3);
    }
    /**
     * Create a function to create SymbolContainer from symbolName and index
     * @param resources resource dictionary used to extracting texture from symbolName
     * @param offset offset the position by a certain amount of index
     */
    private createSymbolContainerCreator(resources: PIXI.loaders.ResourceDictionary, offset: number = 0) {
        return (symbolName: string, index: number) => {
            const texture = resources[symbolName].texture;
            const symbolContainer = new SymbolContainer(texture, this.size);

            /** Order the symbol vertically */
            symbolContainer.y = (index - offset) * this.size;

            this.addChild(symbolContainer);
            return symbolContainer;
        }
    }
}