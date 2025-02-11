import { Module } from '@nestjs/common';
import { KafkaConsumerService } from 'src/kafka/kafka.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PDPCrawlerHandler } from './pdp-crawler.handler';
import { PDPCrawlerService } from './pdp-crawler.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [PDPCrawlerHandler, PDPCrawlerService],
  imports: [ConfigModule, KafkaModule],
})
export class PDPCrawlerModule {
  constructor(
    private kafkaConsumerService: KafkaConsumerService,
    pdpCrawlerHandler: PDPCrawlerHandler,
  ) {
    void this.kafkaConsumerService.listen(pdpCrawlerHandler);
  }
}
