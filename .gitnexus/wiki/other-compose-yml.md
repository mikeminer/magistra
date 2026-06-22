# Other — compose.yml

**Other - compose.yml**
========================

Table of Contents
-----------------

1. [Overview](#overview)
2. [Purpose](#purpose)
3. [How it Works](#how-it-works)
4. [Key Components](#key-components)
5. [Connections to the Rest of the Codebase](#connections-to-the-rest-of-the-codebase)

### Overview

The `compose.yml` module is responsible for defining and managing the services that make up the Italian OSS Legal Platform application. It orchestrates the deployment, configuration, and interaction between various components, including the API, app, worker, and minio services.

### Purpose

The primary purpose of this module is to provide a unified way of managing the dependencies and interactions between different services in the application. By defining the services and their relationships in a single file, it simplifies the process of deploying and maintaining the application.

### How it Works

The `compose.yml` module uses Docker Compose to define and manage the services. Here's a high-level overview of how it works:

1. **Service Definition**: The module defines each service (e.g., API, app, worker, minio) using a YAML file that specifies its image, ports, environment variables, and other configuration settings.
2. **Dependency Management**: The module manages the dependencies between services by specifying which services depend on others. For example, the `app` service depends on the `api` service to function correctly.
3. **Service Start-up**: When the application is started, Docker Compose starts each service according to its definition in the `compose.yml` file.
4. **Health Checks**: The module defines health checks for each service to ensure they are running correctly.

### Key Components

The following services are defined in this module:

*   **API Service**: Handles incoming requests and provides data to the app service.
*   **App Service**: Provides a user interface for the application and interacts with the API service.
*   **Worker Service**: Responsible for ingesting data from the database and performing other tasks.
*   **Minio Service**: Provides object storage for the application.

### Connections to the Rest of the Codebase

The `compose.yml` module connects to the rest of the codebase through the following relationships:

*   The `app` service depends on the `api` service, which means it will only start if the API is healthy.
*   The `worker` service depends on the `postgres` service, which means it will only start if the database is healthy.
*   The `minio-init` service depends on the `minio` service, which means it will only start if the minio service is healthy.

**Service Relationships Diagram**
```mermaid
graph LR
    style app fill:#f9f,stroke:#333,stroke-width:3px;
    style api fill:#f9f,stroke:#333,stroke-width:3px;
    style worker fill:#f9f,stroke:#333,stroke-width:3px;
    style minio fill:#f9f,stroke:#333,stroke-width:3px;
    style postgres fill:#f9f,stroke:#333,stroke-width:3px;

    api --> app
    app --> worker
    worker --> postgres
    minio --> minio-init

    label "Depends on" as "Depends On"
    label "Health Check" as "Health Check"

    style dependsOn fill:#ccc,stroke:#333,stroke-width:3px;
    style healthCheck fill:#ccc,stroke:#333,stroke-width:3px;

    api[dependsOn] --> app[healthCheck]
    app[dependsOn] --> worker[healthCheck]
    worker[dependsOn] --> postgres[healthCheck]
    minio-init[dependsOn] --> minio[healthCheck]

    label "Service Start-up" as "Starts Up"
    style startsUp fill:#ccc,stroke:#333,stroke-width:3px;

    api[startsUp]
    app[startsUp]
    worker[startsUp]
    minio-init[startsUp]
    minio[startsUp]
    postgres[startsUp]

    label "Health Check Interval" as "Interval"
    style interval fill:#ccc,stroke:#333,stroke-width:3px;

    api[interval] --> app[interval]
    app[interval] --> worker[interval]
    worker[interval] --> postgres[interval]
    minio-init[interval] --> minio[interval]

    label "Timeout" as "Timeout"
    style timeout fill:#ccc,stroke:#333,stroke-width:3px;

    api[timeout] --> app[timeout]
    app[timeout] --> worker[timeout]
    worker[timeout] --> postgres[timeout]
    minio-init[timeout] --> minio[timeout]

    label "Retries" as "Retries"
    style retries fill:#ccc,stroke:#333,stroke-width:3px;

    api[retries] --> app[retries]
    app[retries] --> worker[retries]
    worker[retries] --> postgres[retries]
    minio-init[retries] --> minio[retries]

```
This diagram illustrates the relationships between services, including dependencies, health checks, and start-up behavior.