Project Overview: Banana for Scale (v1)
This is a legacy hybrid mobile application built during the Ionic v1 / AngularJS era (around 2014-2015). It was designed to be a "Universal Unit Converter" with a fun twist: using bananas as a primary measurement unit.

Technical Stack
Framework: Ionic v1 (built on top of AngularJS 1.x).
Build Tools: Gulp for task automation and Bower for front-end dependency management.
Platform: Cordova/PhoneGap for mobile porting (Android/iOS).
Key Libraries:
js-quantities: Handles the heavy lifting for unit conversions.
angular-local-storage: Manages conversion history and user preferences.
ZeroClipboard: Provides copy-to-clipboard functionality for desktop browsers.
ngCordova: AngularJS wrappers for Cordova plugins (Camera, Clipboard, Toast, etc.).
Core Functionality
Unit Conversion: Supports Length and Mass.
Length: Bananas, inches, feet, yards, miles, millimeters, centimeters, meters, kilometers.
Mass: Bananas, ounces, pounds, short tons, grams, kilograms, metric tons.
Special handling for "feet and inches" (inputting two values for a single base unit).
Conversion History: Keeps track of the last 10 conversions in local storage.
Last Used State: Remembers your last selected unit kind (Length/Mass) and units for a seamless experience.
Clipboard Integration: Allows users to quickly copy result values or the entire conversion string.
Design & UI
Mobile-First: Uses Ionic's standard components like ion-header-bar, ion-content, and modals.
Desktop Fallback: Has a "not-mobile" mode with a centered layout and a playful background featuring rotating banana-shaped clouds.
Responsive: Hides the app description and clouds on smaller screens to prioritize the converter.