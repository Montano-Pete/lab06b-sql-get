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

    test('returns fruits', async() => {

      const expectation = [
        {
            id: 1,
            name: 'Rainier Cherry',
            category: 'Tree',
            price: 1,
        },
        {
            id: 2,
            name: 'Mango',
            category: 'Tree',
            price: 3,
        },
        {
            id: 3,
            name: 'Strawberry',
            category: 'Ground',
            price: 2,
        },
        {
            id: 4,
            name: 'Grapefruit',
            category: 'Tree',
            price: 5,
        },
        {
            id: 5,
            name: 'Watermelon',
            category: 'Ground',
            price: 7,
        },
        {
            id: 6,
            name: 'Kiwi',
            category: 'Vine',
            price: 2,
        },
        {
            id: 7,
            name: 'Passion Fruit',
            category: 'Vine',
            price: 4,
        },
        {
            id: 8,
            name: 'Lychee',
            category: 'Tree',
            price: 1,
        },
        {
            id: 9,
            name: 'Lemon',
            category: 'Tree',
            price: 2,
        },
        {
            id: 10,
            name: 'Dragon Fruit',
            category: 'Cactus',
            price: 4,
        },
      ];

      const data = await fakeRequest(app)
        .get('/fruits')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns fruit specific id', async() => {

      const expectation = [
        {
            id: 1,
            name: 'Rainier Cherry',
            category: 'Tree',
            price: 1,
        }
      ];

      const data = await fakeRequest(app)
        .get('/fruits/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
