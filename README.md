# ChargeRunner for Manheim

> **"ChargeRunner turns EV charging downtime into auction intelligence."**

ChargeRunner is a control-tower software layer for mobile EV charging dispatch on Manheim auction lots. It connects vehicle location, battery state of charge, auction timing, battery-health workflow, transport readiness, and sustainability metrics into one priority-dispatch workflow.

---

## 🚗 What Is ChargeRunner?

As EV inventory grows at Manheim auction lots, vehicles arrive with unknown charge levels, missing battery-health certificates, and tight auction and transport windows. Managing this manually creates bottlenecks, delays, and missed opportunities.

**Cox/Manheim already has strong pieces:**
- LotVision for vehicle-location tracking
- EV battery-health capability
- Cox Fleet mobile service capability
- Auction process data and vehicle listing workflows

**ChargeRunner is not replacing those tools.** It is the software layer that connects them into one coordinated priority-dispatch workflow — so the right vehicle gets serviced at the right time, in the right order, with the right data flowing through automatically.

---

## 🎯 Core Demo Workflow

```
Which EV needs service first?
        ↓
Why? (priority score + reason tags)
        ↓
Dispatch a mobile unit
        ↓
Charge + certify + prep the vehicle
        ↓
Update readiness + log metrics
        ↓
Dispatch to the next priority EV
```

---

## ✨ Features

### Dashboard
- Lot-wide EV status at a glance
- Metric cards: vehicles serviced, kWh delivered, units available, readiness %

### Vehicle Priority Queue
- Ranks all EVs on the lot by priority score
- Color-coded urgency indicators
- Reason tags explain why each vehicle is ranked where it is

### Vehicle Detail Panel
- VIN, make, model, year
- Lot location (e.g. Grid G-4)
- Current and target state of charge
- Auction time and transport deadline
- Battery-health status
- Transport-ready status
- Days on lot and estimated vehicle value
- Recommended action

### Dispatch System
- System generates a specific dispatch command (e.g. "Mobile Unit 3: Grid G-4, charge to 40%, run battery-health workflow")
- One-click "Dispatch Mobile Unit" button
- One-click "Complete Service" button
- Vehicle status updates automatically after service

### "While It Plugs In" Timeline
| Time | Action | Value |
|------|--------|-------|
| Minute 0 | Mobile unit arrives at EV | No staff time wasted moving vehicles to fixed chargers |
| Minute 1–5 | Battery-health workflow runs | Battery data improves vehicle record and auction listing |
| Minute 5–25 | Vehicle charges to target SoC | Vehicle becomes sale-ready, test-drive-ready, transport-ready |
| Minute 26 | ESG and operational metrics log | Cox gets emissions, cost, utilization, and readiness data |
| Next | System dispatches to next priority EV | Continuous lot optimization |

### ESG / Operations Metrics
- kWh delivered per session
- CO₂ offset estimates
- Mobile unit utilization rate
- Lot-wide readiness percentage

---

## 🧮 Priority Scoring Logic

ChargeRunner ranks every EV on the lot using a simple, transparent scoring model:

| Condition | Points |
|-----------|--------|
| State of charge below 20% | +35 |
| State of charge between 20–35% | +20 |
| Auction within 2 hours | +30 |
| Auction within 4 hours | +15 |
| Transport deadline within 4 hours | +25 |
| Battery-health report missing | +20 |
| Days on lot greater than 10 | +10 |
| Estimated value greater than $45,000 | +10 |

> In a real deployment, Cox/Manheim would tune this model using real operational data. These weights are a defensible starting point for prototype demonstration.

---

## 🗂️ Mock Data

This prototype uses 10 simulated EV records. Each vehicle includes:

- `id` — unique identifier
- `VIN` — vehicle identification number
- `make`, `model`, `year`
- `lotLocation` — e.g. Grid G-4
- `currentSoC` — current state of charge (%)
- `targetSoC` — target state of charge (%)
- `auctionTime` — scheduled auction datetime
- `transportDeadline` — transport pickup datetime
- `batteryHealthStatus` — `complete` or `missing`
- `daysOnLot` — number of days on the lot
- `estimatedValue` — vehicle value in USD
- `transportReady` — `true` or `false`
- `serviceStatus` — `waiting`, `dispatched`, `in service`, or `completed`
- `recommendedAction` — plain-language dispatch instruction
- `priorityScore` — calculated score
- `reasonTags` — e.g. `["Low SoC", "Auction soon", "Battery report missing"]`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React + TanStack Start |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Data | Mock data (no real APIs) |
| Hosting | Lovable / Netlify / Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### Install and Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/ChargeRunner.git

# Navigate into the project
cd ChargeRunner

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open your browser at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 🌐 Deployment

### Option 1 — Lovable (Recommended)
Open the project at [lovable.dev](https://lovable.dev) and click the **Publish** button. Lovable hosts it instantly.

### Option 2 — Netlify
1. Connect your GitHub repo at [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist/client`
4. Click Deploy

### Option 3 — Vercel
1. Import your GitHub repo at [vercel.com](https://vercel.com)
2. Vercel auto-detects the settings
3. Click Deploy

---

## 📋 Prototype Scope

This is a **hackathon prototype**, not a production system.

**This prototype uses mock data and simulated functionality. It does not connect to:**
- Cox or Manheim production APIs
- LotVision vehicle-location system
- Real EV charger hardware
- Real OBD or battery-diagnostic systems
- Real route optimization or map APIs
- Any authentication or user-role system
- Any production database

**Future integrations (real deployment roadmap):**
- LotVision API for real-time vehicle location
- Cox battery-health records and workflow triggers
- Cox Fleet dispatch data and mobile unit GPS
- Manheim auction schedule and listing system
- Transport management system for pickup deadlines
- Sustainability reporting pipeline for ESG metrics

---

## 🏁 3-Minute Demo Path

1. **Open the dashboard** → show lot-wide EV status and metric cards
2. **Show the priority queue** → vehicles ranked by urgency score and reason tags
3. **Select the top vehicle** → detail panel shows charge level, auction time, battery status, recommended action
4. **Show the dispatch recommendation** → "Mobile Unit 3: Grid G-4, charge to 40%, run battery-health workflow"
5. **Click Dispatch Mobile Unit** → vehicle status updates to In Service
6. **Click Complete Service** → SoC updates, battery-health completes, transport-ready flips to true
7. **Dashboard metrics update** → vehicles serviced, kWh delivered, readiness percentage
8. **Show the "While It Plugs In" timeline** → explain the value at each step
9. **Close with the pitch line** → *"ChargeRunner turns EV charging downtime into auction intelligence."*

---

## 💡 Business Value

- **Auction readiness** — vehicles arrive at auction charged, certified, and test-drive ready
- **Buyer confidence** — battery-health certificates improve sale outcomes for EVs
- **Transport efficiency** — vehicles are flagged and prepped before transport deadlines
- **Staff efficiency** — mobile units go to vehicles; staff don't move vehicles to fixed chargers
- **Sustainability reporting** — every charging session logs kWh, CO₂ offset, and utilization automatically
- **Lot intelligence** — priority scoring surfaces hidden risk (parasitic drain, aging inventory, high-value vehicles)

---

## 👥 Built For

**Manheim / Cox Automotive Innovation Challenge**

ChargeRunner was designed as a student innovation prototype exploring how Cox/Manheim's existing capabilities — vehicle tracking, battery-health workflow, mobile fleet service, and auction data — could be connected into a unified EV charging dispatch platform.

---

## 📄 License

This project was built as a prototype for educational and competition purposes. All vehicle data is simulated. No proprietary Cox or Manheim data, APIs, or systems were used.
