const socket = io();

const inbox = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

let userName = '';

const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

    const receivedMsg = `
    <div class="incoming__message">
      <div class="received__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="message__author">${user}</span>
          <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>`;

    const myMsg = `
    <div class="outgoing__message">
      <div class="sent__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>`;

    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    inputField.value = "";
});

inputField.addEventListener("keyup", () => {
    socket.emit("typing", {
        isTyping: inputField.value.length > 0,
        nick: userName,
    });
});

const newUserConnected = (user) => {
    userName = user || `User${Math.floor(Math.random() * 10000)}`;
    socket.emit("new user", userName);
}

const addToBox = (userName) => {
    if (document.querySelector(`.${userName}-userlist`))
        return;

    const userBox = `
        <div class="chat_ib ${userName}-userlist">
        <h5>${userName}</h5>
        </div>
    `
    inbox.innerHTML += userBox;
};

newUserConnected();

socket.on("new user", (data) => {
    data.map((user) => addToBox(user));
});

socket.on("user disconnected", (userName) => {
    document.querySelector(`.${userName}-userlist`).remove();
})

socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});

socket.on("typing", function (data) {
    const { isTyping, nick } = data;

    if (!isTyping) {
        fallback.innerHTML = "";
        return;
    }
    fallback.innerHTML = `<p>${nick} is typing...</p>`;
});