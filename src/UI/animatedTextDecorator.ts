import { TweenLite } from "gsap";
/**
 * Animated Text Decorator
 * Turn a number field into get set property
 * where setting the number results in a text field (`this[textField]`) has its text animated toward that value
 * @param textField the field name of the text field
 * @param preProcessValue an optional function that allows preprocessing the value prior to passing it to setter
 */
export function animatedNumber(textField: string, preProcessValue?: (current: number, next: number) => number) {
    return function (target: any, key: string) {
        let _value: number = target[key];
    
        const getter = function () {
            return _value;
        };
        const setter = function (value: number) {
            /**
             * Preprocess value
             */
            if (preProcessValue) {
                _value = preProcessValue.bind(this)(_value, value);
            } else {
                _value = value >> 0;
            }
            /**
             * Animate the text field
             */
            if (this[textField]) {
                TweenLite.to(this[textField], 0.5, {
                    text: _value,
                    roundProps: "text",
                });
            }
        };

        if (delete target[key]) {
            Object.defineProperty(target, key, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    }
}