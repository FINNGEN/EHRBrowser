FROM --platform=linux/amd64  rocker/r-ver:4.4.1
RUN /rocker_scripts/setup_R.sh https://packagemanager.posit.co/cran/__linux__/jammy/2025-06-12

# install OS dependencies including java, python 3, node.js, and nginx
RUN apt-get update && apt-get install -y openjdk-8-jdk liblzma-dev libbz2-dev libncurses5-dev curl python3-dev python3.venv git pandoc nginx\
    # rjava
    libssl-dev libcurl4-openssl-dev  libpcre2-dev libicu-dev \
    # xml2
    libxml2-dev \
    # sodium
    libsodium-dev\
    # systemfonts
    libfontconfig1-dev \
    # textshaping
    libharfbuzz-dev libfribidi-dev\
    #ragg
    libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev\
    # inotify for pre_init.sh
    inotify-tools\
    # node.js
    ca-certificates gnupg \
&& R CMD javareconf \
&& rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN mkdir -p /etc/apt/keyrings \
&& curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
&& echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
&& apt-get update \
&& apt-get install -y nodejs \
&& rm -rf /var/lib/apt/lists/*

# Install renv and restore packages
RUN --mount=type=secret,id=build_github_pat \
    cp /usr/local/lib/R/etc/Renviron /tmp/Renviron \
    && echo "GITHUB_PAT=$(cat /run/secrets/build_github_pat)" >> /usr/local/lib/R/etc/Renviron \
    && Rscript -e 'install.packages("remotes")' \
    && Rscript -e 'remotes::install_github("FINNGEN/ROMOPAPI")' \
    && cp /tmp/Renviron /usr/local/lib/R/etc/Renviron;

# Copy the romopapi folder into the container
COPY romopapi /romopapi
ENV ROMOPAPI_DATABASE=OnlyCounts-FinnGen

# Copy the React application
COPY node_modules /app/node_modules
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY public /app/public
COPY src /app/src
WORKDIR /app

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Update the romopapi package
# Add cache bust to ensure latest ROMOPAPI is installed
ARG CACHE_BUST=4
RUN --mount=type=secret,id=build_github_pat \
    cp /usr/local/lib/R/etc/Renviron /tmp/Renviron \
    && echo "GITHUB_PAT=$(cat /run/secrets/build_github_pat)" >> /usr/local/lib/R/etc/Renviron \
    && Rscript -e 'remotes::install_github("FINNGEN/ROMOPAPI");remotes::install_github("javier-gracia-tabuenca-tuni/DatabaseConnector@bigquery-DBI-2");install.packages("bigrquery")' \
    && cp /tmp/Renviron /usr/local/lib/R/etc/Renviron;

# Expose only the main port (nginx will handle internal routing)
EXPOSE 8563

# Install npm dependencies and build the React app
ENV REACT_APP_API_BASE_URL=/api/
RUN npm install
RUN npm run build


# Run both the APIb & Rscript -e \"source('/romopapi/runOmopApi.R')\""] 
# CMD ["sh", "-c", "Rscript -e \"source('/romopapi/runOmopApi.R')\" & python3 -m http.server 8563 --directory build"]
# Run both the R API service and nginx reverse proxy
CMD ["sh", "-c", "Rscript -e \"source('/romopapi/runOmopApi.R')\" & nginx -g 'daemon off;'"]
