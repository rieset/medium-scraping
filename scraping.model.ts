export interface ScrapingInputModel {
  link: string;
  format: string;
  type: string;
}

export interface ScrapingOutputModel extends ScrapingInputModel {
  title: string;
}

export type ScrapingParserType = 'puppeteer' | 'needle';

export interface ScrapingConditionModel {
  parserType: ScrapingParserType
  parser: (html: string) => any
  test: string
}
