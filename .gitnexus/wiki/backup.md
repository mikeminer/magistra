# Backup

**Backup Module Documentation**

**Overview**
------------

The Backup module is responsible for creating backups of critical data stores, including Minio and PostgreSQL databases. It provides a simple and efficient way to automate backup processes, ensuring data integrity and availability.

**Purpose**
----------

The primary purpose of the Backup module is to provide a reliable and automated backup solution for critical data stores. This ensures that data is regularly backed up, reducing the risk of data loss in case of hardware failure or other disasters.

**How it Works**
----------------

The Backup module consists of two main scripts: `backup_minio.ps1` and `backup_postgres.ps1`. These scripts are executed using PowerShell, which provides a flexible and powerful environment for automating tasks.

### Minio Backup Script (`backup_minio.ps1`)

The `backup_minio.ps1` script is responsible for backing up data from a Minio bucket. Here's an overview of the script:

*   It takes three parameters: `$Alias`, `$Bucket`, and `$OutputDir`.
*   The script checks if the `$Bucket` parameter is empty, throwing an error if it is.
*   It creates a new directory at the specified `$OutputDir` using `New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null`.
*   It generates a timestamp and constructs the output file path by joining the `$OutputDir`, `$Bucket`, and timestamp.
*   The script uses `mc mirror` to copy data from the Minio bucket to the local machine, creating a mirrored copy of the data.

### PostgreSQL Backup Script (`backup_postgres.ps1`)

The `backup_postgres.ps1` script is responsible for backing up data from a PostgreSQL database. Here's an overview of the script:

*   It takes two parameters: `$DatabaseUrl` and `$OutputDir`.
*   The script checks if the `$DatabaseUrl` parameter is empty, throwing an error if it is.
*   It creates a new directory at the specified `$OutputDir` using `New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null`.
*   It generates a timestamp and constructs the output file path by joining the `$OutputDir`, "legal-platform", and timestamp.
*   The script uses `pg_dump` to dump the PostgreSQL database, saving the output to a local file.

**Key Components**
------------------

The Backup module consists of two main components:

*   **Minio Mirror**: A PowerShell cmdlet that mirrors data from a Minio bucket to the local machine. This component is used in the `backup_minio.ps1` script.
*   **pg_dump**: A PostgreSQL database tool that dumps the database, saving the output to a local file. This component is used in the `backup_postgres.ps1` script.

**Integration with the Codebase**
------------------------------

The Backup module integrates with the rest of the codebase through the following means:

*   **Environment Variables**: The module uses environment variables (`$S3_BUCKET` and `$DATABASE_URL`) to store sensitive data, such as Minio bucket names and PostgreSQL database URLs.
*   **PowerShell Execution**: The module is executed using PowerShell, which provides a flexible and powerful environment for automating tasks.

**Call Graph & Execution Flows**
------------------------------

The Backup module has the following call graph and execution flows:

Internal calls: None

Outgoing calls: `mc mirror` (Minio Mirror)

Incoming calls: None

Execution flows: No execution flows detected for this module.

**Mermaid Diagram**
-----------------

```mermaid
graph LR
    A[Backup Module] -->|PowerShell Execution|> B[Minio Mirror]
    B -->|mc mirror|> C[Local Machine]
    D[PostgreSQL Database] -->|pg_dump|> E[Local File]
```

This Mermaid diagram illustrates the call graph and execution flows of the Backup module. It shows how the module is executed using PowerShell, which calls the Minio Mirror cmdlet to mirror data from a Minio bucket to the local machine. Additionally, it shows how the PostgreSQL database is dumped using `pg_dump`, saving the output to a local file.

**Troubleshooting**
------------------

To troubleshoot issues with the Backup module, follow these steps:

*   Check the environment variables (`$S3_BUCKET` and `$DATABASE_URL`) to ensure they are set correctly.
*   Verify that the Minio bucket and PostgreSQL database exist and are accessible.
*   Check the PowerShell execution logs for any errors or warnings.

By following these troubleshooting steps, you can identify and resolve issues with the Backup module, ensuring data integrity and availability.