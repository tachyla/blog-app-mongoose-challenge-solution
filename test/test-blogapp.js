//'use: strict'
//require all packages
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;

//this so should syntax can be used throughout 
const should = should();

//REQUIRE model schema called {BlogPost} from models.js
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config');

//initialize Chai
chai.should();
chai.use(chaiHttp);

runServer(DATABASE_URL);



//Create function that add seed data to TEST_DATABSE
function seedBlogPostData() {
  console.info('seeding BlogPost data');
    //starts empty, then fills with the returns from generate functions
  const seedData = [];

  for (let i=1; i<10; i++) {
    seedData.push(generateBlogPostData());
  }
    //returns the promise of the seedData inserted into BlogPost
  return BlogPost.insertMany(seedData);
}
//NEED functions to :
                //generate seed title 
                //genereate seed content
                //generate seed author
                                        //that will be added to the TEST_DATABSE


//This func describes how the seed data function will generate a whole BlogPost
//that will be an object
function generateBlogPostData() {
    //return an object using all the generate functions from above
  return {
    title: faker.lorem.word,
    content: faker.lorem.sentence,
    author: {
        firstName: faker.name.firstName, 
        lastName: faker.name.lastName
    }
  };
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}