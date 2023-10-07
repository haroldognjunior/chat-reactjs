import Picker from "emoji-picker-react";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

// Función de utilidad para agregar ceros a la izquierda
const addLeadingZero = value => (value < 10 ? "0" + value : value);

const getFormattedTime = () => {
  const currentDate = new Date();
  const hours = addLeadingZero(currentDate.getHours());
  const minutes = addLeadingZero(currentDate.getMinutes());
  const seconds = addLeadingZero(currentDate.getSeconds());
  return `[${hours}:${minutes}:${seconds}]`;
};

const Chat = () => {
  // Estados del componente
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [fullHour, setFullHour] = useState("");
  const [listMessages, setListMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [activedButton, setActivedButton] = useState(false);

  // Efecto para recibir mensajes del servidor
  useEffect(() => {
    const receiveMessage = msg => {
      setListMessages(prevMessages => [...prevMessages, msg]);
    };

    socket.on("message", receiveMessage);

    return () => socket.off("message", receiveMessage);
  }, []);

  // Manejo de eventos
  const onEmojiClick = emojiObject => {
    setMessage(prevInput => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Enviar mensaje al servidor
    socket.emit("message", { body: message, user: userName, hour: fullHour });

    // Agregar el nuevo mensaje a la lista
    const newMsg = {
      body: message,
      user: userName,
      hour: fullHour,
    };
    setListMessages(prevMessages => [...prevMessages, newMsg]);
    setMessage("");
  };

  return (
    <div className="container">
      <input
        className="userName"
        type="text"
        onChange={e => setUserName(e.target.value)}
        placeholder="Ingrese el nombre del usuario"
      ></input>
      <div>
        <p>Qué bueno verte por acá =)</p>
        {listMessages.length === 0 && <p class="smallText">Escribe tu mensaje.</p>}
        <div className="messages">
          {listMessages.map(
            (message, i) =>
              message.hour && (
                <p className="textMessage" key={`${(message, i)}`}>
                  {message.hour} <span className="user">{message.user}</span> :{" "}
                  <span className="body">{message.body}</span>
                </p>
              )
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bottomChat">
            <img
              className="pickerImg"
              src="https://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
              onClick={() => setShowPicker(!showPicker)}
              alt="emoji"
            />
            {showPicker && <Picker onEmojiClick={onEmojiClick} />}
            <input
              className="messageInput"
              value={message}
              placeholder="Escribe tu mensaje"
              onChange={e => {
                const newMessage = e.target.value;
                setMessage(newMessage);
                setFullHour(getFormattedTime());

                // Habilitar o deshabilitar el botón en función de la longitud del mensaje
                setActivedButton(newMessage.length > 0);
              }}
              type="text"
              name="message"
            />

            {/* Botón de envío */}
            <button className="submitButton" type="submit" disabled={!activedButton}>
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
