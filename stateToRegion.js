export const stateToRegion = {
    "Alabama": "Southeast",
    "Alaska": "Far West",
    "Arizona": "Rocky Mountains",
    "Arkansas": "Southeast",
    "California": "Far West",
    "Colorado": "Rocky Mountains",
    "Connecticut": "New England",
    "Delaware": "Mid-Atlantic",
    "Florida": "Southeast",
    "Georgia": "Southeast",
    "Hawaii": "Far West",
    "Idaho": "Rocky Mountains",
    "Illinois": "Great Lakes",
    "Indiana": "Great Lakes",
    "Iowa": "Great Plains",
    "Kansas": "Great Plains",
    "Kentucky": "Southeast",
    "Louisiana": "Southeast",
    "Maine": "New England",
    "Maryland": "Mid-Atlantic",
    "Massachusetts": "New England",
    "Michigan": "Great Lakes",
    "Minnesota": "Great Lakes",
    "Mississippi": "Southeast",
    "Missouri": "Great Plains",
    "Montana": "Rocky Mountains",
    "Nebraska": "Great Plains",
    "Nevada": "Rocky Mountains",
    "New Hampshire": "New England",
    "New Jersey": "Mid-Atlantic",
    "New Mexico": "Rocky Mountains",
    "New York": "Mid-Atlantic",
    "North Carolina": "Southeast",
    "North Dakota": "Great Plains",
    "Ohio": "Great Lakes",
    "Oklahoma": "Great Plains",
    "Oregon": "Far West",
    "Pennsylvania": "Mid-Atlantic",
    "Rhode Island": "New England",
    "South Carolina": "Southeast",
    "South Dakota": "Great Plains",
    "Tennessee": "Southeast",
    "Texas": "Great Plains",
    "Utah": "Rocky Mountains",
    "Vermont": "New England",
    "Virginia": "Southeast",
    "Washington": "Far West",
    "West Virginia": "Southeast",
    "Wisconsin": "Great Lakes",
    "Wyoming": "Rocky Mountains"
};

export const regionColors = d3.scaleOrdinal()
    .domain([
        "Great Plains", 
        "Outlying Areas", 
        "Southeast", 
        "Mid-Atlantic", 
        "New England", 
        "Far West", 
        "Great Lakes", 
        "Rocky Mountains"
    ])
    .range([
        "#e41a1c", // Great Plains
        "#377eb8", // Outlying Areas
        "#4daf4a", // Southeast
        "#984ea3", // Mid-Atlantic
        "#ff7f00", // New England
        "#ffff33", // Far West
        "#a65628", // Great Lakes
        "#f781bf"  // Rocky Mountains
    ]);
