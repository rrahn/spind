
module.exports = class BoxStatus {
    kind = 'free';
    message = '';

    constructor(kind, message) {
        this.kind = kind;
        this.message = message;
    }
}
