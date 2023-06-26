include .env

RM := rm -fr

ENVFILE	:= .env

GR= \033[32;1m
RE= \033[31;1m
YE= \033[33;1m
CY= \033[36;1m
RC= \033[0m

all: up

up : $(ENVFILE)
	@printf "$(CY)"
	@echo "Starting up..."
	@printf "$(RC)"
	docker compose up --build -d

$(ENVFILE) :
	@printf "$(YE)"
	@echo "Creating .env file..."
	@printf "$(RC)"
	@cp ./.env.example ./.env

down :
	@printf "$(RE)"
	@echo "Shutting down..."
	@printf "$(RC)"
	docker compose -v down

clean : down

fclean : 
	docker compose down -v --rmi all --remove-orphans

re : fclean all

.PHONY: all clean fclean re up down

