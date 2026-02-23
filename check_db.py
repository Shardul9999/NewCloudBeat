import requests
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

res = requests.get(f"{url}/rest/v1/songs?select=*", headers={"apikey": key, "Authorization": f"Bearer {key}"})
print(res.json()[:1])
