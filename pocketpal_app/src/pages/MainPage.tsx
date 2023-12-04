import React, {useState, useEffect} from 'react';
import {MantineProvider, Text, Button} from "@mantine/core";
import {toast} from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {auth, db, projectFirestore} from "../config/firebase.tsx";
import {addDoc, collection, doc, getDoc, query, where} from "firebase/firestore";
import {getDocs} from "@firebase/firestore";
import {DefaultAlertTime} from "../config/globals.tsx";
import BasicPieChart from "../components/BasicPieChart";
import HistoryComponent from "../components/HistoryComponent.tsx";
import ExpenseAddingForm from "../components/ExpenseAddingForm.tsx";
import {Timestamp} from "@firebase/firestore";
import "../App.css";
import {IconFileTypePdf, IconPlus} from "@tabler/icons-react";

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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [data, setData] = useState<Array<Expense>>([]);
    const [earnings, setEarnings] = useState<number>(0);
    const [reload, setReload] = useState<boolean>(true);

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Current month
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Current year

    const fetchMonthlyBudget = async () => {
        try {
            const uid = auth.currentUser?.uid || null;
            if (uid) {
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

    const fetchRecurrentExpenses = async () => {
        const recurrentExpenses: Expense[] = [];
        try {
            const uid = auth.currentUser?.uid || null;
            if (uid) {
                const querySnapshot = await getDocs(query(collection(db, "users", uid, "recurrentExpenses"), where("type", "==", true)));
                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    const expense = {
                        id: doc.id,
                        category: data.category,
                        creationDate: data.creationDate,
                        description: data.description,
                        type: data.type,
                        user: data.user,
                        value: data.value,
                    };
                    recurrentExpenses.push(expense);
                }
            }
            return recurrentExpenses;
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
            await fetchMonthlyBudget();

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
                    if (docData.type !== true) {
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
                    }
                });

                // Filtruj dane na podstawie wybranego miesiąca i roku
                const filteredData = fetchedData.filter(item => {
                    if (item !== undefined) {
                        if (item.type !== true) {
                            const itemDate = new Date(item.creationDate.toMillis());
                            return (
                                itemDate.getFullYear() === selectedYear &&
                                itemDate.getMonth() + 1 === selectedMonth
                            );
                        }
                    }
                });

                if (filteredData !== undefined) setData([...filteredData, ...await fetchRecurrentExpenses()]);
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

            //ustaw czcionkę na roboto
            pdf.setFont('Roboto');



            // Pobierz aktualną datę i sformatuj ją
            const now = new Date();
            const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;

            // Dodaj aktualną datę na górze dokumentu
            pdf.setFontSize(10);
            pdf.text(`Data wygenerowania: ${formattedDate}`, 10, 10);

            // Zwiększ margines dla tytułu raportu
            pdf.setFontSize(20);
            pdf.text(`Raport dla ${data[0]?.displayName} z ${selectedMonth}/${selectedYear}`, 10, 20);

            //dopisz "Tabela wydatków"
            pdf.setFontSize(14);
            pdf.text(`Tabela wydatków`, 10, 30);

            // Przygotuj dane do pierwszej tabeli (wydatki)
            const expenseTableData = data.map(item => [
                item.category,
                item.creationDate.toDate().toLocaleDateString(),
                item.description || '-',
                item.value.toFixed(2),
            ]);

            // Dodaj łączną sumę wydatków
            const totalExpense = data.reduce((sum, item) => sum + item.value, 0);
            const totalExpenseRow = ['Suma', '', '',totalExpense.toFixed(2)];
            expenseTableData.push(totalExpenseRow);

            // Dodaj nagłówki do pierwszej tabeli
            const expenseTableHeaders = ['Kategoria', 'Data', 'Opis', 'Wartosci'];
            (pdf as any).autoTable({
                startY: 35,
                head: [expenseTableHeaders],
                body: expenseTableData,
                theme: 'grid',
            });

            // Oblicz pozycję startY dla drugiej tabeli
            let startYForSecondTable = (pdf as any).lastAutoTable.finalY + 10;  // Dodajemy 10 jako margines

            //dopisz "Podsumowanie"
            pdf.setFontSize(14);
            pdf.text(`Podsumowanie`, 10, startYForSecondTable);

            // Przygotuj dane do drugiej tabeli (earnings)
            const earningsTableData = [
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

            // Dodaj nagłówki do drugiej tabeli
            const earningsTableHeaders = ['Przychody', 'Wydatki', 'Roznica'];
            (pdf as any).autoTable({
                startY: startYForSecondTable + 5,
                head: [earningsTableHeaders],
                body: earningsTableData,
                theme: 'grid',
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
                if(!reload) {
                    setData([]);
                    setEarnings(0);
                }
                setReload(true);
            }
        });
    }, [reload, data, selectedMonth, selectedYear]);

    useEffect(() => {
        // Fetch data only when logged in
        if (loggedIn) {
            // console.log('Fetching data...');
            fetchData();
        }
    }, [selectedMonth, selectedYear, loggedIn]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="main-page">
            <MantineProvider theme={{colorScheme: colorScheme}}>
                {loggedIn ? (
                    <div className="MonthPicker">
                        <label id="month">Wybierz miesiąc: </label>
                        <DatePicker className="MonthPicker__input"
                                    selected={new Date(selectedYear, selectedMonth - 1)}
                                    onChange={(date: any) => {
                                        // console.log('Selected Date:', date);
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
                        <div className="overview"
                            style={{minWidth: data.length !== 0 ? "45vw" : "100%"}}
                        >
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
                                        style={{marginBottom: "1rem"}}
                                    >
                                        Brak danych do wyświetlenia
                                    </Text>
                                    <BasicPieChart data={data} earnings={earnings}/>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overview"
                             style={{minWidth: data.length !== 0 ? "45vw" : "100%", top: "calc(50% - 250px)"}}
                        >
                            <Text
                                size="xl"
                                weight={700}
                                style={{marginBottom: "1rem"}}
                            >
                                Witaj w PocketPal!
                            </Text>

                            <BasicPieChart data={data} earnings={earnings}/>
                        </div>
                    )}
                    {data.length !== 0 && loggedIn ? (
                        <HistoryComponent data={data} fetchData={fetchData}/>
                    ) : (
                        <></>
                    )}
                </div>
                {loggedIn ? <ExpenseAddingForm onUpdate={onUpdate}/> : <></>}
                {loggedIn ?
                    <Button className="family_raport_button" onClick={generatePDF}
                            style={{
                                paddingLeft: isMobile ? "5px" : "20px",
                                paddingRight: isMobile ? "5px" : "20px",
                                right: isMobile ? "70px" : "170px",
                                borderRadius: isMobile ? "50%" : "0.25rem"
                            }}>
                        {isMobile ? <IconFileTypePdf/> : "Generuj raport PDF"}
                    </Button>
                    :
                    <></>
                }
            </MantineProvider>
        </div>
    );
};

export default MainPage;
