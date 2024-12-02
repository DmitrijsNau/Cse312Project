# Pupple

The full site is accessible [here](https://pupli.me/).

## Rules to Follow:

- Use branches for features
- Only merge branches to dev (dev will be merged to main during meetings)
- IF YOU ADD ANY NEW DEPENDENCIES: make sure to run
  `pip freeze >
  requirements.txt`

## Getting Started

### Using pyenv:

1. **Install Python 3.11**:

   ```sh
   pyenv install 3.11.0
   ```

2. **Set the local Python version to 3.11**:

   ```sh
   pyenv local 3.11.0
   ```

3. **Create a virtual environment**:

   ```sh
   python -m venv .venv
   ```

4. **Activate the virtual environment**:

   ```sh
   source .venv/bin/activate
   ```

5. **Dependencies**:
   ```sh
   pip install -r requirements.txt
   ```

### Start the server:

```sh
docker compose up
```

### Using Nix

#### Entering development shell

```sh
nix develop
```

#### Starting the server

```sh
nix run
```
