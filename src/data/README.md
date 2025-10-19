# OnlyFans Transaction Generator

A Python script that generates realistic OnlyFans transaction data for the Infloww platform.

## Features

- Generates 30 days of transaction data
- Targets daily revenue between $6.5k-$7k
- Creates exactly 30 transactions per day
- Realistic transaction type distribution:
  - Messages: ~60%
  - Tips: ~22%
  - Subscriptions: ~17%
  - Posts: ~1%
- Generates realistic fan and creator data
- Proper JSON structure matching Infloww format

## Usage

### Basic Usage

```bash
python generate_transactions.py
```

This will generate a file called `generated_transactions_30days.json` with 30 days of transaction data.

### Custom Usage

```python
from generate_transactions import TransactionGenerator

generator = TransactionGenerator()

# modify settings if needed
generator.channel_distribution = {
    "messages": 0.65,
    "tips": 0.20,
    "subscriptions": 0.14,
    "posts": 0.01
}

# generate data
data = generator.generate_30_days()

# save to file
import json
with open('my_transactions.json', 'w') as f:
    json.dump(data, f, indent=2)
```

## Output Format

The generated JSON follows the Infloww data structure:

```json
{
  "metadata": {
    "userName": "Generated User",
    "utcOffset": "-08:00",
    "operationalStatus": true,
    "totalMessages": 538,
    "platformFee": 0.5,
    "version": "5.6.1",
    "totalNotifications": 900
  },
  "transactions": [
    {
      "id": "tx_000001",
      "timestamp": "2025-09-19T05:24:19Z",
      "channel": "tips",
      "creatorAlias": "@crystal_star",
      "fanId": "fan_000001",
      "amount": 25.0,
      "isRefunded": false,
      "refundTimestamp": null,
      "refundAmount": 0
    }
  ],
  "creators": [...],
  "fans": [...]
}
```

## Customization

You can customize various aspects of the generator:

- **Channel Distribution**: Modify `channel_distribution` to change transaction type percentages
- **Amount Ranges**: Adjust `amount_ranges` to change price ranges for each transaction type
- **Creators**: Add/modify creator profiles in the `creators` list
- **Daily Revenue**: Modify the target revenue range in `generate_30_days()`

## Requirements

- Python 3.6+
- No external dependencies (uses only standard library)

## Example Output Statistics

```
Generated 900 transactions
Total revenue: $20,686.07
Average daily revenue: $689.54

Channel distribution:
  tips: 199 (22.1%) - $9,162.24
  messages: 538 (59.8%) - $6,921.74
  subscriptions: 155 (17.2%) - $4,436.81
  posts: 8 (0.9%) - $165.28
```
