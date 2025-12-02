import requests

KEYS = [
    "AQ.Ab8RN6Lpc1b3GBQ8RRkYVzFef39kUTsp3HnTX0wvY7XUo5_fnw",
    "AQ.Ab8RN6K7ERjqomuoOJZhFoB7nC75Ng5oNvK4xbhxZzlahxTM1g"
]

MODEL = "gemini-2.0-flash-exp" # Trying a standard model first, or the one from curl if valid
# The user mentioned gemini-2.5-flash-lite, let's try that too if the first fails or as primary.
# Note: gemini-2.5 might not be public yet or requires specific endpoint. 
# The curl used: https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent

URL_TEMPLATE = "https://aiplatform.googleapis.com/v1/publishers/google/models/{model}:generateContent?key={key}"

def test_key(key, model_name="gemini-1.5-flash"):
    url = URL_TEMPLATE.format(model=model_name, key=key)
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "role": "user",
            "parts": [{"text": "Hello, are you working?"}]
        }]
    }
    
    print(f"Testing key {key[:10]}... with model {model_name}")
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success!")
            print(response.json())
            return True
        else:
            print("Failed.")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

print("--- Testing Keys ---")
for key in KEYS:
    # Try with the model from the user's curl (gemini-2.5-flash-lite)
    if test_key(key, "gemini-2.5-flash-lite"):
        pass
    # Fallback to gemini-1.5-flash
    if test_key(key, "gemini-1.5-flash"):
        pass
        
    # Test Veo (Video)
    print("\nTesting Veo (Video)...")
    if test_key(key, "veo-3.1-fast-generate-001"):
        print("Veo Access Confirmed!")
    else:
        print("Veo Access Failed (Expected if Veo doesn't support API Key auth directly via this endpoint or quota issue).")
