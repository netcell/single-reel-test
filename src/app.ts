import * as PIXI from 'pixi.js'
import { Reel } from './Reel/Reel';

export const app = new PIXI.Application({
    width : window.innerWidth,
    height: window.innerHeight
});

const onResize = () => {
    app.renderer.resize(
        window.innerWidth, 
        window.innerHeight
    );
    
}
/**
 * Make the canvas responsive
 */
window.addEventListener("resize", onResize);
onResize();
