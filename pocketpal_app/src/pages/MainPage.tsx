import React, { useState, useEffect } from 'react';
import { MantineProvider, Text, Button } from "@mantine/core";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from "../config/firebase.tsx";
import {collection, doc, getDoc, query, where} from "firebase/firestore";
import { getDocs } from "@firebase/firestore";
import { DefaultAlertTime } from "../config/globals.tsx";
import BasicPieChart from "../components/BasicPieChart";
import HistoryComponent from "../components/HistoryComponent.tsx";
import ExpenseAddingForm from "../components/ExpenseAddingForm.tsx";
import { Timestamp } from "@firebase/firestore";


import "../App.css";
import { display } from 'html2canvas/dist/types/css/property-descriptors/display';

type Expense = {
    id: string;
    category: string;
    creationDate: Timestamp;
    description?: string;
    type: boolean;
    user: string;
    value: number;
    earnings?: number;
    displayName?: string;
};

const MainPage = () => {
    const colorScheme = "dark";
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [data, setData] = useState<Array<Expense>>([]);
    const [earnings, setEarnings] = useState<number>(0);
    const [reload, setReload] = useState<boolean>(true);

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Current month
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Current year

    const fetchMonthlyBudget = async () => {
        try{
            const uid = auth.currentUser?.uid || null;
            if(uid){
                const monthlyBudget = doc(db, "users", uid);
                const docSnap = await getDoc(monthlyBudget);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const monthlyBudget = data?.earnings;
                    setEarnings(monthlyBudget);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd podczas pobierania budżetu miesięcznego!", {
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

    const fetchData = async () => {
        try {
            const uid = auth.currentUser?.uid || null;
    
            if (uid) {
                // Zapytanie do kolekcji 'usersData' (wydatki)
                const expensesQuery = query(
                    collection(db, "usersData"),
                    where("user", "==", uid),
                );
    
                const expensesSnapshot = await getDocs(expensesQuery);
    
                // Zapytanie do kolekcji 'users' (dane użytkownika)
                const userQuery = query(
                    collection(db, "users"),
                    where("email", "==", auth.currentUser?.email),
                );
    
                const userSnapshot = await getDocs(userQuery);
                const userData = userSnapshot.docs[0]?.data() || {};
    
                // Pobierz zarobki z danych użytkownika
                const earnings = userData.earnings || 0;
                const displayName = userData.displayName || "";
    
                const fetchedData = expensesSnapshot.docs.map((doc) => {
                    const docData = doc.data();
                    return {
                        id: doc.id,
                        category: docData.category,
                        creationDate: docData.creationDate,
                        description: docData.description,
                        type: docData.type,
                        user: docData.user,
                        value: docData.value,
                        earnings: earnings,
                        displayName: displayName,
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

            fetchMonthlyBudget();
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
        fetchMonthlyBudget();
        fetchData(); // Fetch data directly on update
    };

    const generatePDF = async () => {
        try {
            const pdf = new jsPDF();
    
            // Dodaj tytuł do raportu z diseplayName i datą
            pdf.setFontSize(20);
            pdf.text(`Raport dla ${data[0]?.displayName} z ${selectedMonth}/${selectedYear}`, 10, 10);


    
            // Przygotuj dane do pierwszej tabeli (wydatki)
            const expenseTableData = data.map(item => [
                item.category,
                item.description || '-',
                item.value.toFixed(2),
            ]);
    
            // Dodaj łączną sumę wydatków
            const totalExpense = data.reduce((sum, item) => sum + item.value, 0);
            const totalExpenseRow = ['Suma', '', totalExpense.toFixed(2)];
            expenseTableData.push(totalExpenseRow);
    
            // Dodaj nagłówki do pierwszej tabeli
            const expenseTableHeaders = ['Kategoria', 'Opis', 'Wartosci'];
            (pdf as any).autoTable({
                startY: 20,
                head: [expenseTableHeaders],
                body: expenseTableData,
            });
    

            // Dodaj odstęp między tabelami
            pdf.addPage();

            // Przygotuj dane do trzeciej tabeli (earnings)
            const earningsTableData2: (string | number)[][] = [
                [
                    data[0]?.earnings ? data[0].earnings.toFixed(2) : '-',
                    totalExpense.toFixed(2),
                    (
                        (data[0]?.earnings
                            ? parseFloat(data[0].earnings.toFixed(2))
                            : 0) - parseFloat(totalExpense.toFixed(2))
                    ).toFixed(2),
                ],
            ];
            

            // Dodaj nagłówki do trzeciej tabeli
            const earningsTableHeaders2 = ['Zarobki', 'Wydatki', 'Roznica'];
            (pdf as any).autoTable({
                startY: 20,
                head: [earningsTableHeaders2],
                body: earningsTableData2,
            });



            


    
            // Zapisz PDF
            pdf.save(`raport-${selectedMonth}-${selectedYear}.pdf`);
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd podczas generowania raportu PDF!", {
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

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
        });
    }, [reload, data, selectedMonth, selectedYear]);

    useEffect(() => {
        // Fetch data only when logged in
        if (loggedIn) {
            fetchMonthlyBudget();
            fetchData();
        }
    }, [selectedMonth, selectedYear, loggedIn]);

    return (
        <div className="main-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                {loggedIn ? (
                    <div className="MonthPicker">
                        <label id="month">Select Month: </label>
                        <DatePicker className="MonthPicker__input"
                            selected={new Date(selectedYear, selectedMonth - 1)}
                            onChange={(date: any) => {
                                console.log('Selected Date:', date);

                                setSelectedMonth(date.getMonth() + 1);
                                setSelectedYear(date.getFullYear());
                            }}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            id="month"
                        />
                    </div>
                ) : (
                    <></>
                )}
                <div className="interface">
                    {loggedIn ? (
                        <div className="overview">
                            {data.length !== 0 ? (
                                <>
                                    <div id="chart-container">
                                        <BasicPieChart data={data} earnings={earnings}/>
                                    </div>

                                </>
                            ) : (
                                <div className="no-data-message">
                                    <Text
                                        size="xl"
                                        weight={700}
                                        style={{ marginBottom: "1rem" }}
                                    >
                                        Brak danych do wyświetlenia
                                    </Text>
                                    <BasicPieChart data={data} earnings={earnings}/>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overview">
                            <Text
                                size="xl"
                                weight={700}
                                style={{ marginBottom: "1rem" }}
                            >
                                Witaj w PocketPal!
                            </Text>

                            <BasicPieChart data={data} earnings={earnings}/>
                        </div>
                    )}
                    {data.length !== 0 && loggedIn ? (
                        <div>
                            <HistoryComponent data={data} fetchData={fetchData} />
                            <Button className='raport_button' onClick={generatePDF}>Generuj raport PDF</Button>
                        </div>
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
