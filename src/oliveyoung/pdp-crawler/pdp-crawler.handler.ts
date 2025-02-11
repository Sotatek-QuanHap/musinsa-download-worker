/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { PDPCrawlerService } from './pdp-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';
import { KafkaTopics } from '../constants';

@Injectable()
export class PDPCrawlerHandler extends BaseKafkaHandler {
  constructor(
    configService: ConfigService,
    private readonly crawlerService: PDPCrawlerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super(configService, 'olive_young_pdp_crawler');
    this.params = arguments;
  }

  public validator(): Promise<void> {
    return Promise.resolve();
  }

  public async process(data: any, logger: SandyLogger): Promise<void> {
    logger.log(`Processing product: ${data.url}`);
    const html = await this.crawlerService.fetchProduct(data.url);

    // Send to Kafka for parsing
    await this.kafkaProducer.send({
      topic: KafkaTopics.pdpParserRequest,
      message: JSON.stringify({ url: data.productUrl, html }),
    });
  }

  // PDPCrawler listens to PDPCrawlerRequest topic
  getTopicNames(): string {
    return KafkaTopics.pdpCrawlerRequest;
  }

  getGroupId(): string {
    return 'olive-young-pdp-crawler-group';
  }

  getCount(): number {
    return this.configService.get('app.oliveYoung.numberOfPdpCrawlers', 0, {
      infer: true,
    });
  }
}
