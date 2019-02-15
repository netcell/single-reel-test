import * as PIXI from 'pixi.js'
import { Reel } from './Reel/Reel';

export const app = new PIXI.Application({
    width : window.innerWidth,
    height: window.innerHeight
});


const reel = new Reel();
app.stage.addChild(reel)

const onResize = () => {
    app.renderer.resize(
        window.innerWidth, 
        window.innerHeight
    );
    reel.position.set(
        window.innerWidth/2, 
        window.innerHeight/2
    );
    
}
/**
 * Make the canvas responsive
 */
window.addEventListener("resize", onResize);
onResize();
