# Cake Delight

Cake Delight is a full-featured **Cloud Native Microservices application** built to demonstrate modern backend architecture, containerization, orchestration, event-driven processing, and cluster observability.

The application uses independently deployable Node.js/Express microservices, MongoDB for persistent storage, Redis with BullMQ for asynchronous event processing, Kubernetes for container orchestration, and Prometheus + Grafana for monitoring and observability.

---

## Architecture

```text
                         React Frontend (Vite)
                                  |
                                  | Port 8080 / Port-Forward
                                  v
                         API Gateway (8080)
                                  |
        +-------------------------+-------------------------+-------------------------+
        |                         |                         |                         |
        v                         v                         v                         v
+------------------+    +------------------+    +------------------+    +----------------------+
| Catalog Service  |    |  Order Service   |    | Rating Service   |    | Notification Service |
|    Port 3001     |    |    Port 3002     |    |    Port 3003     |    |      Port 3004       |
+------------------+    +------------------+    +------------------+    +----------------------+
        |                         |                         |                         |
        v                         v                         v                         v
+------------------+    +------------------+    +------------------+    +----------------------+
| MongoDB          |    | MongoDB          |    | MongoDB          |    | MongoDB              |
| catalogdb        |    | orderdb          |    | ratingdb         |    | notificationdb       |
+------------------+    +------------------+    +------------------+    +----------------------+
                                  |
                                  | Publish Event
                                  v
                         +------------------+
                         |      Redis       |
                         |     Port 6379    |
                         +------------------+
                                  |
                                  | BullMQ: order-events
                                  v
                         Notification Service
                            Event Consumer
```

---

## Architecture Highlights

### 1. Microservices Architecture

Cake Delight is divided into independently deployable services:

* **Catalog Service** — manages cake catalog operations.
* **Order Service** — manages baskets and checkout operations.
* **Rating Service** — manages cake reviews and ratings.
* **Notification Service** — processes asynchronous notification events.
* **API Gateway** — provides a centralized entry point for frontend API requests.

Each service has its own application runtime, deployment, service definition, and responsibilities.

### 2. Event-Driven Architecture

The application uses **Redis + BullMQ** for asynchronous communication.

The checkout flow works as follows:

```text
Order Service
     |
     | ORDER_CREATED
     v
   Redis
     |
     | BullMQ Queue
     v
Notification Service
     |
     v
Process Notification
```

This keeps notification processing decoupled from the order creation request.

### 3. Isolated Databases

MongoDB is used as the persistent database layer.

Logical database separation is maintained for each service:

```text
MongoDB
 |
 +-- catalogdb
 |
 +-- orderdb
 |
 +-- ratingdb
 |
 +-- notificationdb
```

This provides logical data isolation while using a persistent MongoDB deployment.

### 4. Observability

The application exposes service metrics using `prom-client`.

**Prometheus** collects and stores metrics, while **Grafana** provides dashboards and visualization.

```text
Microservices
     |
     | Metrics
     v
 Prometheus
     |
     | PromQL
     v
  Grafana
```

---

# Project Structure

```text
cake-delight/
│
├── catalog-service/            # Cake catalog REST API & Mongoose models
|
│---Demonstrations Images.   #Contains images of our applications
|
|
├── order-service/              # Basket management & checkout flow
│                               # BullMQ producer
│
├── rating-service/             # Cake reviews & average score calculation
│
├── notification-service/       # BullMQ background worker
│                               # Notification processing service
│
├── gateway/                    # Express API Gateway
│                               # Path rewriting and CORS support
│
├── frontend/                   # Frontend application/static assets
│
├── k8s/                        # Kubernetes manifests
│   │
│   ├── namespace.yaml
│   │
│   ├── mongo/
│   │   ├── pvc.yaml
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── redis/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── catalog/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── order/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── rating/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── notification/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── gateway/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   └── monitoring/
│       │
│       ├── prometheus/
│       │   ├── configmap.yaml
│       │   ├── clusterrole.yaml
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       │
│       └── grafana/
│           ├── deployment.yaml
│           └── service.yaml
│
├── docker-compose.yml          # Local multi-container environment
│
└── README.md
```

