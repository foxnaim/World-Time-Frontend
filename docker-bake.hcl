// docker-bake.hcl
//
// HCL definition for docker buildx bake.
// Provides parallel multi-arch builds for the WorkTime backend and frontend
// images, with a shared abstract "base" target that applies OCI image labels
// and target platforms.
//
// Usage:
//   docker buildx bake                        # builds the default group (dev tags)
//   docker buildx bake backend                # builds a single target
//   docker buildx bake prod --push            # builds prod group and pushes to registry
//   REGISTRY=ghcr.io/myorg TAG=main \
//     docker buildx bake --push               # override variables from the environment

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

variable "REGISTRY" {
  default = "ghcr.io/foxnaim"
}

variable "TAG" {
  default = "latest"
}

variable "VERSION" {
  default = "dev"
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

group "default" {
  targets = ["backend", "frontend"]
}

group "prod" {
  targets = ["backend-prod", "frontend-prod"]
}

// ---------------------------------------------------------------------------
// Abstract base target
//
// Every concrete target inherits these OCI labels and platforms. The image
// source, license, version and build timestamp are carried into the final
// image so downstream tooling (ghcr.io UI, Trivy, Syft, etc.) can resolve
// provenance without extra flags.
// ---------------------------------------------------------------------------

target "base" {
  labels = {
    "org.opencontainers.image.source"   = "https://github.com/foxnaim/worktime"
    "org.opencontainers.image.licenses" = "MIT"
    "org.opencontainers.image.version"  = "${VERSION}"
    "org.opencontainers.image.created"  = timestamp()
  }
  platforms = [
    "linux/amd64",
    "linux/arm64",
  ]
}

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------

target "backend" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "backend/Dockerfile"
  target     = "runtime"
  tags = [
    "${REGISTRY}/worktime-backend:${TAG}",
  ]
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
}

target "backend-prod" {
  inherits = ["backend"]
  tags = [
    "${REGISTRY}/worktime-backend:${VERSION}",
    "${REGISTRY}/worktime-backend:latest",
  ]
}

// ---------------------------------------------------------------------------
// Frontend
// ---------------------------------------------------------------------------

target "frontend" {
  inherits   = ["base"]
  context    = "."
  dockerfile = "frontend/Dockerfile"
  target     = "runtime"
  tags = [
    "${REGISTRY}/worktime-frontend:${TAG}",
  ]
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
}

target "frontend-prod" {
  inherits = ["frontend"]
  tags = [
    "${REGISTRY}/worktime-frontend:${VERSION}",
    "${REGISTRY}/worktime-frontend:latest",
  ]
}
