/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { CategoryCrawlerService } from './category-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';

@Injectable()
export class CategoryCrawlerHandler extends BaseKafkaHandler {
  constructor(
    configService: ConfigService,
    private readonly crawlerService: CategoryCrawlerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super(
      configService,
      configService.get(
        'app.oliveyoung.categoryCrawler.name',
        'olive_young_category_crawler',
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
        'app.oliveYoung.topics.categoryParserRequest',
        'olive-young.category-parser.request',
        { infer: true },
      ),
      message: JSON.stringify({ url: data.productUrl, html }),
    });
  }

  // CategoryCrawler listens to Category topic
  getTopicNames(): string {
    return this.configService.get(
      'app.oliveYoung.topics.categoryCrawlerRequest',
      'olive-young.category-crawler.request',
      { infer: true },
    );
  }

  getGroupId(): string {
    return this.configService.get(
      'app.oliveYoung.categoryCrawler.groupId',
      'olive-young-category-crawler-group',
      { infer: true },
    );
  }

  getCount(): number {
    return this.configService.get(
      'app.oliveYoung.categoryCrawler.numberOfHandlers',
      0,
      { infer: true },
    );
  }
}
