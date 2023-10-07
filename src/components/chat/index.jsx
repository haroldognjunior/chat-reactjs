import Picker from "emoji-picker-react";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const Chat = () => {
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [fullHour, setFullHour] = useState("");
  const [listMessages, setListMessages] = useState([
    {
      body: "Bienvenido al chat",
      user: "admin",
      hour: fullHour,
    },
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const [activedButton, setActivedButton] = useState(false);
  const currentDate = new Date();
  const hour = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours();
  const minute =
    currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes();
  const second =
    currentDate.getSeconds() < 10 ? "0" + currentDate.getSeconds() : currentDate.getSeconds();

  const onEmojiClick = emojiObject => {
    setMessage(prevInput => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const handleSubmit = e => {
    e.preventDefault();

    socket.emit("message", { body: message, user: userName, hour: fullHour });

    const newMsg = {
      body: message,
      user: userName,
      hour: fullHour,
    };
    setListMessages([...listMessages, newMsg]);
    setMessage("");
  };

  useEffect(() => {
    const receiveMessage = msg => {
      setListMessages([...listMessages, msg]);
    };
    socket.on("message", receiveMessage);

    return () => socket.off("message", receiveMessage);
  }, [listMessages]);

  return (
    <div>
      <input
        type="text"
        onChange={e => setUserName(e.target.value)}
        placeholder="ingrese el nombre del usuario"
      ></input>
      <div>
        {listMessages.map((message, i) => (
          <p key={`${(message, i)}`}>
            {message.hour} {message.user}: {message.body}
          </p>
        ))}

        <form onSubmit={handleSubmit}>
          <p>Escribe tu mensaje.</p>
          <div>
            <img
              src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
              onClick={() => setShowPicker(!showPicker)}
              alt="emoji"
            />
            {showPicker && <Picker onEmojiClick={onEmojiClick} />}
            <input
              value={message}
              placeholder="Escribe tu mensaje"
              onChange={e => {
                console.log(e.target.value);
                setMessage(e.target.value);
                setFullHour(`[${hour}:${minute}:${second}]`);
                setActivedButton(userName.length > 0);
              }}
              type="text"
              name="message"
            />

            <button type="submit" disabled={!activedButton}>
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
