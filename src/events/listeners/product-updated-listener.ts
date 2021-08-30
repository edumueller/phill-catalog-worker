import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductUpdatedEvent } from '@phill-sdk/common';
import { queueGroupName } from './queue-group-name';
import { productSyncQueue } from '../../queues/product-sync-queue';

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
    // delete all jobs with version < than current?
    productSyncQueue.add(
      { ...data },
      {
        // With this retry configuration, we will exponentially increase
        // the delay between retries, we will retry a total of
        // 18 times in ~3 days
        attempts: 18,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );

    msg.ack();
  }
}
