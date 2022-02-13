import { entity } from "src/models/entities";
import connectToTheDatabase from "src/utils/mongo-connection";

export class EntityService {
    constructor() {
    }

    async before() {
        await connectToTheDatabase();
    }

    async after() {
    }

    static getEntityKey(data: entity.Entity): string {
        return data["_id"] as string
    }
}