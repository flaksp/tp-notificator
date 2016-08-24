# Guild Wars 2 Trading Post Notificator

You can get it at extension stores now:
* [Chrome Store](https://chrome.google.com/webstore/detail/fmfminppfcknlpekeffahpnpfahmhojk) &mdash; Google Chrome, Google Chrome Canary, Chromium and Yandex.Browser
* [Opera Store](https://addons.opera.com/extensions/details/guild-wars-2tm-trading-post-notificator/) &mdash; Opera 15+

Someone asked me to release extension on GitHub and I did so. I've never thought I will show its sources though, hope you'll be okay with my shitty code.

This extension uses [jQuery](https://jquery.com/) 2.2.4, [Bootstrap](http://getbootstrap.com/) 4.0.0 alpha 3, [Handlebars](http://handlebarsjs.com/) 4.0.5, [UAParser](https://github.com/faisalman/ua-parser-js) 0.7.10, [clipboard.js](https://github.com/zenorocha/clipboard.js) 1.5.12, [Font Awesome](http://fontawesome.io/) 4.6.3, [Balloon.css](https://github.com/kazzkiq/balloon.css) 0.3.0 and [Highstock](http://www.highcharts.com/) 4.2.6.

## Latest release - 1.7.1.0 - August 24, 2016

This update was heavily focused on UI improvements.
* Bootstrap, the core of design of this extension, was updated to new version, so the extension runs with native fonts for every OS now: *Segoe UI* for Windows and *San Francisco* for OS X.
* Reduced the font size in the "Detailed info" modal window, so lines in selling and buying orders columns won't break anymore.
* Item prices at all pages are not breaking lines anymore.
* "Total profit" and "Total costs" blocks were redesigned a bit.
* Fixed links at options page. They are blue now.
* Strange tags like `&lt;c=@flavor&gt;` are not displayed in item descriptions anymore.

Check out previous releases at [releases](https://github.com/terron-kun/tp-notificator/releases) page.
