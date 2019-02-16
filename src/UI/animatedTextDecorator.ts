import { TweenLite } from "gsap";
import numeral from 'numeral';
/**
 * Animated Text Decorator
 * Turn a number field into get set property
 * where setting the number results in a text field (`this[textField]`) has its text animated toward that value
 * @param textFieldName the field name of the text field
 * @param preProcessValue an optional function that allows preprocessing the value prior to passing it to setter
 */
export function animatedNumber(textFieldName: string, preProcessValue?: (current: number, next: number) => number) {
    return function (target: any, key: string) {
        let _value: number = target[key];
    
        const getter = function () {
            return _value;
        };
        const setter = function (value: number) {
            const prevValue = _value;
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
            const textField = this[textFieldName];
            if (textField) {
                const valueObject = { value: prevValue };
                TweenLite.to(valueObject, 0.5, {
                    value: _value,
                    roundProps: "value",
                    onUpdate: () => {
                        textField.text = numeral(valueObject.value).format('0,0');
                    }
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