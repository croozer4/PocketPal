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

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Current month
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Current year

    const fetchData = async () => {
        try {
            const uid = auth.currentUser?.uid || null;
    
            if (uid) {
                const q = query(
                    collection(db, "usersData"),
                    where("user", "==", uid),
                );
    
                const querySnapshot = await getDocs(q);
    
                const fetchedData = querySnapshot.docs.map((doc) => {
                    const docData = doc.data();
                    return {
                        id: doc.id,
                        category: docData.category,
                        creationDate: docData.creationDate,
                        description: docData.description,
                        type: docData.type,
                        user: docData.user,
                        value: docData.value,
                    };
                });
    
                // Filtruj dane na podstawie wybranego miesiąca i roku
                const filteredData = fetchedData.filter(item => {
                    const itemDate = new Date(item.creationDate.toMillis());
                    return (
                        itemDate.getFullYear() === selectedYear &&
                        itemDate.getMonth() + 1 === selectedMonth
                    );
                });
    
                setData(filteredData);
            }
    
            setReload(false);
    
        } catch (error) {
            console.error(error);
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
    }



    const onUpdate = () => {
        // setReload(true); // Comment this line
        fetchData(); // Fetch data directly on update
    };

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            // if (reload) { // Comment this condition
                fetchData().then();
            // }
    
            if (user) {
                setLoggedIn(true);
                // console.log(user);
            } else {
                setLoggedIn(false);
            }
        });
    }, [reload, data, selectedMonth, selectedYear]);
    
    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);


    return (
        <div className="main-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                {loggedIn ? (
                    <div className="MonthPicker">
                        <label htmlFor="month">Select Month: </label>
                        <DatePicker
                            selected={new Date(selectedYear, selectedMonth - 1)}
                            onChange={(date: any) => {
                                console.log('Selected Date:', date);
                                
                                setSelectedMonth(date.getMonth() + 1);
                                setSelectedYear(date.getFullYear());

                                setData([]);
                                fetchData();
                                
                            }}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                        />
                    </div>
                ) : (
                    <></>
                )}
                <div className="interface">
                    <div className="overview">
                        <BasicPieChart data={data} />
                    </div>
                    {data && data.length !== 0 && loggedIn &&
                        <HistoryComponent data={data} fetchData={fetchData} />
                    }
                </div>
                {loggedIn && <ExpenseAddingForm onUpdate={onUpdate} />}
            </MantineProvider>
        </div>
    );
};

export default MainPage;
