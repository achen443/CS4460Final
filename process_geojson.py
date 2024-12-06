import json
import topojson

# Load the TopoJSON file
with open('states.json', 'r') as file:
    topo_data = json.load(file)

# Convert TopoJSON to GeoJSON
geojson_data = topojson.feature(topo_data, topo_data["objects"]["states"])

# Define the acquisition years for each group of states
territorial_acquisitions = {
    1783: ["CT", "DE", "GA", "MA", "MD", "NH", "NJ", "NY", "NC", "PA", "RI", "SC", "VA"],
    1803: ["AR", "IA", "KS", "LA", "MN", "MO", "MT", "ND", "NE", "OK", "SD", "WY"],
    1845: ["TX"],
    1848: ["AZ", "CA", "CO", "NV", "NM", "UT"],
    1853: ["AZ", "NM"],  # Overlaps for Gadsden Purchase (adjust if partial geometries exist)
    1867: ["AK"],
    1959: ["HI"]
}

# Add 'year' property to GeoJSON features
for feature in geojson_data["features"]:
    state_abbr = feature["properties"].get("abbr", "")
    year = None
    for acquisition_year, states in territorial_acquisitions.items():
        if state_abbr in states:
            year = acquisition_year
            break
    feature["properties"]["year"] = year

# Save the updated GeoJSON
with open('us_territorial_expansion.geojson', 'w') as output_file:
    json.dump(geojson_data, output_file)

# Optionally: Convert back to TopoJSON
# You can use a CLI tool like 'topojson-cli' or a library to convert this back if needed
