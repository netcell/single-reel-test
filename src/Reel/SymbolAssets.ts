/**
 * List of the symbols on the reel
 */
export const SYMBOL_ORDER = "SYM1, SYM2, SYM3, SYM3, SYM4, SYM4, SYM1, SYM1, SYM1, SYM4, SYM4, SYM4, SYM4, SYM2, SYM1, SYM1, SYM3, SYM1, SYM1, SYM5, SYM5, SYM5, SYM2, SYM2, SYM1, SYM3, SYM5, SYM1, SYM1, SYM1, SYM5, SYM5, SYM4, SYM3, SYM2, SYM1, SYM1"
    .toLowerCase()
    .replace(/ /g, '')
    .split(',');
/**
 * Symbol images url
 * We need to use this to allows parcel to copy those assets over to the build
 */
export const SYMBOL_IMAGES = {
    sym1: require(`../assets/sym1.png`),
    sym2: require(`../assets/sym2.png`),
    sym3: require(`../assets/sym3.png`),
    sym4: require(`../assets/sym4.png`),
    sym5: require(`../assets/sym5.png`),
}