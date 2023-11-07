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

  });

  afterAll(async () => {

    const entities = testDataSource.entityMetadatas;

    for (const entity of entities) {
        const repository = testDataSource.getRepository(entity.name); // Get repository
        await repository.clear(); // Clear each entity table's content
        console.log('entity', entity);
    }
    await testDataSource.destroy();
  });

  describe('Auth Controller', () => {
    it('POST /auth/register - should create a new user and return a token', async () => {
      const res = await axios.post(`/auth/register`, {
        username: 'newuser', // replace with a new username
        password: 'newpassword', // replace with a new password
      });

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('userName');
    });

    it('POST /auth/login - should return a token when provided valid credentials', async () => {
      const res = await axios.post(`/auth/login`, {
        username: 'testuser', // replace with a valid username
        password: 'testpassword', // replace with a valid password
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
    });
  });
});
