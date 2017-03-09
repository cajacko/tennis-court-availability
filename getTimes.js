#! /usr/bin/env node

require('dotenv').config();
require('chromedriver');
require('phantomjs-prebuilt');
const webdriver = require('selenium-webdriver');
var jsdom = require("jsdom");
const fs = require('fs');

const By = webdriver.By;
const until = webdriver.until;

var driver = new webdriver.Builder()
    // .forBrowser('chrome')
    .forBrowser('phantomjs')
    .build();

const timeout = 1000;

function twoDigitTimeString(number) {
  if (number < 10) {
    number = '0' + number;
  }

  return number;
}

function timeFourCharacters(date) {
  const hours = twoDigitTimeString(date.getHours());
  const minutes = twoDigitTimeString(date.getMinutes());

  return hours + '-' + minutes;
}

driver.get('https://better.legendonlineservices.co.uk');
driver.findElement(By.name('login.Email')).sendKeys(process.env.EMAIL);
driver.findElement(By.name('login.Password')).sendKeys(process.env.PASSWORD);
driver.findElement(By.css('#login')).click();
driver.get('https://better.legendonlineservices.co.uk/camden_-_kentish_tow/BookingsCentre/Index');
driver.findElement(By.linkText('Islington')).click().then(function() {
  setTimeout(function() {
    driver.findElement(By.css('.rg_11636:nth-child(141) span')).click().then(function() {
      setTimeout(function() {
        driver.findElement(By.css('#behaviours .activityItem:nth-child(2) label')).click().then(function() {
          setTimeout(function() {
            driver.findElement(By.css('#activities .activityItem:first-child label')).click().then(function() {
              setTimeout(function() {
                driver.findElement(By.css('#bottomsubmit')).click().then(function() {
                  setTimeout(function() {
                    driver.switchTo().frame("TB_iframeContent");
                    driver.findElement(By.css('#resultContainer')).then(function(element) {
                      element.getAttribute("innerHTML").then(function(text) {
                        jsdom.env(
                          text,
                          ["http://code.jquery.com/jquery.js"],
                          function (err, window) {

                            var availabilty = {};
                            var currentDay = 'no-day';

                            window.$('.sportsHallSlotWrapper > div').each(function(index, div) {
                              var text = window.$(div).text();

                              if (!window.$(div).hasClass('sporthallSlot')) {
                                currentDay = text;
                                availabilty[currentDay] = {};
                              } else if (window.$(div).find('.sporthallSlotAddLink').length) {
                                var re = /Ctr([0-9]*:[0-9]*) ([0-9]*)/g;
                                var m = re.exec(text);

                                if (m) {
                                  availabilty[currentDay][m[1]] = m[2];
                                }
                              } else {
                                var re = /Ctr([0-9]*:[0-9]*)/g;
                                var m = re.exec(text);

                                if (m) {
                                  availabilty[currentDay][m[1]] = 0;
                                }
                              }
                            });

                            const monthNum = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
                            const nowDate = new Date();
                            let date = nowDate.getFullYear() + '-' + monthNum[nowDate.getMonth()] + '-' + twoDigitTimeString(nowDate.getDate());
                            date = date + ' ' + timeFourCharacters(nowDate);
                            const fileName = './json/' + date + '.json';

                            const json = JSON.stringify(availabilty, null, 2);
                            fs.writeFileSync(fileName, json, 'utf8');

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


// driver.wait(until.titleIs('webdriver - Google Search'), 1000);
// driver.quit();
