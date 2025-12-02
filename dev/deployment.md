
# Configuration 

At the moment this repo is the one we use in Finngen. 
All the configuration is set for our own databases.
However, the configuration is designed to be flexible and can be adapted to other databases.

Only `romopapi/databasesConfig.yml`, `Dockerfile` and `romopapi/runOmopApi.R` need to be change. 


1. Fork the repository or clone it locally.

2. Edit `romopapi/databasesConfig.yml`. This file allows to have more than one database configured and also change parameters on run time. 
However, the simplest way is to just have a single database configured. Follow [DatabaseConnector::createConnectionDetails](https://ohdsi.github.io/DatabaseConnector/reference/createConnectionDetails.html) for the connection details.

Replace current file with your configuration.

```yaml
your_database_id:
  cohortTableHandler:
    database:
      databaseId: your_database_id
      databaseName: your_database_name
      databaseDescription: your database description
    connection:
      connectionDetailsSettings: # Same parameters that go into the DatabaseConnector::createConnectionDetails function, for example:
          dbms: postgresql
          user: your_user
          password: your_password
          port: your_port
          pathToDriver: /drivers
      tempEmulationSchema: temporary_schema_name
    cdm:
        cdmDatabaseSchema: your_schema.your_cdm_schema
        vocabularyDatabaseSchema: your_schema.your_vocabulary_schema
        resultsDatabaseSchema: your_schema.your_results_schema
```

3. Only if your database needs drivers, edit `Dockerfile`. Uncomment the line to install the drivers for your database.
   
```Dockerfile
# Install the drivers for the database, Uncomment to install the drivers for your database
ENV DATABASECONNECTOR_JAR_FOLDER=/drivers
RUN Rscript -e 'DatabaseConnector::downloadJdbcDrivers(dbms = "your_database_type")'
```

4. Edit `romopapi/runOmopApi.R`. This file is the entry point for the API. It is used to run the API and to build the counts table.
  
```R
host <- "0.0.0.0"
port <- 8564

databasesConfig <- .readAndParseYalm(
        pathToYalmFile = file.path("/romopapi/databasesConfig.yml")
    )

cohortTableHandlerConfig <- databasesConfig$your_database_id$cohortTableHandler
buildCountsTable <- Sys.getenv("REBUILD_COUNTS_TABLE")

# run the api server
ROMOPAPI::runApiServer(
    host = host, 
    port = port, 
    cohortTableHandlerConfig = cohortTableHandlerConfig,
    buildCountsTable = buildCountsTable
)
```

5. In order to work there need to be 2 tables in the `resultsDatabaseSchema`: `cohort_counts` and `stratified_cohort_counts`.
The easies way to create this in on run time durint the first run, see Run below.

# Build

Build the Docker image.
```
docker build -t ehr_browser .
```

# Run
Run the Docker container.

If it is the first time running, set the flag to TRUE to rebuild the counts table.
```
docker run --rm -p 8563:8563 -p 8564:8564 -e REBUILD_COUNTS_TABLE=TRUE ehr_browser
```

The rest of the times set the flag to FALSE.
```
docker run --rm -p 8563:8563 -p 8564:8564 -e REBUILD_COUNTS_TABLE=FALSE ehr_browser
```

Open the browser.
http://localhost:8564/

For debugging, you can also talk to the API directly in:
http://localhost:8563/__docs__
















































# Run Docker

## FinnGen Eunomia

```
docker run --rm -p 8563:8563 -p 8564:8564 -e ROMOPAPI_DATABASE=Eunomia-Finngen ehr_browser 
```

## Atlas Development

```
docker run --rm  -p 8564:8564 -p 8563:8563 -e ROMOPAPI_DATABASE=AtlasDevelopment-BQ5k -e GCP_SERVICE_KEY=/keys/atlas-development-270609-410deaacc58b.json -v /Users/javier/keys:/keys ehr_browser
```
```
docker run --rm  -p 8564:8564 -p 8563:8563 -e ROMOPAPI_DATABASE=AtlasDevelopment-BQ500k -e GCP_SERVICE_KEY=/keys/atlas-development-270609-410deaacc58b.json -v /Users/javier/keys:/keys -e REBUILD_COUNTS_TABLE=TRUE ehr_browser
```

## Sandbox DF13

```
docker pull eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser
```

```
docker run --rm -p 8563:8563 -p 8564:8564 -e ROMOPAPI_DATABASE=Sandbox-DF13 -e SANDBOX_PROJECT="$SANDBOX_PROJECT" -e SESSION_MANAGER="$SESSION_MANAGER" ehr_browser 
```

Optionally add the flag `-e REBUILD_COUNTS_TABLE=TRUE` to rebuild the counts table

for example:
```
docker run --rm -p 8563:8563 -p 8564:8564 -e ROMOPAPI_DATABASE=Sandbox-DF13 -e SANDBOX_PROJECT="$SANDBOX_PROJECT" -e SESSION_MANAGER="$SESSION_MANAGER" -e REBUILD_COUNTS_TABLE=TRUE  eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser:dev 
```

Browser:
http://localhost:8563/?conceptIds=<conceptId>



# deploy demo to Google Cloud Run

gcloud services enable artifactregistry.googleapis.com

gcloud artifacts repositories create ehr-browser-repo \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker repo for EHR Browser"

# push to Google Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev
docker tag ehr_browser europe-west1-docker.pkg.dev/atlas-development-270609/ehr-browser-repo/ehr_browser:latest
docker push europe-west1-docker.pkg.dev/atlas-development-270609/ehr-browser-repo/ehr_browser:latest


gcloud run deploy ehr-browser-demo \
  --image europe-west1-docker.pkg.dev/atlas-development-270609/ehr-browser-repo/ehr_browser:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated\
  --port 8563


https://ehr-browser-demo-xxxxxx-uc.a.run.app


gcloud run services list --region europe-west1


gcloud logs read "projects/atlas-development-270609/logs/run.googleapis.com%2Frequests" \
  --region europe-west1 \
  --limit 50

  gcloud run services delete your-service \
  --region europe-west1
