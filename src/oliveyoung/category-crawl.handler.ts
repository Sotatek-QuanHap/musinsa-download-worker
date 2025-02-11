import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseCrawlHandler } from '../utils/base-crawler.handler';
import { KafkaNamePatten } from '../constant/kafka.constant';
import { SandyLogger } from '../utils/sandy.logger';

@Injectable()
export class CategoryCrawlHandler extends BaseCrawlHandler {
  constructor(configService: ConfigService) {
    super(
      configService,
      configService.get(
        'app.topics.categoryCrawlerRequest',
        'category-crawl.request',
        { infer: true },
      ),
    );
  }

  async process(data: any, logger: SandyLogger): Promise<any> {
    const res = await axios.get(data.url);
    const html = res.data;
    return {
      resultTopic: this.configService.get<string>(
        'app.oliveYoung.topics.categoryParserRequest',
        'category-parser.request',
        { infer: true },
      ),
      data: JSON.stringify({ html }),
    };
  }

  public validator(): Promise<void> {
    return Promise.resolve();
  }
}
