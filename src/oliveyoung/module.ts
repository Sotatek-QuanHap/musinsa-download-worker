import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { CategoryCrawlHandler } from './category-crawl.handler';
import { KafkaConsumerService } from '../kafka/kafka.consumer';

@Module({
  imports: [KafkaModule],
  providers: [CategoryCrawlHandler],
  exports: [],
})
export class OliveYoungModule {
  constructor(
    private kafkaConsumer: KafkaConsumerService,
    categoryCrawlHandler: CategoryCrawlHandler,
  ) {
    for (const handler of [categoryCrawlHandler]) {
      handler.setPlatform('olive-young');
      void this.kafkaConsumer.listen(handler);
    }
  }
}
