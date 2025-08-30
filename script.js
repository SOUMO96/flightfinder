// Working flight search app
let currentUser = null;

const airports = {
    // Major Metro Cities
    'Mumbai': 'BOM', 'Delhi': 'DEL', 'Bangalore': 'BLR', 'Chennai': 'MAA',
    'Kolkata': 'CCU', 'Hyderabad': 'HYD', 'Pune': 'PNQ', 'Ahmedabad': 'AMD',
    
    // Popular Tourist Destinations
    'Goa': 'GOI', 'Jaipur': 'JAI', 'Kochi': 'COK', 'Thiruvananthapuram': 'TRV',
    'Udaipur': 'UDR', 'Jodhpur': 'JDH', 'Varanasi': 'VNS', 'Amritsar': 'ATQ',
    
    // Business & Industrial Cities
    'Surat': 'STV', 'Indore': 'IDR', 'Bhopal': 'BHO', 'Nagpur': 'NAG',
    'Coimbatore': 'CJB', 'Madurai': 'IXM', 'Vijayawada': 'VGA', 'Visakhapatnam': 'VTZ',
    
    // Hill Stations & Tourist Places
    'Shimla': 'SLV', 'Manali': 'KUU', 'Dehradun': 'DED', 'Bagdogra': 'IXB',
    'Imphal': 'IMF', 'Dimapur': 'DMU', 'Shillong': 'SHL', 'Aizawl': 'AJL',
    
    // Eastern India
    'Bhubaneswar': 'BBI', 'Ranchi': 'IXR', 'Patna': 'PAT', 'Guwahati': 'GAU',
    'Silchar': 'IXS', 'Agartala': 'IXA', 'Dibrugarh': 'DIB', 'Jorhat': 'JRH',
    
    // Western India
    'Rajkot': 'RAJ', 'Vadodara': 'BDQ', 'Bhavnagar': 'BHU', 'Porbandar': 'PBD',
    'Nashik': 'ISK', 'Aurangabad': 'IXU', 'Kolhapur': 'KLH', 'Solapur': 'SSE',
    
    // Southern India
    'Mangalore': 'IXE', 'Mysore': 'MYQ', 'Hubli': 'HBX', 'Belgaum': 'IXG',
    'Tirupati': 'TIR', 'Rajahmundry': 'RJA', 'Kadapa': 'CDP', 'Nellore': 'NLR',
    
    // Central India
    'Jabalpur': 'JLR', 'Raipur': 'RPR', 'Bilaspur': 'PAB', 'Khajuraho': 'HJR',
    'Gwalior': 'GWL', 'Ujjain': 'UJN', 'Satna': 'TNI', 'Singrauli': 'JYG',
    
    // Northern India
    'Chandigarh': 'IXC', 'Ludhiana': 'LUH', 'Jammu': 'IXJ', 'Srinagar': 'SXR',
    'Leh': 'IXL', 'Kullu': 'KUU', 'Pathankot': 'IXP', 'Dharamshala': 'DHM',
    
    // Andaman & Nicobar
    'Port Blair': 'IXZ', 'Car Nicobar': 'CBD',
    
    // Lakshadweep
    'Agatti': 'AGX',
    
    // Emerging Destinations
    'Darbhanga': 'DBR', 'Kishangarh': 'KQH', 'Kannur': 'CNN', 'Belagavi': 'IXG',
    'Shirdi': 'SAG', 'Pantnagar': 'PGH', 'Lilabari': 'IXI', 'Tezu': 'TEZ',
    'Pasighat': 'IXT', 'Ziro': 'ZER', 'Tezpur': 'TEZ', 'Along': 'IXV',
    
    // Additional Popular Routes
    'Rourkela': 'RRK', 'Jharsuguda': 'JRG', 'Jeypore': 'PYB', 'Rayagada': 'RYP',
    'Cuddapah': 'CDP', 'Pondicherry': 'PNY', 'Salem': 'SXV', 'Tuticorin': 'TCR'
};

const cities = Object.keys(airports);

function decrypt(data) {
    return decodeURIComponent(escape(atob(data)));
}

// Initialize on page load
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('ff_currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(decrypt(savedUser));
            document.getElementById('userName').textContent = currentUser.firstName;
            document.getElementById('userInfo').style.display = 'flex';
            
            // Setup functionality
            setupAutocomplete();
            setupEventListeners();
        } catch (e) {
            localStorage.removeItem('ff_currentUser');
            window.location.href = 'auth.html';
        }
    } else {
        window.location.href = 'auth.html';
    }
});

