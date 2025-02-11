/* eslint-disable prefer-rest-params */
import { Injectable } from '@nestjs/common';
import { BaseKafkaHandler } from 'src/utils/base.handler';
import { PLPCrawlerService } from './plp-crawler.service';
import { ConfigService } from '@nestjs/config';
import { SandyLogger } from 'src/utils/sandy.logger';
import KafkaProducerService from 'src/kafka/kafka.producer';
import puppeteer from 'puppeteer';

@Injectable()
export class PLPCrawlerHandler extends BaseKafkaHandler {
  constructor(
    configService: ConfigService,
    private readonly crawlerService: PLPCrawlerService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super(
      configService,
      configService.get(
        'app.oliveyoung.plpCrawler.name',
        'olive_young_plp_crawler',
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
      await page.goto(
        `${data.url}&pageIdx=${index + 1}&rowsPerPage=${perProductPage}`,
      );
      const html = await page.evaluate(() => document.body.innerHTML);
      console.log('pageIdx: ', index + 1);

      await this.kafkaProducer.send({
        topic: this.configService.get<string>(
          'app.oliveYoung.topics.plpParserRequest',
          'olive-young.plp-parser.request',
          { infer: true },
        ),
        message: JSON.stringify({
          url: `${data.url}&pageIdx=${index + 1}&rowsPerPage=${perProductPage}`,
          html,
        }),
      });
    }
  }

  // PLPCrawler listens to PLP topic
  getTopicNames(): string {
    return this.configService.get(
      'app.oliveYoung.topics.plpCrawlerRequest',
      'olive-young.plp.request',
      { infer: true },
    );
  }

  getGroupId(): string {
    return this.configService.get(
      'app.oliveYoung.plpCrawler.groupId',
      'olive-young-plp-crawler-group',
      { infer: true },
    );
  }

  getCount(): number {
    return this.configService.get(
      'app.oliveYoung.plpCrawler.numberOfHandlers',
      0,
      { infer: true },
    );
  }
}
