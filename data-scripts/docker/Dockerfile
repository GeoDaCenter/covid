FROM python:3.8.3
WORKDIR /tmp

# Install the compilation tools
RUN apt-get update -y && \
  apt-get install build-essential ca-certificates git -y && \
  pip install --upgrade pip

# Install libspatialindex
RUN wget http://download.osgeo.org/libspatialindex/spatialindex-src-1.8.5.tar.gz && \
  tar -xvzf spatialindex-src-1.8.5.tar.gz && \
  cd spatialindex-src-1.8.5 && \
  ./configure && \
  make && \
  make install && \
  cd - && \
  rm -rf spatialindex-src-1.8.5* && \
  ldconfig

# Install geopandas
RUN pip install rtree geopandas pandas requests

# Move entrypoint script to container and deploy key to ssh folder
COPY entrypoint.sh .
COPY id_rsa /root/.ssh/id_rsa

# Run git clone, get data, git push
CMD "./entrypoint.sh"
