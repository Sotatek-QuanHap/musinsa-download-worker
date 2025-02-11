import { Module } from '@nestjs/common';
import appConfig from './config/app.config';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';
import { PDPCrawlerModule as OliveYoungPDPCrawlerModule } from './olive-young-pdp-crawler/pdp-crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: false,
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    KafkaModule,
    OliveYoungPDPCrawlerModule,
  ],
})
export class AppModule {}
