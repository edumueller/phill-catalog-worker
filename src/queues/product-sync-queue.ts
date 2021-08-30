import Queue from 'bull';
import { natsWrapper } from '../nats-wrapper';
import { ProductSyncCompletePublisher } from '../events/publishers/product-sync-complete-publisher';
import axios from 'axios';
import { ProductSyncFetchError, ProductSyncPostError } from '@phill-sdk/common';

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

productSyncQueue.process(
  async (job) =>
    new Promise((resolve, reject) => {
      console.log('Started processing job');
      console.log(job.data);
      const postData = () => {
        axios
          .post(`${process.env.SUPPLY_CHAIN_URL}/supply-chain`, job.data)
          .then(() => {
            new ProductSyncCompletePublisher(natsWrapper.client).publish({
              id: job.data.id,
              version: job.data.version,
            });
            resolve();
          })
          .catch((e) => {
            reject(new ProductSyncPostError());
          });
      };

      if (job.data.version === 0) {
        return postData();
      }

      axios
        .get(`${process.env.SUPPLY_CHAIN_URL}/supply-chain/${job.data.id}`)
        .then(({ data: { version } }) => {
          if (version < job.data.version) {
            postData();
          }
        })
        .catch((e) => {
          reject(new ProductSyncFetchError());
        });
    })
);

export { productSyncQueue };
