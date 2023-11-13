import "../App.css";
import CustomNavbar from "../components/NavbarComponent";
import BasicPieChart from "../components/BasicPieChart";
import { MantineProvider, Text } from "@mantine/core";
import HistoryComponent from "../components/HistoryComponent.tsx";
import ExpenseAddingForm from "../components/ExpenseAddingForm.tsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../config/firebase.tsx";
import { collection, query, where } from "firebase/firestore";
import { getDocs } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { DefaultAlertTime } from "../config/globals.tsx";
import { Timestamp } from "firebase/firestore";

type Expense = {
    id: string;
    category: string;
    creationDate: Timestamp;
    description?: string;
    type: boolean;
    user: string;
    value: number;
};

const MainPage = () => {
    const colorScheme = "dark";
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
                console.log(user);
            } else {
                setLoggedIn(false);
            }
        });
    }, [reload, data]);

    return (
        <div className="main-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                <div className="interface">
                    <div className="overview">
                        <Text
                            size="xl"
                            weight={700}
                            style={{ marginBottom: "1rem" }}
                        >
                            Witaj w PocketPal!
                        </Text>
                        <BasicPieChart data={data} />
                    </div>
                    {data.length !== 0 && loggedIn ? (
                        <HistoryComponent data={data} fetchData={fetchData} />
                    ) : (
                        <></>
                    )}
                </div>
                {loggedIn ? <ExpenseAddingForm onUpdate={onUpdate} /> : <></>}
            </MantineProvider>
        </div>
    );
};

export default MainPage;
