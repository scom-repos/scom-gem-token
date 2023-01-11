## Step 1: Install packages
Create a new directory named `repos`, go into it and run the following commands:
```
git clone https://github.com/scom-repos/gem-token-contract.git
```
Go back to the base directory and run the following command:
```sh
docker-compose up install
```
## Step 2: Build and bundle library
```sh
docker-compose up build
```

## Step 3: Run a dev server
```sh
docker-compose up -d serve
```
Access the dev server via http://127.0.0.1:8080/