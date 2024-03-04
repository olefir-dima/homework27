import "../src/style.css";

const wsProtocol = location.protocol === "http:" ? "ws" : "wss";
const ws = new WebSocket(`${wsProtocol}://${location.host}`);

function displayMessage(userName, text, time, isCurrentUser) {
  const messagesContainer = document.querySelector(".messages");
  const messageClass = isCurrentUser
    ? "messages__request"
    : "messages__respond";
  const alignmentClass = isCurrentUser ? "align-right" : "align-left";

  messagesContainer.insertAdjacentHTML(
    "beforeend",
    `
      <div class="message ${messageClass} ${alignmentClass}">
          <div class="message__header">
              <p class="message__sender">${userName}</p>
          </div>
          <div class="message__body">
              <p class="message__content">${text}</p>
          </div>
          <div class="message__footer">
              <p class="message__time">${time}</p>
          </div>
      </div>
    `
  );

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const { userName, message, userID } = data;
  const storedUserID = localStorage.getItem("userID");
  const isCurrentUser = userID === storedUserID;
  const time = new Date().toLocaleString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  displayMessage(userName, message, time, isCurrentUser);
};

function saveUserName() {
  const inputNameValue = document
    .querySelector(".messenger__input")
    .value.trim();
  if (!inputNameValue) {
    alert("Write your name in");
  } else {
    localStorage.setItem("userName", inputNameValue);
    document.querySelector(".messenger__initial").style.display = "none";
    document.querySelector(".messenger__loader").style.display = "block";
    setTimeout(() => {
      document.querySelector(".messenger__loader").style.display = "none";
      document.querySelector(".messenger__chat").style.display = "flex";
    }, 3000);
  }
}

const messengerBtn = document.querySelector(".messenger__btn");
messengerBtn.addEventListener("click", saveUserName);

const inputMessageBtn = document.querySelector(".messenger__input-message-btn");
inputMessageBtn.addEventListener("click", () => {
  const inputMessage = document.querySelector(".messenger__input-message");
  const message = inputMessage.value.trim();
  const userName = localStorage.getItem("userName");
  const userID = localStorage.getItem("userID");

  if (message) {
    const time = new Date().toLocaleString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const data = { userName, userID, message };
    ws.send(JSON.stringify(data));

    displayMessage(userName, message, time, true);

    inputMessage.value = "";
  } else {
    alert("The message is empty");
  }
});
