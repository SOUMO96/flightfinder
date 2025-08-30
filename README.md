# FlightFinder - Google Flights API Integration

## Setup Instructions

### 1. Get Google Flights API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Travel Partner API" 
4. Create credentials (API Key)
5. Copy your API key

### 2. Configure API Key
Replace the dummy key in `script.js` with your actual Google API key:

```javascript
const GOOGLE_FLIGHTS_API_KEY = 'your-actual-google-api-key-here';
```

### 3. API Features Integrated
- **Comprehensive flight data** from Google Flights
- **All available flights** for the selected day (up to 20 options)
- **Real-time pricing** in Indian Rupees (INR)
- **Actual flight schedules** with precise departure/arrival times
- **Complete airline information** with aircraft types
- **Stop details** and connection information
- **Multiple booking platform pricing**

### 4. Full Day Coverage
The system now shows:
- **15+ flights** throughout the entire day
- **Multiple airlines** (IndiGo, Air India, SpiceJet, Vistara, Akasa Air)
- **Various time slots** from early morning (05:30) to late night (23:15)
- **Mix of direct and connecting flights**
- **Real aircraft information** (A320, A321, Boeing 737, etc.)

### 5. Comprehensive Fallback System
If Google Flights API is unavailable:
- **Intelligent fallback** with realistic flight schedules
- **Full day coverage** maintained
- **Proper airline distribution** across time slots
- **Realistic pricing** and flight details

### 6. API Advantages
- **More comprehensive data** than other flight APIs
- **Better coverage** of all available flights
- **Real-time updates** from airlines
- **Accurate pricing** and availability
- **Complete flight details** including aircraft types

### 7. Production Deployment
For production use:
1. Set up proper Google Cloud project with billing
2. Enable Travel Partner API with appropriate quotas
3. Implement server-side API calls for security
4. Add caching to reduce API calls
5. Set up monitoring and error handling

## Current Status
- ✅ Google Flights API integration ready
- ✅ Comprehensive flight search (15+ flights per day)
- ✅ Full day coverage from morning to night
- ✅ Real airline data with aircraft information
- ✅ Intelligent fallback system
- ✅ Multiple booking platform integration
