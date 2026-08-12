  Cake Delight is a full-featured Cloud Native Microservices application built to demonstrate modern backend architecture, containerization, orchestration, event-driven processing, and cluster observability.
  
                  React Frontend (Vite)
                         │
                         │ (Port 8080 / Port-Forward)
                         ▼
                 API Gateway (8080)
                         │
   ┌─────────────────────┼─────────────────────┬─────────────────────┐
   ▼                     ▼                     ▼                     ▼
Catalog Service       Order Service         Rating Service     Notification Service
  (Port 3001)           (Port 3002)           (Port 3003)           (Port 3004)
   │                     │                     │                     │
   ▼                     ▼                     ▼                     ▼
MongoDB (catalogdb)   MongoDB (orderdb)     MongoDB (ratingdb)   MongoDB (notificationdb)
                         │                                           ▲
                         │ (Publish Event)                           │ (Consume Event)
                         ▼                                           │
                       Redis ──(BullMQ: order-events)────────────────┘




Key Architectural Highlights
1. Microservices Architecture: Independently deployable Node.js/Express services for Catalog, Order, Rating, and Notification functionalities.
2. Event-Driven Architecture: Asynchronous, non-blocking order processing decoupled via BullMQ and Redis.
3. Isolated Databases: Logical database separation (catalogdb, orderdb, ratingdb, notificationdb) hosted on a persistent MongoDB instance.
4. Observability: Prometheus scraping native metrics via prom-client with Grafana dashboard visualizers.
                       In our architecture we have 9 pods for each service and other service

cake-delight/
├── catalog-service/      # Cake catalog REST API & Mongoose models
├── order-service/        # Basket management & order checkout flow (BullMQ producer)
├── rating-service/       # Cake reviews & average score calculation
├── notification-service/ # BullMQ background worker & email simulation service
├── gateway/              # Express API Gateway with path rewriting
├── frontend/             # Vanilla HTML/JS frontend assets
├── k8s/                  # Kubernetes manifests
│   ├── namespace.yaml
│   ├── mongo/            # PVC, Deployment, Service (Port 27017)
│   ├── redis/            # Deployment, Service (Port 6379)
│   ├── catalog/          # Deployment, Service (Port 3001)
│   ├── order/            # Deployment, Service (Port 3002)
│   ├── rating/           # Deployment, Service (Port 3003)
│   ├── notification/     # Deployment, Service (Port 3004)
│   ├── gateway/          # Deployment, Service (NodePort 30080)
│   └── monitoring/
│       ├── prometheus/   # ConfigMap, ClusterRole, Deployment, Service (9090)
│       └── grafana/      # Deployment, Service (3000)
├── docker-compose.yml    # Local multi-container development environment
└── README.md

Pod Name.             Container Image	            Port	                Work / Responsibility
mongo-*	                  mongo:6.0	                27017	       Database server (catalogdb, orderdb, ratingdb, notificationdb)
redis-*.            	redis:7-alpine.          	6379	             In-memory queue storage for BullMQ
catalog-service-*	   catalog-service:latest	    3001	         Cake items create & fetch karne ke REST APIs
order-service-*	        order-service:latest	    3002	          Basket management & checkout trigger
rating-service-*	    rating-service:latest	    3003	           Cake reviews & average rating calculation
notification-service-*	notification-service:latest	3004	        BullMQ consumer worker & notification logs
gateway-*	              gateway:latest	        8080	      Central HTTP proxy with CORS support
prometheus-*	        prom/prometheus:v2.45.0	    9090	       Metrics collector & time-series storage
grafana-*	           grafana/grafana:10.0.0	   3000	         Analytics & visualization dashboard

1. Catalog Service (/catalog)
Method.    Gateway Endpoint.          Description
GET.          /catalog/cakes.           Fetch all cakes (supports category, name, minPrice, maxPrice) 
GET           /catalog/cakes/:id              Get detailed cake information by ID 
POST.           /catalog/cakes            Create a new cake item
GET              /catalog/health            Service health status

