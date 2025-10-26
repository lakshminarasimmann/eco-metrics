// Section navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav item
    event.target.closest('.nav-item').classList.add('active');
}

// Update range slider values
function updateValue(id) {
    const value = document.getElementById(id).value;
    document.getElementById(`${id}-value`).textContent = value;
}

// Text Analyzer
async function analyzeText() {
    const text = document.getElementById("inputText").value.trim();
    if (!text) {
        alert("Please enter some text!");
        return;
    }

    const resultBox = document.getElementById("analyzer-result");
    resultBox.innerHTML = "⏳ Analyzing...";
    resultBox.classList.add("show");

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        resultBox.innerHTML = `
            <h3>${data.result}</h3>
            <p><strong>Word Count:</strong> ${data.word_count}</p>
            <p class="tip">💡 ${data.tip}</p>
        `;
    } catch (error) {
        resultBox.innerHTML = "❌ Error analyzing data. Please try again.";
    }
}

function clearAnalyzer() {
    document.getElementById("inputText").value = "";
    const resultBox = document.getElementById("analyzer-result");
    resultBox.classList.remove("show");
}

// Carbon Calculator
let carbonBreakdownChart = null;

async function calculateCarbon() {
    const transport = document.getElementById("transport").value;
    const transportType = document.getElementById("transport-type").value;
    const energy = document.getElementById("energy").value;
    const waste = document.getElementById("waste").value;
    const recycle = document.getElementById("recycle").value;

    if (!transport || !energy || !waste) {
        alert("Please fill all fields!");
        return;
    }

    const resultBox = document.getElementById("carbon-result");
    resultBox.innerHTML = "⏳ Calculating...";
    resultBox.classList.add("show");

    try {
        const response = await fetch("/api/carbon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                transport, 
                transport_type: transportType,
                energy, 
                waste, 
                recycle 
            }),
        });

        const data = await response.json();
        
        resultBox.innerHTML = `
            <div class="result-header">
                <h3>🌍 Total Carbon Footprint: ${data.carbon_footprint} kg CO₂/month</h3>
                <p class="annual">Annual Projection: ${data.annual_projection} kg CO₂/year</p>
            </div>
            <div class="breakdown-grid">
                <div class="breakdown-item">
                    <span class="breakdown-label">🚗 Transport:</span>
                    <span class="breakdown-value">${data.breakdown.transport} kg</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">⚡ Energy:</span>
                    <span class="breakdown-value">${data.breakdown.energy} kg</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">🗑️ Waste:</span>
                    <span class="breakdown-value">${data.breakdown.waste} kg</span>
                </div>
            </div>
            <div class="recommendations">
                <h4>📋 Recommendations:</h4>
                ${data.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
            </div>
            <p class="comparison">📊 ${data.comparison}</p>
        `;
        
        // Show and update chart
        document.getElementById("carbon-chart-container").style.display = "block";
        updateCarbonChart(data.breakdown);
        
    } catch (error) {
        resultBox.innerHTML = "❌ Error calculating carbon footprint.";
    }
}

function updateCarbonChart(breakdown) {
    const ctx = document.getElementById('carbonBreakdownChart');
    
    if (carbonBreakdownChart) {
        carbonBreakdownChart.destroy();
    }
    
    carbonBreakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transport', 'Energy', 'Waste'],
            datasets: [{
                data: [breakdown.transport, breakdown.energy, breakdown.waste],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Carbon Footprint Breakdown',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Water Calculator
let waterBreakdownChart = null;

async function calculateWater() {
    const people = document.getElementById("people").value;
    const showers = document.getElementById("showers").value;
    const laundry = document.getElementById("laundry").value;
    const dishwasher = document.getElementById("dishwasher").value;

    if (!people) {
        alert("Please enter number of people!");
        return;
    }

    const resultBox = document.getElementById("water-result");
    resultBox.innerHTML = "⏳ Calculating...";
    resultBox.classList.add("show");

    try {
        const response = await fetch("/api/water", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ people, showers, laundry, dishwasher }),
        });

        const data = await response.json();
        
        resultBox.innerHTML = `
            <div class="result-header">
                <h3>💧 Water Usage Analysis</h3>
            </div>
            <div class="breakdown-grid">
                <div class="breakdown-item">
                    <span class="breakdown-label">Daily:</span>
                    <span class="breakdown-value">${data.daily_usage} L</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Weekly:</span>
                    <span class="breakdown-value">${data.weekly_usage} L</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Monthly:</span>
                    <span class="breakdown-value">${data.monthly_usage} L</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Annual:</span>
                    <span class="breakdown-value">${data.annual_usage} L</span>
                </div>
            </div>
            <div class="savings-box">
                <h4>💰 Potential Monthly Savings: ${data.savings_potential} L</h4>
            </div>
            <div class="recommendations">
                <h4>💡 Water Saving Tips:</h4>
                ${data.tips.map(tip => `<p>• ${tip}</p>`).join('')}
            </div>
        `;
        
        // Show and update chart
        document.getElementById("water-chart-container").style.display = "block";
        updateWaterChart(data.breakdown);
        
    } catch (error) {
        resultBox.innerHTML = "❌ Error calculating water usage.";
    }
}

