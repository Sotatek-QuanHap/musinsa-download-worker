import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PDPCrawlerService {
  private readonly logger = new Logger(PDPCrawlerService.name);

  constructor() {}

  async fetchProduct(productUrl: string) {
    try {
      // TODO: Add proxy rotater
      const { data: html } = await axios.get(productUrl);
      return html;
    } catch (error) {
      this.logger.error(`Error fetching ${productUrl}: ${error.message}`);
    }
  }
}
