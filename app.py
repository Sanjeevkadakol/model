from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import random
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Serve static files
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico')

@app.route('/api/analyze-area', methods=['POST'])
def analyze_area():
    try:
        data = request.get_json()
        
        if not data or 'coordinates' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        # Extract parameters
        coordinates = data.get('coordinates', [])
        detection_mode = data.get('detectionMode', 'standard')
        time_range = data.get('timeRange', '1month')
        sensitivity = data.get('sensitivity', 0.5)
        
        # Validate coordinates
        if not coordinates or len(coordinates) < 3:
            return jsonify({'error': 'Invalid area coordinates'}), 400
            
        # Generate simulated detection results
        num_detections = random.randint(3, 10)
        detected_areas = []
        
        # Calculate bounding box of selected area
        lats = [coord[0] for coord in coordinates]
        lngs = [coord[1] for coord in coordinates]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)
        
        # Types of detections based on mode
        detection_types = {
            'standard': ['Deforestation', 'Forest Degradation', 'Land Use Change'],
            'advanced': ['Clear Cutting', 'Selective Logging', 'Forest Fire', 'Agricultural Expansion'],
            'monitoring': ['Vegetation Loss', 'Canopy Change', 'Forest Health']
        }
        
        current_types = detection_types.get(detection_mode, detection_types['standard'])
        
        for _ in range(num_detections):
            # Generate random point within the area
            lat_offset = (max(lats) - min(lats)) * (random.random() - 0.5) * 0.5
            lng_offset = (max(lngs) - min(lngs)) * (random.random() - 0.5) * 0.5
            
            detection = {
                'coordinates': [
                    center_lat + lat_offset,
                    center_lng + lng_offset
                ],
                'type': random.choice(current_types),
                'riskLevel': random.choice(['high', 'medium', 'low']),
                'confidence': random.uniform(60, 98),
                'size': random.uniform(0.1, 2.0),
                'vegetationDensity': random.uniform(20, 90),
                'description': generate_description()
            }
            detected_areas.append(detection)
            
        # Count risk levels
        risk_counts = {
            'highRisk': sum(1 for area in detected_areas if area['riskLevel'] == 'high'),
            'mediumRisk': sum(1 for area in detected_areas if area['riskLevel'] == 'medium'),
            'lowRisk': sum(1 for area in detected_areas if area['riskLevel'] == 'low'),
            'totalSites': len(detected_areas)
        }
        
        return jsonify({
            'status': 'success',
            'detectedAreas': detected_areas,
            **risk_counts
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_description():
    descriptions = [
        "Significant vegetation loss detected in this area, indicating possible deforestation activity.",
        "Changes in canopy structure suggest selective logging operations.",
        "Rapid land use change observed, potentially for agricultural expansion.",
        "Forest degradation patterns identified, requiring immediate attention.",
        "Multiple signs of human activity affecting forest health.",
        "Natural forest disturbance detected, monitoring recommended.",
        "Evidence of forest fragmentation and habitat disruption.",
        "Seasonal changes in vegetation density observed.",
        "Potential illegal logging activity identified in this region.",
        "Signs of forest recovery and regeneration present."
    ]
    return random.choice(descriptions)

if __name__ == '__main__':
    # Create static folder if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    app.run(debug=True, port=5000) 