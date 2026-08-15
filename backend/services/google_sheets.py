import os
import json
import logging
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
from models.contact import ContactModel

logger = logging.getLogger("cardsnap.google_sheets")

HEADERS = [
    "Name",
    "Job Title",
    "Company",
    "Phone",
    "Email",
    "Website",
    "LinkedIn",
    "Address",
    "Notes",
    "Date Added"
]

def get_gspread_client():
    """
    Initializes gspread client using service account credentials from env or JSON file.
    """
    import gspread
    from google.oauth2.service_account import Credentials

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]

    # Check 1: File path
    sa_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
    if sa_file and os.path.exists(sa_file):
        return gspread.service_account(filename=sa_file, scopes=scopes)

    # Check 2: Direct environment variables
    email = os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    private_key = os.getenv("GOOGLE_PRIVATE_KEY")
    if email and private_key:
        # Handle line breaks in private key if passed as single string
        private_key = private_key.replace("\\n", "\n")
        info = {
            "type": "service_account",
            "client_email": email,
            "private_key": private_key,
            "token_uri": "https://oauth2.googleapis.com/token"
        }
        creds = Credentials.from_service_account_info(info, scopes=scopes)
        return gspread.authorize(creds)

    # Check 3: credentials.json in local backend directory
    default_json = os.path.join(os.path.dirname(__file__), "..", "credentials.json")
    if os.path.exists(default_json):
        return gspread.service_account(filename=default_json, scopes=scopes)

    raise ValueError("Google Service Account credentials not configured.")

def is_google_sheets_configured() -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Checks if sheet ID and service account credentials are available.
    Returns: (is_configured, sheet_id, message)
    """
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    if not sheet_id or sheet_id == "your_google_sheet_id_here":
        return False, None, "GOOGLE_SHEET_ID environment variable is missing or default."
    
    try:
        get_gspread_client()
        return True, sheet_id, "Google Sheets API successfully configured."
    except Exception as e:
        return False, sheet_id, f"Google Service Account error: {str(e)}"

def get_contact_count() -> Optional[int]:
    """
    Returns the number of contacts currently in the Google Sheet (excluding header).
    """
    is_conf, sheet_id, _ = is_google_sheets_configured()
    if not is_conf or not sheet_id:
        return None

    try:
        client = get_gspread_client()
        sh = client.open_by_key(sheet_id)
        worksheet = sh.sheet1
        all_values = worksheet.get_all_values()
        if not all_values:
            return 0
        # Exclude header row if present
        if all_values[0] == HEADERS or "Name" in all_values[0]:
            return max(0, len(all_values) - 1)
        return len(all_values)
    except Exception as e:
        logger.error(f"Error fetching contact count: {e}")
        return None

def append_contact_to_sheet(contact: ContactModel) -> Tuple[bool, str, Optional[int]]:
    """
    Appends a new contact row to the configured Google Sheet.
    Checks and creates headers if missing.
    Returns: (success, message, new_row_number)
    """
    is_conf, sheet_id, msg = is_google_sheets_configured()
    if not is_conf or not sheet_id:
        return False, f"Google Sheet not connected: {msg}", None

    try:
        client = get_gspread_client()
        sh = client.open_by_key(sheet_id)
        worksheet = sh.sheet1
        
        # Verify or create header
        existing_rows = worksheet.get_all_values()
        if not existing_rows or len(existing_rows) == 0:
            worksheet.append_row(HEADERS)
            existing_rows = [HEADERS]
        elif existing_rows[0] != HEADERS and "Name" not in existing_rows[0]:
            # Insert header at top if sheet is non-empty without header
            worksheet.insert_row(HEADERS, index=1)
            existing_rows = [HEADERS] + existing_rows

        date_added = datetime.now().strftime("%d/%m/%Y")
        
        row_data = [
            contact.name or "",
            contact.job_title or "",
            contact.company or "",
            contact.phone or "",
            contact.email or "",
            contact.website or "",
            contact.linkedin or "",
            contact.address or "",
            contact.notes or "",
            date_added
        ]

        worksheet.append_row(row_data, value_input_option="USER_ENTERED")
        new_row_number = len(existing_rows) + 1

        return True, "Contact successfully saved to Google Sheet.", new_row_number

    except Exception as e:
        logger.error(f"Failed to append contact to Google Sheet: {e}")
        return False, f"Google Sheets save error: {str(e)}", None
