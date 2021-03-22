import {ScrapingParserType} from '../scraping.model';

const cheerio = require('cheerio');
const TurndownService = require('turndown');
const turndownService = new TurndownService()

export interface MediumModel {
  title?: string
  description?: string
  poster?: string
  content?: string
  tags?: string
  publishedAt?: number
}

export class Medium {

  public parserType: ScrapingParserType = 'needle';

  public subscribe: string = '^https://medium\.com.*'

  public parser(html: string): any {
    const article: MediumModel = {};

    const $ = cheerio.load(html);

    $("meta[property='twitter:title']").each(function() {
      article.title = this.attribs.content;
    });

    $('meta[name=description]').each(function() {
      article.description = this.attribs.content;
    });

    $("meta[property='og:image']").each(function() {
      article.poster = this.attribs.content;
    });

    $("meta[property='article:published_time']").each(function() {
      article.publishedAt = this.attribs.content;
    });

    $("article section").eq(1).each(function() {
      let html = $(this).html();
      html = html.replace(/^.*<\/figure>/, '');
      article.content = turndownService.turndown(html);
    });

    $("script[type='application/ld+json']").each(function() {
      const data = JSON.parse($(this).html());
      article.publishedAt = new Date(data.datePublished).valueOf();
      article.tags = data.keywords
        .filter((keyword) => keyword.indexOf('Tag:') === 0)
        .map((keyword) => keyword.replace('Tag:', '').toLowerCase())
    })

    return Promise.resolve(article);
  }

}

export const medium = new Medium();
