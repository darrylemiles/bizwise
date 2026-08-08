# Bizwise

> **Business Profit Management — Know your cash. Control your debt. Grow your business.**

Bizwise is a SaaS platform designed to help small businesses track their **revenue, expenses, cash flow, debts, and profitability** in one place.

Instead of relying on spreadsheets or manually calculating whether the business is actually making money, Bizwise gives business owners a simple overview of their financial position and helps them make better decisions.

---

## 🎯 Problem

Small businesses often track their finances using spreadsheets, notebooks, or separate applications.

This makes it difficult to answer simple but important questions:

* How much money does the business actually have?
* How much profit did we make this month?
* Where is our money going?
* How much do we owe?
* How much money should we reserve for debt payments?
* Are we actually profitable?
* Can we afford to spend this money?

Bizwise solves this by bringing these financial activities into one centralized system.

---

## 💡 Solution

Bizwise provides a centralized financial workspace where business owners can:

* Track income and expenses
* Monitor available cash
* Track business debts
* Create debt repayment goals
* Monitor profit and loss
* Analyze financial performance
* View financial dashboards and reports

The goal isn't to replace accounting software.

**Bizwise is a decision-making tool for business owners.**

---

# 🚀 MVP Features

## 1. Dashboard

The dashboard provides an overview of the current financial state of the business.

### Metrics

* Total Revenue
* Total Expenses
* Net Profit
* Available Cash
* Total Debt
* Debt Paid
* Remaining Debt
* Profit Margin

### Example

```text
-----------------------------------------------
                 BIZWISE
-----------------------------------------------

Revenue             ₱250,000
Expenses            ₱150,000
Net Profit          ₱100,000

Available Cash      ₱180,000

Debt
Total               ₱100,000
Paid                ₱40,000
Remaining           ₱60,000
-----------------------------------------------
```

---

# 💰 2. Revenue Management

Track money coming into the business.

### Revenue fields

* Amount
* Source
* Category
* Date
* Description

### Example

```text
Sales
₱25,000
August 8, 2026

Service
₱15,000
August 7, 2026
```

Revenue is included in the business's financial calculations.

---

# 💸 3. Expense Management

Track where business money is being spent.

### Expense fields

* Amount
* Category
* Date
* Description

### Example categories

* Inventory
* Rent
* Utilities
* Salaries
* Marketing
* Transportation
* Software
* Operations
* Other

This allows business owners to understand where their money is going.

---

# 🏦 4. Central Cash

Bizwise maintains a centralized view of the business's available cash.

The system calculates cash based on financial transactions.

```text
Opening Cash
     +
Revenue
     -
Expenses
     -
Debt Payments
     =
Available Cash
```

This gives the owner a clearer picture of how much money is actually available.

---

# 💳 5. Debt Management

Debt is treated as more than just a financial record.

Bizwise turns debt into something the business can actively work toward eliminating.

### Debt information

* Creditor
* Original Amount
* Remaining Amount
* Interest Rate
* Due Date
* Minimum Payment
* Status
* Notes

### Example

```text
Laptop Financing

Original Debt:      ₱60,000
Remaining:          ₱35,000

Progress
████████████░░░░░░ 42%

Target:
Pay off by December 2026
```

---

# 🎯 6. Debt as a Mission

One of Bizwise's core concepts is turning debt repayment into a **goal**.

Instead of simply showing:

> "You owe ₱60,000."

Bizwise shows:

> "Your goal is to eliminate ₱60,000 of debt."

Users can track:

* Debt progress
* Amount paid
* Remaining balance
* Target payoff date
* Payment history
* Progress percentage

This creates a more actionable experience for business owners.

---

# 📊 7. Profit & Loss

Bizwise calculates the business's profitability.

```text
Revenue
   -
Expenses
   =
Net Profit
```

Users can view financial performance by:

* Day
* Week
* Month
* Year

### Example

```text
August 2026

Revenue       ₱250,000
Expenses      ₱150,000
----------------------
Net Profit    ₱100,000

Profit Margin: 40%
```

---

# 📈 8. Financial Analytics

The MVP includes basic financial analytics.

Examples:

* Revenue trends
* Expense trends
* Profit trends
* Expense breakdown
* Debt progress
* Monthly performance

Charts should help users quickly understand their business without reading raw transactions.

---

# 🔐 9. Authentication

Users can securely create and manage their accounts.

### MVP authentication

* Registration
* Login
* Logout
* Password hashing
* JWT authentication
* Protected routes

---

