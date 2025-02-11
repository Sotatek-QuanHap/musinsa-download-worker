import { Module } from '@nestjs/common';
import { KafkaConsumerService } from 'src/kafka/kafka.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';
import { CategoryCrawlerHandler } from './category-crawler.handler';
import { CategoryCrawlerService } from './category-crawler.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [CategoryCrawlerHandler, CategoryCrawlerService],
  imports: [ConfigModule, KafkaModule],
})
export class CategoryCrawlerModule {
  constructor(
    private kafkaConsumerService: KafkaConsumerService,
    categoryCrawlerHandler: CategoryCrawlerHandler,
  ) {
    void this.kafkaConsumerService.listen(categoryCrawlerHandler);
  }
}
