//require all packages
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

//this so should syntax can be used throughout 
const should = should();

//REQUIRE model schema called {BlogPost} from models.js
const {BlogPost} = require('../models');
const {app, runServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

//initialize Chai with chaiHttp
chai.use(chaiHttp);





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

function generateTitle() {
    //set title = to faker.title to generate some fake title
    //title should be returned in the form of an object
  return {title: faker.title};
}

function generateContent() {
  return {content: faker.content};
}

function generateAuthor() {
  return {author: faker.author};
}

//This func describes how the seed data function will generate a whole BlogPost
//that will be an object
function generateBlogPostData() {
    //return an object using all the generate functions from above
  return {
    title: generateTitle(),
    content: generateContent(),
    author: generateAuthor()
  };
}