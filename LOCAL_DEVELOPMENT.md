# 🏠 Local Development Guide

This guide shows how to run all services locally for development and testing.

## Prerequisites

1. **Node.js 18+**
2. **Azure Functions Core Tools**: `npm install -g azure-functions-core-tools@4 --unsafe-perm true`
3. **Docker** (for local Kafka/EventHub simulation)
4. **PostgreSQL** (local or Docker)

## 🚀 Quick Start

### 1. File Processor (Azure Functions)

```bash
cd src/services/file-processor
npm install
func start --verbose
```

**Local Endpoint**: `http://localhost:7071/api/fileProcessor`

### 2. Validation Service

```bash
cd src/services/validation-service
npm install

# Set environment variables
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
export KAFKA_TOPIC_INJECTION=injection-topic
export KAFKA_TOPIC_VALID_ROWS=valid-row-topic
export KAFKA_TOPIC_INVALID_ROWS=invalid-row-topic
export KAFKA_TOPIC_PROGRESS=progress-topic
export POSTGRES_HOST=localhost
export POSTGRES_DATABASE=validation_db
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=password
export DATABRICKS_OAUTH_TOKEN=your_token
export POSTGRES_CLIENT_ID=your_client_id
export NODE_ENV=development

npm run dev
```

**Local Endpoint**: `http://localhost:3000/health`

### 3. Progress Service

```bash
cd src/services/progress-service
npm install

# Set environment variables
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
export KAFKA_TOPIC_PROGRESS=progress-topic
export SIGNALR_CONNECTION_STRING=your_signalr_connection
export POSTGRES_HOST=localhost
export POSTGRES_DATABASE=progress_db
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=password
export NODE_ENV=development

npm run dev
```

**Local Endpoint**: `http://localhost:3000/health`

## 🐳 Local Infrastructure with Docker

### Option 1: Use Docker Compose for Local Services

Create `docker-compose.local.yml`:

```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: validation_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Option 2: Use Azure Service Emulator

For a more realistic environment, use Azure Service Emulator or local Azure Storage Emulator.

## 🧪 Testing Locally

### 1. Test File Upload (Local)

```bash
# Set your local storage connection string
export DATA_STORAGE_CONNECTION="your_local_storage_connection"

# Upload test file
./test-blob-upload.sh
```

### 2. Test End-to-End Flow

1. **Start all services** in separate terminals
2. **Upload a file** using the test script
3. **Monitor logs** in each service terminal
4. **Check health endpoints**:
   - File Processor: `http://localhost:7071/api/fileProcessor`
   - Validation Service: `http://localhost:3000/health`
   - Progress Service: `http://localhost:3000/health`

## 🔧 Development Tips

### Hot Reload
- **File Processor**: Restart `func start` after changes
- **Container Apps**: Use `npm run dev` for automatic TypeScript compilation

### Debugging
- Use VS Code debugger with appropriate launch configurations
- Set breakpoints in TypeScript files
- Monitor console logs for each service

### Environment Variables
Create `.env` files in each service directory for easier management:

```bash
# In each service directory
cp .env.example .env
# Edit .env with your local values
```

## 🚀 Benefits of Local Development

1. **Faster iteration** - No deployment time
2. **Better debugging** - Full IDE support
3. **Cost effective** - No Azure resource costs
4. **Offline development** - Work without internet
5. **Team collaboration** - Share local setup

## 📝 Next Steps

1. Set up your local environment
2. Test the complete flow locally
3. Debug and iterate quickly
4. Deploy to Azure only when ready for production testing
