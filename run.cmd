# using HTTPS and open the default browser for the app
start chrome https://localhost:8080 --incognito
http-server ./public -s -S -C ./public/cert.pem -K ./private/key.pem