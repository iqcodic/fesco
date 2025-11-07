const playwright = require('playwright');

async function scrapeBill(reference) {
  const url = 'https://bill.pitc.com.pk/fescobill';
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const inputSelectors = ['input[name="refno"]','input[name="reference"]','input#ref','input#txtRef','input[type="text"]','input'];
    let inputFound = null;
    for (const s of inputSelectors) { if (await page.$(s)) { inputFound = s; break; } }
    if (!inputFound) throw new Error('Reference input not found.');
    await page.fill(inputFound, '');
    await page.type(inputFound, reference, { delay: 40 });
    const buttonSelectors = ['button[type="submit"]','button#btnSearch','button.search-button','button','input[type="submit"]'];
    let clicked = false;
    for (const s of buttonSelectors) {
      const b = await page.$(s);
      if (b) { await b.click(); clicked = true; break; }
    }
    if (!clicked) { await page.press(inputFound, 'Enter'); }
    const resultSelectors = ['#result','.result','.bill-details','#billDetails','table','.panel-body'];
    let resultHtml = null;
    for (const s of resultSelectors) {
      try {
        await page.waitForSelector(s, { timeout: 5000 });
        resultHtml = await page.$eval(s, el => el.innerHTML);
        break;
      } catch (e) {}
    }
    if (!resultHtml) { await page.waitForTimeout(1500); resultHtml = await page.content(); }
    const text = await page.innerText('body');
    const amountMatch = text.match(/(?:Rs\.?|PKR|Rupees)?\s*([0-9,]+(?:\.\d+)?)/i);
    const dueMatch = text.match(/Due Date[:\s]*([A-Za-z0-9,\-\/ ]{6,40})/i) || text.match(/Due[:\s]*([A-Za-z0-9,\-\/ ]{6,40})/i);
    const nameMatch = text.match(/Name[:\s]*([A-Za-z0-9 \-\.]+)/i);
    const result = {
      reference,
      amount: amountMatch ? amountMatch[1] : null,
      due_date: dueMatch ? dueMatch[1].trim() : null,
      name: nameMatch ? nameMatch[1].trim() : null,
      raw_text_snippet: text.substring(0, 2000),
      raw_html_snippet: resultHtml ? resultHtml.substring(0, 2000) : null
    };
    await browser.close();
    return result;
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
}
module.exports = { scrapeBill };
