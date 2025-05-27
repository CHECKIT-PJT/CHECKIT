# ⚠️ NVIDIA GPU 지원 Docker 베이스 이미지
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# 기본 설정
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# 필수 패키지 설치
RUN apt update && apt install -y \
    python3 python3-pip git curl unzip vim \
    pkg-config default-libmysqlclient-dev \
    && apt clean

# pip 업그레이드
RUN python3 -m pip install --upgrade pip

# PyTorch 설치 (cu118)
#RUN pip install torch==2.1.2+cu118 torchvision==0.16.2+cu118 torchaudio==2.1.2+cu118 \
# -f https://download.pytorch.org/whl/torch_stable.html

# requirements.txt 복사 및 설치
COPY requirements.txt .
RUN pip install -r requirements.txt

# 소스 복사
COPY . .

# 포트 열기
EXPOSE 8000

# FastAPI 서버 실행 명령어
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
