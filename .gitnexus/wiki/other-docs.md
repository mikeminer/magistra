# Other — docs

**Ingestion Module Documentation**

**Overview**

The Ingestion Module is responsible for collecting, processing, and storing data from various sources to build the corpus of Normative Acts (NA). It plays a crucial role in ensuring the accuracy, completeness, and consistency of the NA dataset.

**Purpose**

The primary purpose of the Ingestion Module is to:

1. Collect data from external sources, such as Open Data Normativa, Gazzetta Ufficiale, and other relevant datasets.
2. Process the collected data using various algorithms and techniques to extract relevant information.
3. Store the processed data in a database for further analysis and use.

**How it Works**

The Ingestion Module works by:

1. Receiving requests from the Application Layer to ingest new data.
2. Querying external sources, such as Open Data Normativa, to retrieve relevant data.
3. Processing the retrieved data using various algorithms and techniques, such as text normalization, entity recognition, and relationship extraction.
4. Storing the processed data in a database for further analysis and use.

**Key Components**

The Ingestion Module consists of the following key components:

1. **Data Sources**: The module connects to external sources, such as Open Data Normativa, Gazzetta Ufficiale, and other relevant datasets.
2. **Data Processing**: The module uses various algorithms and techniques to process the collected data, including text normalization, entity recognition, and relationship extraction.
3. **Database**: The module stores the processed data in a database for further analysis and use.
4. **Review Queue**: The module allows users to review and validate the ingested data, ensuring its accuracy and completeness.

**Architecture**

The Ingestion Module architecture is as follows:

```
+---------------+
|  Application  |
|  Layer        |
+---------------+
          |
          | Request
          v
+---------------+
|  Ingestion    |
|  Module       |
+---------------+
          |
          | Data Sources
          v
+---------------+
|  Data Processing|
+---------------+
          |
          | Database
          v
+---------------+
|  Storage      |
+---------------+
```

**Mermaid Diagram**

The following Mermaid diagram illustrates the Ingestion Module architecture:
```mermaid
graph LR
    Application Layer --> Ingestion Module
    Ingestion Module --> Data Sources
    Ingestion Module --> Data Processing
    Data Processing --> Database
    Database --> Storage
```
This diagram shows the flow of data from the Application Layer to the Ingestion Module, which then processes and stores the data in a database.

**Connections to Other Modules**

The Ingestion Module connects to other modules in the codebase as follows:

1. **Application Layer**: The module receives requests from the Application Layer to ingest new data.
2. **Data Sources**: The module connects to external sources, such as Open Data Normativa, to retrieve relevant data.
3. **Review Queue**: The module allows users to review and validate the ingested data, ensuring its accuracy and completeness.

**Conclusion**

The Ingestion Module is a critical component of the corpus building process, responsible for collecting, processing, and storing data from various sources. Its architecture and connections to other modules ensure that the data is accurate, complete, and consistent, making it suitable for use in various applications.