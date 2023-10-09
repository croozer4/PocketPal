import './App.css'
import NavbarComponent from './components/NavbarComponent'
import AuthComponent from './components/AuthenticationComponent'

function App() {
  return (
    <>
      <NavbarComponent/>
      <div className="App">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
      </div>
      <AuthComponent/>
    </>
  )
}

export default App