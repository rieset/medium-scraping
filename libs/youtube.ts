import { ScrapingParserType } from "../scraping.model";

const cheerio = require('cheerio');
const TurndownService = require('turndown');
const turndownService = new TurndownService()

export interface YoutubeModel {
  title?: string
  description?: string
  poster?: string
  content?: string
  tags?: string[]
  publishedAt?: number
}

export class Youtube {

  public parserType:  ScrapingParserType = 'puppeteer';

  public subscribe: string = '^https://youtu\.be.*'

  public parser(html: string): any {
    const article: YoutubeModel = {};

    const $ = cheerio.load(html);

    $("meta[itemprop='name']").each(function() {
      article.title = this.attribs.content;
    });

    $("meta[itemprop='description']").each(function() {
      article.description = this.attribs.content;
    });

    $("meta[itemprop='datePublished']").each(function() {
      article.publishedAt = new Date(this.attribs.content).valueOf();
    });

    $("link[itemprop='url']").each(function() {
      article.poster = this.attribs.href;
    });

    article.tags = [];
    $("meta[property='og:video:tag']").each(function() {
      article.tags.push(this.attribs.content.replace(/^#/, ''));
    });

    return Promise.resolve(article);
  }

}

export const youtube = new Youtube();
