<div align="center">

# 🚗 AI Car Damage Estimator

**AI-powered vehicle damage assessment & instant repair cost estimation, built for the Indian automotive market.**

</div>

---

## 📖 Project Overview

**AI Car Damage Estimator** is a full-stack web application that uses **Google's Gemini AI vision models** to analyze photos of damaged vehicles and instantly generate a detailed, itemized repair report — complete with damaged parts, severity, recommended action (repair or replace), and estimated costs in **Indian Rupees (₹)**.

The platform is designed for **two types of users**:
- 👤 **Customers** — upload a photo of their damaged car and receive an instant, transparent damage & cost estimate.
- 🏢 **Shop Owners / Admins** — manage a custom pricing inventory, review submitted appraisals, and generate professional, shareable reports for their customers.

---

## ✨ Key Features

- 📸 **AI-Powered Damage Detection** — Upload a car image and let Gemini AI identify the vehicle model, damaged parts, and severity level (Minor / Moderate / Severe).
- 🧩 **Visual Damage Overlay** — Damaged areas are highlighted directly on the vehicle image using bounding boxes and polygon overlays for clear visual context.
- 💰 **Smart Pricing Engine** — Automatically matches detected parts to a configurable pricing matrix using multi-tier keyword and synonym matching.
- 🛠️ **Repair vs. Replace Recommendations** — Each damaged component comes with a clear action recommendation and cost breakdown.
- 🧾 **Downloadable PDF Reports** — Generate polished, print-ready invoice-style reports using `html2canvas` and `jsPDF`.
- 🔗 **Shareable Appraisal Links** — Share a damage report via a unique link, with support for customer review/feedback.
- 🔐 **Secure Authentication** — Separate, protected login flows for customers and shop owner/admins, with hashed credentials (`bcryptjs`) and JWT-based sessions.
- 🗂️ **Inventory & Pricing Editor** — Admins can customize repair/replacement pricing per vehicle segment (Hatchback, Sedan, SUV, etc.) and component.
- 🕓 **Appraisal History** — Past assessments are stored and retrievable for future reference.
- ⚡ **Resilient AI Pipeline** — Automatic model fallback chain (multiple Gemini model tiers) and response caching to ensure consistent, quota-friendly performance.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TSX |
| **AI Engine** | Google Gemini API (`@google/genai`) with multi-model fallback |
| **Database** | MongoDB (Mongoose) |
| **Auth & Security** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Reporting** | `jsPDF`, `html2canvas` |
| **Data Viz** | Recharts, Framer Motion (`motion`) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A **Gemini API key**

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
#    Set GEMINI_API_KEY (and other required values) in your .env file

# 3. Run the app in development mode
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🔄 How It Works

1. 📤 **Upload** — The user uploads a photo of the damaged vehicle.
2. 🤖 **Analyze** — The image is sent to the backend, which queries the Gemini vision model to identify the car, damaged parts, and severity.
3. 🎯 **Localize** — Damage regions are mapped onto the image using bounding boxes/polygons for visual clarity.
4. 💵 **Price** — The pricing engine matches each damaged part against the relevant pricing matrix (default or shop-owner customized) to compute costs.
5. 📄 **Report** — A complete, shareable, and downloadable damage summary report is generated for the customer.

---

## 🎯 Use Cases

- Insurance pre-assessment and claim documentation
- Body shop / garage customer quotations
- Used-car resale damage disclosure
- Rental/fleet vehicle return inspections

---

## 🏁 Conclusion

The **AI Car Damage Estimator** brings speed, transparency, and consistency to vehicle damage assessment by combining computer vision AI with a configurable, business-ready pricing engine. It bridges the gap between customers and repair shops with instant, data-driven, and shareable cost estimates — reducing manual inspection time and building trust through transparent pricing. 🚀🔧

## Author

**Sathiesh Kumar M**

View my website in : https://ai-car-damage-detection-estimator.onrender.com 
