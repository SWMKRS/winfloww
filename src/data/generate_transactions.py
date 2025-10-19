#!/usr/bin/env python3
"""
OnlyFans transaction generator for Infloww platform.
Generates realistic transaction data based on specified constraints.
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

class TransactionGenerator:
    """Generates realistic OnlyFans transactions with proper distribution."""

    def __init__(self):
        self.creators = [
            {"id": "scarlettrose", "name": "Scarlett Rose", "alias": "@scarlett_rose"},
            {"id": "diamondray", "name": "Diamond Ray", "alias": "@diamond_ray"},
            {"id": "ivynight", "name": "Ivy Night", "alias": "@ivy_night"},
            {"id": "rubyblaze", "name": "Ruby Blaze", "alias": "@ruby_blaze"},
            {"id": "crystalstar", "name": "Crystal Star", "alias": "@crystal_star"},
            {"id": "ambermoon", "name": "Amber Moon", "alias": "@amber_moon"},
            {"id": "sapphirefox", "name": "Sapphire Fox", "alias": "@sapphire_fox"},
            {"id": "emeraldwave", "name": "Emerald Wave", "alias": "@emerald_wave"}
        ]

        # transaction type distribution
        self.channel_distribution = {
            "messages": 0.60,    # 60%
            "tips": 0.22,        # 22%
            "subscriptions": 0.17, # 17%
            "posts": 0.01        # 1% (negligible)
        }

        # amount ranges by channel - higher for 6.8-7k daily targets
        self.amount_ranges = {
            "messages": (80.0, 300.0),
            "tips": (150.0, 1500.0),
            "subscriptions": (150.0, 750.0),
            "posts": (80.0, 300.0)
        }

        self.fan_counter = 1
        self.tx_counter = 1

    def generate_timestamp(self, start_date: datetime, end_date: datetime) -> str:
        """Generate random timestamp within date range."""
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        random_date = start_date + timedelta(days=random_days)

        # add random time
        random_hour = random.randint(0, 23)
        random_minute = random.randint(0, 59)
        random_second = random.randint(0, 59)

        random_date = random_date.replace(hour=random_hour, minute=random_minute, second=random_second)
        return random_date.isoformat() + 'Z'

    def select_channel(self) -> str:
        """Select transaction channel based on distribution."""
        rand = random.random()
        cumulative = 0
        for channel, prob in self.channel_distribution.items():
            cumulative += prob
            if rand <= cumulative:
                return channel
        return "messages"  # fallback

    def generate_amount(self, channel: str) -> float:
        """Generate realistic amount for given channel."""
        min_amt, max_amt = self.amount_ranges[channel]

        if channel == "tips":
            # tips tend to be round numbers or common amounts
            common_tips = [150, 200, 300, 400, 500, 750, 1000, 1200, 1500]
            if random.random() < 0.7:  # 70% chance for common tip
                return float(random.choice(common_tips))

        # generate random amount with some realistic patterns
        amount = random.uniform(min_amt, max_amt)

        # round to realistic decimal places
        if channel in ["subscriptions", "posts"]:
            amount = round(amount, 2)
        else:
            amount = round(amount, 2)

        return amount

    def generate_fan_id(self) -> str:
        """Generate unique fan ID."""
        fan_id = f"fan_{self.fan_counter:06d}"
        self.fan_counter += 1
        return fan_id

    def generate_transaction_id(self) -> str:
        """Generate unique transaction ID."""
        tx_id = f"tx_{self.tx_counter:06d}"
        self.tx_counter += 1
        return tx_id

    def generate_transaction(self, timestamp: str) -> Dict[str, Any]:
        """Generate single transaction."""
        channel = self.select_channel()
        creator = random.choice(self.creators)
        amount = self.generate_amount(channel)

        return {
            "id": self.generate_transaction_id(),
            "timestamp": timestamp,
            "channel": channel,
            "creatorAlias": creator["alias"],
            "fanId": self.generate_fan_id(),
            "amount": amount,
            "isRefunded": False,
            "refundTimestamp": None,
            "refundAmount": 0
        }

    def generate_daily_transactions(self, date: datetime, target_revenue: float) -> List[Dict[str, Any]]:
        """Generate 30 transactions for a day targeting specific revenue."""
        transactions = []
        current_revenue = 0.0

        # generate transactions with better targeting
        for i in range(30):
            timestamp = self.generate_timestamp(date, date + timedelta(days=1))
            tx = self.generate_transaction(timestamp)

            # calculate remaining slots and target
            remaining_slots = 30 - i - 1
            remaining_target = target_revenue - current_revenue

            if remaining_slots > 0:
                # calculate ideal amount for this transaction
                ideal_amount = remaining_target / remaining_slots

                # if our generated amount is too high, scale it down
                if tx["amount"] > ideal_amount * 1.5:
                    tx["amount"] = ideal_amount * random.uniform(0.8, 1.2)

                # ensure minimum amount
                tx["amount"] = max(tx["amount"], 50.0)

            transactions.append(tx)
            current_revenue += tx["amount"]

        return transactions

    def generate_30_days(self) -> Dict[str, Any]:
        """Generate 30 days of transaction data."""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        all_transactions = []
        daily_revenues = []

        for day_offset in range(30):
            current_date = start_date + timedelta(days=day_offset)
            # daily revenue target between $6.8k-$7k (tighter range, higher average)
            target_revenue = random.uniform(6800, 7000)

            daily_txs = self.generate_daily_transactions(current_date, target_revenue)
            all_transactions.extend(daily_txs)

            daily_total = sum(tx["amount"] for tx in daily_txs)
            daily_revenues.append(daily_total)

        # generate metadata
        metadata = {
            "userName": "Generated User",
            "utcOffset": "-08:00",
            "operationalStatus": True,
            "totalMessages": len([tx for tx in all_transactions if tx["channel"] == "messages"]),
            "platformFee": 0.5,
            "version": "5.6.1",
            "totalNotifications": len(all_transactions)
        }

        # generate fan data
        fans = []
        fan_data = {}

        for tx in all_transactions:
            fan_id = tx["fanId"]
            if fan_id not in fan_data:
                fan_data[fan_id] = {
                    "fanId": fan_id,
                    "creatorAlias": tx["creatorAlias"],
                    "subscriptionStatus": "active",
                    "subscriptionType": "recurring",
                    "renewOn": True,
                    "subscriptionStartDate": "2024-01-01T00:00:00.000Z",
                    "lastTransactionDate": tx["timestamp"],
                    "totalSpent": 0,
                    "transactionCount": 0
                }

            fan_data[fan_id]["totalSpent"] += tx["amount"]
            fan_data[fan_id]["transactionCount"] += 1
            fan_data[fan_id]["lastTransactionDate"] = tx["timestamp"]

        fans = list(fan_data.values())

        return {
            "metadata": metadata,
            "transactions": all_transactions,
            "creators": self.creators,
            "fans": fans
        }

def main():
    """Main function to generate and save transaction data."""
    generator = TransactionGenerator()

    print("Generating 30 days of OnlyFans transactions...")
    data = generator.generate_30_days()

    # calculate statistics
    total_revenue = sum(tx["amount"] for tx in data["transactions"])
    channel_counts = {}
    channel_revenue = {}

    for tx in data["transactions"]:
        channel = tx["channel"]
        channel_counts[channel] = channel_counts.get(channel, 0) + 1
        channel_revenue[channel] = channel_revenue.get(channel, 0) + tx["amount"]

    print(f"\nGenerated {len(data['transactions'])} transactions")
    print(f"Total revenue: ${total_revenue:,.2f}")
    print(f"Average daily revenue: ${total_revenue/30:,.2f}")

    print("\nChannel distribution:")
    for channel, count in channel_counts.items():
        percentage = (count / len(data["transactions"])) * 100
        revenue = channel_revenue[channel]
        print(f"  {channel}: {count} ({percentage:.1f}%) - ${revenue:,.2f}")

    # save to file
    output_file = "generated_transactions_30days.json"
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\nData saved to {output_file}")

if __name__ == "__main__":
    main()
