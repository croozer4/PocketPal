import './App.css'
import CustomNavbar from './components/NavbarComponent'
import BasicPieChart from './components/BasicPieChart'
import {Text} from "@mantine/core";
import HistoryComponent from "./components/HistoryComponent.tsx";

function App() {
  return (
    <>
      <CustomNavbar/>
      <div className="interface">
        <div className="overview">
          <Text
            size="xl"
            weight={700}
            style={{marginBottom: "1rem"}}
          >
            Witaj w PocketPal!
          </Text>
          <BasicPieChart/>
        </div>
        <HistoryComponent/>
      </div>
    </>
  )
}

export default App