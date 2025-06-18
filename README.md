# GimmyAI - Your AI Homework Helper

Get instant help with math, science, english, and more. Upload images of your problems for detailed explanations.

## Features

- 🤖 AI-powered homework assistance
- 📝 Support for text, images, PDFs, and documents
- 🔒 Secure authentication with Firebase
- 💬 Real-time chat interface
- 📱 Responsive design for all devices
- 🎨 Modern and intuitive UI

## Tech Stack

- **Frontend**: React + Vite
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Notifications**: Sonner

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gimmyai.git
   cd gimmyai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase and OpenAI credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── firebase/          # Firebase configuration and services
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Features in Detail

### AI-Powered Homework Help

- Get instant answers to your questions
- Upload images of problems for detailed explanations
- Support for multiple subjects including math, science, and english

### File Upload Support

- Images (PNG, JPG, JPEG, GIF)
- PDF documents
- Word documents (DOC, DOCX)

### User Authentication

- Secure email/password authentication
- Protected routes and content
- User session management

### Real-time Chat

- Instant message delivery
- Message history
- File sharing capabilities
- AI response generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Girmachew Samson - [gimmys943@gmail.com](mailto:gimmys943@gmail.com)

Project Link: [https://github.com/yourusername/gimmyai](https://github.com/yourusername/gimmyai)
