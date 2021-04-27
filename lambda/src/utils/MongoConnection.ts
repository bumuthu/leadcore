import mongoose from 'mongoose';

const connectToTheDatabase = async () => {
    const MONGO_PATH = 'mongodb+srv://root:Lc@12345@cluster1.ninyi.mongodb.net/lc-test1?retryWrites=true&w=majority';

    await mongoose.connect(MONGO_PATH, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
            .then(res => console.log('Connected to db'))
            .catch(err => console.log(err));
}

export default connectToTheDatabase;