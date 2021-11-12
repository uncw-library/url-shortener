## What the app does

There are two apps in this repo: url-forwarder & url-shortener.

The first is a url forwarder.  In production, it receives a url addressed to https://lib.uncw.edu/????, then redirects it to either: 1) library.uncw.edu/????, or to 2) the url shortener value (if there is a match for ???? in the db).

The second app is the url shortener frontend.  It lets people add/remove/revise the shortener values used by the first app.

A postgres db is there to save the shortener values.

Unfortunately, it couldn't be shrunk into one Express app because the two apps have different uses for the "/" path.  So, it stays two apps.


## Building a production image

  - After you're happy with your code changes:
  ```
  docker login libapps-admin.uncw.edu:8000
  docker build --no-cache -t libapps-admin.uncw.edu:8000/randall-dev/url-shortener/forwarder --platform linux/x86_64/v8 ./url-forwarder
  docker push libapps-admin.uncw.edu:8000/randall-dev/url-shortener/forwarder
  ```
  and/or
  ```
  docker login libapps-admin.uncw.edu:8000
  docker build --no-cache -t libapps-admin.uncw.edu:8000/randall-dev/url-shortener/shortener --platform linux/x86_64/v8 ./url-shortener
  docker push libapps-admin.uncw.edu:8000/randall-dev/url-shortener/shortener
  ```

## Running a dev box


Create a file at ./url-shortener-express/.env with contents: 
```
NODE_ENV=development
POSTGRES_USER=CHANGEME
POSTGRES_PASS=CHANGEME
POSTGRES_DB=urlshortener
LDAP_PASS=CHANGEME
LDAP_USER=CHANGEME
```

then, `docker-compose up -d`

  Connect to uncw VPN & see url-forwarder at localhost:3333 & url-shortener at localhost:3111 & postgres port at localhost:3222

  - `docker-compose down` to stop it


To revise the app, revised the code in the ./app folder.  Nodemon inside the container will auto-reload the app whenever you revise ./app.  This works because the ./app folder on your local computer is volume mounted inside the container.  Any revisions to ./app is reflected inside container.

Push any code changes to gitlab.
