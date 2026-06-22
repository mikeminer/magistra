# CorpusNormattiva

**CorpusNormattiva Module Documentation**

**Overview**
------------

The CorpusNormattiva module is responsible for storing and archiving documents related to normative sources in a corpus. It provides two storage options: file system-based and Amazon S3-based, allowing users to choose the most suitable option for their needs.

**Purpose**
----------

The primary purpose of this module is to provide a standardized way of storing and managing normative source documents, ensuring that they are properly archived and easily accessible for future reference.

**How it Works**
----------------

The CorpusNormattiva module consists of several key components:

1.  **Storage Options**: The module provides two storage options: `FileSystemObjectStorage` and `S3ObjectStorage`. These classes handle the actual storage of documents, ensuring that they are properly archived and retrievable.
2.  **ArchiviazioneOggetti Interface**: This interface defines a contract for archiving objects, which is implemented by both storage classes. It provides methods for saving artifacts (documents) to storage.
3.  **creaArchiviazioneOggettiDaEnv Function**: This function creates an instance of the chosen storage class based on the environment variables set in the `process.env` object.

**Key Components**
-----------------

### Storage Classes

#### FileSystemObjectStorage

*   **Description**: This class provides a file system-based storage option. It stores documents in a directory structure defined by the user.
*   **Methods**:
    *   `salvaArtefatto(input)`: Saves an artifact (document) to storage.

#### S3ObjectStorage

*   **Description**: This class provides an Amazon S3-based storage option. It uses the AWS SDK to store documents in an S3 bucket.
*   **Methods**:
    *   `salvaArtefatto(input)`: Saves an artifact (document) to S3.

### ArchiviazioneOggetti Interface

This interface defines a contract for archiving objects, which is implemented by both storage classes. It provides methods for saving artifacts (documents) to storage.

**Connection to the Rest of the Codebase**
-----------------------------------------

The CorpusNormattiva module connects to other parts of the codebase through various APIs and functions:

*   **salvaDocumentoUtente**: This function saves a user document to storage, which in turn calls `creaArchiviazioneOggettiDaEnv` to determine the storage class.
*   **eseguiIngestNormattivaLocale**: This function executes the ingestion process for normative sources, which includes calling `archiviaFontiCorpus`.
*   **ingest.test.ts**: This test file tests the functionality of the CorpusNormattiva module.

**Mermaid Diagram: Storage Flow**
---------------------------------

```mermaid
graph LR
    A[POST (api/documents/route.ts)] -->|salvaDocumentoUtente|> B[creaArchiviazioneOggettiDaEnv]
    B -->|S3ObjectStorage|> C[S3ObjectStorage]
    C -->|salvaArtefatto|> D[PutObjectCommand]
    D -->|s3://${bucket}/${input.chiave}|> E[s3://bucket/input.chiave]
    B -->|FileSystemObjectStorage|> F[FileSystemObjectStorage]
    F -->|salvaArtefatto|> G[writeFile]
    G -->|file://{percorso.replaceAll("\\", "/")}|> H[file:///percorso]
```

This Mermaid diagram illustrates the storage flow, showing how `creaArchiviazioneOggettiDaEnv` determines the storage class and then calls the corresponding method to save the artifact (document) to storage.