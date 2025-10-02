#!/bin/bash

# Deployment script for CFK POC services
set -e

# Configuration
REGISTRY=${DOCKER_REGISTRY:-"your-registry.azurecr.io"}
TAG=${DOCKER_TAG:-"latest"}

echo "🚀 Building and deploying CFK POC services..."

# Build validation service
echo "📦 Building validation-service..."
cd src/services/validation-service
docker build -t ${REGISTRY}/validation-service:${TAG} .
echo "✅ validation-service built successfully"

# Build progress service
echo "📦 Building progress-service..."
cd ../progress-service
docker build -t ${REGISTRY}/progress-service:${TAG} .
echo "✅ progress-service built successfully"

# Push images (if registry is configured)
if [ "$REGISTRY" != "your-registry.azurecr.io" ]; then
    echo "📤 Pushing images to registry..."
    docker push ${REGISTRY}/validation-service:${TAG}
    docker push ${REGISTRY}/progress-service:${TAG}
    echo "✅ Images pushed successfully"
else
    echo "⚠️  Skipping push - no registry configured"
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "To run locally:"
echo "  docker-compose up"
echo ""
echo "To run in development mode:"
echo "  docker-compose -f docker-compose.dev.yml up"
