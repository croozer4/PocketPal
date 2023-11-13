import "./App.css";
import CustomNavbar from "./components/NavbarComponent";
import { MantineProvider } from "@mantine/core";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AnimatedRoutes } from "./pages/AnimatedRoutes";

import { BrowserRouter } from "react-router-dom";

function App() {
    const colorScheme = "dark";

    return (
        <BrowserRouter>
            <MantineProvider theme={{ colorScheme: colorScheme }}>
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
                <CustomNavbar />

                <div className="content">
                    <AnimatedRoutes />
                </div>
            </MantineProvider>
        </BrowserRouter>
    );
}

export default App;
