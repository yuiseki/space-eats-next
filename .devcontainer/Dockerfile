FROM ubuntu:22.04

RUN apt update && apt install -y \
    git \
    curl \
    vim \
    htop \
    jq \
    gcc \
    make \
    gdal-bin \
    python3 \
    python3-pip \
    python3-gdal \
    python3-rtree


RUN curl -Ls https://deb.nodesource.com/setup_18.x | bash
RUN apt update && apt install -y nodejs

RUN pip install --upgrade pip
RUN pip install --upgrade setuptools
RUN pip install --upgrade ipykernel

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt

RUN useradd -m user

CMD [ "sleep", "infinity" ]