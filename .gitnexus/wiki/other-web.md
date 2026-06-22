# Other — web

**Module Documentation: Pannello Operativo**

**Overview**

The Pannello Operativo (Operative Panel) is a critical component of the Legal Platform, responsible for managing the workflow of documents and reviews. It provides a centralized interface for users to interact with the platform, perform various operations, and track the status of their documents.

**Purpose**

The primary purpose of the Pannello Operativo is to facilitate the efficient management of documents and reviews, ensuring that users can easily navigate through the process, access relevant information, and receive timely updates on the status of their documents.

**How it Works**

The Pannello Operativo works by connecting to various backend services, including:

1. **Document Management**: The platform's document management system provides access to a vast repository of documents, which can be searched, filtered, and retrieved.
2. **Review Queue**: The review queue service manages the workflow of reviews, ensuring that documents are properly assigned, reviewed, and updated.
3. **Token Operatore**: The token operatore service is responsible for authenticating users, generating tokens, and managing access to sensitive data.

**Key Components**

1. **Console Domanda**: A user interface component that allows users to interact with the platform, perform various operations, and track the status of their documents.
2. **Stato Ingest**: A module responsible for managing the workflow of ingest (document upload) requests, ensuring that documents are properly processed and stored.
3. **Pannello Operativo**: The main component of this module, providing a centralized interface for users to interact with the platform.

**Connections to Other Components**

The Pannello Operativo connects to various other components in the codebase, including:

1. **Document Management**: The platform's document management system provides access to a vast repository of documents.
2. **Review Queue**: The review queue service manages the workflow of reviews, ensuring that documents are properly assigned, reviewed, and updated.
3. **Token Operatore**: The token operatore service is responsible for authenticating users, generating tokens, and managing access to sensitive data.

**Mermaid Diagram**

```mermaid
graph LR
    A[Console Domanda] -->|handleOpenSource|> B[Pannello Operativo]
    B -->|tokenOperatore|> C[Token Operatore]
    B -->|safeDecode|> D[Document Management]
    B -->|parseJson|> E[Review Queue]
    C -->|get|> F[Sources]
    C -->|post|> G[API/Ask]
```

This Mermaid diagram illustrates the connections between the Pannello Operativo, Console Domanda, Token Operatore, Document Management, and Review Queue services.

**Execution Flows**

The Pannello Operativo is part of several execution flows in the codebase, including:

1. **GET → AsRecord**: A flow that retrieves a document from the platform's repository and processes it for review.
2. **GET → ReadAttribute**: A flow that retrieves a document from the platform's repository and extracts relevant attributes.
3. **GET → GazzettaUfficialeAdapter**: A flow that retrieves a document from the platform's repository and applies Gazzetta Ufficiale adapters to process the data.

**Conclusion**

The Pannello Operativo is a critical component of the Legal Platform, providing a centralized interface for users to interact with the platform, perform various operations, and track the status of their documents. Its connections to other components in the codebase ensure that it can efficiently manage the workflow of documents and reviews, ensuring a seamless user experience.