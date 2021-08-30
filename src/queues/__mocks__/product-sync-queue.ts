import { ProductCreatedEvent } from '@phill-sdk/common';

const queue = [];

export const productSyncQueue = {
  add: jest.fn().mockImplementation((data: ProductCreatedEvent['data']) => {
    queue.push(data);
  }),
  process: jest.fn().mockImplementation((data: ProductCreatedEvent['data']) => {
    console.log('Processing event!');
  }),
  count: async () => queue.length,
};
