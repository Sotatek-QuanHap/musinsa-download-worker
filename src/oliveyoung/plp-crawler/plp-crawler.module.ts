import { Module } from '@nestjs/common';
import { KafkaConsumerService } from 'src/kafka/kafka.consumer';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PLPCrawlerHandler } from './plp-crawler.handler';
import { PLPCrawlerService } from './plp-crawler.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [PLPCrawlerHandler, PLPCrawlerService],
  imports: [ConfigModule, KafkaModule],
})
export class PLPCrawlerModule {
  constructor(
    private kafkaConsumerService: KafkaConsumerService,
    plpCrawlerHandler: PLPCrawlerHandler,
  ) {
    void this.kafkaConsumerService.listen(plpCrawlerHandler);
  }
}