# 👤 10. Business Account

Each user can manage their business information.

Example:

```text
Business Name
Business Type
Currency
Owner
Created At
```

The architecture should allow Bizwise to evolve into a multi-tenant SaaS application.

---

# 🧮 Core Financial Model

Bizwise revolves around a simple financial model.

### Revenue

```text
Revenue = Money coming into the business
```

### Expenses

```text
Expenses = Money leaving the business for operations
```

### Profit

```text
Profit = Revenue - Expenses
```

### Cash

```text
Cash =
Opening Cash
+ Revenue
- Expenses
- Debt Payments
```

### Remaining Debt

```text
Remaining Debt =
Original Debt - Total Debt Payments
```

---

# 🏗️ Architecture

Bizwise will initially follow a modern MERN architecture.

```text
┌─────────────────────────┐
│       React Client      │
│                         │
│ Dashboard               │
│ Transactions            │
│ Debts                   │
│ Analytics               │
└────────────┬────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────┐
│     Node.js / Express   │
│                         │
│ Authentication          │
│ Business Logic          │
│ Financial Calculations  │
│ API                     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│        MongoDB          │
│                         │
│ Users                   │
│ Businesses              │
│ Transactions            │
│ Debts                   │
└─────────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* MUI / Tailwind CSS
* Recharts

## Backend

* Node.js
* Express.js
* TypeScript
* JWT
* REST API

## Database

* MongoDB
* Mongoose

## Development

* Git
* GitHub
* Docker
* Postman
* ESLint
* Prettier

---

# 📁 Project Structure

```text
bizwise/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   │
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 🗃️ Core Entities

The initial database will contain the following major entities:

```text
User
 │
 └── Business
      │
      ├── Transactions
      │    ├── Revenue
      │    └── Expense
      │
      └── Debts
           └── Debt Payments
```

---

# 🔄 Example Business Flow

A business owner receives ₱100,000 in sales.

```text
Revenue
₱100,000
      │
      ▼
Business Cash
₱100,000
      │
      ├── Expenses
      │     ₱40,000
      │
      └── Debt Payment
            ₱10,000
```

Result:

```text
Revenue:          ₱100,000
Expenses:         ₱40,000

Net Profit:       ₱60,000

Cash Remaining:   ₱50,000
Debt Paid:        ₱10,000
```

This distinction is important because **profit and cash are not always the same thing**.

---

# 🗺️ MVP Roadmap

### Phase 1 — Foundation

* [ ] Project setup
* [ ] MongoDB setup
* [ ] Authentication
* [ ] User management
* [ ] Business profile

### Phase 2 — Financial Tracking

* [ ] Revenue CRUD
* [ ] Expense CRUD
* [ ] Transaction categories
* [ ] Central cash calculation

### Phase 3 — Debt

* [ ] Debt CRUD
* [ ] Debt payments
* [ ] Debt progress
* [ ] Debt goals

### Phase 4 — Dashboard

* [ ] Revenue summary
* [ ] Expense summary
* [ ] Profit calculation
* [ ] Cash balance
* [ ] Debt summary
* [ ] Financial charts

### Phase 5 — SaaS Foundation

* [ ] Multi-tenant architecture
* [ ] Subscription-ready architecture
* [ ] Business isolation
* [ ] Role-based access
* [ ] Audit logging

---

# 🔮 Future Features

Bizwise can eventually evolve beyond the MVP.

Potential features include:

* Multiple businesses
* Team members
* Role-based permissions
* Recurring transactions
* Recurring expenses
* Budget management
* Financial forecasting
* Cash flow forecasting
* Invoice management
* Tax estimation
* Bank integrations
* Payment integrations
* Automated financial reports
* Export to CSV/PDF
* Notifications
* Email reports
* Subscription billing
* AI-powered financial insights

---

# 🎯 Product Vision

Bizwise aims to become a simple financial command center for small businesses.

The long-term goal is to answer one question:

> **"How healthy is my business financially?"**

Instead of forcing business owners to understand complicated accounting systems, Bizwise focuses on understandable metrics and actionable financial goals.

---

# 👨‍💻 Development

Clone the repository:

```bash
git clone https://github.com/yourusername/bizwise.git

cd bizwise
```

Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

Create your environment variables:

```env
# Server

PORT=5000
MONGODB_URI=mongodb://localhost:27017/bizwise
JWT_SECRET=your_secret
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

---

# 📄 License

This project is currently private and proprietary.

© 2026 Bizwise. All rights reserved.
