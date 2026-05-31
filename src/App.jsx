import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ZUNDE</h1>
        <p>Empowering Farmers with Health Intelligence</p>
      </header>
      <main>
        <DiseaseDetection />
      </main>
      <footer>
        <p>&copy; 2026 ZUNDE Project - Team GRIWD</p>
      </footer>
    </div>
  )
}

export default App
