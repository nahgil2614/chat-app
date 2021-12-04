// TODO: authentication + encryption
// TODO: only load old messages if we scroll up
// TODO: sticker, icon, reply, send image
// TODO: change firebaseConfig when done

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
const chat = db.collection('chat-log');
const user = db.collection('user');

// cookie manipulation - refer to this: https://stackoverflow.com/a/24103596

// erase the cookie
var cuid = null;

// more convenient to scroll, etc.
var message_list = document.querySelector("#message-list");

// notification sound
var notis = [...Array(4).keys()].map(x => new Audio("noti/noti"+x+".m4a"));

// current furthest timestamp to the past
var firstTimestamp;

// number of message rendered
var totalMessageNo = 0;
var startReached = false;

// to update the front-end when we receive any updates
// assuming only two users
function addMessage(content, uid, timestamp, old=false) {
	// update the message number
	totalMessageNo += 1;
	// process the timestamp
	let date = timestamp.toDate();
	let [month, day, year] = [date.getMonth()+1, date.getDate(), date.getFullYear()];
	date = date.toLocaleTimeString("en-US")+", "+day+"/"+month+"/"+year;

	let message = document.createElement("li");
	message.classList.add(
		"clearfix-message"
	);

	let message_data = ``;
	if (uid == cuid) {
		message_data = `
			<div class="message my-message float-right" title="${date}">
				${content}
			</div>
		`;
	}
	else {
		message_data = `
			<div class="message other-message" title="${date}">
				${content}
			</div>
		`;
		// play notification sound if the user is out of focus
		if (!document.hasFocus() && !old) {
			notis[Math.floor(Math.random()*notis.length)].play();
		}
	}
	message.innerHTML = message_data;
	if (!old) {
		message_list.append(message);
	}
	else {
		message_list.prepend(message);
	}
};

// request the user to login first
var overlay = document.createElement("div");
overlay.style.cssText += 'position:fixed; width:100%; height:100%; top:0; left:0; background:#000; opacity:0.6; z-index:50;';
document.body.append(overlay);

var loginBox = document.createElement("div");
loginBox.style.cssText += 'position:fixed; width:100%; height:100%; top:0; left:0; z-index:51;';
loginBox.innerHTML = `<section class="vh-100">
  <div class="container py-5 h-100">
	<div class="row d-flex justify-content-center align-items-center h-100">
	  <div class="col-12 col-md-8 col-lg-6 col-xl-5">
		<div class="card shadow-2-strong" style="border-radius: 1rem;">
		  <form id="login-form" class="card-body p-5 text-left">

			<h3 class="text-center">Sign in</h3>

			<label class="mt-2 form-label" for="username">Username</label>
			<input type="text" id="username" class="form-control form-control-lg" />

			<label class="mt-2 form-label" for="password">Password</label>
			<input type="password" id="password" class="form-control form-control-lg" />

			<button class="mt-5 btn btn-primary btn-lg btn-block" type="submit">Login</button>
		  </form>
		</div>
	  </div>
	</div>
  </div>
</section>`;
document.body.append(loginBox);

const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	if (loginForm.username.value == "" || loginForm.password.value == "") {
		alert("Please fill in the requested fields!");
		return;
	}
	user.where("username", "==", loginForm.username.value).limit(1)
		.get().then((snapshot) => {
			if (snapshot.size == 0) {
				alert("Username does not exist!");
				return;
			}
			snapshot.docs.forEach(doc => {
				let loginData = doc.data();
				if (loginForm.password.value != loginData.password) {
					alert("Wrong password!");
					return;
				}
				// tranform the password to the key of encrypted messages
				overlay.remove();
				loginBox.remove();

				// get the old history
				chat.orderBy("timestamp", "desc").limit(20)
					.get().then((snapshot) => {
						cuid = loginData.username;
						let oldData;
						snapshot.docs.forEach(doc => {
							oldData = doc.data();
							addMessage(oldData.content, oldData.uid, oldData.timestamp, true);
						});
						firstTimestamp = oldData.timestamp;
						// for the onSnapshot
						message_list.removeChild(message_list.lastChild);
						message_list.scrollTo(0, message_list.scrollHeight);

						// listen for new chat-log's update
						chat.orderBy("timestamp", "desc").limit(1)
							.onSnapshot((querySnapshot) => { // how to get the newest message
								// has not been written to back-end yet
								if (querySnapshot.metadata.hasPendingWrites) return;
								let data;
								querySnapshot.forEach((doc) => {
									data = doc.data();
								});
								// why is there always the null timestamp here? (sentinel??)
								// => https://firebase.google.com/docs/firestore/query-data/listen#events-local-changes
								// hacker can erase this if-statement to get new messages
								// but after we encrypt the data stored in firestore, this hack is useless (only get encrypted data)
								// user is authenticated already
								addMessage(data.content, data.uid, data.timestamp);
								// TODO: handle this behaviour
								message_list.scrollTo(0, message_list.scrollHeight);
							});
					});

				// how to add eventListener when scrollTop == 0???
				message_list.onscroll = function() {
					// 10 messages above
					if (!startReached && message_list.scrollTop * totalMessageNo / message_list.scrollHeight <= 10) {
						// get the old history
						chat.where("timestamp", "<", firstTimestamp).orderBy("timestamp", "desc").limit(10)
							.get().then((snapshot) => {
								// what if there are no snapshots? => do nothing
								if (snapshot.size != 0) {
									let oldData;
									snapshot.docs.forEach(doc => {
										oldData = doc.data();
										addMessage(oldData.content, oldData.uid, oldData.timestamp, true);
									});
									firstTimestamp = oldData.timestamp;
								}
								else {
									startReached = true;
								}
							});
					}
				}
			});

		});
});

// eventListener to update the chat-log
const form = document.querySelector('#message-form');
form.addEventListener('submit', (e) => {
	e.preventDefault();
	if (form.message.value != "" && cuid != null) { // valid message only
		chat.add({
			content: form.message.value,
			uid: cuid,
			timestamp: firebase.firestore.FieldValue.serverTimestamp()
		});
	}
	form.message.value = "";
});