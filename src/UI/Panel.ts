import * as PIXI from 'pixi.js'
import { TweenLite } from 'gsap';

export class Panel extends PIXI.Container {
    private _winValue = 0;
    private _balanceValue = 0;
    private balanceValueText: PIXI.Text;
    private winValueText: PIXI.Text;

    get balanceValue() {
        return this._balanceValue;
    };
    set balanceValue(value: number) {
        value = value >> 0;
        this._balanceValue = value;
        this.balanceValueText.text = value.toString();
    }

    get winValue() {
        return this._winValue;
    };
    set winValue(value: number) {
        value = value >> 0;
        this._winValue = value;
        this.winValueText.text = value.toString();
    }

    constructor(
        
    ) {
        super();

        const defaultStyle = { fontFamily: "Helvetica, sans-serif", fill: 'white' };

        const balanceLabelText = new PIXI.Text("BALANCE:", {
            ...defaultStyle,
            fontSize: 20
        });
        balanceLabelText.position.set(0, 0)
        this.addChild(balanceLabelText);
        const winLabelText = new PIXI.Text("WIN:", {
            ...defaultStyle,
            fontSize: 20
        });
        winLabelText.position.set(0, 40)
        this.addChild(winLabelText);

        this.balanceValueText = new PIXI.Text("0", {
            ...defaultStyle,
            fontSize: 20
        });
        this.balanceValueText.position.set(150, 0)
        this.addChild(this.balanceValueText);
        this.winValueText = new PIXI.Text("0", {
            ...defaultStyle,
            fontSize: 20
        });
        this.winValueText.position.set(150, 40)
        this.addChild(this.winValueText);

        TweenLite.to(this, 0.5, {
            balanceValue: 100
        })
    }

    win(matches: number) {
        const winValue = matches;
        const balanceValue = this.balanceValue + winValue;

        TweenLite.to(this, 0.5, {
            balanceValue,
            winValue,
        })
    }

    spin() {
        this.balanceValue = this.balanceValue - 1;
    }
}