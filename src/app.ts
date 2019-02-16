import * as PIXI from 'pixi.js'
import { Reel } from './Reel/Reel';
import { Panel } from './UI/Panel';

export const app = new PIXI.Application({
    width : window.innerWidth,
    height: window.innerHeight
});


const reel = new Reel();
app.stage.addChild(reel);

const panel = new Panel();
app.stage.addChild(panel);

const onResize = () => {
    app.renderer.resize(
        window.innerWidth, 
        window.innerHeight
    );
    reel.position.set(
        window.innerWidth/3, 
        window.innerHeight/2
    );
    panel.position.set(
        window.innerWidth/2, 
        window.innerHeight/2
    );

    reel.on("spin", panel.spin, panel);
    reel.on("win", panel.win, panel);
    reel.on("lose", panel.lose, panel);
    panel.on("bankrupt", reel.disable, reel);
    
}
/**
 * Make the canvas responsive
 */
window.addEventListener("resize", onResize);
onResize();
