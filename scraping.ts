import {
  ScrapingConditionModel,
  ScrapingInputModel,
  ScrapingOutputModel,
} from './scraping.model';
import {youtube} from './libs/youtube';
import {medium} from './libs/medium';

const puppeteer = require('puppeteer');
const tress = require('tress');
const needle = require('needle');
const log = require('cllc')();

export class Scraping {

  private queue = tress(this.process.bind(this));

  private results = [];

  private browser;

  private page;

  private cancel = () => {};

  private conditions: ScrapingConditionModel[] = [{
    parserType: medium.parserType,
    parser: medium.parser,
    test: medium.subscribe
  }, {
    parserType: youtube.parserType,
    parser: youtube.parser,
    test: youtube.subscribe
  }]

  constructor() {
    this.queue.concurrency = -1000;
  }

  public async start (list: ScrapingInputModel[]): Promise<any[]> {
    log.start('Articles list %s, Success articles %s, Failed articles %s, Skipped articles %s.');
    log.step(list.length, 0, 0);

    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();

    this.queue.push(list);

    return new Promise((done) => {
      this.queue.drain = () => {
        this.drain();
        done(this.results);
      }
    });
  }

  async drain() {
    log.finish();
    await this.browser.close();
  }

  async process(job, done) {
    if (job && job.link) {
      const parser = this.conditions.find((condition) => {
        return new RegExp(condition.test).test(job.link)
      }) || null

      if (!parser) {
        log.step(0, 0, 1, 0);
        done(new Error('Not found parser'));
        return
      }

      const html = await this.getHtml(job.link, parser.parserType);

      const data = {
        ... await parser.parser(html),
        ...job
      };

      this.results.push(await this.postProcess(data));

      log.step(0, 1, 0, 0);
      done();
    } else {
      log.step(0, 0, 0, 1);
      done(null, 'message');
    }
  }

  private async postProcess(data) {
    return {
      ...data,
      tags: data.tags instanceof Array ? data.tags : this.postProcessTags(data.tags)
    }
  }

  private postProcessTags(tags: string | unknown): string[] {
    if (typeof tags !== 'string') {
      return [];
    }

    return tags
      .replace(/\s/, ',')
      .split(',')
      .map((tag) => {
        return tag
          .trim()
          .replace(/^#/g, '')
          .toLowerCase()
      })
  }

  async getHtml(link: string, parserType: 'puppeteer' | 'needle'): Promise<string> {
    if (parserType === 'puppeteer') {
      return await this.usePuppeteer(link)
    }

    if (parserType === 'needle') {
      return await this.useNeedle(link)
    }
  }

  async usePuppeteer(link: string): Promise<string> {
    await this.page.goto(link, {
      waitUntil: 'networkidle2',
    });
    const htmlHandle = await this.page.$('html');
    return await this.page.evaluate(body => body.innerHTML, htmlHandle);
  }

  async useNeedle(link: string): Promise<string> {
    return await needle('get', link)
    .then((data) => {
      return data.body
    })
  }

}
