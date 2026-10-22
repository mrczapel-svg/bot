// bot.js
const puppeteer = require('puppeteer');

const searchTerm = 'Profesjonalne Cv,List Motywacyjny i Profil LinkedIn Na Zamówienie';
const YOUR_DOMAIN = 'profilkariery.pl';
const GOOGLE_URL = 'https://www.google.pl';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  try {
    console.log(`\n🔍 Szukam: "${searchTerm}"`);
    console.log(`📅 Czas: ${new Date().toLocaleString('pl-PL')}`);

    // === GOOGLE ===
    console.log('⏳ Otwieranie Google.pl...');
    await page.goto(GOOGLE_URL, { waitUntil: 'networkidle2' });
    
    // Zaakceptuj cookies na Google
    try {
      await page.click('[aria-label="Zaakceptuj wszystko"]', { timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch {
      console.log('⚠️ Brak przycisku cookies Google');
    }

    // Wpisz w wyszukiwarkę
    console.log('⏳ Wpisuję hasło...');
    await page.click('input[name="q"]');
    await page.type('input[name="q"]', searchTerm, { delay: 50 });
    await page.keyboard.press('Enter');

    // Czekaj na wyniki
    console.log('⏳ Czekam na wyniki Google...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Znajdź link do profilkariery.pl
    console.log(`🔎 Szukam ${YOUR_DOMAIN} w wynikach...`);
    const mainLink = await page.evaluate((domain) => {
      const links = Array.from(document.querySelectorAll('a'));
      const found = links.find(a => 
        a.href && 
        a.href.includes(domain) && 
        !a.href.includes('cache:')
      );
      return found ? found.href : null;
    }, YOUR_DOMAIN);

    if (!mainLink) {
      console.log(`❌ Nie znaleziono ${YOUR_DOMAIN}!`);
      await browser.close();
      return;
    }

    // === TWOJA STRONA ===
    console.log(`✅ Znaleziono! Klika w: ${mainLink}`);
    console.log('⏳ Wchodzę na Twoją stronę...');
    await page.goto(mainLink, { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Czekaj na pojawienie się banerka cookies
    await page.waitForTimeout(2000);

    // Kliknij przycisk "Akceptuję"
    console.log('⏳ Szukam przycisku "Akceptuję"...');
    try {
      // Szukaj przycisku po tekście "Akceptuję"
      await page.click('button:contains("Akceptuję")', { timeout: 5000 });
      console.log('✅ Zaakceptowano cookies!');
      await page.waitForTimeout(1500);
    } catch {
      try {
        // Alternatywa - szukaj przez XPath
        const [button] = await page.$x("//button[contains(text(), 'Akceptuję')]");
        if (button) {
          await button.click();
          console.log('✅ Zaakceptowano cookies!');
          await page.waitForTimeout(1500);
        }
      } catch {
        console.log('⚠️ Nie znaleziono przycisku "Akceptuję" - kontynuuję...');
      }
    }

    // CZEKAJ - Google Analytics się ładuje i zarejestrowuje
    console.log('⏳ Czekam na Google Analytics (rejestracja wizyt)...');
    await page.waitForTimeout(5000);

    console.log(`\n✅ ✅ ✅ GOTOWE!`);
    console.log(`✔️ Wizyta zalogowana w Google Analytics`);
    console.log(`📊 Powinna być widoczna w GA za ~30 sekund\n`);

  } catch (error) {
    console.error(`\n❌ BŁĄD: ${error.message}\n`);
  } finally {
    await browser.close();
  }
})();
