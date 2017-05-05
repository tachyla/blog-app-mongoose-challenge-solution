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
const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

//initialize Chai
chai.use(chaiHttp);
// console.log(TEST_DATABASE_URL);
// runServer(TEST_DATABASE_URL);



//Create function that add seed data to TEST_DATABSE
function seedBlogPostData() {
  console.info('Now seeding BlogPost data');
  //starts empty, then fills with the returns from generate functions
  const seedData = [];

  for (let i = 1; i < 10; i++) {
    seedData.push(generateBlogPostData());
  }
  //returns the promise of the seedData inserted into BlogPost
  return BlogPost.insertMany(seedData);
}

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
describe('BlogPost API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedBlogPostData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });




  describe('GET endpoint', function () {

    it('should return all existing blog posts', function () {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function (_res) {
          res = _res;
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);
          
          return BlogPost
          .count();
        })
        .then(function (count) {
          res.body.should.have.length.of(count);
        });
    });

    it('should return posts with the right fields', function () {
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function (post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'title', 'content', 'author', 'created');
            //returns an array of objects
          });
          resPost = res.body[0];
          return BlogPost
            .findById(resPost.id)
            .exec();
        })
        .then(post => {
          resPost.title.should.equal(post.title);
          resPost.content.should.equal(post.content);
          resPost.author.should.equal(post.authorName);
        });
    });

  });
  describe('POST endpoint', function () {

    it('should add a new blog post', function () {
      let newPost = {
        title: faker.lorem.sentence(),
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        content: faker.lorem.text()
      };
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('id', 'title', 'content', 'author', 'created');
          res.body.title.should.equal(newPost.title);
          res.body.id.should.not.be.null;
          res.body.author.should.equal(
            `${newPost.author.firstName} ${newPost.author.lastName}`);
          res.body.content.should.equal(newPost.content);
          return BlogPost
            .findById(res.body.id)
            .exec();
        })
        .then(function (post) {
          post.title.should.equal(newPost.title);
          post.content.should.equal(newPost.content);
          post.author.firstName.should.equal(newPost.author.firstName);
          post.author.lastName.should.equal(newPost.author.lastName);
        });
    });
  });

  describe('PUT endpoint', function () {
    it('should update each field ', function () {
      //format of updateData should be the same format that the schema requires
      const updateData = {
        title: 'fooTitle',
        content: 'foo Bar FooBar',
        author: {
          firstName: 'Samuel',
          lastName: 'Jackson'
        }
      };
          //func below instructs the test what to do
      return BlogPost
            .findOne()
            .exec()
            .then(post => {
              updateData.id = post.id;

              //SET UP REQUEST
              return chai.request(app)
                .put(`/posts/${post.id}`)
                .send(updateData);
            })
            .then(res => {
              res.should.have.status(201);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.title.should.be.equal(updateData.title);
              res.body.author.should.be.equal(
                `${updateData.author.firstName} ${updateData.author.lastName}`);
              res.body.content.should.equal(updateData.content);

              return BlogPost
                .findById(res.body.id)
                .exec();
            })
            .then(post => {
              post.title.should.equal(updateData.title);
              post.content.should.equal(updateData.content);
              post.author.firstName.should.equal(updateData.author.firstName);
              post.author.lastName.should.equal(updateData.author.lastName);
            });
    });
  });

  describe('DELETE endpoint', function () {
    it('should delete a post by id', function () {
      let post; 
      
      return BlogPost
        .findOne()
        .exec()
        .then(_post => {
          post = _post;
          //originalData = seedData_post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return BlogPost.findById(post.id);
        })
        //the promise returns the response   
        .then(_post => {
          should.not.exist(_post);
        });

    });
  });

});