---

# Kubernetes Workloads

The Kubernetes cluster contains the application services, infrastructure components, and monitoring stack.

| Pod / Workload           | Container Image               |  Port | Responsibility                    |
| ------------------------ | ----------------------------- | ----: | --------------------------------- |
| `mongo-*`                | `mongo:6.0`                   | 27017 | MongoDB database server           |
| `redis-*`                | `redis:7-alpine`              |  6379 | Redis storage for BullMQ          |
| `catalog-service-*`      | `catalog-service:latest`      |  3001 | Cake catalog REST APIs            |
| `order-service-*`        | `order-service:latest`        |  3002 | Basket management and checkout    |
| `rating-service-*`       | `rating-service:latest`       |  3003 | Reviews and average ratings       |
| `notification-service-*` | `notification-service:latest` |  3004 | BullMQ consumer and notifications |
| `gateway-*`              | `gateway:latest`              |  8080 | Central API Gateway               |
| `prometheus-*`           | `prom/prometheus:v2.45.0`     |  9090 | Metrics collection and storage    |
| `grafana-*`              | `grafana/grafana:10.0.0`      |  3000 | Metrics visualization             |

The configured Kubernetes environment runs the application and supporting components as multiple pods within the `cake-delight` namespace.

---

# API Documentation

All application APIs are accessed through the API Gateway.

## 1. Catalog Service

Base path:

```text
/catalog
```

| Method | Gateway Endpoint     | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | `/catalog/cakes`     | Fetch all cakes        |
| GET    | `/catalog/cakes/:id` | Fetch a specific cake  |
| POST   | `/catalog/cakes`     | Create a new cake      |
| GET    | `/catalog/health`    | Catalog service health |

### Cake Filtering

The `GET /catalog/cakes` endpoint supports:

```text
category
name
minPrice
maxPrice
```

Example:

```text
GET /catalog/cakes?category=Birthday&minPrice=500&maxPrice=1500
```

---

## 2. Order Service

Base path:

```text
/orders
```

| Method | Gateway Endpoint                    | Description                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/orders/api/basket?userId=:id`     | Fetch the current basket                       |
| POST   | `/orders/api/basket`                | Add an item or increment quantity              |
| PUT    | `/orders/api/basket/:id`            | Update item quantity                           |
| DELETE | `/orders/api/basket/:id?userId=:id` | Remove an item                                 |
| POST   | `/orders/api/checkout`              | Convert basket into an order and publish event |
| GET    | `/orders/health`                    | Order service health                           |

The checkout endpoint triggers the asynchronous order-processing workflow.

```text
Client
  |
  | POST /orders/api/checkout
  v
Order Service
  |
  | Create Order
  |
  | Publish ORDER_CREATED
  v
Redis / BullMQ
  |
  v
