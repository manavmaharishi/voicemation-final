#!/usr/bin/env python3

import os
import sys
from voicemation import process_speech

def main():
    print("🔍 Debug Test - Testing the voicemation pipeline")
    
    # Test with a simple animation request
    test_text = "Create a simple pendulum animation"
    print(f"📝 Testing with: '{test_text}'")
    
    try:
        result = process_speech(test_text)
        if result:
            print(f"✅ Success! Generated video at: {result}")
        else:
            print("❌ Failed to generate video")
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
