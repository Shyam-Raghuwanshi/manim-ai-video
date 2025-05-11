#!/bin/bash

# Display help message
show_help() {
  echo "Usage: ./run.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --help                Show this help message"
  echo "  --build               Build or rebuild services"
  echo "  --down                Stop and remove containers, networks, volumes"
  echo "  --restart             Restart all services"
  echo "  --logs                View logs for all services"
  echo "  --update-env          Update .env from .env.example (won't overwrite existing values)"
  echo ""
  echo "If no option is provided, it starts all services."
}

# Update .env file with any missing variables from .env.example
update_env_from_example() {
  if [ -f .env.example ] && [ -f .env ]; then
    echo "Updating .env file with any missing variables..."
    
    # Read each line from .env.example
    while IFS= read -r line; do
      # Skip comments and empty lines
      [[ "$line" =~ ^#.*$ ]] || [ -z "$line" ] && continue
      
      # Extract variable name
      var_name=$(echo "$line" | cut -d= -f1)
      
      # Check if variable exists in .env
      if ! grep -q "^${var_name}=" .env; then
        echo "Adding missing variable: $var_name"
        echo "$line" >> .env
      fi
    done < .env.example
    
    echo "Environment file updated."
  else
    echo "Error: .env or .env.example file not found."
    exit 1
  fi
}

# Check if .env file exists, create from example if not
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please edit the .env file with your actual configuration values."
  exit 0
fi

# Process command line arguments
case "$1" in
  --help)
    show_help
    exit 0
    ;;
  --build)
    docker-compose build
    docker-compose up -d
    ;;
  --down)
    docker-compose down
    ;;
  --restart)
    docker-compose restart
    ;;
  --logs)
    docker-compose logs -f
    ;;
  --update-env)
    update_env_from_example
    ;;
  "")
    docker-compose up -d
    ;;
  *)
    echo "Unknown option: $1"
    show_help
    exit 1
    ;;
esac

echo "Done!"