Notification Service
```

---

## 3. Rating Service

Base path:

```text
/ratings
```

| Method | Gateway Endpoint                   | Description              |
| ------ | ---------------------------------- | ------------------------ |
| POST   | `/ratings/ratings`                 | Submit a cake rating     |
| GET    | `/ratings/ratings/:cakeId`         | Get reviews for a cake   |
| GET    | `/ratings/ratings/:cakeId/average` | Calculate average rating |
| GET    | `/ratings/health`                  | Rating service health    |

Ratings are submitted using a **1–5 star** scale.

---

## 4. Notification Service

Base path:

```text
/notifications
```

| Method | Gateway Endpoint               | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | `/notifications`               | Get all processed notifications |
| GET    | `/notifications/:userId`       | Get notifications for a user    |
| GET    | `/notifications/healthService` | Notification service health     |

The Notification Service acts as a BullMQ background worker and consumes events generated by the Order Service.

---

# Technology Stack

| Layer            | Technology    |
| ---------------- | ------------- |
| Frontend         | React / Vite  |
| Backend          | Node.js       |
| API Framework    | Express.js    |
| Database         | MongoDB       |
| ODM              | Mongoose      |
| Message Queue    | BullMQ        |
| Queue Backend    | Redis         |
| Containerization | Docker        |
| Orchestration    | Kubernetes    |
| Local Kubernetes | Minikube      |
| API Gateway      | Express.js    |
| Metrics          | Prometheus    |
| Metrics Client   | `prom-client` |
| Visualization    | Grafana       |
| Container Images | Docker        |

---

# Local Development with Docker Compose

Docker Compose can be used to run the complete backend stack locally without Kubernetes.

## Start the Application

```bash
docker-compose up --build -d
```

## Check Running Containers

```bash
docker-compose ps
```

## Stop the Application

```bash
docker-compose down
```

---

# Kubernetes Deployment

## Prerequisites

Install the following tools:

* Docker Desktop or Docker Daemon
* Minikube
* kubectl

---

## Step 1: Start Minikube

Start the Kubernetes cluster:

```bash
minikube start
```

Configure the Docker CLI to use Minikube's internal Docker daemon:

```bash
eval $(minikube docker-env)
```

This allows Docker images to be built directly inside the Minikube environment.

---

# Step 2: Build Container Images

Build each microservice image inside the Minikube Docker environment.

```bash
docker build -t catalog-service:latest ./catalog-service

docker build -t order-service:latest ./order-service

docker build -t rating-service:latest ./rating-service

docker build -t notification-service:latest ./notification-service

docker build -t gateway:latest ./gateway
```

Verify the images:

```bash
docker images
```

---

# Step 3: Deploy Kubernetes Resources

Create the application namespace:

```bash
kubectl apply -f k8s/namespace.yaml
```

Deploy MongoDB:

```bash
kubectl apply -f k8s/mongo/
```

Deploy Redis:

```bash
kubectl apply -f k8s/redis/
```

Deploy Catalog Service:

```bash
kubectl apply -f k8s/catalog/
```

Deploy Order Service:

```bash
kubectl apply -f k8s/order/
```

Deploy Rating Service:

```bash
kubectl apply -f k8s/rating/
```

Deploy Notification Service:

```bash
kubectl apply -f k8s/notification/
```

Deploy API Gateway:

```bash
kubectl apply -f k8s/gateway/
```

Deploy Prometheus:

```bash
kubectl apply -f k8s/monitoring/prometheus/
```

Deploy Grafana:

```bash
kubectl apply -f k8s/monitoring/grafana/
```

---

# Step 4: Verify Kubernetes Resources

Check all pods:

```bash
kubectl get pods -n cake-delight
```

Check services:

```bash
kubectl get svc -n cake-delight
```

Check persistent volume claims:

```bash
kubectl get pvc -n cake-delight
```

Or check all three together:

```bash
kubectl get pods,svc,pvc -n cake-delight
```

Wait until the required pods reach the `Running` state.

---

# Step 5: Port Forwarding

Port forwarding is used to access the Kubernetes services from the local machine.

Open separate terminal windows for each service.

## API Gateway

```bash
# Terminal 1
kubectl port-forward svc/gateway 8080:8080 -n cake-delight
```
```bash
# Terminal 2 — Prometheus UI (http://localhost:9090)
kubectl port-forward svc/prometheus 9090:9090 -n cake-delight
```
```bash

