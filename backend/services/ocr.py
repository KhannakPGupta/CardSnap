import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger("cardsnap.ocr")

_reader = None
_paddle_ocr = None
_engine_type = None

def get_ocr_engine():
    global _paddle_ocr, _reader, _engine_type
    if _engine_type is not None:
        return _engine_type, _paddle_ocr or _reader

    # Preferred: PaddleOCR
    try:
        from paddleocr import PaddleOCR
        logger.info("Initializing PaddleOCR engine...")
        _paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        _engine_type = "paddleocr"
        return "paddleocr", _paddle_ocr
    except Exception as e:
        logger.info(f"PaddleOCR not available ({e}), falling back to EasyOCR.")

    # Fallback: EasyOCR
    try:
        import easyocr
        logger.info("Initializing EasyOCR engine...")
        _reader = easyocr.Reader(['en'], gpu=False)
        _engine_type = "easyocr"
        return "easyocr", _reader
    except Exception as e:
        logger.error(f"Failed to initialize OCR engine: {e}")
        raise RuntimeError(f"OCR engine initialization failed: {str(e)}")

def run_ocr(image: np.ndarray) -> List[Dict[str, Any]]:
    """
    Runs OCR on input image (numpy array).
    Returns list of dicts:
    [
       {
          "text": str,
          "confidence": float,
          "bbox": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
       },
       ...
    ]
    """
    ocr_results = []
    engine_type, engine = get_ocr_engine()

    try:
        if engine_type == "paddleocr":
            # PaddleOCR returns [[[bbox], (text, conf)], ...]
            results = engine.ocr(image, cls=True)
            if results and isinstance(results, list) and len(results) > 0 and results[0]:
                for line in results[0]:
                    bbox, (text, conf) = line
                    clean_text = str(text).strip()
                    if clean_text:
                        bbox_list = [[int(pt[0]), int(pt[1])] for pt in bbox] if isinstance(bbox, (list, np.ndarray)) else []
                        ocr_results.append({
                            "text": clean_text,
                            "confidence": float(round(float(conf), 3)),
                            "bbox": bbox_list
                        })
        else:
            # EasyOCR
            results = engine.readtext(image)
            for bbox, text, conf in results:
                clean_text = str(text).strip()
                if clean_text:
                    bbox_list = [[int(pt[0]), int(pt[1])] for pt in bbox] if isinstance(bbox, (list, np.ndarray)) else []
                    ocr_results.append({
                        "text": clean_text,
                        "confidence": float(round(float(conf), 3)),
                        "bbox": bbox_list
                    })
    except Exception as e:
        logger.error(f"OCR Error using {engine_type}: {e}")
        raise RuntimeError(f"OCR processing failed: {str(e)}")

    return ocr_results

