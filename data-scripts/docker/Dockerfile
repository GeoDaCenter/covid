FROM python:3.8.3
WORKDIR /tmp

# Install the compilation tools
RUN apt-get update -y && \
  apt-get install -y build-essential software-properties-common zip unzip ca-certificates git -y && \
  pip install --upgrade pip && \
  apt-get update

# Install libspatialindex
RUN wget http://download.osgeo.org/libspatialindex/spatialindex-src-1.8.5.tar.gz && \
  tar -xvzf spatialindex-src-1.8.5.tar.gz && \
  cd spatialindex-src-1.8.5 && \
  ./configure && \
  make && \
  make install && \
  cd - && \
  rm -rf spatialindex-src-1.8.5* && \
  ldconfig && \
  pip install pygeoda && \
  apt-get install -y --no-install-recommends r-base && \
  apt-get install -y libudunits2-dev gfortran libgdal-dev && \
  Rscript -e "install.packages(c('dplyr', 'classInt', 'sf'))"


# Install geopandas
RUN pip install rtree geopandas pandas boto3 requests grequests pytz us lxml
RUN pip install bs4 protobuf pandas_gbq google-cloud-bigquery regex

# Move entrypoint script to container and deploy key and gbq key to ssh folder
COPY entrypoint.sh .
COPY id_rsa /root/.ssh/id_rsa
COPY gbq-credentials.json /root/.ssh/gbq-credentials.json

# Run git clone, get data, git push
ENTRYPOINT ["sh", "entrypoint.sh"]