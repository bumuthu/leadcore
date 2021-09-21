export namespace ingress {
    export interface LoginInput {
        username: string,
        password: string
    }

    export interface SignUpInput {
        firstName: string,
        lastName?: string,
        email: string,
        linkedinUrl?: string,
        username: string,
        password: string
    }
}