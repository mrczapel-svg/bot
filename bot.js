// bot.js
const puppeteer = require('puppeteer');

const YOUR_URL = 'https://profilkariery.pl';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
  );

  try {
    console.log(`\n📄 Wchodzę na: ${YOUR_URL}`);
    console.log(`📅 Czas: ${new Date().toLocaleString('pl-PL')}`);

    // Wejdź na stronę
    console.log('⏳ Ładuję stronę...');
    await page.goto(YOUR_URL, { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Czekaj na pojawienie się banerka cookies
    await page.waitForTimeout(2000);

    // Kliknij przycisk "Akceptuję"
    console.log('⏳ Szukam przycisku "Akceptuję"...');
    try {
      const [button] = await page.$x("//button[contains(text(), 'Akceptuję')]");
      if (button) {
        await button.click();
        console.log('✅ Zaakceptowano cookies!');
        await page.waitForTimeout(1500);
      }
    } catch {
      console.log('⚠️ Nie znaleziono przycisku cookies - kontynuuję...');
    }

    // CZEKAJ - Google Analytics się ładuje i zarejestrowuje
    console.log('⏳ Czekam na Google Analytics...');
    await page.waitForTimeout(5000);

    console.log(`\n✅ ✅ ✅ SUKCES!`);
    console.log(`✔️ Wizyta zalogowana w Google Analytics`);
    console.log(`📊 Powinna być widoczna w GA za ~30 sekund\n`);

  } catch (error) {
    console.error(`\n❌ BŁĄD: ${error.message}\n`);
  } finally {
    await browser.close();
  }
})();
