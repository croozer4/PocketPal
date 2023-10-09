import './App.css'
import NavbarComponent from './components/NavbarComponent'
import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <MantineProvider>
      <NavbarComponent/>
        <div className="App">
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
        </div>
    </MantineProvider>
  )
}

export default App
