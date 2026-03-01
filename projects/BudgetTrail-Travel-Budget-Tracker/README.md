# BudgetTrail - Travel Budget Tracker

A comprehensive web-based travel budget tracking application that helps travelers manage their expenses, monitor spending patterns, and stay within budget during trips.

## 🌟 Features

### 💰 Budget Management
- Set total trip budget and duration
- Real-time budget tracking with visual progress indicators
- Daily average spending calculations
- Multi-currency support (USD, EUR, GBP, JPY, CAD, AUD)
- Budget status alerts (good/warning/danger zones)

### 📊 Expense Tracking
- Add expenses with categories, descriptions, and dates
- Cost splitting for group travel (equal split)
- Expense filtering by category and date
- Edit and delete expenses
- Persistent storage using localStorage

### 📈 Analytics & Reports
- Interactive pie chart showing spending by category
- Expense history with detailed breakdowns
- Visual budget progress bar
- Export functionality for data backup

### 🎨 User Interface
- Modern, responsive design optimized for mobile and desktop
- Dark theme with travel-inspired color scheme
- Smooth animations and transitions
- Intuitive form controls and navigation

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- No server required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start tracking your travel expenses!

## 📖 Usage Guide

### Setting Your Budget
1. Enter your total trip budget
2. Specify trip duration in days
3. Select your preferred currency
4. Click "Set Budget" to initialize tracking

### Adding Expenses
1. Fill in the expense date (defaults to today)
2. Select expense category
3. Enter description and amount
4. Optionally enable cost splitting for group expenses
5. Click "Add Expense" to save

### Managing Expenses
- **Filter**: Use category and date filters to find specific expenses
- **Edit**: Click "Edit" on any expense to modify it
- **Delete**: Click "Delete" to remove expenses
- **Clear Filters**: Reset all filters to show all expenses

### Viewing Reports
- Switch between different report views using the tabs
- View spending breakdown by category in the pie chart
- Monitor budget progress with the visual indicator

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and form controls
- **CSS3**: Advanced styling with Flexbox, Grid, and animations
- **JavaScript ES6+**: Modern JavaScript with classes and async/await
- **Chart.js**: Interactive data visualization
- **LocalStorage API**: Client-side data persistence

### File Structure
```
BudgetTrail-Travel-Budget-Tracker/
├── index.html          # Main application interface
├── style.css           # Comprehensive styling and themes
├── script.js           # Application logic and functionality
└── README.md           # This documentation
```

### Key Components

#### Budget Management System
```javascript
const budget = {
    total: 0,
    duration: 0,
    currency: 'USD',
    spent: 0,
    expenses: []
};
```

#### Expense Tracking
- Real-time expense calculation and categorization
- Support for split expenses in group travel scenarios
- Persistent storage with automatic data recovery

#### Data Visualization
- Chart.js integration for spending analytics
- Responsive charts that adapt to screen size
- Color-coded budget status indicators

### Browser Compatibility
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🎯 Use Cases

### Solo Traveler
- Track daily expenses and stay within budget
- Monitor spending patterns across categories
- Plan future trips based on historical data

### Group Travel
- Split costs equally among travelers
- Track shared expenses (accommodation, transport)
- Monitor group budget compliance

### Business Travel
- Categorize expenses for reimbursement
- Track per diem spending
- Generate expense reports

## 🔧 Customization

### Adding New Categories
Edit the `categories` array in `script.js`:
```javascript
const categories = [
    'accommodation', 'food', 'transportation',
    'activities', 'shopping', 'miscellaneous',
    'your-new-category'  // Add your category here
];
```

### Currency Support
Add new currencies to the `currencySymbols` object:
```javascript
const currencySymbols = {
    USD: '$',
    EUR: '€',
    // Add your currency here
    NEW: 'symbol'
};
```

### Styling Customization
Modify `style.css` to change colors, fonts, and layout:
- Travel theme colors: `--primary: #00bcd4; --secondary: #ff9800;`
- Dark theme background: `--bg-primary: #0a0a0a;`

## 📊 Data Export

The application includes data export functionality for backing up your budget data. Future versions will include:
- CSV export for spreadsheet analysis
- PDF reports for expense submission
- Cloud synchronization options

## 🔒 Privacy & Security

- All data stored locally in your browser
- No data transmitted to external servers
- No account registration required
- Data persists between browser sessions

## 🚀 Future Enhancements

- [ ] Trip planning integration
- [ ] Receipt photo upload and OCR
- [ ] Multi-trip management
- [ ] Expense sharing with other travelers
- [ ] Advanced reporting and analytics
- [ ] Offline functionality with service workers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better travel expense management
- Part of the OpenPlayground project collection

---

**Happy Travels!** ✈️🗺️💰