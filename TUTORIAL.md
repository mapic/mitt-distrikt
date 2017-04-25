## Tutorial, notes for installing

#### Wordpress
```bash

# run wordpress
# see https://github.com/docker-library/docs/tree/master/wordpress
docker run --name some-wordpress -e WORDPRESS_DB_PASSWORD=example --link some-mariadb:mysql -p 8080:80 -d wordpress

# run linked mariadb 
docker run --name some-mariadb -e MYSQL_ROOT_PASSWORD=example -d mariadb:latest

# site is now available @ http://localhost:8080
# NB: only :80 doesn't seem to work...
```