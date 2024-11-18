import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useState, useEffect, useRef } from 'react';
import './Chat.css';
import logo from '../public/gaspface-logo.png'; // Adjust the path if necessary
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import content from "./aicontent.js";
import { FaArrowUp, FaPaperclip } from "react-icons/fa";
const systemMessage = {
  role: "system",
  content: content // Context for AI with background knowledge of me and some rules and stuff

};

const API_KEY = import.meta.env.VITE_API_KEY;
const currentGptModel = 'gpt-4o-mini';

function Chat() {
  const [messages, setMessages] = useState([
    {
      message: `Hello, I'm **GimmyAI**! What can I help you with?`,
      sender: "ChatGPT"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const lastMessageRef = useRef(null);
  

  useEffect(() => {
    if (lastMessageRef.current && !isMobileDevice()) {
      const chatContainer = document.querySelector('.app-body');
      const observer = new IntersectionObserver(entries => {
        const lastEntry = entries[0];
        if (!lastEntry.isIntersecting && chatContainer.scrollTop + chatContainer.offsetHeight >= chatContainer.scrollHeight) {
          lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, {
        threshold: 1.0
      });
  
      observer.observe(lastMessageRef.current);
      return () => observer.disconnect(); // Clean up the observer when the component unmounts or updates
    }
  }, [messages]);
  
  
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  
  const handleImagePreviewClick = () => {
    setSelectedImage(null);
  };

  const handleFileSelect = (event) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(imageFile);
    }
  };
  

  const displayImageMessage = (base64Image) => {
    setMessages(prevMessages => [...prevMessages, {
      message: base64Image,
      sender: 'user',
      image: true
    }]);
  };

  const displayErrorMessage = (errorMessage) => {
    setMessages(prevMessages => [...prevMessages, { message: errorMessage, sender: 'ChatGPT' }]);
  };

  

  const MAX_FILE_SIZE_MB = 15; // Set a maximum size limit for images (in MB)

  const sendImageToAPI = async (base64File) => {
    setIsTyping(true);
    try {
      const fileSize = base64File.length * (3 / 4) / (1024 * 1024); // Convert base64 length to MB
      if (fileSize > MAX_FILE_SIZE_MB) {
        displayErrorMessage(`The file is too large (${fileSize.toFixed(2)} MB). Please upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`);
        setIsTyping(false);
        return;
      }
  
      // For now, describe the image in the text and send it
      const imageMessage = `I've uploaded an image (${fileSize.toFixed(2)} MB).`; // Optionally include file size
      setMessages(prevMessages => [...prevMessages, { message: imageMessage, sender: 'user' }]);
  
      const payload = {
        model: currentGptModel, // Ensure the correct model is used
        messages: [
          systemMessage,
          ...messages.map(msg => ({
            role: msg.sender === "ChatGPT" ? "assistant" : "user",
            content: msg.message,
          })),
          { role: 'user', content: imageMessage }, // Mention the image as part of the conversation
        ],
      };
  
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Display the response from GPT in the chat
        setMessages(prevMessages => [...prevMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
      } else {
        if (response.status === 429) {
          displayErrorMessage("GimmyAI is getting too many requests right now. Please try again after a few minutes.");
        } else {
          displayErrorMessage(`Error: ${data.error.message}`);
        }
      }
    } catch (error) {
      console.error('Error interpreting file:', error);
      displayErrorMessage('An error occurred while interpreting the file.');
    } finally {
      setIsTyping(false);
    }
  };
  


  const sendMessageToAPI = async (userMessage) => {
    setIsTyping(true);
    let apiErrorOccurred = false;
    let friendlyErrorMessage = "Oops! There was an unexpected hiccup.";
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-08-06',
          messages: [
            systemMessage,
            ...messages.map(msg => ({
              role: msg.sender === "ChatGPT" ? "assistant" : "user",
              content: msg.message
            })),
            { role: 'user', content: userMessage }
          ]
        })
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessages(prevMessages => [...prevMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
      } else {
        apiErrorOccurred = true;
        if (response.status === 429) {
          friendlyErrorMessage = "GimmyAI is getting too many requests right now. Please try again after a few minutes.";
        } else if(data.error){
          friendlyErrorMessage = `Error: ${data.error.message}`;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      apiErrorOccurred = true;
      friendlyErrorMessage = "Looks like GimmyAI's got too excited and needs a moment. Let's give it some space and try again after a short break.";
    } finally {
      setIsTyping(false);
      if (apiErrorOccurred) {
        displayErrorMessage(friendlyErrorMessage);
      }
    }
  };

  
  
  const handleSendMessage = async () => {
    const chatContainer = document.querySelector('.app-body');
    const isScrollingUp = chatContainer.scrollTop < chatContainer.scrollHeight - chatContainer.offsetHeight;
    if (event && event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      return;
    }
    if (!newMessage.trim() && selectedImage === null) return;
    const outgoingMessage = {
      message: newMessage,
      sender: 'user'
    };
    const isDuplicateMessage = messages.length > 0 && messages[messages.length - 1].message.trim() === outgoingMessage.message.trim();
    if (isDuplicateMessage) {
      return;
    }
    setNewMessage(''); // Clear the textarea immediately
    setIsTyping(true);
    try {
      if (newMessage.trim()) {
        setMessages(prevMessages => [...prevMessages, outgoingMessage]);
      }
  
      if (selectedImage) {
        await sendImageToAPI(selectedImage);
        setSelectedImage(null);
      } else if (outgoingMessage.message.trim()) {
        await sendMessageToAPI(outgoingMessage.message);
      }
    } catch (error) {
      if (error.status === 429) {
        displayErrorMessage("GimmyAI is getting too many requests right now. Please try again after a few minutes.");
      } 
      console.error("Error sending message:", error);
      displayErrorMessage("GimmyAI ran out of juice, come back later!");
    } finally {
      setIsTyping(false);
    }
  
    if (!isScrollingUp) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  
  };

  // eslint-disable-next-line no-unused-vars
  const handlePaste = (event) => {
    event.preventDefault(); // Prevent the default paste behavior
  
    const items = event.clipboardData.items;
  
    const imageItem = Array.from(items).find((item) => item.type.indexOf('image') === 0);
  
    if (imageItem) {
      const blob = imageItem.getAsFile();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        displayImageMessage(base64Image);
        sendImageToAPI(base64Image);
      };
      reader.readAsDataURL(blob);
    } else {
      const pasteText = event.clipboardData.getData('text/plain');
      setNewMessage(prevMessage => prevMessage + pasteText); 
    }
  };
  
  

  const formatMessage = (message) => {
    if (message.image) {
      return {
        __html: `<img src="data:image/png;base64,${message.message}" alt="User upload" style="max-width: 100%; max-height: 400px;" />`,
      };
    }
  
    let formattedMessage = message.message.replace(/###\s?(.*)/g, '<strong>$1</strong>');
  
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedMessage = formattedMessage.replace(/\[([^\]]+)\]\((http[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    formattedMessage = formattedMessage.replace(/(\bhttps?:\/\/[^\s<]+)(?![^<]*>)(?!<\/a>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
    // Replace the try-catch block in the formatMessage function
    try {
      // Block-level LaTeX equations with $$...$$
      formattedMessage = formattedMessage.replace(/\$\$(.*?)\$\$/g, (match, equation) => {
        const html = katex.renderToString(equation, {
          throwOnError: false,
          displayMode: true,
          output: 'html',
        });
        return `<div class="katex-block">${html}</div>`;
      });
  
      // Inline LaTeX equations with $...$
      formattedMessage = formattedMessage.replace(/\$(.*?)\$/g, (match, equation) => {
        const html = katex.renderToString(equation, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
        });
        return `<span class="katex-inline">${html}</span>`;
      });
    } catch (error) {
      console.error('Error formatting equation:', error);
    }
  
    return { __html: formattedMessage };
  };

  

// const handleTextareaChange = (e) => {
//   const target = e.target;
//   setNewMessage(target.value);

//   if (target.value.trim()) {
//     target.style.height = 'auto';
//     target.style.height = `${target.scrollHeight}px`;
//   }
// };

  
  

  return (
    <div id="root">
      <header className="app-header">
      <a href="/"><img src={logo} width="50px" height="60px" alt="GimmyAI Logo" className="app-logo" /></a>
        <h1>GimmyAI</h1>
        <div className="tooltip-container">
          <FontAwesomeIcon className="info-icon" icon={faCircleInfo} />
          <span className="tooltip w3-animate-opacity">GimmyAI is powered by better models of GPT</span>
        </div>
      </header>
      <div className="app-body">
      {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'user' ? 'outgoing' : 'incoming'}`}>
              <div dangerouslySetInnerHTML={formatMessage(message)} />
            </div>
          ))}
        <div ref={lastMessageRef} />
        {isTyping && (
          <div className="typing-indicator">
            <span></span><span></span><span></span> GimmyAI is typing...
          </div>
        )}
      </div>
      <div className="input-container">
        <label htmlFor="imageInput">
          <FaPaperclip className="attachment-button"/>
          <input
            type="file"
            id="imageInput"
            accept="image/png,image/jpeg,image/webp,image/gif,.pdf/.doc"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
       {selectedImage && (
        <div className="image-preview-container" onClick={handleImagePreviewClick}>
          <img src={selectedImage} alt="Selected Image" className="image-preview" />
        </div>
      )}
              
      <textarea
        value={newMessage}
        onChange={(e) => {
          // handleTextareaChange(e);
          setNewMessage(e.target.value);
        }}
        placeholder="Type your message here..."
        className="input-textarea"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      <FaArrowUp className="send-button" onClick={handleSendMessage} title="Send" alt="Send Message"></FaArrowUp>
    </div>
  </div>

  );
}

export default Chat;
/******  03fd2ed0-edfb-437a-91bf-b52a6c08033f  *******/