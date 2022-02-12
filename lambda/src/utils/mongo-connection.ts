import mongoose from 'mongoose';

const connectToTheDatabase = async () => {

    require('../models/db/pricing.model');
    require('../models/db/role.model');
    require('../models/db/user.model');
    require('../models/db/team.model');

    const MONGO_PATH = 'mongodb+srv://root:Lc@12345@cluster1.ninyi.mongodb.net/lc-test1?retryWrites=true&w=majority';
    
    if ([1, 2].includes(mongoose.connection.readyState) == false) {
        await mongoose.connect(MONGO_PATH, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
            .then(res => console.log('Connected to db'))
            .catch(err => console.log(err));
    }
}

export default connectToTheDatabase;