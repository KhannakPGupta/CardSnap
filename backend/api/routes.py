from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
import os
from models.contact import (
    ContactModel,
    ContactScanResult,
    ConfigStatusResponse,
    SaveContactResponse,
    MergeContactsRequest,
    RenameLedgerRequest
)
from utils.validation import validate_image_file
from services.image_processing import process_image
from services.ocr import run_ocr
from services.extractor import extract_contact_info
from services.google_sheets import (
    is_google_sheets_configured,
    get_contact_count,
    append_contact_to_sheet,
    archive_active_worksheet_in_gs,
    activate_archived_worksheet_in_gs,
    delete_archived_worksheet_in_gs,
    rename_archived_worksheet_in_gs
)
from services.excel_storage import (
    append_contact_to_excel,
    get_local_excel_contact_count,
    ensure_excel_file_exists,
    get_all_contacts_from_excel,
    update_contact_in_excel,
    delete_contact_from_excel,
    generate_vcard_string,
    create_new_excel_sheet,
    get_all_ledgers,
    activate_ledger_file,
    delete_ledger_file,
    rename_ledger_file,
    merge_contacts_in_excel,
    DATA_DIR,
    EXCEL_PATH
)
from fastapi.responses import Response

router = APIRouter()

@router.get("/contacts")

def list_contacts():
    contacts = get_all_contacts_from_excel()
    return {"contacts": contacts, "total": len(contacts)}

@router.put("/contacts/{row_id}")
def update_contact(row_id: int, contact: ContactModel):
    success, msg = update_contact_in_excel(row_id, contact)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"success": True, "message": msg}

@router.delete("/contacts/{row_id}")
def delete_contact(row_id: int):
    success, msg = delete_contact_from_excel(row_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"success": True, "message": msg}

@router.post("/contacts/reset")
def reset_contacts_sheet():
    success, msg, archive_filename = create_new_excel_sheet()
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=msg)
    
    # Sync with Google Sheets if configured
    is_configured, _, _ = is_google_sheets_configured()
    if is_configured and archive_filename:
        gs_success, gs_msg = archive_active_worksheet_in_gs(archive_filename)
        if not gs_success:
            logger.warning(f"Google Sheets archive sync failed: {gs_msg}")
            return {"success": True, "message": f"{msg} (Google Sheets sync error: {gs_msg})"}
            
    return {"success": True, "message": msg}

@router.get("/download-vcard")
def download_vcard():
    contacts = get_all_contacts_from_excel()
    vcard_str = generate_vcard_string(contacts)
    return Response(
        content=vcard_str,
        media_type="text/vcard",
        headers={"Content-Disposition": "attachment; filename=CardSnap_Contacts.vcf"}
    )

import logging

logger = logging.getLogger("cardsnap.routes")

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/config/status", response_model=ConfigStatusResponse)
def get_config_status():
    is_configured, sheet_id, message = is_google_sheets_configured()
    count = get_contact_count() if is_configured else None
    local_count = get_local_excel_contact_count()
    return ConfigStatusResponse(
        google_sheets_configured=is_configured,
        spreadsheet_id=sheet_id if is_configured else None,
        contact_count=count,
        local_excel_count=local_count,
        message=message
    )

@router.get("/download-excel")
def download_excel():
    filepath = ensure_excel_file_exists()
    return FileResponse(
        path=filepath,
        filename="CardSnap_Contacts.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/ledgers")
def list_ledgers():
    return {"ledgers": get_all_ledgers()}

@router.post("/ledgers/activate/{filename}")
def activate_ledger(filename: str):
    success, msg, backup_filename = activate_ledger_file(filename)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        
    # Sync with Google Sheets if configured
    is_configured, _, _ = is_google_sheets_configured()
    if is_configured and backup_filename:
        gs_success, gs_msg = activate_archived_worksheet_in_gs(filename, backup_filename)
        if not gs_success:
            logger.warning(f"Google Sheets activation sync failed: {gs_msg}")
            return {"success": True, "message": f"{msg} (Google Sheets sync error: {gs_msg})"}
            
    return {"success": True, "message": msg}

@router.delete("/ledgers/{filename}")
def delete_ledger(filename: str):
    success, msg = delete_ledger_file(filename)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        
    # Sync with Google Sheets if configured
    is_configured, _, _ = is_google_sheets_configured()
    if is_configured:
        gs_success, gs_msg = delete_archived_worksheet_in_gs(filename)
        if not gs_success:
            logger.warning(f"Google Sheets delete sync failed: {gs_msg}")
            return {"success": True, "message": f"{msg} (Google Sheets sync error: {gs_msg})"}
            
    return {"success": True, "message": msg}

@router.get("/download-excel/{filename}")
def download_specific_excel(filename: str):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.abspath(filepath).startswith(os.path.abspath(DATA_DIR)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.post("/scan", response_model=ContactScanResult)
async def scan_business_card(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        validate_image_file(file, contents)
        
        # Image processing
        processed_img, original_img = process_image(contents)
        
        # OCR execution
        ocr_results = run_ocr(processed_img)
        if not ocr_results:
            # Fallback to original image if processed image produced no text
            ocr_results = run_ocr(original_img)
            
        if not ocr_results:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="We couldn't read this card clearly. Try taking a sharper, better-lit photo."
            )
            
        # Structure extraction
        extracted_result = extract_contact_info(ocr_results)
        
        # Image saving is disabled to optimize memory and disk usage.
        extracted_result.card_image_filename = ""
        return extracted_result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning business card: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process business card: {str(e)}"
        )

