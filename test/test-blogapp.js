//'use: strict'
//require all packages
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//this so should syntax can be used throughout
const should = chai.should();

//REQUIRE model schema called {BlogPost} from models.js
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

//initialize Chai
chai.use(chaiHttp);
// console.log(TEST_DATABASE_URL);
// runServer(TEST_DATABASE_URL);



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
//This func describes how the seed data function will generate a whole BlogPost
//NEED faker methods to :
                //generate seed title
                //genereate seed content
                //generate seed author
//NEEDS to be an object
function generateBlogPostData() {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.text(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

//PARENT DESCRIBE Function
describe('BlogPost API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });




  describe('GET endpoint', function() {

    it('should return all existing restaurants', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          res.body.should.have.length.of(count);
        });
    });

    it('should return posts with the right fields', function() {
      let resBlogPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'title', 'content', 'author', 'created');
          });
          resPost = res.body[0];
          return BlogPost.findById(resPost.id)
          .exec();
        })
        .then(post => {
          resPost.title.should.equal(post.title);
          resPost.content.should.equal(post.content);
          resPost.author.should.equal(post.authorName);
        });
    });

  });
  describe('POST endpint', function() {

    it('should add a new blog post', function() {
      let newPost = {
        title: faker.lorem.sentence(),
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()},
        content: faker.lorem.text()
      };
      return chai.request(app)
        .post('/post')
        .send(newPost)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'content', 'author', 'created');
          res.body.title.should.equal(newPost.title);
          res.body.id.should.not.be.null;
          res.body.author.should.equal(
            `${newPost.author.firstName} ${newPost.author.lastName}`);
          res.body.content.should.equal(newPost.content);
          return BlogPost.findById(res.body.id).exec();
        })
        .then(function(post) {
          post.title.should.equal(newPost.title);
          post.content.should.equal(newPost.content);
          post.author.firstName.should.equal(newPost.author.firstName);
          post.author.lastName.should.equal(newPost.author.lastName);
        });

    })
  })

});
  //CLOSE PARENT DESCRIBE func
