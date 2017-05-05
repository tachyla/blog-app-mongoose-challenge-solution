require('dotenv').config();
// exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL ||'mongodb://tachyla:Qa12345678>@ds129281.mlab.com:29281/blog';


 exports.TEST_DATABASE_URL = (
//process.env.TEST_DATABASE_URL; 
//global.TEST_DATABASE_URL ||
//copied into mongoose.connect on server.js
'mongodb://tachyla:Qa12345678@ds129641.mlab.com:29641/blogtest'

);
exports.PORT = process.env.PORT || 8080;
