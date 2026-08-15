import cv2
import numpy as np
from PIL import Image, ImageOps
import io

def process_image(image_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    """
    Process image for optimal OCR extraction.
    Returns: (processed_image, original_rgb_image)
    """
    # Load using PIL first to handle EXIF orientation properly
    pil_image = Image.open(io.BytesIO(image_bytes))
    try:
        pil_image = ImageOps.exif_transpose(pil_image)
    except Exception:
        pass

    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")

    original_rgb = np.array(pil_image)
    
    # Convert to BGR for OpenCV
    bgr_img = cv2.cvtColor(original_rgb, cv2.COLOR_RGB2BGR)
    
    h, w = bgr_img.shape[:2]
    max_dim = 2400
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        new_w, new_h = int(w * scale), int(h * scale)
        bgr_img = cv2.resize(bgr_img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Preprocessing pipeline
    # 1. Grayscale
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    
    # 2. Contrast Enhancement (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    
    # 3. Subtle Denoising
    denoised = cv2.fastNlMeansDenoising(enhanced, None, h=10, templateWindowSize=7, searchWindowSize=21)
    
    # 4. Sharpening
    kernel = np.array([[0, -0.5, 0], [-0.5, 3, -0.5], [0, -0.5, 0]], dtype=np.float32)
    sharpened = cv2.filter2D(denoised, -1, kernel)
    
    # Return both sharpened grayscale/enhanced image and original RGB array
    return sharpened, original_rgb
