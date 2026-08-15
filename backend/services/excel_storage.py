import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from datetime import datetime
from typing import Tuple
from models.contact import ContactModel

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
EXCEL_PATH = os.path.join(DATA_DIR, "CardSnap_Contacts.xlsx")

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

def ensure_excel_file_exists() -> str:
    """Ensure data directory and CardSnap_Contacts.xlsx file exist with styled header."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(EXCEL_PATH):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Contacts"
        
        # Header formatting
        ws.append(HEADERS)
        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
        center_align = Alignment(horizontal="center", vertical="center")
        
        for col_num, header in enumerate(HEADERS, 1):
            cell = ws.cell(row=1, column=col_num)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = center_align
            ws.column_dimensions[get_column_letter(col_num)].width = max(len(header) + 6, 18)
            
        wb.save(EXCEL_PATH)
    return EXCEL_PATH

def append_contact_to_excel(contact: ContactModel) -> Tuple[bool, str, int]:
    """Appends contact to local Excel sheet."""
    try:
        filepath = ensure_excel_file_exists()
        wb = openpyxl.load_workbook(filepath)
        ws = wb.active
        
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
        ws.append(row_data)
        new_row_num = ws.max_row
        wb.save(filepath)
        return True, "Contact saved to local Excel sheet.", new_row_num
    except Exception as e:
        return False, f"Excel save error: {str(e)}", 0

def get_local_excel_contact_count() -> int:
    """Return total number of saved contacts in local Excel file."""
    try:
        if not os.path.exists(EXCEL_PATH):
            return 0
        wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True)
        ws = wb.active
        max_r = ws.max_row
        wb.close()
        return max(0, max_r - 1)
    except Exception:
        return 0
