import {Scraping} from './scraping';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'fs';
import neatCsv = require('neat-csv');
import {ScrapingInputModel} from './scraping.model';

const config = process.env.CONFIGFILE;
const start = parseInt(process.env.START, 10) || 0;
const finish = parseInt(process.env.STOP, 10) || undefined;

if (typeof config !== 'string') {
  throw new Error('Config is not passed')
}

if (existsSync(config) === false) {
  throw new Error('Config does not exist or may not be available')
}

neatCsv<ScrapingInputModel>(readFileSync(config, 'utf8'))
.then(async (list: ScrapingInputModel[]) => {
  const scraping = new Scraping();
  return await scraping.start(list, start, finish);
})
.then(async (results: any[]) => {
  writeFileSync(__dirname + "/result.json", JSON.stringify(results, null, '\t'), {
    flag: 'w'
  });
  return results;
})
.then(async (results: any[]) => {
  return results;
})
