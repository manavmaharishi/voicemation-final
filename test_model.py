#!/usr/bin/env python3

from dotenv import load_dotenv
import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

load_dotenv()

def test_simple_api_call():
    endpoint = "https://models.github.ai/inference"
    token = os.environ["GITHUB_TOKEN"]
    
    client = ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token),
    )
    
    print("🚀 Testing simple API call...")
    
    try:
        # Try different model names
        for model in ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-4.1"]:
            print(f"🧪 Testing model: {model}")
            try:
                response = client.complete(
                    messages=[
                        SystemMessage("You are a helpful assistant."),
                        UserMessage("Say hello in one word."),
                    ],
                    temperature=0.7,
                    max_tokens=10,
                    model=model
                )
                print(f"✅ Success with model {model}!")
                print(f"📩 Response: {response.choices[0].message.content}")
                break
            except Exception as e:
                print(f"❌ Failed with model {model}: {e}")
                continue
    except Exception as e:
        print(f"❌ API call failed: {e}")

if __name__ == "__main__":
    test_simple_api_call()