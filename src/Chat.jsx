import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useState, useEffect, useRef } from 'react';
import './Chat.css';
import logo from '../public/gaspface-logo.png'; // '../public/emnet-gasp-face-logo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import content from "./aicontent.js";
import { FaArrowUp, FaPaperclip } from "react-icons/fa";

const systemMessage = {
  role: "system",
  content: content // Context for AI with background knowledge of me and some rules and stuff
};

const API_KEY = import.meta.env.VITE_API_KEY;

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
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImagePreviewClick = () => {
    setSelectedImage(null);
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
  
      // Display the image in the chat
      displayImageMessage(base64File);
  
      // Prepare the payload for the OpenAI API
      const payload = {
        model: 'gpt-4o-mini',
        messages: [
          systemMessage,
          ...messages.map(msg => ({
            role: msg.sender === "ChatGPT" ? "assistant" : "user",
            content: msg.message,
          })),
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64File
                }
              }
            ]
          }
        ],
        max_tokens: 1000
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
      // Limit the conversation history to the last 5 messages
      const recentMessages = messages.slice(-5);
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: 'gpt-4', // Use GPT-4 for text-based responses
          messages: [
            systemMessage,
            ...recentMessages.map(msg => ({
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
        } else if (data.error) {
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

  // Compress image function
  const compressImage = (base64File, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64File;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Compress the image
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
    });
  };

  const handleFileSelect = async (event) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result;

        // Compress the image before setting it
        const compressedImage = await compressImage(base64File);
        setSelectedImage(compressedImage);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    const outgoingMessage = {
      message: newMessage,
      sender: 'user'
    };

    setNewMessage(''); // Clear the textarea immediately
    setIsTyping(true);

    try {
      if (newMessage.trim()) {
        setMessages(prevMessages => [...prevMessages, outgoingMessage]);
        await sendMessageToAPI(outgoingMessage.message);
      }

      if (selectedImage) {
        await sendImageToAPI(selectedImage);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      displayErrorMessage("GimmyAI ran out of juice, come back later!");
    } finally {
      setIsTyping(false);
    }

    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatMessage = (message) => {
    if (message.image) {
      return {
        __html: `<img src="${message.message}" alt="User upload" style="max-width: 100%; max-height: 400px;" />`,
      };
    }
  
    let formattedMessage = message.message.replace(/###\s?(.*)/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedMessage = formattedMessage.replace(/\[([^\]]+)\]\((http[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    formattedMessage = formattedMessage.replace(/(\bhttps?:\/\/[^\s<]+)(?![^<]*>)(?!<\/a>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
    // Handle LaTeX equations
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

  
  return (
    <div id="root">
      <header className="app-header">
        <a href="/"><img src={logo} width="50px" height="60px" alt="GimmyAI Logo" className="app-logo" /></a>
        <h1>EmnetAI</h1>
        <div className="tooltip-container">
          <FontAwesomeIcon className="info-icon" icon={faCircleInfo} />
          <span className="tooltip w3-animate-opacity">Powered by GPT-4o</span>
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
            <span></span><span></span><span></span> EmnetAI is typing...
          </div>
        )}
      </div>

      <div className="input-container">
        <label htmlFor="imageInput">
          <FaPaperclip className="attachment-button" />
          <input
            type="file"
            id="imageInput"
            accept="image/png,image/jpeg,image/webp,image/gif"
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
          onChange={(e) => setNewMessage(e.target.value)}
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