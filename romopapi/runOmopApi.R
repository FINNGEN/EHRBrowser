# get database from environment variable
database <- Sys.getenv("ROMOPAPI_DATABASE")
host <- "0.0.0.0"
port <- 8564

# check is one of the following databases
if (!(database %in% c("OnlyCounts-FinnGen", "AtlasDevelopment-BQ5K", "AtlasDevelopment-BQ", "Sandbox-LATEST", "Sandbox-DEV"))) {
    stop("ROMOPAPI_DATABASE must be one of: OnlyCounts-FinnGen, AtlasDevelopment-BQ5K, AtlasDevelopment-BQ, Sandbox-LATEST, Sandbox-DEV")
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

    if (database == "AtlasDevelopment-BQ5K") {
        cohortTableHandlerConfig <- databasesConfig$BQ5K$cohortTableHandler
    } else if (database == "AtlasDevelopment-BQ") {
        cohortTableHandlerConfig <- databasesConfig$BQ$cohortTableHandler
    }
}

if (database |> stringr::str_starts("Sandbox")) {
    message("Running Sandbox-LATEST API")


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
        sandboxProject = Sys.getenv("SANDBOX_PROJECT")
    )

    if (database == "Sandbox-LATEST") {
        cohortTableHandlerConfig <- databasesConfig$LATEST$cohortTableHandler
    } else if (database == "Sandbox-DEV") {
        cohortTableHandlerConfig <- databasesConfig$DEV$cohortTableHandler
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

visitSourceGroupConceptIds = c(
    # longitudinal
    2002330246, # INPAT
    2002330247, # OPER_IN
    2002330248, # OPER_OUT
    2002330249, # OUTPAT
    2002330250, # PRIM_OUT
    2002330102, # REIM
    2002330104, # DEATH
    2002330101, # PURCH
    2002330103, # CANC
    # registers
    2002330245, # KANTA
    2002330106, # BIOBANK
    2002330186, # KIDNEY
    2002330119, # VISION
    2002330105, # BIRTH_MOTHER
    # Drugs
    2002330251, # PRESCRIPTION
    2002330252, # DELIVERY
    2002330253, # PRESCRIPTION_DELIVERY
    2002330254, # DELIVERY_KELA
    2002330255 # PRESCRIPTION_DELIVERY_KELA
)

# run the api server
ROMOPAPI::runApiServer(
    host = host, 
    port = port, 
    cohortTableHandlerConfig = cohortTableHandlerConfig,
    buildCountsTable = buildCountsTable, 
    visitSourceGroupConceptIds = visitSourceGroupConceptIds
)
