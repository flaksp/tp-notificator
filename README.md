# Guild Wars 2 Trading Post Notificator
You can get it at extension stores now:
* [Chrome Store](https://chrome.google.com/webstore/detail/fmfminppfcknlpekeffahpnpfahmhojk) - Google Chrome, Google Chrome Canary and Chromium
* [Opera Store](https://addons.opera.com/extensions/details/guild-wars-2tm-trading-post-notificator/) - Opera 15+

Someone asked me to release extension on GitHub and I did so. I've never thought I will show its sources though, hope you'll be okay with my shitty code.

This extension uses [jQuery](https://jquery.com/) 2.2.3, [Bootstrap](http://getbootstrap.com/) 4.0.0 alpha 2, [Handlebars](http://handlebarsjs.com/) 4.0.5, [UAParser](https://github.com/faisalman/ua-parser-js) 0.7.10 and [Font Awesome](http://fontawesome.io/) 4.6.3.

## Latest release - 1.5.0.0 - May 23, 2016
* Added 2 new languages which may be used to display item names: Korean and Chinese. Despite the fact that GW2 API officially supports Korean, it has unknown issues now.
* Settings page has been renamed to "Options" and was moved out of the extension. Now it is located at extensions page (may also be accessed via right-click on extension icon) and was redesigned to use default browser style.
* Debug page can be accessed via FAQ page now.
* Full-tab mode trigger added to debug page. It's for debug only now. Not really sure if I will finish this feature for production.
* The extension was refactored to support cross-browser features. That means all browsers will run the same extension. This should decrease number of bugs in future however this feature may be cause of some bugs you can find in this release (tell me if you find them; they will be fixed ASAP).
* Added new tool — simple fee calculator.
* Small UI improvements.

Check out previuos releases at [releases](https://github.com/terron-kun/tp-notificator/releases) page.
