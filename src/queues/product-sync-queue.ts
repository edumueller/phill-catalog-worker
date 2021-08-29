import Queue from 'bull';
import { natsWrapper } from '../nats-wrapper';
import { ProductSyncCompletePublisher } from '../events/publishers/product-sync-complete-publisher';
import axios from 'axios';
import {
  ProductSyncFetchError,
  ProductSyncPostError,
  ProductSyncVersionError,
} from '@phill-sdk/common';

interface Payload {
  id: string;
  name: string;
  price: number;
  quantity: number;
  version: number;
}

const productSyncQueue = new Queue<Payload>('product:create', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

productSyncQueue.process(async (job) => {
  const postData = () => {
    axios
      .post(`${process.env.SUPPLY_CHAIN_URL}/supply-chain`, job.data)
      .then(() => {
        new ProductSyncCompletePublisher(natsWrapper.client).publish({
          id: job.data.id,
          version: job.data.version,
        });
      })
      .catch((e) => {
        throw new ProductSyncPostError();
      });
  };

  if (job.data.version === 0) {
    postData();
  } else {
    axios
      .get(`${process.env.SUPPLY_CHAIN_URL}/supply-chain/${job.data.id}`)
      .then(({ data: { version } }) => {
        if (version !== job.data.version - 1) {
          throw new ProductSyncVersionError();
        } else {
          postData();
        }
      })
      .catch((e) => {
        throw new ProductSyncFetchError();
      });
  }
});

export { productSyncQueue };
