/**
 * @fileoverview Configuration for different psychological experiment scenarios.
 * Each scenario defines a category of products and specific content to be displayed.
 * The bias engine will modify these scenarios at runtime.
 */

export const SCENARIOS = [
    {
        id: 'tech_headphones',
        title: 'Choose Your Audio Gear',
        category: 'Electronics',
        description: 'You are looking for high-quality noise cancelling headphones for your commute.',
        products: [
            {
                id: 'p1',
                name: 'SonicPulse X1',
                price: 199,
                rating: 4.2,
                image: 'headset-mic', // mapped to icon
                features: ['Active Noise Cancellation', '20hr Battery', 'Plastic Build']
            },
            {
                id: 'p2',
                name: 'AudioMax Pro',
                price: 299, // The "Target" often
                rating: 4.8,
                image: 'headphones',
                features: ['Premium Noise Cancellation', '30hr Battery', 'Aluminum Build', 'Voice Assistant']
            },
            {
                id: 'p3',
                name: 'BudgetBeats',
                price: 99,
                rating: 3.5,
                image: 'volume-low',
                features: ['Passive Isolation', '10hr Battery', 'Wired']
            }
        ]
    },
    {
        id: 'travel_flights',
        title: 'Book Your Weekend Getaway',
        category: 'Travel',
        description: 'You want a quick flight to New York for a weekend trip.',
        products: [
            {
                id: 't1',
                name: 'BudgetAir Saver',
                price: 150,
                rating: 3.0,
                image: 'plane-tail',
                features: ['No Carry-on', 'Middle Seat', '6:00 AM Departure']
            },
            {
                id: 't2',
                name: 'SkyHigh Standard',
                price: 240, // Target
                rating: 4.5,
                image: 'plane',
                features: ['Carry-on Included', 'Seat Selection', '10:00 AM Departure', 'Free WiFi']
            },
            {
                id: 't3',
                name: 'LuxJet Premium',
                price: 600,
                rating: 5.0,
                image: 'wine',
                features: ['First Class', 'Lounge Access', 'Anytime Departure', 'Champagne']
            }
        ]
    },
    {
        id: 'subscription_streaming',
        title: 'Select a Streaming Plan',
        category: 'Services',
        description: 'You are subscribing to a new video streaming service.',
        products: [
            {
                id: 's1',
                name: 'Basic Plan',
                price: 9.99,
                rating: 3.8,
                image: 'monitor',
                features: ['720p Resolution', '1 Device', 'Ads Supported']
            },
            {
                id: 's2',
                name: 'Pro Plan',
                price: 14.99, // Target
                rating: 4.7,
                image: 'monitor-play',
                features: ['4K HDR', '4 Devices', 'Ad-Free', 'Offline Downloads']
            },
            {
                id: 's3',
                name: 'Ultimate Bundle',
                price: 24.99,
                rating: 4.9,
                image: 'collection-play',
                features: ['4K HDR', 'Unlimited Devices', 'Live TV Included', 'Sports Package']
            }
        ]
    }
];
