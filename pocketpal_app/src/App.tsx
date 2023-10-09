import './App.css'
import CustomNavbar from './components/NavbarComponent'
import BasicPieChart from './components/BasicPieChart'
import {Text} from "@mantine/core";

function App() {
  return (
    <>
      <CustomNavbar/>
      <div className="interface">
        <Text
          size="xl"
          weight={700}
          style={{marginBottom: "1rem"}}
        >
          Witaj w PocketPal!
        </Text>
      </div>
      <BasicPieChart/>
    </>
  )
}

export default App