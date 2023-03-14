/** @template T */
export default class Success {
    status = true
    result
    remaining

    /**
     * @param {T} result
     * @param {String} remaining
     */
    constructor(result, remaining) {
        this.result = result
        this.remaining = remaining
    }
}
