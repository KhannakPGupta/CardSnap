from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ContactModel(BaseModel):
    name: Optional[str] = ""
    job_title: Optional[str] = ""
    company: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    website: Optional[str] = ""
    linkedin: Optional[str] = ""
    address: Optional[str] = ""
    notes: Optional[str] = ""
    image_path: Optional[str] = ""

class FieldConfidence(BaseModel):
    value: str = ""
    confidence: float = 1.0

class ContactScanResult(BaseModel):
    name: FieldConfidence
    job_title: FieldConfidence
    company: FieldConfidence
    phone: FieldConfidence
    email: FieldConfidence
    website: FieldConfidence
    linkedin: FieldConfidence
    address: FieldConfidence
    notes: FieldConfidence
    raw_ocr: List[Dict[str, Any]] = []
    card_image_filename: Optional[str] = ""

class ConfigStatusResponse(BaseModel):
    google_sheets_configured: bool
    spreadsheet_id: Optional[str] = None
    contact_count: Optional[int] = None
    local_excel_count: Optional[int] = 0
    message: str = ""

class SaveContactResponse(BaseModel):
    success: bool
    message: str
    row_added: Optional[int] = None

class MergeContactsRequest(BaseModel):
    target_row_id: int
    duplicate_row_ids: List[int]
    merged_contact: ContactModel

class RenameLedgerRequest(BaseModel):
    filename: str
    new_label: str
