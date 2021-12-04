# chat-app
A chat app for me and my girlfriend 🤪

## How to setup (on Windows 10)
- Create a database at Firestore and then save the configuration at `./public/firebase.js`. The database has two collections:
	- `user` with 2 documents (for you and your gf), each with 2 fields:
		- `username` (string)
		- `password` (string)
	- `chat-log` with n documents, each with 3 fields:
		- `content` (string)
		- `timestamp` (timestamp)
		- `uid` (string)
- [Generate a self-signed SSL certificate](https://stackoverflow.com/a/10176685):
```
openssl req -x509 -newkey rsa:4096 -keyout ./private/key.pem -out ./public/cert.pem -sha256 -days 365 -nodes -subj "/C=US/ST=Oregon/L=Portland/O=Company Name/OU=Org/CN=www.example.com"
```
- [Install Node.js and NPM](https://phoenixnap.com/kb/install-node-js-npm-on-windows) beforehand.
- Install `http-server`
```
npm install --global http-server
```
- Setup virtual server from your AP's Web GUI to Internal Port `8080` (default port used by `http-server`) and Service Port `x`.

## How to run
- Run `run.cmd`.
- Assume that your public IP address is `yyy.yyy.yyy.yyy`. Send your gf the link `https://yyy.yyy.yyy.yyy:x`.
- Enjoy!

## To-do list
- Fix buggy scrollbar for smooth scroll (touchpad, smartphone, etc.).
- Fix scrollbar's CSS (I need to learn more 😥).
- Use the TCP connection between me and my gf to exchange messages, then write all of them to Firestore at the end of the session to use considerably less read operations.
- Make a fancy cookie to authenticate users (instead of a global variable 😂) => no need to re-authenticate after reloading.

## Lessons learnt
- When building apps with Firestore, the concern should be about the number of read operations, not the storage (so we need to make the chat to load only when we scroll up).
- Host an HTTPS website from my laptop by using port forwarding.
- Understand private/public networks (what a shame 😂).
- Understand web app's responsiveness (at the high level).

## Credits
- Chat app template: https://www.bootdey.com/snippets/view/chat-app
- Login box template: https://mdbootstrap.com/docs/standard/extended/login/#section-7