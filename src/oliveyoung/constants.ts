export const PDPCrawlerConfigs = {
  name: 'olive-young.pdp-crawler',
  groupId: 'olive-young-pdp-crawler-group',
};

export const CategoryCrawlerConfigs = {
  name: 'olive-young.category-crawler',
  groupId: 'olive-young-category-crawler-group',
};

export const KafkaTopics = {
  categoryCrawlerRequest: 'olive-young.category-crawl.request',
  categoryParserRequest: 'olive-young.category-parser.request',

  plpCrawlerRequest: 'olive-young.plp-crawler.request',
  plpParserRequest: 'olive-young.plp-parser.request',

  pdpCrawlerRequest: 'olive-young.pdp-crawler.request',
  pdpParserRequest: 'olive-young.pdp-parser.request',
};
