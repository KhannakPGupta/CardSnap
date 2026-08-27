import re
from typing import List, Dict, Any
from models.contact import ContactScanResult, FieldConfidence

COMMON_JOB_TITLES = [
    "founder", "co-founder", "ceo", "cto", "coo", "cfo", "chief executive officer",
    "chief technology officer", "chief operating officer", "chief financial officer",
    "director", "managing director", "president", "vice president", "vp",
    "general manager", "manager", "product manager", "project manager",
    "engineering manager", "marketing manager", "sales manager", "account manager",
    "engineer", "software engineer", "senior software engineer", "lead engineer",
    "full stack developer", "developer", "frontend developer", "backend developer",
    "consultant", "senior consultant", "designer", "ui/ux designer", "architect",
    "solution architect", "head of engineering", "head of product", "head of sales",
    "head of marketing", "partner", "associate", "analyst", "executive", "owner",
    "proprietor", "advocate", "principal"
]

COMPANY_KEYWORDS = [
    "technologies", "technology", "tech", "solutions", "labs", "lab",
    "inc", "pvt", "ltd", "private", "limited", "corp", "corporation",
    "llc", "group", "systems", "services", "service", "studio", "agency",
    "software", "global", "enterprises", "enterprise", "consulting",
    "ventures", "interactive", "digital", "co", "company", "media",
    "works", "networks", "industries", "holdings", "capital", "infotech"
]

CITY_STATE_KEYWORDS = [
    "chennai", "bangalore", "bengaluru", "mumbai", "delhi", "new delhi",
    "hyderabad", "pune", "kolkata", "ahmedabad", "gurgaon", "noida",
    "california", "san francisco", "new york", "london", "singapore",
    "india", "usa", "uk", "uae", "dubai", "texas", "street", "st", "road",
    "rd", "avenue", "ave", "boulevard", "blvd", "floor", "building", "bldg",
    "suite", "plot", "sector", "phase"
]

