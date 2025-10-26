from flask import Flask, request, jsonify, send_from_directory
import os
import json
from datetime import datetime

app = Flask(__name__)

# Store calculation history (in production, use a database)
calculation_history = []

# Serve the landing page
@app.route('/')
def home():
    with open("landing.html", "r", encoding="utf-8") as f:
        return f.read()

# Serve the dashboard
@app.route('/dashboard')
def dashboard():
    with open("dashboard.html", "r", encoding="utf-8") as f:
        return f.read()

# Serve static files
@app.route('/<path:filename>')
def serve_static(filename):
    if filename.endswith(('.css', '.js', '.html')):
        return send_from_directory(os.getcwd(), filename)
    return "Not found", 404

# API endpoint for text analysis
@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    
    # Calculate based on text content
    word_count = len(text.split())
    score = min(10, max(1, (word_count % 10) + 1))
    
    eco_tips = [
        "Use energy-efficient LED bulbs to save 75% energy 💡",
        "Switch to reusable water bottles and save 167 plastic bottles/year 💧",
        "Plant a tree this weekend - it absorbs 22kg CO₂/year 🌱",
        "Turn off lights when not in use - save 10% on energy bills 💡",
        "Use public transport twice a week - reduce 1,600kg CO₂/year 🚲",
        "Reduce meat consumption - save 820kg CO₂/year per person 🥗",
        "Install water-saving fixtures - reduce usage by 30% 💧",
        "Compost food waste - reduce 300kg waste/year per household ♻️",
    ]
    
    tip = eco_tips[score % len(eco_tips)]
    
    return jsonify({
        "result": f"Eco score for your text is {score}/10 🌿",
        "tip": tip,
        "word_count": word_count,
        "score": score
    })

# API endpoint for carbon footprint calculation with accurate formulas
@app.route('/api/carbon', methods=['POST'])
def carbon():
    data = request.get_json()
    
    # Get inputs
    transport_km = float(data.get("transport", 0))
    transport_type = data.get("transport_type", "car")
    energy_kwh = float(data.get("energy", 0))
    waste_kg = float(data.get("waste", 0))
    recycle_percent = float(data.get("recycle", 0))
    
    # Emission factors (kg CO2 per unit) - based on EPA and scientific sources
    transport_factors = {
        "car": 0.171,  # kg CO2 per km (average gasoline car)
        "bus": 0.089,  # kg CO2 per km
        "train": 0.041,  # kg CO2 per km
        "motorcycle": 0.103,  # kg CO2 per km
        "bicycle": 0.0,  # kg CO2 per km
    }
    
    energy_factor = 0.45  # kg CO2 per kWh (average grid)
    waste_factor = 0.57  # kg CO2 per kg waste
    recycle_reduction = 0.7  # 70% reduction if recycled
    
    # Calculate emissions
    transport_emissions = transport_km * transport_factors.get(transport_type, 0.171)
    energy_emissions = energy_kwh * energy_factor
    waste_emissions = waste_kg * waste_factor * (1 - (recycle_percent / 100) * recycle_reduction)
    
    total_emissions = transport_emissions + energy_emissions + waste_emissions
    
    # Annual projection
    annual_emissions = total_emissions * 12
    
    # Recommendations based on highest contributor
    recommendations = []
    if transport_emissions > energy_emissions and transport_emissions > waste_emissions:
        recommendations.append(f"Transportation is your biggest contributor ({transport_emissions:.1f} kg CO₂)")
        recommendations.append("Consider carpooling, public transport, or cycling more often")
    elif energy_emissions > waste_emissions:
        recommendations.append(f"Energy usage is your biggest contributor ({energy_emissions:.1f} kg CO₂)")
        recommendations.append("Switch to renewable energy sources or reduce electricity consumption")
    else:
        recommendations.append(f"Waste is your biggest contributor ({waste_emissions:.1f} kg CO₂)")
        recommendations.append("Increase recycling and composting rates")
    
    # Save to history
    calculation_history.append({
        "date": datetime.now().isoformat(),
        "type": "carbon",
        "value": round(total_emissions, 2)
    })
    
    return jsonify({
        "carbon_footprint": round(total_emissions, 2),
        "annual_projection": round(annual_emissions, 2),
        "breakdown": {
            "transport": round(transport_emissions, 2),
            "energy": round(energy_emissions, 2),
            "waste": round(waste_emissions, 2)
        },
        "recommendations": recommendations,
        "comparison": "Average US footprint: 1,333 kg CO₂/month" if total_emissions < 1333 else "Above average - let's reduce it!"
    })

