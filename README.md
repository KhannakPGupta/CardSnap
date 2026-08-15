# CardSnap — Business Card Scanner & Google Sheets Contact Storage

> **Turn business cards into organized contacts continuously stored in ONE central Google Sheet.**

CardSnap is a modern, full-stack web application that allows users to scan physical business cards (via image upload or live camera capture), automatically extract contact details using OCR and intelligent heuristics, verify/edit the extracted information, and append every contact as a **new row in ONE continuous Google Sheet**.

---

## 🌟 Key Features

* **Instant Card Scanning**: Upload business card images (JPG, JPEG, PNG, WEBP) or capture directly using your browser camera.
* **Computer Vision & OCR**: Image preprocessing (contrast enhancement, noise reduction, sharpening) and OCR text extraction.
* **Structured Information Extraction**: Automatically extracts Full Name, Job Title, Company, Phone Number, Email, Website, LinkedIn, Address, and Date Added.
* **Continuous One-Sheet Database**: Appends every scanned contact as a new row to your configured Google Sheet without overwriting previous contacts or creating multiple sheets.
* **Interactive Review Screen**: Edit any extracted field before saving, with low-confidence field indicators (`⚠ Verify`).
* **Live Contact Count**: Displays the total count of contacts stored in your connected Google Sheet.
* **Sequential Scanning**: Reset and scan another card immediately without page reloads.

---

## 🛠 Tech Stack

### Frontend
* **React 19**
* **Vite**
* **Tailwind CSS v4**
* **Lucide React** (Icons)

### Backend
* **Python 3.13 / FastAPI**
* **OpenCV** & **Pillow** (Image Preprocessing)
* **EasyOCR** (Text Detection & Recognition)
* **Google Sheets API** (`gspread` & `google-auth`)
* **Pydantic v2** (Data Validation)

---

## 🏗 Architecture

```text
 Physical Business Card
        │
        ▼ (Upload / Live Camera)
  React Frontend (Vite)
        │
        ▼ POST /api/scan (Multipart Form)
  FastAPI Backend
        │
   ┌────┴───────────────────────────┐
   │ 1. OpenCV Preprocessing       │
   │ 2. OCR Text Recognition        │
   │ 3. Heuristic Field Extraction │
   └────┬───────────────────────────┘
        │
        ▼ Return Structured Contact + Confidence
  React Review & Verification Screen
        │
        ▼ POST /api/save-contact (JSON)
  FastAPI Google Sheets Service
        │
        ▼ Append Row
  ONE Central Google Sheet
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18+ (Recommended v20+)
* **Python**: v3.10+

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Runs on http://localhost:8000)
uvicorn main:app --reload
```

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📊 Google Sheets Setup & Credentials

CardSnap uses a Google Cloud Service Account to append rows to your Google Sheet without requiring manual OAuth logins.

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Create Project** and enter a name (e.g., `CardSnap-App`).

### Step 2: Enable Google Sheets & Drive APIs
1. In Google Cloud Console, navigate to **APIs & Services > Library**.
2. Search for **Google Sheets API** and click **Enable**.
3. Search for **Google Drive API** and click **Enable**.

### Step 3: Create a Service Account
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > Service Account**.
3. Enter service account name (e.g., `cardsnap-bot`) and click **Create and Continue**.
4. Click **Done**.

### Step 4: Generate Service Account Key
1. Click on the newly created service account email.
2. Go to the **Keys** tab and click **Add Key > Create new key**.
3. Choose **JSON** format and click **Create**. The key file will download automatically.

### Step 5: Share Your Google Sheet
1. Open your target Google Sheet (or create a new blank one).
2. Click the **Share** button in Google Sheets.
3. Add your service account email (e.g., `cardsnap-bot@...iam.gserviceaccount.com`) as an **Editor**.
4. Uncheck "Notify people" and click **Share**.

### Step 6: Configure Environment Variables
Copy your Google Sheet ID from its URL:
`https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`

In `backend/.env`:
```env
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SERVICE_ACCOUNT_FILE=credentials.json
```
Place your downloaded JSON key as `backend/credentials.json` (or set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` directly in `.env`).

---

## 📝 Continuous Google Sheet Format

When the first contact is saved, CardSnap automatically creates the header row if missing:

| Name | Job Title | Company | Phone | Email | Website | LinkedIn | Address | Notes | Date Added |
| ---- | --------- | ------- | ----- | ----- | ------- | -------- | ------- | ----- | ---------- |
| Rahul Sharma | Founder & CEO | ABC Tech | +91 98765 43210 | rahul@abc.com | www.abctech.com | linkedin.com/in/rahul | Chennai, TN | Met at conference | 15/08/2026 |
| Priya Mehta | Product Manager | XYZ Ltd | +91 98765 12345 | priya@xyz.com | www.xyz.com | linkedin.com/in/priya | Bangalore, KA | | 15/08/2026 |

* **Every new scan adds Row 3, Row 4, Row 5, etc.**
* Previously stored contacts are **never deleted or overwritten**.

---

## 🔧 Environment Variables Reference

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `GOOGLE_SHEET_ID` | The ID of your target Google Sheet | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs...` |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Path to JSON service account credentials | `credentials.json` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email | `cardsnap@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Private key string | `"-----BEGIN PRIVATE KEY-----\n..."` |

---

## 🔍 Troubleshooting

* **Backend return "Google Sheet Not Configured"**: Verify that `GOOGLE_SHEET_ID` and `credentials.json` or private key env vars are set in `backend/.env`.
* **403 Forbidden / Permission Error**: Ensure the service account email is added as an **Editor** to the Google Sheet.
* **Camera Not Available**: Ensure you are running on `http://localhost` or `https://` as browser security restrictions disable camera access on insecure HTTP origins.

---

## 🔮 Future ML Architecture & Roadmap

In future releases, the heuristic regex extractor can be upgraded to layout-aware deep learning models:
* **LayoutLM / LayoutLMv3**: For layout-aware document visual question answering and Named Entity Recognition (NER).
* **Donut (OCR-free Visual Document Understanding)**: End-to-end business card parsing.
* **Duplicate Contact Detection**: Match existing contacts by email or phone before appending.
* **Batch Card Processing**: Upload multiple business card images simultaneously and save all rows in bulk.
