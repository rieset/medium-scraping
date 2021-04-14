import { ScrapingParserType } from "../scraping.model";

const cheerio = require('cheerio');
const TurndownService = require('turndown');
const turndownService = new TurndownService()

export interface TwitterModel {
  followers?: string
  joined?: string
  tweets?: string
  isPoster?: boolean
  poster?: string
}

export class Twitter {

  public parserType:  ScrapingParserType = 'puppeteer';

  public subscribe: string = '^https://twitter.*'

  public parser(html: string): any {
    const article: TwitterModel = {
      followers: "0",
      joined: "undefined",
      tweets: "0",
      isPoster: false,
      poster: "undefined"
    };

    const $ = cheerio.load(html);

    $("#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-1gm7m50.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(1) div.css-1dbjc4n.r-1ifxtd0 div:nth-child(2) > a > span.css-901oao.css-16my406.r-18jsvk2.r-poiln3.r-b88u0q.r-bcqeeo.r-qvutc0 > span").each(function() {
      article.followers = this.children[0]?.data;
    });

    $("div[data-testid=UserProfileHeader_Items] span").each(function() {
      article.joined = this.children[1]?.data;
    });

    $("div[data-testid=titleContainer] div.css-901oao.css-bfa6kz").each(function() {
      article.tweets = this.children[0]?.data;
    })

    $("div.r-1p0dtai.r-1pi2tsx.r-1d2f490.r-u8s1d.r-ipm5af.r-13qz1uu img").each(function() {
      article.isPoster = true
      article.poster = this.attribs.src
    })

    return Promise.resolve(article);
  }

}

export const twitter = new Twitter();
