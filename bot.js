// bot.js
const puppeteer = require('puppeteer');

// Miasta po całej Polsce z koordynatami
const polskieMiasta = [
  { name: 'Warszawa', lat: 52.2297, lng: 21.0122 },
  { name: 'Kraków', lat: 50.0647, lng: 19.9450 },
  { name: 'Wrocław', lat: 51.1079, lng: 17.0385 },
  { name: 'Poznań', lat: 52.4064, lng: 16.9252 },
  { name: 'Gdańsk', lat: 54.3520, lng: 18.6466 },
  { name: 'Szczecin', lat: 53.4285, lng: 14.5528 },
  { name: 'Łódź', lat: 51.7592, lng: 19.4560 },
  { name: 'Katowice', lat: 50.2645, lng: 19.0238 },
  { name: 'Białystok', lat: 53.1325, lng: 23.1688 },
  { name: 'Rzeszów', lat: 50.0413, lng: 21.9993 },
  { name: 'Gdynia', lat: 54.4808, lng: 18.6305 },
  { name: 'Częstochowa', lat: 50.8118, lng: 19.1183 },
  { name: 'Sopot', lat: 54.4400, lng: 18.5567 },
  { name: 'Toruń', lat: 53.0238, lng: 18.5975 }
];

// Losowe miasto
function getLosoweeMiasto() {
  return polskieMiasta[Math.floor(Math.random() * polskieMiasta.length)];
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  
  // Losowe miasto
  const miasto = getLosoweeMiasto();
  
  // Polskie ustawienia
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  );
  
  await page.setViewport({ width: 390, height: 844 });
  
  // Geolokacja - LOSOWE MIASTO
  await page.setGeolocation({ latitude: miasto.lat, longitude: miasto.lng });
  
  // Polskie nagłówki
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pl-PL,pl;q=0.9',
  });

  try {
    console.log(`\n📄 Zaczynam na stronie głównej`);
    console.log(`🌍 Lokacja: ${miasto.name}`);
    console.log(`📅 Czas: ${new Date().toLocaleString('pl-PL')}`);

    // 1. Wejdź na stronę główną
    console.log('⏳ Wchodzę na profilkariery.pl...');
    await page.goto('https://profilkariery.pl', { waitUntil: 'networkidle2', timeout: 15000 });
    
    await page.waitForTimeout(2000);

    // Akceptuj cookies
    console.log('⏳ Akceptuję cookies...');
    try {
      const [button] = await page.$x("//button[contains(text(), 'Akceptuję')]");
      if (button) {
        await button.click();
        await page.waitForTimeout(1500);
      }
    } catch {
      console.log('⚠️ Brak cookies');
    }

    // 2. CZEKAJ 2 MINUTY
    console.log(`⏳ Czekam 2 minuty na stronie głównej (z ${miasto.name})...`);
    console.log('⏳ (GA zarejestrowuje czas na stronie)');
    await page.waitForTimeout(120000); // 2 minuty

    // 3. Kliknij pierwszy link
    console.log('\n✅ 2 minuty minęły! Klika na zamow-usluge-profesjonalne-cv.html');
    await page.goto('https://profilkariery.pl/zamow-usluge-profesjonalne-cv.html', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    
    console.log('✅ Weszło na stronę 1');
    await page.waitForTimeout(2000);

    // Akceptuj cookies
    try {
      const [button] = await page.$x("//button[contains(text(), 'Akceptuję')]");
      if (button) {
        await button.click();
      }
    } catch {}

    // 4. Czekaj chwilę
    await page.waitForTimeout(3000);

    // 5. Kliknij drugi link
    console.log('✅ Klika na potwierdzenie-cv.html');
    await page.goto('https://profilkariery.pl/potwierdzenie-cv.html', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    
    console.log('✅ Weszło na stronę 2');
    await page.waitForTimeout(2000);

    // Akceptuj cookies
    try {
      const [button] = await page.$x("//button[contains(text(), 'Akceptuję')]");
      if (button) {
        await button.click();
      }
    } catch {}

    // 6. Czekaj na GA
    console.log('\n⏳ Czekam na Google Analytics...');
    await page.waitForTimeout(5000);

    console.log(`\n✅ ✅ ✅ SUKCES!`);
    console.log(`✔️ Odwiedzina z ${miasto.name} zalogowana w GA`);
    console.log(`📊 Widoczna w Analytics za ~30 sekund\n`);

  } catch (error) {
    console.error(`\n❌ BŁĄD: ${error.message}\n`);
  } finally {
    await context.close();
    await browser.close();
  }
})();
