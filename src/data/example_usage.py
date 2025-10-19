#!/usr/bin/env python3
"""
Example usage of the OnlyFans transaction generator.
"""

from generate_transactions import TransactionGenerator
import json

def generate_custom_dataset():
    """Generate a custom dataset with specific parameters."""
    generator = TransactionGenerator()

    # you can modify the generator settings before generating
    generator.channel_distribution = {
        "messages": 0.65,      # 65% messages
        "tips": 0.20,          # 20% tips
        "subscriptions": 0.14, # 14% subscriptions
        "posts": 0.01          # 1% posts
    }

    # generate the data
    data = generator.generate_30_days()

    # save with custom filename
    with open('custom_transactions.json', 'w') as f:
        json.dump(data, f, indent=2)

    print("Custom dataset generated and saved to custom_transactions.json")

if __name__ == "__main__":
    generate_custom_dataset()
