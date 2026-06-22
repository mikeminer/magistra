# Other — decisions

**Other — decisions**

## Overview
The `decisions` module is responsible for defining and managing the project's baseline stack, which includes choices on technologies, databases, and infrastructure. This document provides an overview of the module's purpose, how it works, its key components, and how it connects to the rest of the codebase.

### Purpose

The primary goal of this module is to provide a solid foundation for the project by selecting a set of technologies that can support ingest of legal sources, vector search, orchestration of RAG (Research and Analysis Group) tasks, and distribution with autonomous hosting. The baseline stack should be flexible enough to accommodate changes without requiring significant rework.

### How it Works

The `decisions` module uses a simple decision-making process:

1. Define the project's requirements and constraints.
2. Evaluate existing technologies and choose the best fit for each component (e.g., frontend, API, database).
3. Document the chosen baseline stack and its implications.

## Key Components

### Frontend

* **Next.js**: Used for the interface, providing a robust and scalable foundation for the frontend.
* **TypeScript**: Utilized as the primary programming language for the frontend, ensuring maintainability and scalability.

### API and Services

* **Node.js**: Employed as the runtime environment for the API and services, leveraging its performance and flexibility.
* **TypeScript**: Also used for the API and services, maintaining consistency with the frontend.

### Database

* **PostgreSQL**: Chosen as the primary database, providing a robust and scalable solution for structured data storage and vector search.
* **pgvector**: Utilized to enhance search capabilities and improve query performance.

### Storage

* **MinIO** (or compatible S3 service): Selected as the object storage solution, offering high-performance and scalability.

### Infrastructure

* **Docker Compose**: Used to manage local development environments with autonomous hosting, ensuring flexibility and portability.

### Embedding and LLM Integration

* **Interfacce sostituibili**: Designed to accommodate interchangeable interfaces for third-party LLM (Large Language Model) services and embedding libraries.

## Connection to the Codebase

The `decisions` module connects to other parts of the codebase through:

* **API routes**: The API and services components interact with the frontend, using Next.js as the interface.
* **Database queries**: The database component is used by various parts of the application, including the API and services.

## Call Graph & Execution Flows

The `decisions` module has no outgoing or incoming calls. Its execution flows are not explicitly defined, as it primarily serves as a configuration file for the baseline stack.

```mermaid
graph LR
    style decision-making process fill:#f9f,stroke:#333,stroke-width:2px;
    decision-making process -->|Define project requirements|-->|Evaluate technologies|
    decision-making process -->|Choose best fit|-->|Document baseline stack|
    
    style Next.js fill:#f9f,stroke:#333,stroke-width:2px;
    Next.js -->|Interface|-->|Frontend API|
    style Node.js fill:#f9f,stroke:#333,stroke-width:2px;
    Node.js -->|API and services|-->|Database queries|
    
    style PostgreSQL fill:#f9f,stroke:#333,stroke-width:2px;
    PostgreSQL -->|Structured data storage|-->|Vector search|
    style MinIO fill:#f9f,stroke:#333,stroke-width:2px;
    MinIO -->|Object storage|-->|Autonomous hosting|
```

This Mermaid diagram illustrates the high-level connections between the `decisions` module and other components in the codebase.