// Setup event listeners
function setupEventListeners() {
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchFlights);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ff_currentUser');
            window.location.href = 'auth.html';
        });
    }
}

// Setup autocomplete
function setupAutocomplete() {
    const departureInput = document.getElementById('departure');
    const arrivalInput = document.getElementById('arrival');
    
    if (departureInput) createAutocomplete(departureInput);
    if (arrivalInput) createAutocomplete(arrivalInput);
}

function createAutocomplete(input) {
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.display = 'none';
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(dropdown);
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        dropdown.innerHTML = '';
        
        if (value.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        const matches = cities.filter(city => 
            city.toLowerCase().includes(value)
        ).slice(0, 5);
        
        if (matches.length > 0) {
            dropdown.style.display = 'block';
            matches.forEach(city => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = `${city} (${airports[city]})`;
                item.addEventListener('click', () => {
                    input.value = city;
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(item);
            });
        } else {
            dropdown.style.display = 'none';
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Search flights
function searchFlights() {
    if (!currentUser) {
        document.getElementById('authRequired').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
        return;
    }
    
    const departure = document.getElementById('departure').value.trim();
    const arrival = document.getElementById('arrival').value.trim();
    
    if (!departure || !arrival) {
        alert('Please enter both departure and arrival cities');
        return;
    }
    
    if (departure === arrival) {
        alert('Departure and arrival cities cannot be the same');
        return;
    }
    
    // Hide auth message
    document.getElementById('authRequired').classList.add('hidden');
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    // Generate flights
    setTimeout(() => {
        const flights = generateFlights(departure, arrival);
        displayFlights(flights);
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');
        
        document.querySelector('.results h2').textContent = 
            `${flights.length} flights found from ${departure} to ${arrival}`;
    }, 300);
}

// Generate comprehensive flight data sorted by time
function generateFlights(departure, arrival) {
    return [
        // Early Morning
        {
            airline: 'IndiGo', airlineLogo: '🟦', airlineCode: '6E', rating: 4.2,
            cabinBaggage: '7kg', checkedBaggage: '15kg', meals: 'Paid',
            aircraft: 'Airbus A320', flightNumber: '6E0501',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '05:30' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '07:30' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'IndiGo Direct', logo: '🏢', price: 4500 },
                { site: 'MakeMyTrip', logo: '🛫', price: 4700 },
                { site: 'Cleartrip', logo: '✈️', price: 4800 }
            ], bestPrice: 4500
        },
        {
            airline: 'Air India', airlineLogo: '🟥', airlineCode: 'AI', rating: 3.5,
            cabinBaggage: '7kg', checkedBaggage: '23kg', meals: 'Complimentary',
            aircraft: 'Boeing 737', flightNumber: 'AI0601',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '06:45' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '08:45' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'Air India Direct', logo: '🏢', price: 4800 },
                { site: 'MakeMyTrip', logo: '🛫', price: 5000 },
                { site: 'Yatra', logo: '🌟', price: 5100 }
            ], bestPrice: 4800
        },
        // Morning
        {
            airline: 'SpiceJet', airlineLogo: '🟨', airlineCode: 'SG', rating: 3.8,
            cabinBaggage: '7kg', checkedBaggage: '15kg', meals: 'Paid',
            aircraft: 'Boeing 737', flightNumber: 'SG0801',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '08:15' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '10:15' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'SpiceJet Direct', logo: '🏢', price: 4200 },
                { site: 'MakeMyTrip', logo: '🛫', price: 4400 },
                { site: 'EaseMyTrip', logo: '💼', price: 4500 }
            ], bestPrice: 4200
        },
        {
            airline: 'Vistara', airlineLogo: '🟪', airlineCode: 'UK', rating: 4.5,
            cabinBaggage: '7kg', checkedBaggage: '23kg', meals: 'Complimentary',
            aircraft: 'Airbus A321', flightNumber: 'UK0901',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '09:30' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '11:30' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'Vistara Direct', logo: '🏢', price: 5800 },
                { site: 'Cleartrip', logo: '✈️', price: 6000 },
                { site: 'Goibibo', logo: '🎯', price: 6100 }
            ], bestPrice: 5800
        },
        {
            airline: 'Akasa Air', airlineLogo: '🟠', airlineCode: 'QP', rating: 4.0,
            cabinBaggage: '7kg', checkedBaggage: '15kg', meals: 'Paid',
            aircraft: 'Boeing 737 MAX', flightNumber: 'QP1001',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '10:45' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '12:45' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'Akasa Air Direct', logo: '🏢', price: 5200 },
                { site: 'Cleartrip', logo: '✈️', price: 5400 },
                { site: 'Paytm Travel', logo: '💳', price: 5500 }
            ], bestPrice: 5200
        },
        // Afternoon
        {
            airline: 'IndiGo', airlineLogo: '🟦', airlineCode: '6E', rating: 4.2,
            cabinBaggage: '7kg', checkedBaggage: '15kg', meals: 'Paid',
            aircraft: 'Airbus A320', flightNumber: '6E1201',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '12:15' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '14:15' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'IndiGo Direct', logo: '🏢', price: 5100 },
                { site: 'MakeMyTrip', logo: '🛫', price: 5300 },
                { site: 'Goibibo', logo: '🎯', price: 5400 }
            ], bestPrice: 5100
        },
        {
            airline: 'Air India', airlineLogo: '🟥', airlineCode: 'AI', rating: 3.5,
            cabinBaggage: '7kg', checkedBaggage: '23kg', meals: 'Complimentary',
            aircraft: 'Boeing 787', flightNumber: 'AI1401',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '14:30' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '16:30' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'Air India Direct', logo: '🏢', price: 5600 },
                { site: 'Cleartrip', logo: '✈️', price: 5800 },
                { site: 'Paytm Travel', logo: '💳', price: 5900 }
            ], bestPrice: 5600
        },
        {
            airline: 'SpiceJet', airlineLogo: '🟨', airlineCode: 'SG', rating: 3.8,
            cabinBaggage: '7kg', checkedBaggage: '15kg', meals: 'Paid',
            aircraft: 'Boeing 737', flightNumber: 'SG1601',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '16:00' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '19:30' },
            duration: '3h 30m', stops: ['Jaipur'], stopsText: '1 Stop',
            prices: [
                { site: 'SpiceJet Direct', logo: '🏢', price: 4000 },
                { site: 'MakeMyTrip', logo: '🛫', price: 4200 },
                { site: 'EaseMyTrip', logo: '💼', price: 4300 }
            ], bestPrice: 4000
        },
        // Evening
        {
            airline: 'Vistara', airlineLogo: '🟪', airlineCode: 'UK', rating: 4.5,
            cabinBaggage: '7kg', checkedBaggage: '23kg', meals: 'Complimentary',
            aircraft: 'Airbus A320', flightNumber: 'UK1801',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '18:15' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '20:15' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'Vistara Direct', logo: '🏢', price: 6200 },
                { site: 'MakeMyTrip', logo: '🛫', price: 6400 },
                { site: 'Yatra', logo: '🌟', price: 6500 }
            ], bestPrice: 6200
        },
        {
            airline: 'IndiGo', airlineLogo: '🟦', airlineCode: '6E', rating: 4.2,
            cabinBaggage: '7kg', checkedBaggage: '15kg', meals: 'Paid',
            aircraft: 'Airbus A321', flightNumber: '6E2001',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '20:30' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '22:30' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'IndiGo Direct', logo: '🏢', price: 5300 },
                { site: 'Cleartrip', logo: '✈️', price: 5500 },
                { site: 'Goibibo', logo: '🎯', price: 5600 }
            ], bestPrice: 5300
        },
        // Night
        {
            airline: 'Air India', airlineLogo: '🟥', airlineCode: 'AI', rating: 3.5,
            cabinBaggage: '7kg', checkedBaggage: '23kg', meals: 'Complimentary',
            aircraft: 'Boeing 737', flightNumber: 'AI2201',
            departure: { city: departure, airport: airports[departure] || 'DEL', time: '22:45' },
            arrival: { city: arrival, airport: airports[arrival] || 'BOM', time: '00:45' },
            duration: '2h 00m', stops: [], stopsText: 'Non-stop',
            prices: [
                { site: 'Air India Direct', logo: '🏢', price: 4700 },
                { site: 'Cleartrip', logo: '✈️', price: 4900 },
                { site: 'MakeMyTrip', logo: '🛫', price: 5000 }
            ], bestPrice: 4700
        }
    ]; // Removed sorting - flights now show in chronological order
}

