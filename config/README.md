## Install on custom domain
All you need to do to get the `nginx` configuration to work, is to replace the domain names in the config file with your own.


Look in the [nginx.conf](https://github.com/mapic/kart-og-medvirkning/blob/master/config/nginx.conf) file and replace the domain names in these blocks:
```yml
############################################
# replace with your domain name
############################################
server_name                 blog.meon.io;
############################################

```

There are two different domains, which should point to the same IP. You need to add an `A` record for this in your DNS.