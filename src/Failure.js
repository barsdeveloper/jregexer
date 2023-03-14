export default class Failure {
    status = false
    /** @type {String} */
    remaining
    index = 0

    constructor(remaining, index) {
        this.remaining = remaining
        this.index = index
    }

    /** @param {Failure} other */
    getFurthest(other) {
        return other.remaining.length - other.index < this.remaining.length - this.index
            ? other
            : this
    }
}
