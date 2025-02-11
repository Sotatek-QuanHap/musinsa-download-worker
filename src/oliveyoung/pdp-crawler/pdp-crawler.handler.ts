/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { PDPCrawlerService } from './pdp-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';

@Injectable()
export class PDPCrawlerHandler extends BaseKafkaHandler {
  constructor(
    configService: ConfigService,
    private readonly crawlerService: PDPCrawlerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super(
      configService,
      configService.get(
        'app.oliveyoung.pdpCrawler.name',
        'olive_young_pdp_crawler',
        { infer: true },
      ),
    );
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
      topic: this.configService.get<string>(
        'app.oliveYoung.topics.pdpParserRequest',
        'olive-young.pdp-parser.request',
        { infer: true },
      ),
      message: JSON.stringify({ url: data.productUrl, html }),
    });
  }

  // PDPCrawler listens to PLP topic
  getTopicNames(): string {
    return this.configService.get(
      'app.oliveYoung.topics.pdpCrawlerRequest',
      'olive-young.pdp-crawler.request',
      { infer: true },
    );
  }

  getGroupId(): string {
    return this.configService.get(
      'app.oliveYoung.pdpCrawler.groupId',
      'olive-young-pdp-crawler-group',
      { infer: true },
    );
  }

  getCount(): number {
    return this.configService.get(
      'app.oliveYoung.pdpCrawler.numberOfHandlers',
      0,
      { infer: true },
    );
  }
}
