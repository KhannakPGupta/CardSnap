import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from datetime import datetime
from typing import Tuple, Optional
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
    "Date Added",
    "Image Path"
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
            date_added,
            contact.image_path or ""
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
                "date_added": str(row_vals[9] or "").strip(),
                "image_path": str(row_vals[10] or "").strip() if len(row_vals) > 10 else ""
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
        ws.cell(row=row_id, column=11, value=contact.image_path or "")
        
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

def create_new_excel_sheet() -> Tuple[bool, str, Optional[str]]:
    """Archives the current CardSnap_Contacts.xlsx file and creates a fresh styled one."""
    try:
        from typing import Optional
        if os.path.exists(EXCEL_PATH):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_filename = f"CardSnap_Contacts_{timestamp}.xlsx"
            archive_path = os.path.join(DATA_DIR, archive_filename)
            os.rename(EXCEL_PATH, archive_path)
            ensure_excel_file_exists()
            return True, f"Old ledger archived as {archive_filename}, new ledger initialized.", archive_filename
        else:
            ensure_excel_file_exists()
            return True, "Fresh ledger initialized.", None
    except Exception as e:
        return False, f"Error creating new sheet: {str(e)}", None

def get_all_ledgers() -> list:
    """Lists all Excel files in the data directory with metadata."""
    ensure_excel_file_exists()
    ledgers = []
    try:
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".xlsx") and filename.startswith("CardSnap_Contacts"):
                filepath = os.path.join(DATA_DIR, filename)
                stat = os.stat(filepath)
                is_active = (filename == "CardSnap_Contacts.xlsx")
                
                contact_count = 0
                try:
                    wb = openpyxl.load_workbook(filepath, read_only=True)
                    ws = wb.active
                    contact_count = max(0, ws.max_row - 1)
                    wb.close()
                except Exception:
                    pass

                ledgers.append({
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "modified_time": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M:%S"),
                    "is_active": is_active,
                    "contact_count": contact_count
                })
        # Sort active first, then newest archived first
        ledgers.sort(key=lambda x: (not x["is_active"], x["filename"]), reverse=True)
    except Exception as e:
        print(f"Error listing ledgers: {e}")
    return ledgers

def activate_ledger_file(filename: str) -> Tuple[bool, str, Optional[str]]:
    """Activates an archived ledger by copying/moving it to CardSnap_Contacts.xlsx."""
    try:
        from typing import Optional
        target_path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(target_path):
            return False, "Ledger file not found", None
        
        if filename == "CardSnap_Contacts.xlsx":
            return True, "Ledger is already active", None
        
        backup_filename = None
        # Backup the current active ledger first
        if os.path.exists(EXCEL_PATH):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"CardSnap_Contacts_{timestamp}.xlsx"
            backup_path = os.path.join(DATA_DIR, backup_filename)
            os.rename(EXCEL_PATH, backup_path)
            
        import shutil
        shutil.copy(target_path, EXCEL_PATH)
        return True, "Ledger activated successfully", backup_filename
    except Exception as e:
        return False, f"Error activating ledger: {str(e)}", None

def delete_ledger_file(filename: str) -> Tuple[bool, str]:
    """Deletes an archived ledger file. Cannot delete the active CardSnap_Contacts.xlsx file."""
    try:
        if filename == "CardSnap_Contacts.xlsx":
            return False, "Cannot delete the active ledger. Reset it instead."
            
        target_path = os.path.join(DATA_DIR, filename)
        # Security check: ensure path is within DATA_DIR and file exists
        if not os.path.abspath(target_path).startswith(os.path.abspath(DATA_DIR)):
            return False, "Unauthorized access path."
            
        if not os.path.exists(target_path):
            return False, "Ledger file not found."
            
        os.remove(target_path)
        return True, "Ledger file deleted successfully."
    except Exception as e:
        return False, f"Error deleting ledger: {str(e)}"

def rename_ledger_file(old_filename: str, new_label: str) -> Tuple[bool, str, Optional[str]]:
    """Renames an Excel ledger file, preserving security and prefix paths."""
    try:
        from typing import Optional
        clean_label = "".join(c for c in new_label if c.isalnum() or c in ("_", "-")).strip()
        if not clean_label:
            return False, "Invalid label name. Use only alphanumeric characters, dashes, or underscores.", None
            
        new_filename = f"CardSnap_Contacts_{clean_label}.xlsx"
        
        old_path = os.path.join(DATA_DIR, old_filename)
        new_path = os.path.join(DATA_DIR, new_filename)
        
        # Security checks
        if not os.path.abspath(old_path).startswith(os.path.abspath(DATA_DIR)) or \
           not os.path.abspath(new_path).startswith(os.path.abspath(DATA_DIR)):
            return False, "Unauthorized access path.", None
            
        if not os.path.exists(old_path):
            return False, "Source ledger file not found.", None
            
        if os.path.exists(new_path):
            return False, f"A ledger named '{new_filename}' already exists.", None
            
        os.rename(old_path, new_path)
        
        # If we renamed the active sheet, make sure to create a fresh empty active sheet
        if old_filename == "CardSnap_Contacts.xlsx":
            ensure_excel_file_exists()
            
        return True, f"Ledger renamed successfully to {new_filename}", new_filename
    except Exception as e:
        return False, f"Error renaming ledger: {str(e)}", None

def merge_contacts_in_excel(target_row_id: int, duplicate_row_ids: list, merged_contact: ContactModel) -> Tuple[bool, str]:
    """Merges a group of contact rows by updating the target row and deleting the duplicates."""
    try:
        filepath = ensure_excel_file_exists()
        wb = openpyxl.load_workbook(filepath)
        ws = wb.active
        
        # 1. Update the target row
        ws.cell(row=target_row_id, column=1, value=merged_contact.name or "")
        ws.cell(row=target_row_id, column=2, value=merged_contact.job_title or "")
        ws.cell(row=target_row_id, column=3, value=merged_contact.company or "")
        ws.cell(row=target_row_id, column=4, value=merged_contact.phone or "")
        ws.cell(row=target_row_id, column=5, value=merged_contact.email or "")
        ws.cell(row=target_row_id, column=6, value=merged_contact.website or "")
        ws.cell(row=target_row_id, column=7, value=merged_contact.linkedin or "")
        ws.cell(row=target_row_id, column=8, value=merged_contact.address or "")
        ws.cell(row=target_row_id, column=9, value=merged_contact.notes or "")
        ws.cell(row=target_row_id, column=11, value=merged_contact.image_path or "")
        # Keep original date added if present
        if not ws.cell(row=target_row_id, column=10).value:
            ws.cell(row=target_row_id, column=10, value=datetime.now().strftime("%d/%m/%Y"))
            
        # 2. Delete duplicate rows in descending order to avoid ID shifting issues
        sorted_duplicates = sorted([int(r) for r in duplicate_row_ids if int(r) != target_row_id], reverse=True)
        for row_id in sorted_duplicates:
            if row_id >= 2 and row_id <= ws.max_row:
                ws.delete_rows(row_id)
                
        wb.save(filepath)
        return True, "Contacts successfully merged in Excel sheet"
    except Exception as e:
        return False, f"Merge error: {str(e)}"
