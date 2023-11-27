import {Accordion, Button, MantineProvider} from '@mantine/core';
import {format} from 'date-fns';
import {auth, db} from "../config/firebase.tsx";
import {deleteDoc, doc} from "@firebase/firestore";
import {toast} from "react-toastify";
import {QuickAlertTime} from "../config/globals.tsx";
import "../styles/HistoryComponentStyles.css";
import {Timestamp} from '@firebase/firestore-types';
import {useEffect} from 'react';

type Expense = {
    id: string;
    category: string;
    creationDate: Timestamp;
    description?: string;
    type: boolean;
    user: string;
    value: number;
}

const deleteExpense = async (id: string) => {
    try {
        // pobierz wszystkie dokumenty z kolekcji 'usersData' z katalogu danego użytkownika
        const uid = auth.currentUser?.uid || null;

        if (uid) {
            await deleteDoc(doc(db, "usersData", id)).then(() => {
                toast.success('Wydatek został usunięty!', {
                    position: "top-center",
                    autoClose: QuickAlertTime,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            });
        }
    } catch (error) {
        toast.error('Wystąpił błąd podczas usuwania wydatku!', {
            position: "top-center",
            autoClose: QuickAlertTime,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }
}

const deleteRecurrentExpense = async (id: string) => {
    try {
        const uid = auth.currentUser?.uid || null;
        if (uid) {
            await deleteDoc(doc(db, "users", uid, "recurrentExpenses", id)).then(() => {
                toast.success('Stały wydatek został usunięty!', {
                    position: "top-center",
                    autoClose: QuickAlertTime,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            });
        }
    } catch (error) {
        toast.error('Wystąpił błąd podczas usuwania stałego wydatku!', {
            position: "top-center",
            autoClose: QuickAlertTime,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }
}

const PeekDetails = ({fetchData, ...item}: Expense & { fetchData: () => void }) => {
    // Formatowanie daty przy użyciu date-fns
    const timestamp = item.creationDate.toMillis(); // Konwersja na timestamp w milisekundach
    const dateFormatted = format(timestamp, "dd/MM/yyyy");
    // console.log(item.creationDate); // Obiekt Firestore Timestamp
    // console.log(dateFormatted); // Sformatowana data

    const handleDeleteExpense = async (id: string) => {
        try {
            // Usuń wydatek i wywołaj fetchData po pomyślnym usunięciu
            await deleteExpense(id);
            fetchData();
        } catch (error) {
            toast.error('Wystąpił błąd podczas usuwania wydatku!', {
                position: "top-center",
                autoClose: QuickAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }

    const handleDeleteRecurrentExpense = async (id: string) => {
        try {
            // Usuń wydatek i wywołaj fetchData po pomyślnym usunięciu
            await deleteRecurrentExpense(id);
            fetchData();
        } catch (error) {
            toast.error('Wystąpił błąd podczas usuwania stałego wydatku!', {
                position: "top-center",
                autoClose: QuickAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }

    return (
        <Accordion.Item key={item.id} value={item.id}>
            <Accordion.Control>{item.category} | {item.value}zł
                ({dateFormatted}){item.type ? " | Stały wydatek" : null}</Accordion.Control>
            <Accordion.Panel>
                <div className='description-container'>{item.description}</div>
                {item.user === auth.currentUser?.uid &&
                    <>
                        {item.type ?
                            <Button variant="filled" color="orange" style={{marginTop: "10px"}}
                                    onClick={() => handleDeleteRecurrentExpense(item.id)}>Usuń stały wydatek</Button>
                            :
                            <Button variant="filled" color="red" style={{marginTop: "10px"}}
                                    onClick={() => handleDeleteExpense(item.id)}>Usuń</Button>
                        }
                    </>
                }
            </Accordion.Panel>
        </Accordion.Item>
    );
}

const HistoryComponent = ({data, fetchData}: { data: Array<Expense>, fetchData: () => void }) => {
    return (
        <MantineProvider theme={{colorScheme: 'dark'}}>
            <Accordion multiple style={{minWidth: "50vw"}} className='history-list'>
                {
                    data.map((item) => (
                        <PeekDetails key={item.id} {...item} fetchData={fetchData}/>
                    )).sort((a, b) => {
                        return new Date(b.props.date).getTime() - new Date(a.props.date).getTime()
                    })
                }
            </Accordion>
        </MantineProvider>
    )
}

export default HistoryComponent;
