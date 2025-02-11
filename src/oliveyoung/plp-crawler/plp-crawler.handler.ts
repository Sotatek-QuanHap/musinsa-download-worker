/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { PLPCrawlerService } from './plp-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';
import puppeteer from 'puppeteer';
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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(data.url);

    const totalProducts = await page.evaluate(() => {
      const element = document.querySelector('.cate_info_tx span');
      return element ? parseInt(element?.textContent?.trim() || '0', 10) : 0;
    });
    const perProductPage = await page.evaluate(() => {
      const element = document.querySelector('.count_sort.tx_num ul li.on a');
      return element ? parseInt(element?.textContent?.trim() || '0', 10) : 0;
    });

    const totalPages = Math.ceil((totalProducts || 0) / (perProductPage || 1));

    const pages = Array.from({ length: totalPages }, (_, i) => i + 5);
    for (const index in pages) {
      const page = await browser.newPage();
      const url = `${data.url}&pageIdx=${Number(index) + 1}&rowsPerPage=${perProductPage}`;
      await page.goto(url);
      const html = await page.evaluate(() => document.body.innerHTML);
      console.log('pageIdx: ', Number(index) + 1);

      await this.kafkaProducer.send({
        topic: KafkaTopics.plpCrawlerRequest,
        message: JSON.stringify({
          url,
          html,
        }),
      });
    }
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
