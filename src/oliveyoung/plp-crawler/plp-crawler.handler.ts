/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { PLPCrawlerService } from './plp-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';
import { KafkaTopics, PLPCrawlerConfigs } from '../constants';

@Injectable()
export class PLPCrawlerHandler extends BaseKafkaHandler {
  constructor(
    configService: ConfigService,
    private readonly crawlerService: PLPCrawlerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super(configService, PLPCrawlerConfigs.name);
    this.params = arguments;
  }

  public validator(): Promise<void> {
    return Promise.resolve();
  }

  public async process(data: any, logger: SandyLogger): Promise<void> {
    logger.log(`Processing product: ${data.url}`);
    const page = 1;
    const maximumPageSize = 10000;
    const url = `${data.url}&pageIdx=${page}&rowsPerPage=${maximumPageSize}`;
    const currentUrl = new URL(url);
    const searchParams = currentUrl.searchParams;
    const categoryId = searchParams.get('dispCatNo');
    const html = await this.crawlerService.fetchProduct(url);

    await this.kafkaProducer.send({
      topic: KafkaTopics.plpParserRequest,
      message: JSON.stringify({
        url,
        html,
        categoryId,
      }),
    });
  }

  // PLPCrawler listens to PLP topic
  getTopicNames(): string {
    return KafkaTopics.plpCrawlerRequest;
  }

  getGroupId(): string {
    return PLPCrawlerConfigs.groupId;
  }

  getCount(): number {
    return this.configService.get('app.oliveYoung.numberOfPlpCrawlers', 0, {
      infer: true,
    });
  }
}
