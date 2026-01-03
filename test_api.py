#!/usr/bin/env python3

import requests
from dotenv import load_dotenv
import os

load_dotenv()

# Test if GitHub Models API is reachable
try:
    print("🔗 Testing GitHub Models API connectivity...")
    response = requests.get("https://models.github.ai/inference", timeout=10)
    print(f"✅ API endpoint reachable. Status: {response.status_code}")
except requests.exceptions.Timeout:
    print("❌ API endpoint timed out")
except requests.exceptions.ConnectionError:
    print("❌ API endpoint connection error")
except Exception as e:
    print(f"❌ API endpoint error: {e}")

# Test basic Azure AI client
try:
    print("\n🤖 Testing Azure AI Client creation...")
    from azure.ai.inference import ChatCompletionsClient
    from azure.core.credentials import AzureKeyCredential
    
    endpoint = "https://models.github.ai/inference"
    token = os.environ["GITHUB_TOKEN"]
    
    client = ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token),
    )
    print("✅ Client created successfully")
    
except Exception as e:
    print(f"❌ Client creation failed: {e}")