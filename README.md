## What the app does

    This is an unusual app.  It's two Express apps + a postgres.  Originally, it was an API+rerouter knex/koa app, plus a React app, + postgres.  But there's no benefit to bringing knex/React/etc to the table.  So, I shrunk it down to Express apps + db.

    Unfortunately, it couldn't be shrunk into one Express app because the two apps have different uses for the "/" path.  So, it stays two apps.

    Url-forwarder passes:
      / to drupal mainsite
      /sometext to drupal mainsite/sometext

      ... unless sometext is in the url-shortener db.
      in which case it passes:
      /sometext to the fullurl of that url-shortener db shortname

    Url-shortener is a webapp that lets you read/write/edit the shortnames:fullurls.

    A postgres db is there to save the shortnames:fullurls.

## Building a production image

  - After you're happy with your code changes:
  ```
  docker login libapps-admin.uncw.edu:8000
  docker build --no-cache -t libapps-admin.uncw.edu:8000/randall-dev/course-reserves .
  docker push libapps-admin.uncw.edu:8000/randall-dev/course-reserves
  ```

## Running a dev box


Create a file at ./url-shortener-express/.env

```
NODE_ENV=development
DB_USER=CHANGEME
DB_PASS=CHANGEME
LDAP_PASS=CHANGEME
LDAP_USER=CHANGEME
```

then, `docker-compose up -d`

  Connect to uncw VPN & see url-forwarder at localhost:3333 & url-shortener at localhost:3111

  - `docker-compose down` to stop it

To add a new package, run `npm install {{whatever}}` on your local computer to add that requirement to package.json.  Running 

```
docker-compose down
docker-compose up --build -d
```

To revise the app, revised the code in the ./app folder.  Nodemon inside the container will auto-reload the app whenever you revise ./app.  This works because the ./app folder on your local computer is volume mounted inside the container.  Any revisions to ./app is reflected inside container.

Push any code changes to gitlab.
