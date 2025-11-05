import json
import os

import pandas as pd
import requests

# ✅ API Keys & Setup
REALTOR_API_KEY = "879275a2b6mshf4b3de1300b03aep10b3edjsn456c19e64bda"  # Replace with your actual key
REALTOR_HOST = "realty-in-us.p.rapidapi.com"
DATA_FOLDER = "data/realty_us"
os.makedirs(DATA_FOLDER, exist_ok=True)

HEADERS = {
    "X-RapidAPI-Key": REALTOR_API_KEY,
    "X-RapidAPI-Host": REALTOR_HOST,
    "Content-Type": "application/json"
}

# ✅ Fetch Property Listings
def fetch_property_listings(zip_code, category="for_sale"):
    print(f"📊 Fetching {category.upper()} properties for ZIP Code {zip_code}...")

    url = "https://realty-in-us.p.rapidapi.com/properties/v3/list"
    payload = {
        "limit": 200,
        "offset": 0,
        "postal_code": zip_code,
        "status": [category],  # for_sale, for_rent, sold
        "sort": {"direction": "desc", "field": "list_date"}
    }

    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code == 200:
        properties = response.json().get("data", {}).get("home_search", {}).get("results", [])
        return [p["property_id"] for p in properties if "property_id" in p]  
    else:
        print(f"❌ API Error ({category}): {response.status_code} - {response.text}")
        return []

# ✅ Fetch Property Details
def fetch_property_details(property_id):
    url = "https://realty-in-us.p.rapidapi.com/properties/v3/detail"
    params = {"property_id": property_id}
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code == 200:
        return response.json().get("data", {})
    else:
        print(f"❌ API Error (Property Details): {response.status_code} - {response.text}")
        return None

# ✅ Fetch Schools in the Area
def fetch_schools(zip_code):
    url = "https://realty-in-us.p.rapidapi.com/schools/list"
    params = {"limit": 20, "offset": 0, "postal_code": zip_code}
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code == 200:
        return response.json().get("data", {}).get("schools", [])
    else:
        print(f"❌ API Error (Schools): {response.status_code} - {response.text}")
        return []

# ✅ Fetch Real Estate Agents
def fetch_agents(zip_code):
    url = "https://realty-in-us.p.rapidapi.com/agents/list"
    params = {"postal_code": zip_code, "offset": 0, "limit": 10, "sort": "recent_activity_high"}
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code == 200:
        return response.json().get("data", {}).get("agents", [])
    else:
        print(f"❌ API Error (Agents): {response.status_code} - {response.text}")
        return []

# ✅ Fetch Mortgage Rates
def fetch_mortgage_rates(zip_code):
    url = "https://realty-in-us.p.rapidapi.com/mortgage/v2/check-rates"
    params = {"postal_code": zip_code}
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code == 200:
        return response.json().get("data", {})
    else:
        print(f"❌ API Error (Mortgage Rates): {response.status_code} - {response.text}")
        return {}

# ✅ Fetch Commute Time
def fetch_commute_time(property_id):
    url = "https://realty-in-us.p.rapidapi.com/properties/v3/get-commute-time"
    params = {"property_id": property_id, "transportation_type": "driving", "with_traffic": "false"}
    
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code == 200:
        return response.json().get("data", {})
    elif response.status_code == 500:
        print(f"⚠️ Server Error: Commute time unavailable for Property ID {property_id}. Skipping...")
        return {}  # Return empty response
    else:
        print(f"❌ API Error (Commute Time): {response.status_code} - {response.text}")
        return {}

# ✅ Fetch Surrounding Area Insights
def fetch_surroundings(property_id):
    url = "https://realty-in-us.p.rapidapi.com/properties/v3/get-surroundings"
    params = {"property_id": property_id}
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code == 200:
        return response.json().get("data", {})
    else:
        print(f"❌ API Error (Surroundings): {response.status_code} - {response.text}")
        return {}

# ✅ Main Function to Fetch & Store Data
def fetch_and_store_realty_data(zip_code):
    categories = ["for_sale", "for_rent", "sold"]
    all_properties = []

    for category in categories:
        property_ids = fetch_property_listings(zip_code, category)
        print(f"✅ Found {len(property_ids)} properties for {category.upper()}.")

        for property_id in property_ids:
            details = fetch_property_details(property_id)
            if details:
                details["category"] = category
                details["commute_time"] = fetch_commute_time(property_id)
                details["surroundings"] = fetch_surroundings(property_id)
                all_properties.append(details)

    # ✅ Fetch Extra Data
    schools = fetch_schools(zip_code)
    agents = fetch_agents(zip_code)
    mortgage_rates = fetch_mortgage_rates(zip_code)

    # ✅ Save Data to JSON
    with open(f"{DATA_FOLDER}/realty_us_properties_{zip_code}.json", "w") as f:
        json.dump(all_properties, f, indent=4)

    with open(f"{DATA_FOLDER}/schools_{zip_code}.json", "w") as f:
        json.dump(schools, f, indent=4)

    with open(f"{DATA_FOLDER}/agents_{zip_code}.json", "w") as f:
        json.dump(agents, f, indent=4)

    with open(f"{DATA_FOLDER}/mortgage_rates_{zip_code}.json", "w") as f:
        json.dump(mortgage_rates, f, indent=4)

    # ✅ Convert to DataFrame & Save as CSV
    df = pd.DataFrame(all_properties)
    df.to_csv(f"{DATA_FOLDER}/realty_us_properties_{zip_code}.csv", index=False)

    print(f"✅ Data saved successfully in {DATA_FOLDER}/")

# ✅ Run Script for Example ZIP Code
fetch_and_store_realty_data("02122")
