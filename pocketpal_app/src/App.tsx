import './App.css'
import CustomNavbar from './components/NavbarComponent'
import BasicPieChart from './components/BasicPieChart'
import {MantineProvider, Text} from "@mantine/core";
import HistoryComponent from "./components/HistoryComponent.tsx";
import ExpenseAddingForm from './components/ExpenseAddingForm.tsx';
import { useDisclosure } from '@mantine/hooks';

function App() {

  const [openedAddingExpense, { open, close }] = useDisclosure(false);

  return (
    <MantineProvider theme={{colorScheme:'dark'}}>
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
        <ExpenseAddingForm openedAddingExpense={openedAddingExpense}/>
        <button onClick={open}>Dodaj wydatek</button>
      </div>
    </MantineProvider>
  )
}

export default App