// Display flights
function displayFlights(flights) {
    const flightList = document.getElementById('flightList');
    if (!flightList) return;
    
    flightList.innerHTML = '';
    
    flights.forEach(flight => {
        const flightCard = document.createElement('div');
        flightCard.className = 'flight-card';
        
        const stars = '⭐'.repeat(Math.floor(flight.rating));
        
        const pricesHtml = [
            { site: 'MakeMyTrip', logo: '🛫', price: flight.bestPrice + 200 },
            { site: 'Cleartrip', logo: '✈️', price: flight.bestPrice + 100 },
            { site: 'Goibibo', logo: '🎯', price: flight.bestPrice },
            { site: 'Yatra', logo: '🌟', price: flight.bestPrice + 300 },
            { site: 'EaseMyTrip', logo: '💼', price: flight.bestPrice + 150 },
            { site: 'Paytm Travel', logo: '💳', price: flight.bestPrice + 250 },
            { site: 'Ixigo', logo: '🚀', price: flight.bestPrice + 50 },
            { site: 'Booking.com', logo: '🏨', price: flight.bestPrice + 400 },
            { site: 'Expedia', logo: '🌍', price: flight.bestPrice + 350 }
        ].sort((a, b) => a.price - b.price).map((priceInfo, index) => `
            <div class="booking-site ${index === 0 ? 'best-price' : ''}">
                <div class="site-logo">${priceInfo.logo}</div>
                <div class="site-name">${priceInfo.site}</div>
                <div class="site-price">₹${priceInfo.price.toLocaleString('en-IN')}</div>
                <button class="book-btn" onclick="bookFlight('${priceInfo.site}', ${priceInfo.price}, '${flight.departure.city}', '${flight.arrival.city}')">Book</button>
            </div>
        `).join('');
        
        flightCard.innerHTML = `
            <div class="flight-header">
                <div class="airline-info">
                    <div class="airline-main">
                        <span class="airline-logo">${flight.airlineLogo}</span>
                        <div class="airline-details">
                            <div class="airline-name">${flight.airline}</div>
                            <div class="flight-meta">
                                <span>${flight.flightNumber}</span> • 
                                <span>${flight.aircraft}</span>
                            </div>
                        </div>
                    </div>
                    <div class="airline-rating">
                        <div class="rating">${stars} ${flight.rating}</div>
                        <div class="baggage-info">
                            <div class="cabin-bag">🎒 Cabin: ${flight.cabinBaggage}</div>
                            <div class="checked-bag">🧳 Checked: ${flight.checkedBaggage}</div>
                        </div>
                        <div class="meals">🍽️ ${flight.meals}</div>
                    </div>
                </div>
                <div class="best-price-badge">Best: ₹${flight.bestPrice.toLocaleString('en-IN')}</div>
            </div>
            <div class="flight-route">
                <div class="departure">
                    <div class="time">${flight.departure.time}</div>
                    <div class="city">${flight.departure.city}</div>
                    <div class="airport">${flight.departure.airport}</div>
                </div>
                <div class="duration">
                    <div class="flight-line">
                        <div class="plane-icon">✈️</div>
                    </div>
                    <div class="duration-text">${flight.duration}</div>
                    <div class="stops-info">
                        <span class="stops-count non-stop">${flight.stopsText}</span>
                    </div>
                </div>
                <div class="arrival">
                    <div class="time">${flight.arrival.time}</div>
                    <div class="city">${flight.arrival.city}</div>
                    <div class="airport">${flight.arrival.airport}</div>
                </div>
            </div>
            <div class="price-comparison">
                <h4>💰 Compare & Book:</h4>
                <div class="booking-sites">
                    ${pricesHtml}
                </div>
            </div>
        `;
        flightList.appendChild(flightCard);
    });
}

// Real booking site URLs
const bookingSiteUrls = {
    'MakeMyTrip': 'https://www.makemytrip.com/flight/search',
    'Cleartrip': 'https://www.cleartrip.com/flights',
    'Goibibo': 'https://www.goibibo.com/flights',
    'Yatra': 'https://www.yatra.com/flights',
    'EaseMyTrip': 'https://www.easemytrip.com/flights',
    'Paytm Travel': 'https://travel.paytm.com/flights',
    'Ixigo': 'https://www.ixigo.com/flights',
    'Booking.com': 'https://www.booking.com/flights',
    'Expedia': 'https://www.expedia.co.in/Flights'
};

// Book flight function with real URLs
function bookFlight(site, price, departure, arrival) {
    const baseUrl = bookingSiteUrls[site];
    if (baseUrl) {
        // Create search URL with parameters
        const searchUrl = `${baseUrl}?from=${departure}&to=${arrival}&departure=${document.getElementById('date').value || new Date().toISOString().split('T')[0]}&adults=1`;
        
        // Open in new tab
        window.open(searchUrl, '_blank');
    } else {
        alert(`Redirecting to ${site} for ₹${price.toLocaleString('en-IN')}`);
    }
}
