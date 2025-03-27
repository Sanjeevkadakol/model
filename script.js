// Initialize maps
let map;
let riskMap;

// Initialize the main map
function initMap() {
    try {
        // Default center (Amazon rainforest)
        const defaultCenter = [ -14.235004, -51.92528 ];
        
        // Define tile layers
        const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            name: 'Dark Street View'
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            name: 'Satellite View'
        });

        // Initialize main detection map
        map = L.map('map').setView(defaultCenter, 6);
        streetLayer.addTo(map);
        
        // Add layer control to detection map
        L.control.layers({
            'Dark Street View': streetLayer,
            'Satellite View': satelliteLayer
        }).addTo(map);

        // Initialize risk mapping map
        riskMap = L.map('riskMap').setView(defaultCenter, 6);
        streetLayer.addTo(riskMap);
        
        // Add layer control to risk map
        L.control.layers({
            'Street View': streetLayer,
            'Satellite View': satelliteLayer
        }).addTo(riskMap);

        // Add custom controls
        addMapControls();

        // Hide loading indicator
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing maps:', error);
        // Show error message to user
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <p style="color: red;">Error loading maps. Please check your internet connection and try again.</p>
                </div>
            `;
        }
    }
}

// Add custom controls to maps
function addMapControls() {
    // Add custom control for detection
    const detectionControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('button', '', container);
            button.innerHTML = '<i class="fas fa-tree"></i> Toggle Detection';
            button.onclick = toggleDetection;
            return container;
        }
    });
    map.addControl(new detectionControl());

    // Add custom control for risk mapping
    const riskControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('button', '', container);
            button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Toggle Risk';
            button.onclick = toggleRiskMapping;
            return container;
        }
    });
    riskMap.addControl(new riskControl());
}

// Toggle detection overlay
function toggleDetection() {
    // Simulate detection results
    const detectionResults = generateDetectionResults();
    updateDetectionResults(detectionResults);
}

// Toggle risk mapping overlay
function toggleRiskMapping() {
    // Simulate risk mapping results
    const riskResults = generateRiskResults();
    updateRiskResults(riskResults);
}

// Generate simulated detection results
function generateDetectionResults() {
    return {
        totalArea: Math.floor(Math.random() * 1000),
        confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
        timestamp: new Date().toISOString()
    };
}

// Generate simulated risk results
function generateRiskResults() {
    return {
        highRisk: Math.floor(Math.random() * 5),
        mediumRisk: Math.floor(Math.random() * 10),
        lowRisk: Math.floor(Math.random() * 15),
        riskFactors: [
            'Deforestation Rate',
            'Species Diversity',
            'Habitat Fragmentation',
            'Climate Impact'
        ]
    };
}

// Update detection results display
function updateDetectionResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="result-item">
            <h4>Detection Results</h4>
            <p>Total Affected Area: ${results.totalArea} km²</p>
            <p>Confidence: ${(results.confidence * 100).toFixed(1)}%</p>
            <p>Timestamp: ${new Date(results.timestamp).toLocaleString()}</p>
        </div>
    `;
}

// Update risk results display
function updateRiskResults(results) {
    // Update metrics
    document.getElementById('highRisk').textContent = results.highRisk;
    document.getElementById('mediumRisk').textContent = results.mediumRisk;
    document.getElementById('lowRisk').textContent = results.lowRisk;

    // Update risk factors
    const riskFactorsList = document.getElementById('riskFactors');
    riskFactorsList.innerHTML = results.riskFactors
        .map(factor => `<li>${factor}</li>`)
        .join('');
}

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    // Simulate form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll-based animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature, .metric, .result-item').forEach(el => {
    observer.observe(el);
});

// Add event listener for the Start Detection button
document.addEventListener('DOMContentLoaded', function() {
    const startDetectionButton = document.querySelector('.cta-button');
    if (startDetectionButton) {
        startDetectionButton.addEventListener('click', function() {
            const detectionSection = document.getElementById('detection');
            if (detectionSection) {
                detectionSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Trigger detection after scrolling
                setTimeout(toggleDetection, 1000);
            }
        });
    }
});

// Initialize maps when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
}); 