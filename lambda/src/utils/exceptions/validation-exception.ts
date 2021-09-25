import { KnowError } from "./known-exception"

export class ValidationError extends KnowError {
    constructor(message: string) {
        super(message)
        this.code = "ValidationError"
    }
}