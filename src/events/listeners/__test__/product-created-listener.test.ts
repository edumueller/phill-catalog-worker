import { ProductCreatedEvent } from '@phill-sdk/common';
import { natsWrapper } from '../../../nats-wrapper';
import { ProductCreatedListener } from '../product-created-listener';
import { Message } from 'node-nats-streaming';
import { productSyncQueue } from '../../../queues/product-sync-queue';

const setup = async () => {
  const listener = new ProductCreatedListener(natsWrapper.client);

  const product = {
    id: 'sdadsasda',
    name: 'concert',
    price: 20,
    quantity: 5,
    version: 0,
  };

  const data: ProductCreatedEvent['data'] = product;

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, product, data, msg };
};

it('listener adds product to queue when product:created event is received', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(await productSyncQueue.count()).toBe(1);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
