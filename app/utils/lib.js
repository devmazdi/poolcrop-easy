import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const getProductByUrl = async(sUrl) => {
  try {
    const browser = await puppeteer.launch();
    const [page] = await browser.pages();

    await page.goto(sUrl, { waitUntil: 'networkidle0', timeout: 0 });
    const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    await browser.close();
    const $ = cheerio.load(data);
    let pData = {};
    let img = [];
    pData.title = $('h1').html();
    pData.id = $('[data-test-selector="ProductDetailsPartNumber"]').html().split('</span>').pop();
    pData.weight = $('[data-attributetypeid="0149ec7e-4846-409b-8bf3-accb0142508b"] [data-test-selector="attributes_item_value"]').html().split(' ')[0];
    pData.description = $('[data-test-selector="productDetails_htmlContent"]').html();
    let $images = $('.gvnsqD img');
    $images.each(function(){
      let bImg = $(this).attr('src').replace('medium', 'large').replace('small','large');
      img = [...img,  bImg];
    });
    let gImages = [...new Set(img)];
    pData.images = gImages;
    //console.log(pData);
    return {success: true, productData: pData}

  } catch (error) {
    console.log(error);
    return {success: false, error: error};
  }
}

export {getProductByUrl}