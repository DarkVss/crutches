/**
 * Make "constructor" private by prevention to call it not from static "init" method
 */
class X {
    constructor(target, directoryStructure, directoryList) {
        if ((new Error()).stack?.split('\n')[2].trim().split(' ')[1] !== `${this.constructor.name}.init`) {
            throw ": Wrong new Tree class object initialization";
        }
    }

    static init() {
        return new this();
    }
}
