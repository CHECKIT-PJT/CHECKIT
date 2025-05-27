import logging
from logging.handlers import RotatingFileHandler
import os
import sys

# UTF-8 인코딩 (Windows 대응)
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding="utf-8")

os.makedirs("logs", exist_ok=True)
LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG").upper()

def setup_logger():
    logger = logging.getLogger("app_logger")  # ⚠️ Uvicorn 로거와 분리
    logger.setLevel(LOG_LEVEL)
    logger.propagate = False  # 중복 출력 방지

    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )

    # 콘솔
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 파일
    file_handler = RotatingFileHandler("logs/app.log", maxBytes=10_000_000, backupCount=5, encoding="utf-8")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

logger = setup_logger()
