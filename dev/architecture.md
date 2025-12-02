# Architecture
The architecture of the EHR Browser is based on ROMOPAPI for the backend and EHRBrowser for the frontend.

## ROMOPAPI

[ROMOPAPI](https://github.com/FINNGEN/ROMOPAPI) is a R package that uses [DatabaseConnector](https://github.com/OHDSI/DatabaseConnector) to connect to any OMOP-CDM, query the necessary data and servers it as an API using [plumber](https://www.rplumber.io/).

## EHRBrowser
[EHRBrowser](https://github.com/FINNGEN/EHRBrowser) is a React application that provides the frontend for the EHR Browser.
It is used to display the data in the browser.