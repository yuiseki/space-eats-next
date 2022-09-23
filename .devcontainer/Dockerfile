FROM ubuntu:22.04

RUN apt update && apt install -y \
    git \
    curl \
    vim \
    htop \
    jq \
    sqlite3 \
    gcc \
    make \
    build-essential \
    libsqlite3-dev \
    zlib1g-dev \
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

RUN useradd -m user

USER root
ARG NONROOT_USER=user
RUN curl -fsSL https://get.docker.com | sh
RUN echo "#!/bin/sh\n\
    sudoIf() { if [ \"\$(id -u)\" -ne 0 ]; then sudo \"\$@\"; else \"\$@\"; fi }\n\
    SOCKET_GID=\$(stat -c '%g' /var/run/docker.sock) \n\
    if [ \"${SOCKET_GID}\" != '0' ]; then\n\
        if [ \"\$(cat /etc/group | grep :\${SOCKET_GID}:)\" = '' ]; then sudoIf groupadd --gid \${SOCKET_GID} docker-host; fi \n\
        if [ \"\$(id ${NONROOT_USER} | grep -E \"groups=.*(=|,)\${SOCKET_GID}\(\")\" = '' ]; then sudoIf usermod -aG \${SOCKET_GID} ${NONROOT_USER}; fi\n\
    fi\n\
    exec \"\$@\"" > /usr/local/share/docker-init.sh \
    && chmod +x /usr/local/share/docker-init.sh

RUN git clone --depth 1 https://github.com/mapbox/tippecanoe.git && \
    cd tippecanoe && make -j$(nproc) LDFLAGS="-latomic" && make install && cd .. && \
    rm -rf tippecanoe

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt

ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
CMD [ "sleep", "infinity" ]