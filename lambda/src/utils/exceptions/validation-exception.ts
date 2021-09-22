export class ValidationError extends Error {
    public code: string = "ValidationError";
    constructor(message: string) {
        super(message)
    }
}