# get database from environment variable
database <- Sys.getenv("ROMOPAPI_DATABASE")
host <- "0.0.0.0"
port <- 8563

# check is one of the following databases
if (!(database %in% c("OnlyCounts-FinnGen", "AtlasDevelopment-BQ5k", "AtlasDevelopment-BQ500k", "Sandbox-DF13", "Sandbox-DF13test"))) {
    stop("ROMOPAPI_DATABASE must be one of: OnlyCounts-FinnGen, AtlasDevelopment-BQ5K, AtlasDevelopment-BQ500k, Sandbox-DF13, Sandbox-DF13test")
}

# Create the cohortTableHandlerConfig based on the database
if (database == "OnlyCounts-FinnGen") {
    message("Running OnlyCounts-FinnGen API")
    cohortTableHandlerConfig <- NULL
}

if (database |> stringr::str_detect("AtlasDevelopment")) {
    message("Running Atlas Development API")

    if (Sys.getenv("GCP_SERVICE_KEY") == "") {
        message("GCP_SERVICE_KEY not set. Please set this environment variable to the path of the GCP service key.")
        stop()
    }

    bigrquery::bq_auth(path = Sys.getenv("GCP_SERVICE_KEY"))

    databasesConfig <- yaml::read_yaml("/romopapi/databasesConfig.yml")

    if (database == "AtlasDevelopment-BQ5k") {
        cohortTableHandlerConfig <- databasesConfig$BQ5k$cohortTableHandler
    } else if (database == "AtlasDevelopment-BQ500k") {
        cohortTableHandlerConfig <- databasesConfig$BQ500k$cohortTableHandler
    }
}

if (database |> stringr::str_starts("Sandbox-DF13")) {
    message("Running Sandbox-DF13 API")


    if (Sys.getenv("SANDBOX_PROJECT") == "") {
        message("SANDBOX_PROJECT not set. Please set this environment variable to the sandbox project id.")
        stop()
    }

    if (Sys.getenv("SESSION_MANAGER") == "") {
        message("SESSION_MANAGER not set. Please set this environment variable to the session manager id.")
        stop()
    }

    .readAndParseYalm <- function(pathToYalmFile, ...) {
        yalmString <- paste(readLines(pathToYalmFile), collapse = "\n")
        args <- list(...)
        argsNames <- names(args)
        missingParams <- argsNames[!sapply(argsNames, function(name) {
            any(grepl(paste0(
                "<",
                name, ">"
            ), yalmString))
        })]
        if (length(missingParams) > 0) {
            stop(paste(
                "Error: The following placeholders were not found in the YAML file:",
                paste(missingParams, collapse = ", ")
            ))
        }
        for (name in argsNames) {
            yalmString <- gsub(
                paste0("<", name, ">"), args[[name]],
                yalmString
            )
        }
        yalmFile <- yaml::yaml.load(yalmString)
        return(yalmFile)
    }

    databasesConfig <- .readAndParseYalm(
        pathToYalmFile = file.path("/romopapi/databasesConfig.yml"),
        sandboxProject = Sys.getenv("SANDBOX_PROJECT"),
        sessionManager = stringr::str_extract(Sys.getenv("SESSION_MANAGER"), "ivm-[0-9]+") |> stringr::str_remove("ivm-")
    )

    if (database == "Sandbox-DF13") {
        cohortTableHandlerConfig <- databasesConfig$DF13$cohortTableHandler
    } else if (database == "Sandbox-DF13test") {
        cohortTableHandlerConfig <- databasesConfig$DF13test$cohortTableHandler
    }
}

# rebuild the counts table if the flag is set
if (Sys.getenv("REBUILD_COUNTS_TABLE") != "TRUE") {
    message("REBUILD_COUNTS_TABLE not set to TRUE. Skipping counts table rebuild.")
    buildCountsTable <- FALSE
} else {
    message("Rebuilding counts table...")
    buildCountsTable <- TRUE
}

# run the api server
ROMOPAPI::runApiServer(
    host = host, 
    port = port, 
    cohortTableHandlerConfig = cohortTableHandlerConfig,
    buildCountsTable = buildCountsTable
)
