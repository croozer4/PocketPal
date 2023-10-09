import './App.css'
import CustomNavbar from './components/NavbarComponent'
import AuthComponent from './components/AuthenticationComponent'
import BasicPieChart from './components/BasicPieChart'

const data = [
  {
    "id": "lisp",
    "label": "lisp",
    "value": 114,
    "color": "hsl(116, 70%, 50%)"
  },
  {
    "id": "php",
    "label": "php",
    "value": 280,
    "color": "hsl(20, 70%, 50%)"
  },
  {
    "id": "go",
    "label": "go",
    "value": 409,
    "color": "hsl(222, 70%, 50%)"
  },
  {
    "id": "haskell",
    "label": "haskell",
    "value": 200,
    "color": "hsl(271, 70%, 50%)"
  },
  {
    "id": "make",
    "label": "make",
    "value": 486,
    "color": "hsl(278, 70%, 50%)"
  }
]


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

      <BasicPieChart/>
      siema
    </>
  )
}

export default App