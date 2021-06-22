require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('/POST fruits creates a single fruit', async() => {

        const data = await fakeRequest(app)
            .post('/fruits')
            .send({
                name: 'new fruit',
                category: 'Tree',
                price: 2
            })
            .expect('Content-Type', /json/)
            .expect(200);

        const dataFruit = await fakeRequest(app)
            .get('/fruits')
            .expect('Content-Type', /json/)
            .expect(200);

        const newFruit = {
            "category": "Tree",
            "id": 11,
            "name": "new fruit",
            "price": 2
        };
        
        expect(data.body).toEqual(newFruit);
        expect(dataFruit.body).toContainEqual(newFruit);
    });

    test('/PUT fruits updates a single fruit', async() => {

        const data = await fakeRequest(app)
            .put('/fruits/11')
            .send({
              name: 'updated fruit',
              category: 'Vine',
              price: 8
            })
            .expect('Content-Type', /json/)
            .expect(200);
  
        const dataFruit = await fakeRequest(app)
            .get('/fruits')
            .expect('Content-Type', /json/)
            .expect(200);
  
        const newFruit = {
            "category": "Vine",
            "id": 11,
            "name": "updated fruit",
            "price": 8
        };
          
        expect(data.body).toEqual(newFruit);
        expect(dataFruit.body).toContainEqual(newFruit);
      });

    test('/DELETE fruits deletes a single fruit', async() => {

        await fakeRequest(app)
            .delete('/fruits/11')
            .expect('Content-Type', /json/)
            .expect(200);
  
        const dataFruit = await fakeRequest(app)
            .get('/fruits')
            .expect('Content-Type', /json/)
            .expect(200);
  
        const newFruit = {
            "category": "Vine",
            "id": 11,
            "name": "updated fruit",
            "price": 8
          };
        
        expect(dataFruit.body).not.toContainEqual(newFruit);
      });
  });
});