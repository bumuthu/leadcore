import connectToTheDatabase from "src/utils/mongo-connection";

export class EntityService {
    constructor() {
    }

    async before() {
        await connectToTheDatabase();
    }

    async after() {
    }
}