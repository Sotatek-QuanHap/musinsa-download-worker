/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { CategoryCrawlerService } from './category-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';
import { CategoryCrawlerConfigs, KafkaTopics } from '../constants';

@Injectable()
export class CategoryCrawlerHandler extends BaseKafkaHandler {
  constructor(
    configService: ConfigService,
    private readonly crawlerService: CategoryCrawlerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super(configService, CategoryCrawlerConfigs.name);
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
      topic: KafkaTopics.categoryParserRequest,
      message: JSON.stringify({ url: data.productUrl, html }),
    });
  }

  // CategoryCrawler listens to Category topic
  getTopicNames(): string {
    return KafkaTopics.categoryCrawlerRequest;
  }

  getGroupId(): string {
    return CategoryCrawlerConfigs.groupId;
  }

  getCount(): number {
    return this.configService.get(
      'app.oliveYoung.numberOfCategoryCrawlers',
      0,
      { infer: true },
    );
  }
}
