import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PDPCrawlerService {
  private readonly logger = new Logger(PDPCrawlerService.name);

  constructor() {}

  async fetchInfos(productUrl: string) {
    const [productHtml, extraInfoHtml, optionsInfoHtml] = await Promise.all([
      this.fetchProduct(productUrl),
      this.fetchProductExtraInfo(productUrl),
      this.fetchProductOptions(productUrl),
    ]);

    return {
      url: productUrl,
      productHtml,
      extraInfoHtml,
      optionsInfoHtml,
    };
  }

  async fetchProduct(productUrl: string) {
    try {
      // TODO: Add proxy rotater
      const { data: html } = await axios.get(productUrl);
      return html;
    } catch (error) {
      this.logger.error(`Error fetching ${productUrl}: ${error.message}`);
    }
  }

  async fetchProductExtraInfo(productUrl: string) {
    try {
      const url = new URL(productUrl);
      const productId = url.searchParams.get('goodsNo');
      const extraInfoURL = `${url.origin}/store/goods/getGoodsArtcAjax.do?goodsNo=${productId}`;
      const { data: html } = await axios.post(extraInfoURL);
      return html;
    } catch (error) {
      this.logger.error(
        `Error fetching extra infor ${productUrl}: ${error.message}`,
      );
    }
  }

  async fetchProductOptions(productUrl: string) {
    try {
      const url = new URL(productUrl);
      const productId = url.searchParams.get('goodsNo');
      const optionsInfoURL = `${url.origin}/store/goods/getOptInfoListAjax.do?goodsNo=${productId}`;
      const { data: html } = await axios.post(optionsInfoURL);
      return html;
    } catch (error) {
      this.logger.error(
        `Error fetching extra infor ${productUrl}: ${error.message}`,
      );
    }
  }
}
