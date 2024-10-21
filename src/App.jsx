import { Routes, Route } from 'react-router-dom';
import Entrance from './Entrance';
import Chat from './Chat';
import NoMatch from "./NoMatch"

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Entrance />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
  );
};

export default App;