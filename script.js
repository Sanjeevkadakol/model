// Initialize maps
let map;
let riskMap;

// Add these new global variables at the top
let activeMarkers = new Map(); // Store active markers
let historicalData = new Map(); // Store historical data
let isMonitoring = false;
let monitoringInterval;

// Global variables for charts
let trendChart = null;
let impactChart = null;

// Initialize the main map
function initMap() {
    try {
        // Default center (Amazon rainforest)
        const defaultCenter = [ -14.235004, -51.92528 ];
        
        // Define tile layers
        const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            name: 'Street View'
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '',
            name: 'Satellite View'
        });

        // Define separate layers for risk map
        const streetLayerRisk = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            name: 'Street View'
        });

        const satelliteLayerRisk = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '',
            name: 'Satellite View'
        });

        // Initialize main detection map
        map = L.map('map', {
            attributionControl: false
        }).setView(defaultCenter, 6);
        streetLayer.addTo(map);
        
        // Initialize risk mapping map
        riskMap = L.map('riskMap', {
            attributionControl: false
        }).setView(defaultCenter, 6);
        streetLayer.addTo(riskMap);
        
        // Add layer controls
        L.control.layers({
            'Street View': streetLayer,
            'Satellite View': satelliteLayer
        }).addTo(map);

        L.control.layers({
            'Street View': streetLayerRisk,
            'Satellite View': satelliteLayerRisk
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
    console.log("Detection started"); // Debug log
    
    // Get deforestation data
    const deforestationSites = generateDeforestationData();
    console.log("Sites generated:", deforestationSites); // Debug log

    // Clear any existing markers
    if (window.deforestationMarkers) {
        window.deforestationMarkers.forEach(marker => marker.remove());
    }
    window.deforestationMarkers = [];

    // Add markers for each site
    deforestationSites.forEach(site => {
        console.log("Adding marker for site:", site); // Debug log
        
        // Add marker
        const marker = L.marker(site.location).addTo(map);
        
        // Add circle
        const circle = L.circle(site.location, {
            color: site.severity === 'High' ? '#ff0000' : '#ffa500',
            fillColor: site.severity === 'High' ? '#ff0000' : '#ffa500',
            fillOpacity: 0.5,
            radius: site.area * 100
        }).addTo(map);

        // Add popup
        marker.bindPopup(`
            <div class="deforestation-popup">
                <h4>Deforestation Detected</h4>
                <p>Area: ${site.area} hectares</p>
                <p>Severity: ${site.severity}</p>
                <p>Type: ${site.type}</p>
            </div>
        `);

        window.deforestationMarkers.push(marker);
        window.deforestationMarkers.push(circle);
    });

    // Zoom to markers
    if (window.deforestationMarkers.length > 0) {
        const group = new L.featureGroup(window.deforestationMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }

    // Update results
    updateDetectionResults({
        totalArea: deforestationSites.reduce((sum, site) => sum + site.area, 0),
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        sitesDetected: deforestationSites.length
    });
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

// Enhanced deforestation data generator with more realistic patterns
function generateDeforestationData(timeframe = 'current') {
    const baseLocations = [
        // Amazon rainforest critical areas
        { lat: -3.4653, lng: -62.2159, name: "Manaus Region" },
        { lat: -5.2303, lng: -55.9253, name: "Santarém Area" },
        { lat: -8.7573, lng: -63.8889, name: "Porto Velho Zone" },
        { lat: -3.7436, lng: -73.2516, name: "Iquitos Region" },
        { lat: -9.1900, lng: -67.8000, name: "Rio Branco Area" }
    ];

    return baseLocations.map(base => {
        // Add some randomization to locations to simulate different affected areas
        const randomOffset = () => (Math.random() - 0.5) * 2;
        const location = [
            base.lat + randomOffset() * 0.5,
            base.lng + randomOffset() * 0.5
        ];

        // Generate more realistic data based on timeframe
        const area = Math.floor(Math.random() * 500 + 100);
        const date = timeframe === 'historical' 
            ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
            : new Date();

        return {
            location: location,
            area: area,
            date: date.toISOString(),
            severity: area > 300 ? "High" : area > 150 ? "Medium" : "Low",
            type: ["Clear cutting", "Selective logging", "Burning", "Road construction"][Math.floor(Math.random() * 4)],
            description: generateDescription(area),
            regionName: base.name,
            biodiversityImpact: calculateBiodiversityImpact(area),
            carbonImpact: calculateCarbonImpact(area),
            riskLevel: calculateRiskLevel(area),
            recoveryTime: estimateRecoveryTime(area),
            previousIncidents: Math.floor(Math.random() * 5)
        };
    });
}

// Helper functions for detailed analysis
function calculateBiodiversityImpact(area) {
    const speciesPerHectare = 25; // Average species per hectare
    return {
        speciesAffected: Math.floor(area * speciesPerHectare),
        threatLevel: area > 300 ? "Critical" : area > 150 ? "Significant" : "Moderate",
        ecosystemImpact: area > 300 ? "Severe fragmentation" : "Partial fragmentation"
    };
}

function calculateCarbonImpact(area) {
    const carbonPerHectare = 160; // Tons of carbon per hectare
    return {
        carbonReleased: Math.floor(area * carbonPerHectare),
        equivalentEmissions: Math.floor(area * carbonPerHectare * 3.67), // CO2 equivalent
        yearlyImpact: Math.floor(area * carbonPerHectare * 0.1) // Ongoing yearly impact
    };
}

function calculateRiskLevel(area) {
    const factors = [
        { name: "Habitat Loss", score: area > 300 ? 5 : area > 150 ? 3 : 1 },
        { name: "Species Extinction", score: area > 250 ? 5 : area > 100 ? 3 : 1 },
        { name: "Ecosystem Degradation", score: area > 350 ? 5 : area > 200 ? 3 : 1 },
        { name: "Carbon Release", score: area > 400 ? 5 : area > 250 ? 3 : 1 }
    ];
    return factors;
}

function estimateRecoveryTime(area) {
    return {
        years: Math.floor(area * 0.1) + 5,
        naturalRegeneration: area < 200 ? "Possible" : "Unlikely",
        interventionNeeded: area > 150 ? "Yes" : "No"
    };
}

function generateDescription(area) {
    const descriptions = [
        `Large-scale deforestation detected affecting ${area} hectares of primary forest.`,
        `Significant forest degradation observed with ${area} hectares impacted.`,
        `Forest clearing activity detected, impacting ${area} hectares of diverse ecosystem.`,
        `Illegal logging operation discovered affecting ${area} hectares of protected forest.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function startMonitoring() {
    isMonitoring = true;
    document.querySelector('.detect-button').innerHTML = 'Stop Monitoring';
    document.querySelector('.detect-button').classList.add('monitoring');

    // Initial detection
    performDetection();

    // Set up real-time monitoring
    monitoringInterval = setInterval(performDetection, 30000); // Update every 30 seconds
}

function stopMonitoring() {
    isMonitoring = false;
    document.querySelector('.detect-button').innerHTML = 'Start Monitoring';
    document.querySelector('.detect-button').classList.remove('monitoring');
    clearInterval(monitoringInterval);
}

function performDetection() {
    const currentData = generateDeforestationData();
    updateMap(currentData);
    updateAnalytics(currentData);
    
    // Store in historical data
    historicalData.set(Date.now(), currentData);
    
    // Update historical analysis
    updateHistoricalAnalysis();
}

function updateMap(deforestationSites) {
    // Clear old markers
    activeMarkers.forEach(marker => marker.remove());
    activeMarkers.clear();

    deforestationSites.forEach(site => {
        // Create marker with custom icon based on severity
        const marker = createCustomMarker(site);
        const circle = createImpactCircle(site);
        const popup = createDetailedPopup(site);

        marker.bindPopup(popup);
        marker.addTo(map);
        circle.addTo(map);

        activeMarkers.set(site.location.toString(), [marker, circle]);
    });

    // Fit map to show all markers
    const group = L.featureGroup([...activeMarkers.values()].flat());
    map.fitBounds(group.getBounds().pad(0.1));
}

function createCustomMarker(site) {
    const severityColors = {
        High: '#ff0000',
        Medium: '#ffa500',
        Low: '#ffff00'
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${severityColors[site.severity]}"></div>`,
        iconSize: [20, 20]
    });
}

function createImpactCircle(site) {
    return L.circle(site.location, {
        color: site.severity === 'High' ? '#ff0000' : site.severity === 'Medium' ? '#ffa500' : '#ffff00',
        fillColor: site.severity === 'High' ? '#ff4444' : site.severity === 'Medium' ? '#ffc044' : '#ffff44',
        fillOpacity: 0.5,
        radius: site.area * 100
    });
}

function createDetailedPopup(site) {
    return `
        <div class="deforestation-popup">
            <h4>${site.regionName} - ${site.severity} Alert</h4>
            <div class="popup-content">
                <div class="basic-info">
                    <p><strong>Date:</strong> ${new Date(site.date).toLocaleDateString()}</p>
                    <p><strong>Area:</strong> ${site.area} hectares</p>
                    <p><strong>Type:</strong> ${site.type}</p>
                </div>
                <div class="impact-analysis">
                    <h5>Impact Analysis</h5>
                    <p><strong>Species Affected:</strong> ~${site.biodiversityImpact.speciesAffected}</p>
                    <p><strong>Carbon Released:</strong> ${site.carbonImpact.carbonReleased} tons</p>
                    <p><strong>Recovery Time:</strong> ${site.recoveryTime.years} years</p>
                </div>
                <div class="risk-assessment">
                    <h5>Risk Assessment</h5>
                    ${site.riskLevel.map(risk => 
                        `<p>${risk.name}: ${risk.score}/5</p>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
}

// Add this CSS for enhanced styling
const enhancedStyles = `
    .custom-marker {
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .deforestation-popup {
        max-width: 400px;
        padding: 15px;
    }
    .deforestation-popup h4 {
        margin: 0 0 10px 0;
        color: #d32f2f;
        border-bottom: 2px solid #d32f2f;
        padding-bottom: 5px;
    }
    .popup-content {
        display: grid;
        gap: 10px;
    }
    .impact-analysis, .risk-assessment {
        background: #f5f5f5;
        padding: 10px;
        border-radius: 5px;
    }
    .detect-button.monitoring {
        background-color: #ff4444;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedStyles;
document.head.appendChild(styleSheet);

// Make sure the button is properly connected
document.addEventListener('DOMContentLoaded', function() {
    const detectButton = document.querySelector('.detect-button');
    if (detectButton) {
        detectButton.addEventListener('click', toggleDetection);
        console.log("Detection button listener added"); // Debug log
    } else {
        console.error("Detection button not found"); // Debug log
    }
});

function updateStatCards(data) {
    // Update with animations and trends
    updateStatWithAnimation('totalArea', data.totalArea, 'hectares');
    updateStatWithAnimation('rateChange', data.rateChange, '%');
    updateStatWithAnimation('carbonImpact', data.carbonImpact, 'tons');

    // Add trends
    addTrendIndicator('totalArea', data.rateChange > 0);
    addTrendIndicator('rateChange', data.rateChange > 0);
    addTrendIndicator('carbonImpact', data.rateChange > 0);
}

function updateStatWithAnimation(elementId, value, unit) {
    const element = document.getElementById(elementId);
    const start = parseInt(element.textContent.replace(/[^0-9-]/g, '')) || 0;
    const end = parseInt(value);
    const duration = 1500;
    const steps = 60;
    const increment = (end - start) / steps;
    
    let current = start;
    let step = 0;
    
    const animation = setInterval(() => {
        step++;
        current += increment;
        element.textContent = `${numberWithCommas(Math.round(current))} ${unit}`;
        
        if (step >= steps) {
            clearInterval(animation);
            element.textContent = `${numberWithCommas(end)} ${unit}`;
        }
    }, duration / steps);
}

function addTrendIndicator(elementId, isPositive) {
    const element = document.getElementById(elementId);
    const trendDiv = document.createElement('div');
    trendDiv.className = `trend ${isPositive ? 'positive' : 'negative'}`;
    trendDiv.innerHTML = isPositive ? 
        '<i class="fas fa-arrow-up"></i> Increasing' :
        '<i class="fas fa-arrow-down"></i> Decreasing';
    
    // Remove existing trend indicator if any
    const existingTrend = element.parentElement.querySelector('.trend');
    if (existingTrend) {
        existingTrend.remove();
    }
    
    element.parentElement.appendChild(trendDiv);
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Debug log
    initializeCharts();
    
    // Add event listener to update button
    const updateButton = document.getElementById('updateStats');
    if (updateButton) {
        updateButton.addEventListener('click', updateCharts);
        // Initial update
        updateCharts();
    }
});

function initializeCharts() {
    console.log('Initializing charts'); // Debug log
    
    // Initialize Trend Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Deforested Area (hectares)',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Deforestation Trend'
                    }
                }
            }
        });
    }

    // Initialize Impact Chart
    const impactCtx = document.getElementById('impactChart');
    if (impactCtx) {
        impactChart = new Chart(impactCtx, {
            type: 'bar',
            data: {
                labels: ['Biodiversity Loss', 'Carbon Emissions', 'Soil Erosion', 'Water Impact'],
                datasets: [{
                    label: 'Impact Score',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Environmental Impact'
                    }
                }
            }
        });
    }
}

function updateCharts() {
    console.log('Updating charts'); // Debug log
    const country = document.getElementById('countrySelect').value;
    const timeRange = document.getElementById('timeRange').value;
    const data = generateStatisticsData(country, timeRange);

    // Update Trend Chart
    if (trendChart) {
        trendChart.data.labels = data.timeLabels;
        trendChart.data.datasets[0].data = data.deforestationData;
        trendChart.update();
    }

    // Update Impact Chart
    if (impactChart) {
        impactChart.data.datasets[0].data = data.impactScores;
        impactChart.update();
    }

    // Update Summary Stats
    updateSummaryStats(data);
}

function generateStatisticsData(country, timeRange) {
    // Generate time labels based on selected range
    const years = timeRange === '1year' ? 1 : timeRange === '5years' ? 5 : 10;
    const timeLabels = [];
    const deforestationData = [];
    const currentYear = new Date().getFullYear();

    // Generate data based on country and time range
    const baseValue = {
        'brazil': 1000000,
        'indonesia': 500000,
        'congo': 300000,
        'peru': 200000,
        'colombia': 150000
    }[country] || 100000;

    // Generate time series data
    for (let i = 0; i < years; i++) {
        timeLabels.push(currentYear - i);
        deforestationData.push(baseValue * (1 + Math.random() * 0.5));
    }

    // Generate impact scores
    const impactScores = [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100
    ];

    return {
        timeLabels: timeLabels.reverse(),
        deforestationData: deforestationData.reverse(),
        impactScores: impactScores,
        totalArea: deforestationData.reduce((a, b) => a + b, 0),
        rateChange: ((deforestationData[deforestationData.length - 1] - deforestationData[0]) / deforestationData[0] * 100).toFixed(1)
    };
}

function updateSummaryStats(data) {
    // Update summary statistics
    document.getElementById('totalArea').textContent = `${numberWithCommas(Math.round(data.totalArea))} hectares`;
    document.getElementById('rateChange').textContent = `${data.rateChange}%`;
    document.getElementById('carbonImpact').textContent = `${numberWithCommas(Math.round(data.totalArea * 0.5))} tons`;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} 