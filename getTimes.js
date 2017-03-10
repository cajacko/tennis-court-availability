#! /usr/bin/env node

require('dotenv').config();
require('chromedriver');
require('phantomjs-prebuilt');
const webdriver = require('selenium-webdriver');
const jsdom = require('jsdom');
const fs = require('fs');

const timeout = 1000;
const By = webdriver.By;
const driver = new webdriver.Builder()
    // .forBrowser('chrome')
    .forBrowser('phantomjs')
    .build();

function twoDigitTimeString(number) {
  let value = number;

  if (value < 10) {
    value = `0${value}`;
  }

  return value;
}

function timeFourCharacters(date) {
  const hours = twoDigitTimeString(date.getHours());
  const minutes = twoDigitTimeString(date.getMinutes());

  return `${hours}-${minutes}`;
}

driver.get('https://better.legendonlineservices.co.uk');
driver.findElement(By.name('login.Email')).sendKeys(process.env.EMAIL);
driver.findElement(By.name('login.Password')).sendKeys(process.env.PASSWORD);
driver.findElement(By.css('#login')).click();
driver.get('https://better.legendonlineservices.co.uk/camden_-_kentish_tow/BookingsCentre/Index');
driver.findElement(By.linkText('Islington')).click().then(() => {
  setTimeout(() => {
    driver.findElement(By.css('.rg_11636:nth-child(141) span')).click().then(() => {
      setTimeout(() => {
        driver.findElement(By.css('#behaviours .activityItem:nth-child(2) label')).click().then(() => {
          setTimeout(() => {
            driver.findElement(By.css('#activities .activityItem:first-child label')).click().then(() => {
              setTimeout(() => {
                driver.findElement(By.css('#bottomsubmit')).click().then(() => {
                  setTimeout(() => {
                    driver.switchTo().frame('TB_iframeContent');
                    driver.findElement(By.css('#resultContainer')).then((element) => {
                      element.getAttribute('innerHTML').then((text) => {
                        jsdom.env(
                          text,
                          ['http://code.jquery.com/jquery.js'],
                          (err, window) => {
                            const availabilty = {};
                            let currentDay = 'no-day';

                            window.$('.sportsHallSlotWrapper > div').each((index, div) => {
                              const itemText = window.$(div).text();
                              let re;
                              let m;

                              if (!window.$(div).hasClass('sporthallSlot')) {
                                currentDay = itemText;
                                availabilty[currentDay] = {};
                              } else if (window.$(div).find('.sporthallSlotAddLink').length) {
                                re = /Ctr([0-9]*:[0-9]*) ([0-9]*)/g;
                                m = re.exec(itemText);

                                if (m) {
                                  availabilty[currentDay][m[1]] = m[2];
                                }
                              } else {
                                re = /Ctr([0-9]*:[0-9]*)/g;
                                m = re.exec(itemText);

                                if (m) {
                                  availabilty[currentDay][m[1]] = 0;
                                }
                              }
                            });

                            const monthNum = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
                            const nowDate = new Date();
                            let date = `${nowDate.getFullYear()}-${monthNum[nowDate.getMonth()]}-${twoDigitTimeString(nowDate.getDate())}`;
                            date = `${date} ${timeFourCharacters(nowDate)}`;
                            const fileName = `./json/${date}.json`;

                            const json = JSON.stringify(availabilty, null, 2);
                            fs.writeFileSync(fileName, json, 'utf8');

                            // eslint-disable-next-line
                            console.log(json);
                            driver.quit();
                          }
                        );
                      });
                    });
                  }, 2000);
                });
              }, timeout);
            });
          }, timeout);
        });
      }, timeout);
    });
  }, timeout);
});
