# Other — package.json

**Package.json Module Documentation**

## Overview

The `package.json` file is the primary configuration file for the Italian Oss Legal Platform project. It contains metadata about the project, such as its name, version, and dependencies.

## Purpose

The purpose of this module is to serve as a central hub for managing project dependencies, scripts, and configurations. It provides a way to define how the project should be built, tested, and executed.

## How it Works

When the `package.json` file is loaded, npm (Node Package Manager) uses its contents to determine which packages to install, build, or run. The module's scripts are executed using the `npm run` command, which allows developers to automate tasks such as building, testing, and deploying the project.

## Key Components

* **name**: The name of the project.
* **version**: The version number of the project.
* **private**: A flag indicating whether the project is private or not.
* **description**: A brief description of the project.
* **license**: The license under which the project is released.
* **workspaces**: An array of workspace directories to include in the build process.
* **scripts**: An object containing scripts that can be executed using `npm run`.
* **devDependencies**: An object containing dependencies required for development.
* **engines**: An object specifying minimum versions for Node.js and npm.

## Scripts

The following scripts are defined in the `package.json` file:

| Script | Description |
| --- | --- |
| build | Builds the project using `npm run build --workspaces --if-present`. |
| check | Runs a series of checks, including documentation validation, type checking, testing, and building. |
| check:docs | Validates documentation using the `python scripts/check_docs.py` script. |
| dev | Starts the development server using `npm --workspace @italian-oss-legal-platform/web run dev`. |
| evaluate | Runs tests for evaluation using `npm --workspace @italian-oss-legal-platform/evaluation run test`. |
| ingest:esempio | Ingests an example into the system using `npm --workspace @italian-oss-legal-platform/ingest run ingest:esempio --`. |
| test | Runs tests for the project using `npm run test --workspaces --if-present`. |
| typecheck | Runs type checking using `npm run typecheck --workspaces --if-present`. |
| worker:ingest | Ingests data into the system using `npm --workspace @italian-oss-legal-platform/worker run ingest:once`. |
| worker:migrate | Migrates data in the system using `npm --workspace @italian-oss-legal-platform/worker run migrate`. |
| worker:schedule | Schedules tasks for the worker using `npm --workspace @italian-oss-legal-platform/worker run schedule`. |
| worker:status | Displays the status of the worker using `npm --workspace @italian-oss-legal-platform/worker run status`. |

## Connection to the Rest of the Codebase

The `package.json` file is used by various parts of the codebase, including:

* The build process, which uses scripts defined in this file.
* The testing framework, which uses scripts defined in this file.
* The worker module, which uses scripts defined in this file.

## Mermaid Diagram: Package.json Module Architecture

```mermaid
graph LR
    style package.json fill:#f9f,stroke:#333,stroke-width:2px
    package.json["Package.json"]
    package.json-->|Build|>npm run build
    package.json-->|Check|>npm run check
    package.json-->|Test|>npm run test
    package.json-->|Type Check|>npm run typecheck
    package.json-->|Dev|>npm --workspace @italian-oss-legal-platform/web run dev
    package.json-->|Evaluate|>npm --workspace @italian-oss-legal-platform/evaluation run test
    package.json-->|Ingest:esempio|>npm --workspace @italian-oss-legal-platform/ingest run ingest:esempio --
    package.json-->|Worker:ingest|>npm --workspace @italian-oss-legal-platform/worker run ingest:once
    package.json-->|Worker:migrate|>npm --workspace @italian-oss-legal-platform/worker run migrate
    package.json-->|Worker:schedule|>npm --workspace @italian-oss-legal-platform/worker run schedule
    package.json-->|Worker:status|>npm --workspace @italian-oss-legal-platform/worker run status
```