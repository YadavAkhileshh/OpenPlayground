# 🔋 Battery Status Monitor

A simple web application that displays real-time battery information using the
Browser Battery Status API.

## ✨ Features
- Battery percentage display
- Charging / discharging status
- Time remaining to charge or discharge
- Color-coded battery level indicator
- Real-time updates

## 🛠️ Tech Stack
- HTML
- CSS
- JavaScript
- Battery Status API (Browser built-in)

## 🔌 How it works
This app uses the browser's built-in `navigator.getBattery()` API to access
battery information directly from the device. No backend or external API is used.

## 🌐 Browser Support
| Browser  | Supported |
|--------|-----------|
| Chrome  | ✅ Yes |
| Edge   | ✅ Yes |
| Firefox| ❌ No |
| Safari | ❌ No |

> Note: Battery Status API support is limited due to privacy concerns.

## 🚀 How to run
1. Clone the repository
2. Open `index.html` in a supported browser (Chrome recommended)

## ⚠️ Limitations
- Not supported on all browsers
- Charging time may show `N/A` on some devices

## 📸 Screenshot
![screenshot.png][def]
[def]: screenshot.png