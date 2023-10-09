import './App.css'
import CustomNavbar from './components/NavbarComponent'
import AuthComponent from './components/AuthenticationComponent'

function App() {
  return (
    <>
      <CustomNavbar/>
      <div className="App">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
      </div>
      {/* <AuthComponent/> */}
    </>
  )
}

export default App