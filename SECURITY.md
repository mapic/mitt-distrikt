### Security
To run general security check on Node packages, do: 
```bash 
# Node Security Project
sudo npm i nsp -g
nsp check

# Snyk Vulnerability database
sudo npm install -g snyk
snyk auth # to authenticate with account
snyk test
snyk wizard
```
