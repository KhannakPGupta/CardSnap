from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
import os
from models.contact import (
    ContactModel,
    ContactScanResult,
    ConfigStatusResponse,
    SaveContactResponse
)
from utils.validation import validate_image_file
from services.image_processing import process_image
from services.ocr import run_ocr
from services.extractor import extract_contact_info
from services.google_sheets import (
    is_google_sheets_configured,
    get_contact_count,
    append_contact_to_sheet
)
from services.excel_storage import (
    append_contact_to_excel,
    get_local_excel_contact_count,
    ensure_excel_file_exists,
    EXCEL_PATH
)
import logging

logger = logging.getLogger("cardsnap.routes")
router = APIRouter(prefix="/api")

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

