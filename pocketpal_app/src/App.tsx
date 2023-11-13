import "./App.css";
import CustomNavbar from "./components/NavbarComponent";
import BasicPieChart from "./components/BasicPieChart";
import { MantineProvider, Text } from "@mantine/core";
import HistoryComponent from "./components/HistoryComponent.tsx";
import ExpenseAddingForm from "./components/ExpenseAddingForm.tsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "./config/firebase.tsx";
import { collection, query, where } from "firebase/firestore";
import { getDocs } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { DefaultAlertTime } from "./config/globals.tsx";
import { Timestamp } from "firebase/firestore";

import { AnimatedRoutes } from "./pages/AnimatedRoutes";

import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Router, BrowserRouter } from "react-router-dom";

function App() {
    const colorScheme = "dark";
<<<<<<< Updated upstream
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [data, setData] = useState<Array<Expense>>([]);
    const [reload, setReload] = useState<boolean>(true);

    const fetchData = async () => {
        try {
            // pobierz wszystkie dokumenty z kolekcji 'usersData' z katalogu danego użytkownika
            const uid = auth.currentUser?.uid || null;

            if (uid) {
                const q = query(
                    collection(db, "usersData"),
                    where("user", "==", uid)
                );
                const querySnapshot = await getDocs(q);

                const fetchedData: Array<Expense> = new Array<Expense>();

                if (querySnapshot) {
                    querySnapshot.forEach((doc) => {
                        const docData = doc.data();
                        fetchedData.push({
                            id: doc.id,
                            category: docData.category,
                            creationDate: docData.creationDate,
                            description: docData.description,
                            type: docData.type,
                            user: docData.user,
                            value: docData.value,
                        });
                    });
                }
                setData(fetchedData);
            }
            setReload(false);
        } catch (error) {
            toast.error("Wystąpił błąd podczas pobierania danych!", {
                position: "top-center",
                autoClose: DefaultAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    const onUpdate = () => {
        setReload(true);
    };

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (reload) {
                fetchData().then();
            }

            if (user) {
                setLoggedIn(true);
                // console.log(user);
            } else {
                setLoggedIn(false);
            }
        });
    }, [reload, data]);
=======
>>>>>>> Stashed changes

    return (
            <BrowserRouter >
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
