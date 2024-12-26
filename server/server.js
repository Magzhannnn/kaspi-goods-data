const express = require("express");
const cors = require("cors");

const puppeteer = require("puppeteer-core");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

app.use(cors()); // Включение CORS для всех маршрутов


// Массив товаров
const goods = [
  {
    link: "https://kaspi.kz/shop/p/apple-macbook-pro-14-2023-14-2-8-gb-ssd-512-gb-macos-mtl73-114877279/?c=750000000",
    kaspiId: "114877279",
    cityId: "750000000",
  },
  {
    link: "https://kaspi.kz/shop/p/apple-iphone-16-pro-max-256gb-zolotistyi-123890547/?c=750000000",
    kaspiId: "123890547",
    cityId: "750000000",
  },
  {
    link: "https://kaspi.kz/shop/p/apple-airpods-max-2-cherno-sinii-128622804/?c=750000000",
    kaspiId: "128622804",
    cityId: "750000000",
  },
];

// Функция для получения данных через Puppeteer и обработки с помощью Cheerio
async function fetchPricesForGoods(goods) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", // Укажи свой путь
  });

  for (const product of goods) {
    console.log(`Открываем URL: ${product.link}`);
    const page = await browser.newPage();
    await page.goto(product.link);

    // Подождать загрузки данных
    await page.waitForSelector(".sellers-table__self");

    // Получаем HTML страницы
    const html = await page.content();

    // Используем Cheerio для парсинга HTML
    const $ = cheerio.load(html);
    const prices = [];

    // Ищем таблицу с классом 'sellers-table__self'
    $("table.sellers-table__self tbody tr").each((index, row) => {
      if (index < 5) {
        // Ограничиваем первыми 5 продавцами
        // Извлекаем имя продавца
        const merchantName = $(row).find("td:first-child a").text().trim();

        // Извлекаем цену
        const price = $(row)
          .find(".sellers-table__price-cell-text")
          .first()
          .text()
          .replace(/\D/g, "")
          .trim(); // Чистим цену от символов

        // Извлекаем информацию о доставке
        const deliveryOptions = [];
        $(row)
          .find(".sellers-table__delivery-cell-option")
          .each((_, option) => {
            const deliveryText = $(option).text().trim();
            deliveryOptions.push(deliveryText);
          });

        prices.push({
          merchantName,
          price,
          deliveryOptions,
        });
      }
    });
    product.prices = prices;

    await page.close();
  }

  await browser.close();
}


// Проксирование запросов к Kaspi API
app.get("/get-kaspi-good", async (req, res) => {
    await fetchPricesForGoods(goods).catch(console.error);
    console.log(goods)
    return res.json(goods)
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Прокси-сервер запущен на http://localhost:${PORT}`);
});
