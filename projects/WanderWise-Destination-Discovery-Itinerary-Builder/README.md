# WanderWise - Destination Discovery & Itinerary Builder

An interactive web application that helps travelers discover perfect destinations and build customized itineraries based on their interests, travel duration, and preferences.

## 🌍 Overview

WanderWise uses intelligent filtering to suggest destinations that match your travel style and creates personalized itineraries to make planning your dream trip effortless.

## ✨ Features

- **Smart Destination Discovery**: Get personalized recommendations based on your interests, budget, and preferred season
- **Flexible Itinerary Building**: Select multiple destinations and automatically generate day-by-day plans
- **Interactive Interface**: Beautiful, responsive design with smooth animations and intuitive controls
- **Comprehensive Filtering**: Filter by interests (beach, mountains, culture, food, adventure, etc.), duration, budget, and season
- **Detailed Itineraries**: Get activity suggestions and trip summaries for your selected destinations

## 🎯 How It Works

1. **Set Your Preferences**: Choose your interests, travel duration, budget level, and preferred season
2. **Discover Destinations**: Browse personalized recommendations with stunning images and descriptions
3. **Build Your Itinerary**: Select destinations by clicking on them to add to your trip
4. **Generate Plan**: Get a detailed day-by-day itinerary with activity suggestions

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Interactive functionality and dynamic content generation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📱 Responsive Design

The application is fully responsive and provides an optimal viewing experience across:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (up to 767px)

## 🎨 Design Features

- **Gradient Backgrounds**: Beautiful color transitions for a modern look
- **Card-based Layout**: Clean, organized presentation of destinations
- **Smooth Animations**: Fade-in effects and hover transitions
- **Glassmorphism**: Semi-transparent elements with backdrop blur
- **Typography**: Clean, readable fonts with proper hierarchy

## 🚀 Getting Started

1. Clone the repository
2. Open `index.html` in your web browser
3. Start exploring destinations!

## 📊 Data Source

The application uses a curated dataset of popular travel destinations with:
- High-quality images from Unsplash
- Detailed descriptions and interest tags
- Duration and budget recommendations
- Seasonal information

## 🔧 Customization

### Adding New Destinations

To add new destinations, edit the `destinations` array in `script.js`:

```javascript
{
    id: 11,
    name: "New Destination",
    image: "image_url",
    description: "Description of the destination",
    interests: ["interest1", "interest2"],
    duration: { min: 3, max: 10 },
    season: ["spring", "summer"],
    budget: "moderate"
}
```

### Modifying Interests

Add new interest categories by updating the HTML select options and destination data.

### Styling Customization

The extensive CSS includes utility classes for easy customization and theming.

## 🌟 Future Enhancements

- **Real-time Weather Integration**: Get current weather for destinations
- **Flight and Hotel Booking**: Direct integration with travel APIs
- **User Accounts**: Save and share itineraries
- **Social Features**: Share trips with friends
- **Offline Mode**: Download itineraries for offline use
- **Multi-language Support**: Internationalization
- **Advanced Filtering**: More granular preferences
- **Cost Estimation**: Budget breakdown and cost calculators

## 📄 License

This project is part of the OpenPlayground educational collection. Feel free to use and modify for learning and personal use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

*Discover the world, one perfect destination at a time! 🌍✈️*