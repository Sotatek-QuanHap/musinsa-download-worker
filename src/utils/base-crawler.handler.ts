import { ConfigService } from '@nestjs/config';
import { BaseKafkaHandler } from './base.handler';
import { SandyLogger } from './sandy.logger';
import KafkaProducerService from '../kafka/kafka.producer';

export abstract class BaseCrawlHandler extends BaseKafkaHandler {
  protected platform: string;

  constructor(
    protected configService: ConfigService,
    protected namePattern: string,
  ) {
    super(configService, namePattern);
  }

  public setPlatform(platform: string) {
    this.platform = platform;
    this.name = `${this.platform}.${this.namePattern}`;
  }

  public clone() {
    const handlerInstance: BaseCrawlHandler = super.clone();
    handlerInstance.setPlatform(this.platform);
    return handlerInstance;
  }

  public async setup(): Promise<void> {
    await super.setup();
    this.name = `${this.platform}.${this.namePattern}`;
    console.log('this name set platform', this.name);
  }

  public async handle(kafkaData: any, msg: any, logger: SandyLogger) {
    try {
      const rs = await this.process(msg, logger);
      await this.onProcessSuccess(kafkaData, msg, rs, logger);
    } catch (error) {
      await this.onProcessError(kafkaData, msg, error, logger);
    }
  }

  abstract process(data: any, logger: SandyLogger): Promise<any>;
  async onProcessSuccess(
    kafkaData: any,
    msg: any,
    result: any,
    logger: SandyLogger,
  ) {
    if (result.resultTopic) {
      await KafkaProducerService.push({
        topic: `${this.platform}.${result.resultTopic}`,
        message: result.data,
      });
    }
  }

  async onProcessError(
    kafkaData: any,
    msg: any,
    error: any,
    logger: SandyLogger,
  ) {
    logger.errorAndFinish(`error at hanlder ${this.name}`, error);
  }
}