# Terminal 3 — Grafana Dashboard (http://localhost:3000)
kubectl port-forward svc/grafana 3000:3000 -n cake-delight
```

The API Gateway will be available at:

```text
http://localhost:8080
```

## Prometheus

```bash
kubectl port-forward svc/prometheus 9090:9090 -n cake-delight
```

Prometheus:

```text
http://localhost:9090
```

Prometheus Targets:

```text
http://localhost:9090/targets
```

## Grafana

```bash
kubectl port-forward svc/grafana 3000:3000 -n cake-delight
```

Grafana:

```text
http://localhost:3000
```

---

# Running the Frontend

Navigate to the frontend directory:

```bash
cd cake-delight/frontend
```

Serve the frontend:

```bash
npx serve .
```

The frontend will typically be available on one of the ports displayed by `serve`, such as:

```text
http://localhost:3000
```


The frontend communicates with the application through the API Gateway.

---

# Monitoring and Observability

Cake Delight includes a Kubernetes monitoring stack based on:

```text
                 +----------------------+
                 |    Microservices     |
                 |                      |
                 | Catalog              |
                 | Order                |
                 | Rating               |
                 | Notification         |
                 | Gateway              |
                 +----------+-----------+
                            |
                            | /metrics
                            v
                 +----------------------+
                 |     Prometheus       |
                 |       :9090          |
                 +----------+-----------+
                            |
                            | PromQL
                            v
                 +----------------------+
                 |       Grafana        |
                 |       :3000          |
                 +----------------------+
```

Services expose metrics using `prom-client`.

Prometheus discovers and scrapes the configured Kubernetes targets.

Grafana connects to Prometheus and provides dashboards for visualizing application and infrastructure metrics.

---

# Prometheus Target Verification

After port-forwarding Prometheus:

```bash
kubectl port-forward svc/prometheus 9090:9090 -n cake-delight
```

Open:

```text
http://localhost:9090/targets
```

Under the configured Kubernetes pod monitoring job, verify that the application service targets are showing:

```text
UP
```

A healthy target should appear as:

```text
State: UP
```

---

# Grafana Configuration

After port-forwarding Grafana:

```bash
kubectl port-forward svc/grafana 3000:3000 -n cake-delight
```

Open:

```text
http://localhost:3000
```

Default credentials:

```text
Username: admin
Password: admin
```

After logging in:

```text
Connections
    |
    v
Data Sources
    |
    v
Add data source
    |
    v
Prometheus
```

Configure the Prometheus server URL as:

```text
http://prometheus.cake-delight.svc.cluster.local:9090
```

Then select:

```text
Save & Test
```

---

# Kubernetes Service Discovery

The application uses Kubernetes Services for internal service-to-service communication.

Conceptually:

```text
                 Kubernetes Cluster
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
   catalog-service  order-service   rating-service
        |               |
        |               |
        +-------+-------+
                |
                v
              Redis
                |
                v
       notification-service
```

Kubernetes DNS allows services to communicate using their Kubernetes Service names instead of hardcoded pod IP addresses.

---

# Cluster Operations

## Check Pods

```bash
kubectl get pods -n cake-delight
```

## Check Services

```bash
kubectl get svc -n cake-delight
```

## Check Persistent Volume Claims

```bash
kubectl get pvc -n cake-delight
```

## Check All Major Resources

```bash
kubectl get pods,svc,pvc -n cake-delight
```

---

# Watch Pod Status

To continuously monitor pod lifecycle changes:

```bash
kubectl get pods -n cake-delight -w
```

Press `Ctrl+C` to stop watching.

---

# Application Logs

## Notification Service

The Notification Service is particularly important for debugging asynchronous event processing.

```bash
kubectl logs -f deployment/notification-service -n cake-delight
```

## API Gateway

```bash
kubectl logs -f deployment/gateway -n cake-delight
```

---

# Inspect Pod Details

To inspect the lifecycle events, configuration, scheduling information, and errors for Order Service pods:

```bash
kubectl describe pod -l app=order-service -n cake-delight
```

---

# Restart a Deployment

After updating application code or configuration, restart a deployment:

```bash
kubectl rollout restart deployment/notification-service -n cake-delight
```

For example, the same pattern can be used for other services:

```bash
kubectl rollout restart deployment/catalog-service -n cake-delight

kubectl rollout restart deployment/order-service -n cake-delight

kubectl rollout restart deployment/rating-service -n cake-delight

kubectl rollout restart deployment/gateway -n cake-delight
```

---

# Verify Rollout Status

After restarting a deployment:

```bash
kubectl rollout status deployment/notification-service -n cake-delight
```

Check the running pods:

```bash
kubectl get pods -n cake-delight
```

---

# End-to-End Request Flow

A typical user checkout request follows this architecture:

```text
+------------------+
| React Frontend   |
+--------+---------+
         |
         | HTTP Request
         v
