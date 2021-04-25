import { MongoClient } from 'mongodb';

const connectToTheDatabase = async () => {
    const MONGO_PATH = 'mongodb+srv://root:Lc@12345@cluster1.ninyi.mongodb.net/lc-test1?retryWrites=true&w=majority';

    const mongoClient = new MongoClient(MONGO_PATH, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();
    console.log('DB connected')

    return mongoClient.db('lc-test1');
}

export default connectToTheDatabase;