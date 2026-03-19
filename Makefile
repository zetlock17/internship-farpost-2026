COMPOSE := docker compose

.PHONY: help free-port-backend free-port-frontend docker-build docker-up docker-up-build docker-down docker-restart docker-logs docker-ps docker-clean

help:
	@echo "Available commands:"
	@echo "  make docker-build      - Build backend and frontend images"
	@echo "  make docker-up         - Start all services in background"
	@echo "  make docker-up-build   - Build images and start all services"
	@echo "  make docker-down       - Stop and remove services"
	@echo "  make docker-restart    - Restart all services"
	@echo "  make docker-logs       - Follow logs from all services"
	@echo "  make docker-ps         - Show services status"
	@echo "  make docker-clean      - Stop and remove services, networks, and volumes"
	@echo "  make free-port-backend    - Kill backend process on port 8000"
	@echo "  make free-port-frontend    - Kill frontend process on port 5173"

free-port-backend:
	-lsof -ti:8000 | xargs kill -9

free-port-frontend:
	-lsof -ti:5173 | xargs kill -9

docker-build:
	$(COMPOSE) build

docker-up:
	$(COMPOSE) up -d

docker-up-build:
	$(COMPOSE) up -d --build

docker-down:
	$(COMPOSE) down

docker-restart:
	$(COMPOSE) restart

docker-logs:
	$(COMPOSE) logs -f

docker-ps:
	$(COMPOSE) ps

docker-clean:
	$(COMPOSE) down -v --remove-orphans