+------------------+
|   API Gateway    |
|      :8080       |
+--------+---------+
         |
         | Proxy Request
         v
+------------------+
|  Order Service   |
|      :3002       |
+--------+---------+
         |
         | Store Order
         v
+------------------+
|     MongoDB      |
|     orderdb      |
+------------------+

         Order Service
              |
              | ORDER_CREATED
              v
        +-----------+
        |   Redis   |
        |  BullMQ   |
        +-----+-----+
              |
              | Consume Event
              v
+---------------------------+
|   Notification Service   |
|          :3004            |
+-------------+-------------+
              |
              v
       Notification Log
```

This architecture ensures that notification processing does not block the primary checkout operation.

---

# Observability Flow

```text
+------------------+
| Catalog Service  |
+--------+---------+
         |
         | /metrics
         |
+--------+---------+       +------------------+
| Order Service    |------>|                  |
+--------+---------+       |                  |
         |                 |    Prometheus    |
         | /metrics        |      :9090       |
         |                 |                  |
+--------+---------+       |                  |
| Rating Service   |------>|                  |
+--------+---------+       +--------+---------+
         |                          |
         | /metrics                 | PromQL
         |                          |
+--------+---------+                v
| Notification     |       +------------------+
| Service          |       |     Grafana      |
+------------------+       |      :3000       |
                           +------------------+
```

---

# Key Concepts Demonstrated

The Cake Delight project demonstrates the following cloud-native concepts:

```text
Microservices
     |
     +-- Independent Services
     |
     +-- API Gateway
     |
     +-- Independent Service Deployment
     |
     +-- REST APIs
     |
     +-- Event-Driven Architecture
     |
     +-- Redis + BullMQ
     |
     +-- MongoDB
     |
     +-- Docker
     |
     +-- Kubernetes
     |
     +-- Minikube
     |
     +-- Kubernetes Services
     |
     +-- Persistent Volumes
     |
     +-- Prometheus
     |
     +-- Grafana
     |
     +-- Metrics & Observability
```

---

# Complete Deployment Flow

The complete deployment process can be summarized as:

```text
Source Code
     |
     v
Docker Images
     |
     v
Minikube Docker Environment
     |
     v
Kubernetes Namespace
     |
     +----------------------+
     |                      |
     v                      v
Infrastructure          Microservices
     |                      |
     +-- MongoDB            +-- Catalog
     |                      +-- Order
     +-- Redis              +-- Rating
                            +-- Notification
                            +-- Gateway
                                 |
                                 v
                         Monitoring Stack
                                 |
                         +-------+-------+
                         |               |
                         v               v
                    Prometheus        Grafana
```

---

# Useful Commands

### View everything in the namespace

```bash
kubectl get all -n cake-delight
```

### View pods with additional information

```bash
kubectl get pods -n cake-delight -o wide
```

### View deployment status

```bash
kubectl get deployments -n cake-delight
```

### View service endpoints

```bash
kubectl get endpoints -n cake-delight
```

### View namespace events

```bash
kubectl get events -n cake-delight --sort-by=.lastTimestamp
```

### Delete the complete application namespace

```bash
kubectl delete namespace cake-delight
```

---

# Summary

Cake Delight demonstrates a complete cloud-native application lifecycle:

```text
                    CAKE DELIGHT
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
   Application       Infrastructure    Observability
        |                |                |
        v                v                v
 Microservices        Docker           Prometheus
        |                |                |
        v                v                v
 API Gateway         Kubernetes          Grafana
        |                |
        v                v
 REST APIs           Minikube
        |
        v
 Event-Driven Processing
        |
        v
    Redis + BullMQ
        |
        v
 Asynchronous Notifications
```

The project combines **microservices, REST APIs, event-driven architecture, Docker, Kubernetes, MongoDB, Redis, BullMQ, Prometheus, and Grafana** into a single end-to-end cloud-native application.
