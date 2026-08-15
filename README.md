# CardSnap — Business Card Scanner & Contact Storage

> **Turn physical business cards into organized contacts continuously stored in a downloadable Excel spreadsheet.**

CardSnap is a modern, full-stack web application that allows users to scan physical business cards (via image upload or live camera capture), automatically extract structured contact details using OCR and intelligent computer vision heuristics, verify/edit extracted fields, and save every contact into an **Excel Spreadsheet (`.xlsx`)** with 1-click export.

---

## 🌟 Key Features

* **Instant Card Scanning**: Upload business card images (JPG, JPEG, PNG, WEBP) or capture directly using your browser camera.
* **Computer Vision & OCR**: OpenCV preprocessing (CLAHE contrast enhancement, noise reduction, sharpening) paired with OCR engine support (PaddleOCR & EasyOCR).
* **Structured Information Extraction**: Automatically extracts Full Name, Job Title, Company, Phone Number, Email, Website, LinkedIn, Address, and Date Added.
* **Continuous Excel Spreadsheet Storage**: Appends every scanned contact as a new row to a styled local Excel spreadsheet (`CardSnap_Contacts.xlsx`) with zero cloud configuration required.
* **1-Click Excel Download**: Instantly download your compiled Excel contact sheet directly from the UI header or success screen.
* **Interactive Review Screen**: Edit any extracted field before saving, with low-confidence field indicators (`⚠ Verify`) and raw OCR text debug view.
* **Optional Google Sheets Cloud Sync**: Optionally syncs contacts to a Google Sheet if credentials are provided in `.env`.

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
* **PaddleOCR / EasyOCR** (Text Detection & Recognition)
* **OpenPyXL** (Excel Spreadsheet Engine)
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
   │ 1. OpenCV Preprocessing        │
   │ 2. OCR Text Recognition        │
   │ 3. Heuristic Field Extraction  │
   └────┬───────────────────────────┘
        │
        ▼ Return Structured Contact + Confidence
  React Review & Verification Screen
        │
        ▼ POST /api/save-contact (JSON)
  FastAPI Storage Engine
        │
   ┌────┴───────────────────────────┐
   │ Appends Row to Local Excel     │
   │ (.xlsx downloadable file)      │
   └────────────────────────────────┘
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

## 📝 Continuous Excel Sheet Format

When contacts are saved, CardSnap automatically formats the headers and appends every contact row continuously:

| Name | Job Title | Company | Phone | Email | Website | LinkedIn | Address | Notes | Date Added |
| ---- | --------- | ------- | ----- | ----- | ------- | -------- | ------- | ----- | ---------- |
| Rahul Sharma | Founder & CEO | ABC Tech | +91 98765 43210 | rahul@abc.com | www.abctech.com | linkedin.com/in/rahul | Chennai, TN | Met at conference | 16/08/2026 |
| Priya Mehta | Product Manager | XYZ Ltd | +91 98765 12345 | priya@xyz.com | www.xyz.com | linkedin.com/in/priya | Bangalore, KA | | 16/08/2026 |

* **Every new scan adds Row 2, Row 3, Row 4, etc.**
* Previously stored contacts are **never deleted or overwritten**.
* Click **Download Excel** in the app to download the formatted `.xlsx` file anytime!

---

## ⚙️ Optional Google Sheets Integration

If you want to sync contacts to Google Sheets in addition to Excel:

1. Create a Google Cloud Service Account and download `credentials.json`.
2. Add service account email as **Editor** to your target Google Sheet.
3. Configure `backend/.env`:
   ```env
   GOOGLE_SHEET_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_FILE=credentials.json
   ```

---

## 🔮 Future ML Architecture & Roadmap

* **LayoutLMv3 Integration**: Upgrade regex extraction to visual document entity recognition.
* **Duplicate Detection**: Match existing contacts by email or phone before appending.
* **Batch Card Processing**: Upload multiple business card images simultaneously and save all rows in bulk.