function updateWaterChart(breakdown) {
    const ctx = document.getElementById('waterBreakdownChart');
    
    if (waterBreakdownChart) {
        waterBreakdownChart.destroy();
    }
    
    waterBreakdownChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Showers', 'Laundry', 'Dishwasher', 'Other'],
            datasets: [{
                label: 'Weekly Water Usage (Liters)',
                data: [breakdown.showers, breakdown.laundry, breakdown.dishwasher, breakdown.other],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Liters'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Weekly Water Usage Breakdown',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Sustainability Calculator
let sustainabilityChart = null;

async function calculateSustainability() {
    const renewable = document.getElementById("renewable").value;
    const localFood = document.getElementById("local-food").value;
    const publicTransport = document.getElementById("public-transport").value;
    const recycling = document.getElementById("recycling").value;
    const water = document.getElementById("water-conservation").value;

    const resultBox = document.getElementById("sustainability-result");
    resultBox.innerHTML = "⏳ Calculating...";
    resultBox.classList.add("show");

    try {
        const response = await fetch("/api/sustainability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                renewable, 
                local_food: localFood, 
                public_transport: publicTransport, 
                recycling, 
                water 
            }),
        });

        const data = await response.json();
        
        resultBox.innerHTML = `
            <div class="result-header sustainability-header">
                <h3>🌟 Your Sustainability Score: ${data.score}/10</h3>
                <h2 class="category">${data.category}</h2>
                <p class="message">${data.message}</p>
            </div>
        `;
        
        // Show and update chart
        document.getElementById("sustainability-chart-container").style.display = "block";
        updateSustainabilityChart(data.breakdown);
        
    } catch (error) {
        resultBox.innerHTML = "❌ Error calculating sustainability score.";
    }
}

function updateSustainabilityChart(breakdown) {
    const ctx = document.getElementById('sustainabilityChart');
    
    if (sustainabilityChart) {
        sustainabilityChart.destroy();
    }
    
    sustainabilityChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Renewable Energy', 'Local Food', 'Public Transport', 'Recycling', 'Water Conservation'],
            datasets: [{
                label: 'Your Score',
                data: [
                    breakdown.renewable_energy,
                    breakdown.local_food,
                    breakdown.public_transport,
                    breakdown.recycling,
                    breakdown.water_conservation
                ],
                backgroundColor: 'rgba(0, 200, 83, 0.2)',
                borderColor: 'rgba(0, 200, 83, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 200, 83, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(0, 200, 83, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Sustainability Profile',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Initialize overview charts on page load
window.addEventListener('load', function() {
    initializeOverviewCharts();
});

function initializeOverviewCharts() {
    // Carbon Trend Chart
    const carbonCtx = document.getElementById('carbonChart');
    new Chart(carbonCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Carbon Footprint (kg CO₂)',
                data: [320, 285, 290, 265, 245, 220],
                borderColor: 'rgba(0, 200, 83, 1)',
                backgroundColor: 'rgba(0, 200, 83, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Water Usage Pie Chart
    const waterCtx = document.getElementById('waterChart');
    new Chart(waterCtx, {
        type: 'pie',
        data: {
            labels: ['Showers', 'Laundry', 'Dishes', 'Other'],
            datasets: [{
                data: [455, 150, 80, 350],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
