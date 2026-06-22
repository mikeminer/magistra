# Database

**Database Module Documentation**

**Overview**

The Database module is responsible for managing data storage and retrieval in the application. It provides a layer of abstraction between the business logic and the underlying database, allowing for easier maintenance and scalability.

**Purpose**

The primary purpose of the Database module is to provide a unified interface for interacting with various databases, including document stores, relational databases, and NoSQL databases. This allows developers to focus on writing business logic without worrying about the underlying data storage mechanisms.

**How it Works**

The Database module consists of several key components:

1. **Database Abstraction Layer (DAL)**: The DAL provides a unified interface for interacting with different databases. It encapsulates the database-specific details, such as connection pooling, query execution, and data serialization.
2. **Repository Pattern**: The Repository pattern is used to abstract the data access logic from the business logic layer. This allows for easier testing, maintenance, and scalability.
3. **Query Builder**: The Query Builder provides a way to construct SQL queries or other database-specific queries in a type-safe manner.

**Key Components**

1. **PostgresIngestJobRepository**: Responsible for managing ingest jobs, including starting, stopping, and completing them.
2. **PostgresLegalRepository**: Responsible for managing legal documents, including inserting, updating, and retrieving them.
3. **PostgresReviewRepository**: Responsible for managing review data, including inserting, updating, and retrieving it.
4. **PostgresDocumentRepository**: Responsible for managing document data, including inserting, updating, and retrieving it.

**Connection to the Rest of the Codebase**

The Database module connects to other parts of the codebase through various interfaces:

1. **Ingest API**: The Ingest API provides a way to start ingest jobs, which are managed by the PostgresIngestJobRepository.
2. **Legal API**: The Legal API provides a way to manage legal documents, which are stored in the PostgresLegalRepository.
3. **Review API**: The Review API provides a way to manage review data, which is stored in the PostgresReviewRepository.
4. **Document API**: The Document API provides a way to manage document data, which is stored in the PostgresDocumentRepository.

**Mermaid Diagram**

```mermaid
graph LR
    A[Ingest API] -->|start ingest job|> B(PostgresIngestJobRepository)
    B -->|complete ingest job|> C(Ingest status page)
    A -->|insert document|> D(PostgresDocumentRepository)
    D -->|update document|> E(PostgresDocumentRepository)
    A -->|retrieve document|> F(PostgresDocumentRepository)
    G[Legal API] -->|insert legal document|> H(PostgresLegalRepository)
    H -->|update legal document|> I(PostgresLegalRepository)
    G -->|retrieve legal document|> J(PostgresLegalRepository)
    K[Review API] -->|insert review data|> L(PostgresReviewRepository)
    L -->|update review data|> M(PostgresReviewRepository)
    K -->|retrieve review data|> N(PostgresReviewRepository)
```

This diagram shows the connections between the Ingest API, PostgresIngestJobRepository, and other parts of the codebase. It also highlights the relationships between different repositories and APIs.

**API Documentation**

The Database module provides several APIs for interacting with the databases:

1. **PostgresIngestJobRepository**: Provides methods for starting, stopping, and completing ingest jobs.
2. **PostgresLegalRepository**: Provides methods for inserting, updating, and retrieving legal documents.
3. **PostgresReviewRepository**: Provides methods for inserting, updating, and retrieving review data.
4. **PostgresDocumentRepository**: Provides methods for inserting, updating, and retrieving document data.

Each API has a detailed documentation page that describes the available methods, parameters, and return values.