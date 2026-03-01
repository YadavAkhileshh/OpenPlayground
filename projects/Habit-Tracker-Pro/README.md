# Habit Tracker Pro

A comprehensive habit tracking application with streak counters, analytics, goal setting, and reminder systems. Built with modern web technologies for a seamless user experience.

## 🌟 Features

### Core Functionality
- **Daily Habit Logging**: Mark habits as complete for any date with intuitive check buttons
- **Streak Tracking**: Automatic calculation of current and longest streaks with visual indicators
- **Flexible Scheduling**: Set habits for specific days or daily frequency
- **Progress Analytics**: Visual charts showing completion rates and trends
- **Goal Setting**: Create and track progress toward specific habit goals
- **Smart Reminders**: Intelligent reminder system based on completion patterns

### Advanced Features
- **Productivity Score**: Daily productivity calculation based on habit completion
- **Category Organization**: Group habits by categories (Health, Productivity, Learning, etc.)
- **Data Export**: Export habit data in JSON, CSV, or PDF formats
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **Responsive Design**: Fully responsive design that works on all devices
- **Local Storage**: All data persists locally in the browser
- **Real-time Updates**: Live updates of streaks, scores, and analytics

### Habit Management
- **Custom Icons & Colors**: Personalize habits with custom icons and colors
- **Flexible Targets**: Set daily, weekly, or custom targets with different units
- **Detailed Descriptions**: Add descriptions and notes to habits
- **Completion History**: Track completion history with timestamps
- **Bulk Operations**: Edit multiple habits simultaneously

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- No server or dependencies required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start tracking your habits!

### Basic Usage
1. **Create Your First Habit**:
   - Click "Create New Habit" button
   - Fill in habit name, description, and schedule
   - Choose icon, color, and category
   - Set target and frequency

2. **Daily Tracking**:
   - View today's scheduled habits
   - Click the circle button to mark habits complete
   - Watch your streak counter increase!

3. **Monitor Progress**:
   - Check the productivity score in the header
   - View streak cards for active habits
   - Explore analytics for detailed insights

## 📱 User Interface

### Navigation
- **Theme Toggle**: Switch between light and dark themes
- **Export Button**: Download your habit data
- **Date Navigation**: Move between different dates to log past/future habits

### Main Sections
- **Today's Habits**: Current day's scheduled habits with completion status
- **Habits Overview**: Complete list of all habits with management options
- **Streaks**: Top active streaks with visual fire indicators
- **Analytics**: Charts and insights about your habit patterns
- **Goals**: Progress tracking toward specific habit targets

### Modals
- **Create/Edit Habit**: Comprehensive form for habit configuration
- **Create Goal**: Set specific targets and deadlines
- **Analytics View**: Detailed charts and statistics
- **Export Options**: Choose format for data export

## 🎯 Habit Configuration

### Basic Settings
- **Name**: Clear, descriptive habit name
- **Description**: Optional detailed explanation
- **Icon**: Choose from Font Awesome icon library
- **Color**: Custom color for visual identification

### Scheduling
- **Frequency**: Select specific days or daily
- **Target**: Number of times to complete per day
- **Unit**: Times, minutes, pages, etc.

### Categories
- Health & Fitness
- Productivity
- Learning & Education
- Personal Development
- Social & Relationships
- Creative & Hobbies
- Finance & Money
- Spiritual & Mindfulness

## 📊 Analytics & Insights

### Available Metrics
- **Completion Rate**: Percentage of scheduled habits completed
- **Streak Analysis**: Current and longest streaks per habit
- **Weekly Trends**: 7-day completion history
- **Category Breakdown**: Performance by habit category
- **Goal Progress**: Achievement tracking across all goals

### Insights
- Active streak notifications
- Productivity score calculations
- Completion pattern analysis
- Goal achievement alerts
- Personalized recommendations

## 🎯 Goal Setting

### Goal Types
- **Completion Goals**: Reach X total completions
- **Streak Goals**: Maintain X-day streak
- **Time-based Goals**: Complete within deadline
- **Habit-specific Goals**: Linked to individual habits

### Progress Tracking
- Visual progress bars
- Percentage completion indicators
- Deadline countdown
- Achievement notifications

## 💾 Data Management

### Local Storage
- Automatic saving of all habit data
- Browser-based persistence
- No account or server required
- Data survives browser restarts

### Export Options
- **JSON**: Complete data structure for backup/import
- **CSV**: Spreadsheet-compatible format
- **PDF**: Formatted report (coming soon)

### Data Structure
```json
{
  "habits": [
    {
      "id": "unique-id",
      "name": "Morning Exercise",
      "description": "30-minute workout",
      "icon": "fas fa-dumbbell",
      "color": "#10b981",
      "frequency": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "target": 1,
      "unit": "session",
      "category": "health",
      "completedDates": [
        {"date": "2024-01-15", "count": 1, "timestamp": "2024-01-15T07:00:00Z"}
      ],
      "streak": 5,
      "longestStreak": 12,
      "totalCompletions": 45
    }
  ],
  "goals": [
    {
      "id": "goal-id",
      "title": "100 Workouts",
      "target": 100,
      "current": 45,
      "completed": false,
      "deadline": "2024-06-01"
    }
  ]
}
```

## 🎨 Customization

### Themes
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes for nighttime use
- **Auto-detection**: Follows system theme preference

### Visual Elements
- **Icons**: 1000+ Font Awesome icons available
- **Colors**: Full color picker for habit customization
- **Animations**: Smooth transitions and micro-interactions
- **Responsive Grid**: Adapts to any screen size

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript ES6+**: Modular, class-based architecture
- **Local Storage API**: Client-side data persistence
- **Font Awesome**: Icon library for visual elements

### Browser Support
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Performance
- Lightweight: ~50KB total bundle size
- Fast loading: No external dependencies
- Efficient rendering: Virtual DOM-like updates
- Optimized storage: Minimal localStorage usage

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/habit-tracker-pro.git`
3. Open `index.html` in your browser for testing
4. Make changes to HTML, CSS, or JavaScript files
5. Test thoroughly across different browsers
6. Submit a pull request

### Code Style
- Use modern JavaScript (ES6+)
- Follow consistent naming conventions
- Add comments for complex logic
- Test all new features thoroughly

### Feature Requests
- Check existing issues before creating new ones
- Provide detailed descriptions of proposed features
- Include mockups or examples when possible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family
- **Open Source Community**: Inspiration and best practices

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Debugging Guide](../DEBUGGING_GUIDE.md)
2. Review the [Contributing Guidelines](../CONTRIBUTING.md)
3. Open an issue on GitHub
4. Check the [FAQ](../FAQ.md) (coming soon)

---

**Happy Habit Tracking!** 🎯✨

Track your habits, build streaks, achieve your goals, and become the best version of yourself.