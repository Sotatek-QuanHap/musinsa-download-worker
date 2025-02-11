import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PDPCrawlerModule } from './pdp-crawler/pdp-crawler.module';

@Module({
  imports: [KafkaModule, PDPCrawlerModule],
  providers: [],
  exports: [],
})
export class OliveYoungModule {}
