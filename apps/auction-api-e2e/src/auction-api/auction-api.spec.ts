import axios from 'axios';
import { DataSource } from 'typeorm';

const testDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_URL ?? 'auction-api-e2e.sqlite',
  synchronize: true,
  logging: true,
  entities: ['**/*.entity{.ts,.js}'],
});

describe('Auction-api /api', () => {
  beforeAll(async () => {
    await testDataSource.initialize();

    const entities = testDataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name); // Get repository
      await repository.clear(); // Clear each entity table's content
    }
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('Auth Controller', () => {
    describe('register', () => {
      it('POST /auth/register - should create a new user and return a token', async () => {
        const res = await axios.post(`/auth/register`, {
          username: 'test_user', // replace with a new username
          password: 'test_password', // replace with a new password
        });

        expect(res.status).toBe(201);
        expect(res.data).toHaveProperty('id');
        expect(res.data).toHaveProperty('userName');
      });

      it('POST /auth/register - should return a 400 if the username is already taken', async () => {
        try {
          await axios.post(`/auth/register`, {
            username: 'test_user', // replace with a username that already exists
            password: 'test_password', // replace with a new password
          });
        } catch (err) {
          expect(err.response.status).toBe(400);
        }
      });
    });

    it('POST /auth/login - should return a token when provided valid credentials', async () => {
      const res = await axios.post(`/auth/login`, {
        username: 'test_user', // replace with a valid username
        password: 'test_password', // replace with a valid password
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
    });
  });
});
