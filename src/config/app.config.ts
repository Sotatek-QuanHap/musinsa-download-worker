import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from '.././utils/validate-config';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsString()
  @IsOptional()
  KAFKA_BROKERS: string;

  @IsString()
  @IsOptional()
  KAFKA_CLIENT: string;

  @IsString()
  @IsOptional()
  KAFKA_PDP_CRAWLER_TOPIC: string;

  @IsString()
  @IsOptional()
  KAFKA_PLP_CRAWLER_TOPIC: string;

  @IsInt()
  @IsOptional()
  OLIVE_YOUNG_PDP_CRAWLER_NUMBER: number;

  @IsString()
  OLIVE_YOUNG_KAFKA_PDP_CRAWLER_REQUEST_TOPIC: string;

  @IsString()
  OLIVE_YOUNG_KAFKA_PDP_PARSER_REQUEST_TOPIC: string;

  @IsString()
  OLIVE_YOUNG_KAFKA_PDP_RESULT_TOPIC: string;

  @IsString()
  OLIVE_YOUNG_CRAWLER_PDP_CRAWLER_NAME: string;

  @IsString()
  OLIVE_YOUNG_PDP_CRAWLER_GROUP_ID: string;

  @IsInt()
  @IsOptional()
  OLIVE_YOUNG_CATEGORY_CRAWLER_NUMBER: number;

  @IsString()
  OLIVE_YOUNG_KAFKA_CATEGORY_CRAWLER_REQUEST_TOPIC: string;

  @IsString()
  OLIVE_YOUNG_KAFKA_CATEGORY_PARSER_REQUEST_TOPIC: string;

  @IsString()
  OLIVE_YOUNG_KAFKA_CATEGORY_RESULT_TOPIC: string;

  @IsString()
  OLIVE_YOUNG_CRAWLER_CATEGORY_CRAWLER_NAME: string;

  @IsString()
  OLIVE_YOUNG_CATEGORY_CRAWLER_GROUP_ID: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
    kafka: {
      brokers: process.env.KAFKA_BROKERS || 'localhost:29092',
      client: process.env.KAFKA_CLIENT || 'musinsa-client',
    },
    oliveYoung: {
      pdpCrawler: {
        name:
          process.env.OLIVE_YOUNG_PDP_CRAWLER_NAME || 'olive_young_pdp_crawler',
        groupId:
          process.env.OLIVE_YOUNG_PDP_CRAWLER_GROUP_ID ||
          'olive-young-crawler-group',
        numberOfHandlers: process.env.OLIVE_YOUNG_PDP_CRAWLER_NUMBER || 0,
      },
      categoryCrawler: {
        name:
          process.env.OLIVE_YOUNG_CATEGORY_CRAWLER_NAME ||
          'olive_young_category_crawler',
        groupId:
          process.env.OLIVE_YOUNG_CATEGORY_CRAWLER_GROUP_ID ||
          'olive-young-crawler-group',
        numberOfHandlers: process.env.OLIVE_YOUNG_CATEGORY_CRAWLER_NUMBER || 0,
      },
      topics: {
        pdpCrawlerRequest:
          process.env.OLIVE_YOUNG_KAFKA_PDP_CRAWLER_REQUEST_TOPIC ||
          'olive-young.pdp-crawler.request',
        pdpParserRequest:
          process.env.OLIVE_YOUNG_KAFKA_PDP_PARSER_REQUEST_TOPIC ||
          'olive-young.pdp-parser.request',
        pdpResult:
          process.env.OLIVE_YOUNG_KAFKA_PDP_RESULT_TOPIC ||
          'olive-young.pdp-parser.request',
        categoryCrawlerRequest:
          process.env.OLIVE_YOUNG_KAFKA_CATEGORY_CRAWLER_REQUEST_TOPIC ||
          'olive-young.category-crawler.request',
        categoryParserRequest:
          process.env.OLIVE_YOUNG_KAFKA_CATEGORY_PARSER_REQUEST_TOPIC ||
          'olive-young.category-parser.request',
        categoryResult:
          process.env.OLIVE_YOUNG_KAFKA_CATEGORY_RESULT_TOPIC ||
          'olive-young.category-parser.request',
      },
    },
  };
});