@router.post("/save-contact", response_model=SaveContactResponse)
def save_contact(contact: ContactModel):
    # Always append to local Excel sheet
    excel_success, excel_msg, excel_row = append_contact_to_excel(contact)

    # If Google Sheets is configured, also append to Google Sheet
    is_configured, _, _ = is_google_sheets_configured()
    if is_configured:
        gs_success, gs_msg, gs_row = append_contact_to_sheet(contact)
        if not gs_success:
            logger.warning(f"Google Sheets save failed: {gs_msg}. Local Excel saved successfully.")
            return SaveContactResponse(
                success=True,
                message=f"Saved to local Excel sheet. (Google Sheets error: {gs_msg})",
                row_added=excel_row
            )
        return SaveContactResponse(
            success=True,
            message="Saved to Google Sheet and local Excel file.",
            row_added=gs_row
        )

    # Local Excel only mode
    if not excel_success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=excel_msg
        )
    return SaveContactResponse(
        success=True,
        message="Saved to local Excel sheet.",
        row_added=excel_row
    )

@router.get("/card-image/{filename}")
def get_card_image(filename: str):
    image_path = os.path.join(DATA_DIR, "card_images", filename)
    if not os.path.abspath(image_path).startswith(os.path.abspath(os.path.join(DATA_DIR, "card_images"))):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if not os.path.exists(image_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return FileResponse(image_path)

@router.get("/contacts/duplicates")
def get_duplicate_contacts():
    import re
    import difflib
    contacts = get_all_contacts_from_excel()
    if not contacts:
        return {"duplicates": []}
        
    n = len(contacts)
    parent = list(range(n))
    
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
        
    def union(i, j):
        root_i = find(i)
        root_j = find(j)
        if root_i != root_j:
            parent[root_i] = root_j
            
    # Check matching criteria pairwise
    for i in range(n):
        c1 = contacts[i]
        email1 = c1.get("email", "").strip().lower()
        phone1 = re.sub(r'\D', '', c1.get("phone", ""))
        name1 = c1.get("name", "").strip().lower()
        
        for j in range(i + 1, n):
            c2 = contacts[j]
            email2 = c2.get("email", "").strip().lower()
            phone2 = re.sub(r'\D', '', c2.get("phone", ""))
            name2 = c2.get("name", "").strip().lower()
            
            is_match = False
            
            # 1. Exact email match
            if email1 and email2 and email1 == email2:
                is_match = True
            
            # 2. Exact phone match (minimum 7 digits)
            elif phone1 and phone2 and len(phone1) >= 7 and phone1 == phone2:
                is_match = True
                
            # 3. Fuzzy name match (minimum 3 characters, ratio >= 0.85)
            elif name1 and name2 and len(name1) > 2 and len(name2) > 2:
                if name1 == name2:
                    is_match = True
                else:
                    ratio = difflib.SequenceMatcher(None, name1, name2).ratio()
                    if ratio >= 0.85:
                        is_match = True
            
            if is_match:
                union(i, j)
                
    # Group contacts by their root parent
    clusters = {}
    for i in range(n):
        root = find(i)
        clusters.setdefault(root, []).append(contacts[i])
        
    # Filter clusters with size > 1
    duplicate_groups = []
    for root, group in clusters.items():
        if len(group) > 1:
            # Determine primary match type/value for visual feedback
            email1 = group[0].get("email", "").strip().lower()
            phone1 = re.sub(r'\D', '', group[0].get("phone", ""))
            name1 = group[0].get("name", "").strip().lower()
            
            m_type = "Name"
            m_val = group[0].get("name")
            
            # Inspect pair links to display descriptive reason
            for k in range(1, len(group)):
                email2 = group[k].get("email", "").strip().lower()
                phone2 = re.sub(r'\D', '', group[k].get("phone", ""))
                name2 = group[k].get("name", "").strip().lower()
                
                if email1 and email2 and email1 == email2:
                    m_type = "Email"
                    m_val = email1
                    break
                elif phone1 and phone2 and len(phone1) >= 7 and phone1 == phone2:
                    m_type = "Phone"
                    m_val = group[0].get("phone")
                    break
                elif name1 and name2 and len(name1) > 2 and len(name2) > 2:
                    if name1 != name2:
                        m_type = "Fuzzy Name"
                        m_val = f"{group[0].get('name')} ~ {group[k].get('name')}"
                        break
                    
            duplicate_groups.append({
                "type": m_type,
                "value": m_val,
                "contacts": group
            })
            
    return {"duplicates": duplicate_groups}

@router.post("/contacts/merge")
def merge_contacts(req: MergeContactsRequest):
    success, msg = merge_contacts_in_excel(
        target_row_id=req.target_row_id,
        duplicate_row_ids=req.duplicate_row_ids,
        merged_contact=req.merged_contact
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"success": True, "message": msg}

@router.post("/ledgers/rename")
def rename_ledger(req: RenameLedgerRequest):
    success, msg, new_filename = rename_ledger_file(req.filename, req.new_label)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        
    # Sync with Google Sheets if configured
    is_configured, _, _ = is_google_sheets_configured()
    if is_configured and new_filename:
        gs_success, gs_msg = rename_archived_worksheet_in_gs(req.filename, new_filename)
        if not gs_success:
            logger.warning(f"Google Sheets rename sync failed: {gs_msg}")
            return {"success": True, "message": f"{msg} (Google Sheets sync error: {gs_msg})"}
            
    return {"success": True, "message": msg}