# API endpoint for water usage calculation
@app.route('/api/water', methods=['POST'])
def water():
    data = request.get_json()
    people = int(data.get("people", 1))
    showers = int(data.get("showers", 7))
    laundry = int(data.get("laundry", 3))
    dishwasher = int(data.get("dishwasher", 4))
    
    # Water consumption factors (liters)
    shower_water = 65  # liters per 8-minute shower
    laundry_water = 50  # liters per load
    dishwasher_water = 20  # liters per load
    base_consumption = 50  # liters per person per day (drinking, cooking, etc.)
    
    # Weekly calculations
    weekly_showers = showers * shower_water
    weekly_laundry = laundry * laundry_water
    weekly_dishwasher = dishwasher * dishwasher_water
    weekly_base = people * base_consumption * 7
    
    total_weekly = weekly_showers + weekly_laundry + weekly_dishwasher + weekly_base
    daily_avg = total_weekly / 7
    monthly_usage = total_weekly * 4.33
    annual_usage = total_weekly * 52
    
    # Savings potential
    efficient_shower = 40  # liters with low-flow showerhead
    savings_shower = showers * (shower_water - efficient_shower)
    savings_laundry = laundry * 15  # efficient washing machine
    total_savings = (savings_shower + savings_laundry) * 4.33
    
    return jsonify({
        "daily_usage": round(daily_avg, 1),
        "weekly_usage": round(total_weekly, 1),
        "monthly_usage": round(monthly_usage, 1),
        "annual_usage": round(annual_usage, 1),
        "breakdown": {
            "showers": round(weekly_showers, 1),
            "laundry": round(weekly_laundry, 1),
            "dishwasher": round(weekly_dishwasher, 1),
            "other": round(weekly_base, 1)
        },
        "savings_potential": round(total_savings, 1),
        "tips": [
            f"Install low-flow showerheads to save {savings_shower * 4.33:.0f}L/month",
            "Fix leaky faucets - can waste 90L/day",
            "Use efficient appliances to reduce water by 30%"
        ]
    })

# API endpoint for sustainability score
@app.route('/api/sustainability', methods=['POST'])
def sustainability():
    data = request.get_json()
    
    # Get user responses (1-10 scale)
    renewable_energy = int(data.get("renewable", 5))
    local_food = int(data.get("local_food", 5))
    public_transport = int(data.get("public_transport", 5))
    recycling = int(data.get("recycling", 5))
    water_conservation = int(data.get("water", 5))
    
    # Calculate weighted score
    total_score = (renewable_energy * 0.25 + 
                   local_food * 0.20 + 
                   public_transport * 0.25 + 
                   recycling * 0.15 + 
                   water_conservation * 0.15)
    
    # Determine category
    if total_score >= 8:
        category = "Eco Champion 🌟"
        message = "Outstanding! You're a sustainability leader!"
    elif total_score >= 6:
        category = "Eco Conscious 🌱"
        message = "Great job! Keep improving your eco-friendly habits."
    elif total_score >= 4:
        category = "Getting Started 🌿"
        message = "Good start! There's room for improvement."
    else:
        category = "Beginner 🌍"
        message = "Let's work together to improve your sustainability!"
    
    return jsonify({
        "score": round(total_score, 1),
        "category": category,
        "message": message,
        "breakdown": {
            "renewable_energy": renewable_energy,
            "local_food": local_food,
            "public_transport": public_transport,
            "recycling": recycling,
            "water_conservation": water_conservation
        }
    })

# API endpoint to get calculation history
@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(calculation_history[-10:])  # Last 10 entries

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
