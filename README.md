# Winfloww

OnlyFans Creator Management Dashboard

## Project Approach

This project was built under a tight time crunch by first installing the real Winfloww app and analyzing its source code, frameworks, and assets. We inspected the Electron app bundle to understand the tech stack (React, Ant Design, Recharts) and extracted all UI assets.

Given the time constraints, we took a conservative approach: building a near-replica by hand rather than attempting to reverse engineer the packaged Electron code. Reverse engineering would be the more elegant solution for future iterations, where time permits.

## Update Mock Data

Edit `src/data/mockData.js` - it's just plain objects:

- **earningsData**: gross/net earnings for subscriptions, posts, messages, tips
- **employeesData**: employee hours and sales
- **shiftsData**: shift schedules and totals
- **salesChartData**: chart values (currently zeroed out)
- **notificationData**: message counts

Each export has keys for time periods: `Yesterday`, `Today`, `This week`, `This month`.

## Build

Requires [Task](https://taskfile.dev) - install with `brew install go-task/tap/go-task`

```bash
# mac (arm64)
task build:mac

# mac (intel)
task build:mac:x64

# windows
task build:windows

# all platforms
task build:all
```

Output goes to `dist-electron/`