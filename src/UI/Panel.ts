import * as PIXI from 'pixi.js'
import { animatedNumber } from './animatedTextDecorator';

export class Panel extends PIXI.Container {
    private SPIN_PRICE = 1;
    
    /**
     * During spinning, prevent any input
     */
    private locked: boolean = false;
    
    /**
     * The number text fields
     */
    private balanceValueText: PIXI.Text;
    private winValueText: PIXI.Text;
    private betValueText: PIXI.Text;
    /**
     * The number values bounded to those text fields
     */
    @animatedNumber("balanceValueText")
        private balanceValue = 100;
    @animatedNumber("winValueText")
        private winValue = 0;
    @animatedNumber("betValueText", 
        /**
         * Preprocess the bet value to prevent setting it lower than 0 or higher than affordable amount
         */
        function(current: number, next: number) {
            if (this.locked || next > this.affordableAmount || next < 0) {
                return current;
            } else {
                return next;
            }
        }
    )
        private betValue = 0;

    get affordableAmount() {
        return this.balanceValue - this.SPIN_PRICE;
    }

    constructor() {
        super();

        this.balanceValueText = this.addField("balance", 0, this.balanceValue);
        this.winValueText     = this.addField("win", 1, this.winValue);
        this.betValueText     = this.addField("bet", 2, this.betValue);

        const decreaseBetButton = this.createTextButton('bet-');
        decreaseBetButton.position.set(0, 3 * 40);
        const increaseBetButton = this.createTextButton('bet+');
        increaseBetButton.position.set(70, 3 * 40);
        const maxBetButton = this.createTextButton('bet max');
        maxBetButton.position.set(0, 4 * 40);

        decreaseBetButton.on('mouseup', this.decreaseBet);
        increaseBetButton.on('mouseup', this.increaseBet);
        maxBetButton.on('mouseup', this.betMax);
    }

    /**
     * Animate the balance and win value on win
     * @param matches Amount of appearance of the same symbol
     */
    win(matches: number) {
        this.locked = false;
        this.winValue = this.betValue * matches;
        this.balanceValue = this.balanceValue + this.winValue;
    }
    /**
     * Drop the win value to 0 on lose
     * Cap bet value on remaining balance
     */
    lose() {
        this.locked = false;
        this.winValue = 0;
        this.betValue = Math.min(this.betValue, this.affordableAmount);
        if (this.balanceValue < this.SPIN_PRICE) {
            this.emit("bankrupt");
        }
    }
    /**
     * Decrease the balance value by the cost of spinning
     */
    spin() {
        if (this.locked) return;
        this.locked = true;
        this.balanceValue = this.balanceValue - this.SPIN_PRICE - this.betValue;
    }
    /**
     * Modify bet values on button click
     */
    private decreaseBet = () => this.betValue -= 10;
    private increaseBet = () => this.betValue += 10;
    private betMax      = () => this.betValue = this.affordableAmount;

    /**
     * Create a clickable text
     * @param label the label of the text
     */
    private createTextButton(label: string) {
        const betButton = new PIXI.Text(label.toUpperCase(), {
            fontFamily: "Helvetica, sans-serif",
            fill: 'white',
            fontSize: 20,
        });
        this.addChild(betButton);

        betButton.interactive = true;
        betButton.buttonMode = true;

        return betButton;
    }
    /**
     * Create 2 text objects on the same line, 
     * one is the label, the other is returned for further processing
     * @param name Name to display on the label
     * @param index The vertical order of the field
     */
    private addField(name: string, index: number, initalValue: number = 0) {
        /**
         * Label text
         */
        const labelText = new PIXI.Text(`${name.toUpperCase()}:`, {
            fontFamily: "Helvetica, sans-serif",
            fill: 'white',
            fontSize: 20,
        });
        labelText.position.set(0, index * 40)
        this.addChild(labelText);
        /**
         * Value text
         */
        const valueText = new PIXI.Text(initalValue.toString(), {
            fontFamily: "Helvetica, sans-serif",
            fill: 'white',
            fontSize: 20,
        });
        valueText.position.set(120, index * 40)
        this.addChild(valueText);

        return valueText;
    }
}