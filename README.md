# Pupple

A match-making site for your pets.

The full site is accessible [here](https://pupli.me/).

Please read below to learn about how to use all the features.

### Usage

To DM other users, you both must register a pet, then like each others pets.
After, you may open "My DMs" and start a new conversation!

To create a timed post, register a pet and set a date in the optional field.
You'll see a countdown on the My Pets page.

## Extra Special Feature - Search Bar

The search bar is a very important feature for users. It provides users with an
easy way to search for pets with a matching bio, breed, or name.

### Testing Procedure

1. Start the app with `docker compose up`
2. Open two browsers and navigate to http://localhost:8080/
3. Create an account on each browser and login.
4. On one browser, navigate to the homepage. In the search bar, choose any
   string less than 20 characters and search it. For this browser, stay on this
   page for the remainder of the test.
5. On the other browser, navigate to the register pet page. Register a pet
   with the name equal to the string in the search bar, the remaining fields
   (bio, breed) could be anything EXCEPT this string. Do not add a publication
   date to this pet.
6. Verify that this new pet appears in the search results of the first browser
   without refreshing.
7. Register another pet with a random name (under 20 characters) with its breed
   equal to the string from earlier. The remaining fields could be anything
   EXCEPT this string. Do not add a publication date to this pet.
8. Verify that this new pet appears in the search results of the first browser
   without refreshing.
9. Register another pet with a random name (under 20 characters) with its bio
   equal to the string from earlier. The remaining fields (breed) could be
   anything EXCEPT this string. Do not add a publication date to this pet.
10. Verify that this new pet appears in the search results of the first browser
    without refreshing.
11. Register another pet with a random name, bio, and breed under 20 characters.
    Do not set a publication date to this pet.
12. Verify that this new pet does NOT appear in the search results of the first
    browser.

## Development Rules to Follow:

- Use branches for features
- Only merge branches to dev (dev will be merged to main during meetings)
- IF YOU ADD ANY NEW DEPENDENCIES: make sure to run
  `pip freeze > requirements.txt`

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
