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
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
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

    // Szukaj linku - aż znajdzie!
    let mainLink = null;
    let page_num = 1;
    const MAX_PAGES = 20;

    while (!mainLink && page_num <= MAX_PAGES) {
      console.log(`🔎 Szukam ${YOUR_DOMAIN} na stronie ${page_num}...`);
      
      mainLink = await page.evaluate((domain) => {
        const links = Array.from(document.querySelectorAll('a'));
        const found = links.find(a => 
          a.href && 
          a.href.includes(domain) && 
          !a.href.includes('cache:')
        );
        return found ? found.href : null;
      }, YOUR_DOMAIN);

      if (!mainLink) {
        console.log(`⚠️ Nie znaleziono na stronie ${page_num}, szukam dalej...`);
        
        // Scroll do dołu
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        // Idź na następną stronę
        try {
          let nextButton = null;
          [nextButton] = await page.$x("//a[contains(text(), 'Następna')]");
          
          if (nextButton) {
            console.log('⏳ Przechodzę na stronę ' + (page_num + 1) + '...');
            await nextButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
            await page.waitForTimeout(1500);
            page_num++;
          } else {
            console.log('❌ Koniec wyników Google!');
            break;
          }
        } catch (error) {
          console.log('❌ Błąd przy przechodzeniu do następnej strony');
          break;
        }
      }
    }

    if (!mainLink) {
      console.log(`\n❌ Nie znaleziono ${YOUR_DOMAIN} w wynikach!`);
      await browser.close();
      return;
    }

    // === TWOJA STRONA ===
    console.log(`\n✅ ZNALEZIONO! Klika w: ${mainLink}`);
    console.log('⏳ Wchodzę na Twoją stronę...');
    await page.goto(mainLink, { waitUntil: 'networkidle2', timeout: 15000 });
    
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
