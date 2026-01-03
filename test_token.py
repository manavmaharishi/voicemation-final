#!/usr/bin/env python3

from dotenv import load_dotenv
import os

load_dotenv()

token = os.environ.get("GITHUB_TOKEN")
print(f"🔑 GITHUB_TOKEN loaded: {bool(token)}")
if token:
    print(f"🔑 Token length: {len(token)}")
    print(f"🔑 Token prefix: {token[:20]}...")
else:
    print("❌ GITHUB_TOKEN not found!")