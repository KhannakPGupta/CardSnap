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
        return True, "Contact saved successfully", new_row_num
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

def get_all_contacts_from_excel() -> list:

    """Read all contacts from Excel spreadsheet and return as a list of dicts."""
    contacts = []
    try:
        filepath = ensure_excel_file_exists()
        wb = openpyxl.load_workbook(filepath, data_only=True)
        ws = wb.active
        
        # Row 1 is headers. Data starts at Row 2
        for row_idx in range(2, ws.max_row + 1):
            row_vals = [ws.cell(row=row_idx, column=col_idx).value for col_idx in range(1, len(HEADERS) + 1)]
            # Skip completely empty rows
            if not any(row_vals):
                continue
            
            contact_dict = {
                "id": row_idx,
                "name": str(row_vals[0] or "").strip(),
                "job_title": str(row_vals[1] or "").strip(),
                "company": str(row_vals[2] or "").strip(),
                "phone": str(row_vals[3] or "").strip(),
                "email": str(row_vals[4] or "").strip(),
                "website": str(row_vals[5] or "").strip(),
                "linkedin": str(row_vals[6] or "").strip(),
                "address": str(row_vals[7] or "").strip(),
                "notes": str(row_vals[8] or "").strip(),
                "date_added": str(row_vals[9] or "").strip()
            }
            contacts.append(contact_dict)
        wb.close()
    except Exception as e:
        print(f"Error reading Excel contacts: {e}")
    return contacts

def update_contact_in_excel(row_id: int, contact: ContactModel) -> Tuple[bool, str]:
    """Update contact row in Excel sheet."""
    try:
        filepath = ensure_excel_file_exists()
        wb = openpyxl.load_workbook(filepath)
        ws = wb.active
        
        if row_id < 2 or row_id > ws.max_row:
            return False, "Invalid contact ID"
            
        date_added = ws.cell(row=row_id, column=10).value or datetime.now().strftime("%d/%m/%Y")
        
        ws.cell(row=row_id, column=1, value=contact.name or "")
        ws.cell(row=row_id, column=2, value=contact.job_title or "")
        ws.cell(row=row_id, column=3, value=contact.company or "")
        ws.cell(row=row_id, column=4, value=contact.phone or "")
        ws.cell(row=row_id, column=5, value=contact.email or "")
        ws.cell(row=row_id, column=6, value=contact.website or "")
        ws.cell(row=row_id, column=7, value=contact.linkedin or "")
        ws.cell(row=row_id, column=8, value=contact.address or "")
        ws.cell(row=row_id, column=9, value=contact.notes or "")
        ws.cell(row=row_id, column=10, value=date_added)
        
        wb.save(filepath)
        return True, "Contact updated successfully"
    except Exception as e:
        return False, f"Update error: {str(e)}"

def delete_contact_from_excel(row_id: int) -> Tuple[bool, str]:
    """Delete a contact row from Excel sheet."""
    try:
        filepath = ensure_excel_file_exists()
        wb = openpyxl.load_workbook(filepath)
        ws = wb.active
        
        if row_id < 2 or row_id > ws.max_row:
            return False, "Invalid contact ID"
            
        ws.delete_rows(row_id)
        wb.save(filepath)
        return True, "Contact deleted successfully"
    except Exception as e:
        return False, f"Delete error: {str(e)}"

def generate_vcard_string(contacts: list) -> str:
    """Generate vCard .vcf string format for contacts."""
    vcards = []
    for c in contacts:
        vcard = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            f"FN:{c.get('name', '')}",
            f"TITLE:{c.get('job_title', '')}",
            f"ORG:{c.get('company', '')}",
            f"TEL;TYPE=CELL:{c.get('phone', '')}",
            f"EMAIL;TYPE=INTERNET:{c.get('email', '')}",
            f"URL:{c.get('website', '')}",
            f"ADR;TYPE=WORK:;;{c.get('address', '')};;;;",
            f"NOTE:{c.get('notes', '')}",
            "END:VCARD"
        ]
        vcards.append("\n".join(vcard))
    return "\n\n".join(vcards)