def extract_contact_info(ocr_items: List[Dict[str, Any]]) -> ContactScanResult:
    """
    Extract structured contact info from OCR items.
    ocr_items format: List of {"text": str, "confidence": float, "bbox": [...] }
    """
    lines = [item["text"].strip() for item in ocr_items if item.get("text")]
    confidences = [item.get("confidence", 0.9) for item in ocr_items if item.get("text")]
    
    # Standard field extraction results
    extracted = {
        "name": {"value": "", "confidence": 0.0},
        "job_title": {"value": "", "confidence": 0.0},
        "company": {"value": "", "confidence": 0.0},
        "phone": {"value": "", "confidence": 0.0},
        "email": {"value": "", "confidence": 0.0},
        "website": {"value": "", "confidence": 0.0},
        "linkedin": {"value": "", "confidence": 0.0},
        "address": {"value": "", "confidence": 0.0},
        "notes": {"value": "", "confidence": 1.0}
    }
    
    used_line_indices = set()

    # Helper to strip field labels
    def strip_label(text: str) -> str:
        return re.sub(r'^(website|web|site|url|email|e-mail|mail|phone|tel|mobile|cell|ph|linkedin|address|location|notes)\s*[:.\-]\s*', '', text, flags=re.IGNORECASE).strip()

    # 1. EMAIL EXTRACTION
    email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', re.IGNORECASE)
    for idx, text in enumerate(lines):
        cleaned_text = strip_label(text)
        match = email_regex.search(cleaned_text)
        if match:
            clean_email = match.group(0).lower().rstrip('.')
            extracted["email"] = {"value": clean_email, "confidence": min(0.99, confidences[idx] if idx < len(confidences) else 0.95)}
            used_line_indices.add(idx)
            break

    # 2. LINKEDIN EXTRACTION
    for idx, text in enumerate(lines):
        cleaned_text = strip_label(text)
        lower = cleaned_text.lower()
        if "linkedin" in lower or "linkedln" in lower or "linkdin" in lower:
            # Normalize common OCR corruptions like 'linkedin comlinlusername' or 'linkedin com/in/'
            normalized = re.sub(r'linked[il1]n[\s.]*com[\s./]*(?:in|linl|lin|1n)[\s./]*', 'linkedin.com/in/', lower)
            match = re.search(r'linkedin\.com\/in\/[a-zA-Z0-9_-]+', normalized)
            if match:
                url = "https://www." + match.group(0)
                extracted["linkedin"] = {"value": url, "confidence": 0.95}
                used_line_indices.add(idx)
                break
            else:
                # Fallback URL construction if username was parsed
                parts = cleaned_text.split()
                for p in parts:
                    if "linkedin" in p.lower():
                        clean_p = re.sub(r'^[^\w/:]+', '', p).rstrip('.')
                        if not clean_p.startswith("http"):
                            clean_p = "https://" + clean_p
                        extracted["linkedin"] = {"value": clean_p, "confidence": 0.85}
                        used_line_indices.add(idx)
                        break

    # 3. WEBSITE EXTRACTION
    # Normalize potential space-for-dot corruptions in websites, e.g. "WWW.abctech com" -> "www.abctech.com"
    url_regex = re.compile(r'(?:https?:\/\/)?(?:www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?', re.IGNORECASE)
    domain_regex = re.compile(r'(?:https?:\/\/)?(?![^/]*@)[a-zA-Z0-9-]+\.(?:com|org|net|io|co|in|ai|tech|dev|solutions|app|me)(?:\/[^\s]*)?', re.IGNORECASE)
    
    for idx, text in enumerate(lines):
        if idx in used_line_indices or "@" in text:
            continue
        cleaned_text = strip_label(text)
        # Pre-normalize www / tlds in OCR output
        normalized_web = re.sub(r'\b(www)[\s.]([a-zA-Z0-9-]+)[\s.](com|org|net|io|co|in|ai|tech|dev)\b', r'\1.\2.\3', cleaned_text, flags=re.IGNORECASE)
        normalized_web = re.sub(r'\b([a-zA-Z0-9-]+)\s+(com|org|net|io|co|in|ai|tech|dev)\b', r'\1.\2', normalized_web, flags=re.IGNORECASE)
        
        match = url_regex.search(normalized_web) or domain_regex.search(normalized_web)
        if match:
            site = match.group(0).lower().rstrip('.')
            if "linkedin" not in site:
                if not site.startswith("http://") and not site.startswith("https://"):
                    site = "www." + site if not site.startswith("www.") else site
                extracted["website"] = {"value": site, "confidence": 0.92}
                used_line_indices.add(idx)
                break

    # 4. PHONE EXTRACTION
    # Handles +91 98765 43210, +91-9876543210, (123) 456-7890, +1 800 555 0199, etc.
    phone_regex = re.compile(r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}(?:[\s.-]?\d{1,4})?', re.IGNORECASE)
    
    phone_found = False
    for idx, text in enumerate(lines):
        if idx in used_line_indices:
            continue
        # Check for explicit phone prefixes
        has_phone_keyword = bool(re.search(r'\b(tel|mobile|cell|phone|ph|call|m|t)\b[:.\-\s]', text, re.IGNORECASE))
        
        # Search candidate digits
        digits_only = re.sub(r'\D', '', text)
        if len(digits_only) >= 7 and len(digits_only) <= 15:
            # Avoid matching postal codes or building numbers if no phone keyword
            if has_phone_keyword or "+" in text or "-" in text or len(digits_only) >= 10:
                match = phone_regex.search(text)
                if match:
                    raw_phone = match.group(0).strip()
                    # Clean up trailing letters/noise
                    raw_phone = re.sub(r'^[a-zA-Z\s:]+', '', raw_phone).strip()
                    # Remove spaces inside the phone number
                    raw_phone = raw_phone.replace(" ", "")
                    if len(re.sub(r'\D', '', raw_phone)) >= 7:
                        extracted["phone"] = {"value": raw_phone, "confidence": 0.93 if has_phone_keyword else 0.85}
                        used_line_indices.add(idx)
                        phone_found = True
                        break

    # 5. JOB TITLE EXTRACTION
    title_found_idx = -1
    for idx, text in enumerate(lines):
        if idx in used_line_indices:
            continue
        clean_lower = text.lower()
        for title in COMMON_JOB_TITLES:
            if re.search(rf'\b{re.escape(title)}\b', clean_lower):
                extracted["job_title"] = {"value": text.strip(), "confidence": 0.90}
                used_line_indices.add(idx)
                title_found_idx = idx
                break
        if title_found_idx != -1:
            break

    # 6. COMPANY EXTRACTION
    for idx, text in enumerate(lines):
        if idx in used_line_indices:
            continue
        clean_lower = text.lower()
        is_company = False
        for kw in COMPANY_KEYWORDS:
            if re.search(rf'\b{re.escape(kw)}\b', clean_lower):
                is_company = True
                break
        if is_company:
            extracted["company"] = {"value": text.strip(), "confidence": 0.88}
            used_line_indices.add(idx)
            break

    # 7. NAME EXTRACTION (Heuristic & Position based)
    # Check candidate lines (especially before/near job title or near top)
    name_candidate_idx = -1
    
    # If job title was found, check line immediately before it first
    if title_found_idx > 0 and (title_found_idx - 1) not in used_line_indices:
        cand_text = lines[title_found_idx - 1]
        if is_valid_name(cand_text):
            name_candidate_idx = title_found_idx - 1

    # Otherwise scan from top
    if name_candidate_idx == -1:
        for idx in range(min(5, len(lines))):
            if idx in used_line_indices:
                continue
            cand_text = lines[idx]
            if is_valid_name(cand_text):
                name_candidate_idx = idx
                break

    if name_candidate_idx != -1:
        raw_name = lines[name_candidate_idx].strip()
        # Title case format if uppercase
        if raw_name.isupper():
            raw_name = raw_name.title()
        extracted["name"] = {"value": raw_name, "confidence": 0.89}
        used_line_indices.add(name_candidate_idx)

    # If company still not found, check top lines that weren't name/title
    if not extracted["company"]["value"]:
        for idx in range(min(4, len(lines))):
            if idx in used_line_indices:
                continue
            cand_text = lines[idx].strip()
            # If line has words and no digits or symbols
            if len(cand_text) > 2 and not re.search(r'\d', cand_text) and not any(c in cand_text for c in ['@', ':', '/']):
                extracted["company"] = {"value": cand_text, "confidence": 0.70}
                used_line_indices.add(idx)
                break

    # 8. ADDRESS EXTRACTION
    address_parts = []
    for idx, text in enumerate(lines):
        if idx in used_line_indices:
            continue
        clean_lower = text.lower()
        # Check if line contains city/state/address keywords or postal zip pattern
        has_geo = any(re.search(rf'\b{re.escape(kw)}\b', clean_lower) for kw in CITY_STATE_KEYWORDS)
        has_zip = bool(re.search(r'\b\d{5,6}\b', text))
        if has_geo or has_zip:
            address_parts.append(text.strip())
            used_line_indices.add(idx)

    if address_parts:
        extracted["address"] = {"value": ", ".join(address_parts), "confidence": 0.82}

    return ContactScanResult(
        name=FieldConfidence(**extracted["name"]),
        job_title=FieldConfidence(**extracted["job_title"]),
        company=FieldConfidence(**extracted["company"]),
        phone=FieldConfidence(**extracted["phone"]),
        email=FieldConfidence(**extracted["email"]),
        website=FieldConfidence(**extracted["website"]),
        linkedin=FieldConfidence(**extracted["linkedin"]),
        address=FieldConfidence(**extracted["address"]),
        notes=FieldConfidence(**extracted["notes"]),
        raw_ocr=ocr_items
    )

def is_valid_name(text: str) -> bool:
    """Helper to check if a string is a plausible person's name."""
    text = text.strip()
    if not text or len(text) < 2 or len(text) > 40:
        return False
    # Names should not contain digits or email/url indicators
    if re.search(r'\d', text) or '@' in text or 'www.' in text or '.com' in text:
        return False
    # Names should not contain company suffixes or job keywords
    lower = text.lower()
    if any(kw in lower for kw in ["pvt", "ltd", "inc", "corp", "llc", "technologies", "solutions", "services", "gmbh"]):
        return False
    if any(title in lower for title in ["ceo", "cto", "cfo", "director", "manager", "engineer", "consultant"]):
        return False
    # Check word count (typically 1 to 4 words)
    words = text.split()
    if 1 <= len(words) <= 4:
        return True
    return False
