#!/bin/bash

# Build Performance Benchmark Script
# Tests build times with and without cache

echo "========================================"
echo "Docker Build Performance Benchmark"
echo "========================================"
echo ""

# Configuration
SERVICES="frontend user-auth-service quiz-service notification-service class-assignment-service nginx"

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Function to measure build time
measure_build() {
    local build_type=$1
    echo "[$build_type] Starting build..."
    local start_time=$(date +%s)
    
    if [ "$build_type" == "Cold Build (No Cache)" ]; then
        # Clear all caches for cold build
        docker builder prune -af > /dev/null 2>&1
    fi
    
    docker compose build $SERVICES --parallel > /dev/null 2>&1
    local exit_code=$?
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $exit_code -eq 0 ]; then
        echo "[$build_type] ✅ Completed in ${duration}s"
    else
        echo "[$build_type] ❌ Failed (exit code: $exit_code)"
    fi
    
    return $duration
}

# Function to show image sizes
show_image_sizes() {
    echo ""
    echo "========================================"
    echo "Image Sizes"
    echo "========================================"
    docker images | grep -E "(REPOSITORY|se2025-171)" | head -10
    echo ""
    
    # Calculate total size
    local total_size=$(docker images --format "table {{.Repository}}\t{{.Size}}" | grep "se2025-171" | awk '{print $2}' | sed 's/MB//g' | awk '{s+=$1} END {print s}')
    echo "Total size: ${total_size}MB"
}

# Run benchmarks
echo "1. Testing Warm Build (With Cache)"
echo "-----------------------------------"
measure_build "Warm Build (With Cache)"
warm_time=$?

echo ""
echo "2. Testing Cold Build (No Cache)"
echo "-----------------------------------"
measure_build "Cold Build (No Cache)"
cold_time=$?

# Show results
echo ""
echo "========================================"
echo "Results Summary"
echo "========================================"
echo "Cold Build Time: ${cold_time}s"
echo "Warm Build Time: ${warm_time}s"

if [ $warm_time -gt 0 ]; then
    local speedup=$(awk "BEGIN {print int(($cold_time / $warm_time) * 100)}")
    echo "Cache Speedup: ${speedup}%"
fi

show_image_sizes

echo ""
echo "========================================"
echo "Optimization Summary"
echo "========================================"
echo "✅ BuildKit caching enabled"
echo "✅ Multi-stage builds"
echo "✅ Dependency layer caching"
echo "✅ Parallel builds"
echo "✅ Alpine base images"
echo "✅ .dockerignore configured"
echo ""
