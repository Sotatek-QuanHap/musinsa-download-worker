import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PDPCrawlerModule } from './pdp-crawler/pdp-crawler.module';
import { CategoryCrawlerModule } from './category-crawler/category-crawler.module';
import { PLPCrawlerModule } from './plp-crawler/plp-crawler.module';

@Module({
  imports: [
    KafkaModule,
    PDPCrawlerModule,
    CategoryCrawlerModule,
    PLPCrawlerModule,
  ],
  providers: [],
  exports: [],
})
export class OliveYoungModule {}