2. Order Service
GET            	/orders/api/basket?userId=:id       Fetch current basket for a user
POST	            /orders/api/basket	           Add item or increment quantity in basket
PUT	              /orders/api/basket/:id	        Update item quantity in basket
DELETE	         /orders/api/basket/:id?userId=:id	Delete an item from basket
POST	               /orders/api/checkout	         Convert basket to Order & publish ORDER_CREATED event
GET	                  /orders/health	          Service health status

3. Rating Service (/ratings)
Method                 Gateway Endpoint                Description
POST	                  /ratings/ratings	            Submit a cake review rating (1-5 stars)
GET	                 /ratings/ratings/:cakeId	        Get all reviews for a specific cake
GET	              /ratings/ratings/:cakeId/average	  Calculate average star rating for a cake
GET	                 /ratings/health	                Service health status

4. Notification Service (/notifications)
Method                  Gateway Endpoint               Description
GET                    /notifications                 Get all processed notifications
GET                 /notifications/:userId              Get notifications for a specific user
GET                   /notifications/healthService        health status

Local Development with Docker Compose
To quickly run the entire stack locally without Kubernetes:
# 1. Start all backend containers, MongoDB, and Redis
docker-compose up --build -d

# 2. Check running container status
docker-compose ps


Kubernetes Deployment Guide
Prerequisites
Docker Desktop / Docker Daemon

Minikube installed

kubectl CLI installed

Step 1: Start Minikube & Connect Docker Environment

# Start Minikube cluster
minikube start

# Direct terminal Docker CLI to Minikube's internal Docker daemon
eval $(minikube docker-env)

Step 2: Build Container Images inside Minikube
docker build -t catalog-service:latest ./catalog-service
docker build -t order-service:latest ./order-service
docker build -t rating-service:latest ./rating-service
docker build -t notification-service:latest ./notification-service
docker build -t gateway:latest ./gateway

Step 3: Apply Declarative Kubernetes Manifests
# Create Namespace
kubectl apply -f k8s/namespace.yaml

# Deploy Databases & Caches
kubectl apply -f k8s/mongo/
kubectl apply -f k8s/redis/

# Deploy Microservices & Gateway
kubectl apply -f k8s/catalog/
kubectl apply -f k8s/order/
kubectl apply -f k8s/rating/
kubectl apply -f k8s/notification/
kubectl apply -f k8s/gateway/

# Deploy Prometheus & Grafana Stack
kubectl apply -f k8s/monitoring/prometheus/
kubectl apply -f k8s/monitoring/grafana/

Step 4: Expose Services via Port-Forwarding
Open three separate terminal windows to keep ports exposed to localhost:
# Terminal 1 — API Gateway
kubectl port-forward svc/gateway 8080:8080 -n cake-delight

# Terminal 2 — Prometheus Web UI
kubectl port-forward svc/prometheus 9090:9090 -n cake-delight

# Terminal 3 — Grafana Visualization Dashboard
kubectl port-forward svc/grafana 3000:3000 -n cake-delight

Running the Frontend Application
Open a new terminal session.

Navigate to the frontend directory:
cd cake-delight/frontend
Serve the static frontend using npx:
npx serve .
Access the user application in your browser (typically http://localhost:3000 or http://localhost:5000).

Monitoring & Observability Setup
1. Prometheus Target Verification
Open http://localhost:9090/targets in your browser.

Confirm that all 5 microservices under job kubernetes-pods show UP (Green) status.

2. Grafana Configuration
Open http://localhost:3000 (Default credentials: admin / admin).

Go to Connections > Data Sources > Add data source and select Prometheus.

Set Prometheus URL:
http://prometheus.cake-delight.svc.cluster.local:9090
Click Save & Test.

🛠️ Cluster Operation & Verification Commands

# Check all running pods, services, and volume claims
kubectl get pods,svc,pvc -n cake-delight

# Watch pod status during updates
kubectl get pods -n cake-delight -w

# Stream logs for event debugging
kubectl logs -f deployment/notification-service -n cake-delight
kubectl logs -f deployment/gateway -n cake-delight

# Inspect pod lifecycle events
kubectl describe pod -l app=order-service -n cake-delight

# Restart a deployment after updating code
kubectl rollout restart deployment/notification-service -n cake-delight