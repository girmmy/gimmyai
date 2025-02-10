import { useState } from 'react';
import './Entrance.css';
import Chat from "./Chat";
import logo from '../public/emnet-gasp-face.png'; // ../public/gaspface-logo.png
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
// import { faEnvelope as faEnvelopeSolid } from '@fortawesome/free-solid-svg-icons';

const Entrance = () => {
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const handleStartChatting = () => {
    setShowChat(true);
    
    navigate('/chat');
  };

  return (
    <> {/* Wrap everything in a fragment */}
      {!showChat && (
        <div className="entrance">
          <div className="container">
            <div className="title-container">
              <img src={logo} alt="GimmyAI Logo" className="logo" />
              <h1>
                Unlock the Power <br /> of AI with GimmyAI
              </h1>
              <p>Your AI companion for everyday tasks and engaging conversations.</p>
              {/* <p className="donate">$girmmy to donate!</p> */}
            </div>
            <button className="start-button" onClick={handleStartChatting}>
              Start Chatting!
            </button>
            <div className="social-links">
              <a href="https://instagram.com/@gimmified" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://www.linkedin.com/in/girmachew-samson" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
              <a href="https://github.com/girmmy" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </div>
        </div>
      )}
      {showChat && <Chat />}
    </>
  );
};

export default Entrance;
