import {
  Publisher,
  ProductSyncCompleteEvent,
  Subjects,
} from '@phill-sdk/common';

export class ProductSyncCompletePublisher extends Publisher<ProductSyncCompleteEvent> {
  subject: Subjects.ProductSyncComplete = Subjects.ProductSyncComplete;
}
