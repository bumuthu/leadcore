export class KnowError extends Error {
    public code: string = "KnownError";
    constructor(message: string) {
        super(message)
    }
}