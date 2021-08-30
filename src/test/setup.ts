jest.mock('../nats-wrapper');
jest.mock('../queues/product-sync-queue');

beforeEach(async () => {
  jest.clearAllMocks();
});
