import './App.css';
import { KanbanBoard } from './pages/BoardPage';
import { default as HomePage } from './pages/HomePage';  // default export için böyle import edilir.
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';

function App() {


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/:boardId' element={<BoardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function BoardPage() {
  const { boardId } = useParams();

  return (
    <div>
      <div>
        <KanbanBoard boardId={boardId}/>
      </div>
    </div>
  );
}

export default App;