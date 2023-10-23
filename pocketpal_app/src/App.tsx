import './App.css'
import CustomNavbar from './components/NavbarComponent'
import BasicPieChart from './components/BasicPieChart'
import {MantineProvider, Text} from "@mantine/core";
import HistoryComponent from "./components/HistoryComponent.tsx";
import ExpenseAddingForm from './components/ExpenseAddingForm.tsx';
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const colorScheme = 'dark';

  return (
    <MantineProvider theme={{colorScheme: colorScheme}}>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme={colorScheme}
      />
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
      <ExpenseAddingForm/>
    </MantineProvider>
  )
}

export default App