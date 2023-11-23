import React, { useState, useEffect } from 'react';
import { MantineProvider, Text, Button } from "@mantine/core";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { render } from 'react-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from "../config/firebase.tsx";
import { collection, query, where } from "firebase/firestore";
import { getDocs } from "@firebase/firestore";
import { DefaultAlertTime } from "../config/globals.tsx";
import BasicPieChart from "../components/BasicPieChart";
import HistoryComponent from "../components/HistoryComponent.tsx";
import ExpenseAddingForm from "../components/ExpenseAddingForm.tsx";
import { Timestamp } from "@firebase/firestore";
import html2canvas from 'html2canvas';


import "../App.css";

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
        fetchData(); // Fetch data directly on update
    };

    const generatePDF = async () => {
        try {
            const pdf = new jsPDF();

            // Dodaj tytuł do raportu
            pdf.text(`Raport wydatków - ${selectedMonth}/${selectedYear}`, 14, 10);

            // Poczekaj na zakończenie renderowania wykresu
            // const chartContainer = document.getElementById('chart-container');

            //zmienie koloru arcLinkLabelsTextColor="#FFFFFF"




            // const chartCanvas = await html2canvas(chartContainer!);

            // const chartImage = chartCanvas.toDataURL('image/png');

            // Dodaj obraz z wykresem do raportu
            // pdf.addImage(chartImage, 'PNG', 30, 30, 150, 150);

            // Przygotuj dane do tabeli
            const tableData = data.map(item => [
                item.category,
                item.description || '-',
                item.value.toFixed(2),
            ]);

            // Dodaj łączną sumę wydatków
            const totalExpense = data.reduce((sum, item) => sum + item.value, 0);
            const totalRow = ['Suma', '', totalExpense.toFixed(2)];
            tableData.push(totalRow);

            

            // Dodaj nagłówki do tabeli
            const tableHeaders = ['Kategoria', 'Opis', 'Wartosci'];
            (pdf as any).autoTable({
                startY: 20,
                head: [tableHeaders],
                body: tableData,
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
                                        <BasicPieChart data={data} />
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
                                    <BasicPieChart data={data} />
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

                            <BasicPieChart data={data} />
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
