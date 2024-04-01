import React, {useEffect, useState} from "react";
import {Button} from "@mantine/core";
import {MantineProvider, Text} from "@mantine/core";
import FamilyAddingForm from "../components/FamilyAddingForm.tsx";
import DisplayUserFamilies from "../components/DisplayUserFamilies.tsx";
import {auth, db, projectFirestore} from "../config/firebase.tsx";
import {
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    where,
    query,
    collection,
    DocumentData,
    addDoc,
    updateDoc,
} from "@firebase/firestore";

import DatePicker from "react-datepicker";

import {IconPhoto, IconDownload, IconArrowRight, IconFileTypePdf} from "@tabler/icons-react";

import "../styles/FamilyPageStyle.css";
import {Menu} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {toast} from "react-toastify";
import {DefaultAlertTime, QuickAlertTime} from "../config/globals.tsx";
import {Timestamp} from "firebase/firestore";
import HistoryComponent from "../components/HistoryComponent.tsx";

import {Modal} from "@mantine/core";

import BasicPieChart from "../components/BasicPieChart.tsx";
import {TextInput} from "@mantine/core";
import {v4 as uuidv4} from "uuid";

import "../styles/FamilyAddingFormStyles.css";
import "../styles/PeekMembersStyle.css";

import ExpenseAddingForm from "../components/ExpenseAddingForm.tsx";

import jsPDF from 'jspdf';
import 'jspdf-autotable';


interface Family {
    id: string;
    name: string;
    admins: string[];
    createdBy: string;
    inviteCode: string;
    members: string[];
    // Dodaj inne właściwości, jeśli istnieją
}

type Expense = {
    id: string;
    category: string;
    creationDate: Timestamp;
    description?: string;
    type: boolean;
    user: string;
    value: number;

};

const FamilyPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [reload, setReload] = useState<boolean>(true);
    const [userFamily, setUserFamily] = useState<Family | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [members, setMembers] = useState<string[]>([]);
    const [loggedIn, setLoggedIn] = useState<boolean>(true);
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1
    ); // Current month
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    ); // Current year
    const [earnings, setEarnings] = useState<number>(0);

    const [familyData, setFamilyData] = useState<Array<Expense>>([]);

    const [opened, {open, close}] = useDisclosure(false);
    const [section, setSection] = useState<string>("overview");

    const [familyName, setFamilyName] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");

    // const [members, setMembers] = useState<string[]>([]);
    const [memberNames, setMemberNames] = useState<string[]>([]);
    // const [membersReady, setMembersReady] = useState<boolean>(false);

    const onUpdateData = () => {
        // console.log("onUpdateData");
        fetchFamilyData();
    };

    const onUpdate = () => {
        // console.log("onUpdate");
        setReload(true);
        window.location.reload();
    };

    const handleOpenModal = (section: string) => {
        setSection(section);
        setTimeout(() => {
            open();
        }, 1);
    };

    useEffect(() => {
        const getFamilyNames = async () => {
            const memberNames: string[] = [];
            let earningsSum: number = 0;
            for (const member of members) {
                const q = doc(db, "users", member);
                const querySnapshot = await getDoc(q);
                if (querySnapshot.exists()) {
                    const memberData = querySnapshot.data().displayName;
                    memberNames.push(memberData);

                    const earnings = querySnapshot.data().earnings;
                    earningsSum += earnings;
                } else {
                    // Obsługa przypadku braku wyników
                    // console.log("Brak użytkownika dla podanego id.");
                }
            }
            setMemberNames(memberNames);
            setEarnings(earningsSum);
        };

        if (members.length > 0) {
            getFamilyNames();
        }
    }, [members]);

    const handleAddFamily = async (event: React.FormEvent) => {
        event.preventDefault();

        await addDoc(collection(projectFirestore, "family"), {
            // id: uuidv4(),
            name: familyName,
            // wygeneruj losowy kod
            inviteCode:
                familyName + "-" + Math.random().toString(8).substring(2, 7),
            // dodaj użytkownika, który stworzył rodzinę
            createdBy: auth.currentUser?.uid,
            // dodaj użytkownika, który stworzył rodzinę jako admin
            admins: [auth.currentUser?.uid],
            // dodaj użytkownika, który stworzył rodzinę jako członek
            members: [auth.currentUser?.uid],
        }).then(async (familyDoc) => {
            const familyId = familyDoc.id;
            if(auth.currentUser?.uid) {
                const userRef = doc(db, "users", auth.currentUser?.uid);
                const userSnapshot = await getDoc(userRef);

                if (userSnapshot.exists()) {
                    await updateDoc(userRef, {
                        familyId: familyId,
                    });
                }
            }
        });

        onUpdate();
        close();
    };

    const handleJoinFamily = async (event: React.FormEvent) => {
        event.preventDefault();

        if(auth.currentUser?.uid) {
            const q = query(
              collection(db, "family"),
              where("inviteCode", "==", inviteCode)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const familyData = querySnapshot.docs[0].data();
                const familyId = querySnapshot.docs[0].id;

                console.log(familyData);

                const familyRef = doc(db, "family", familyId);

                await updateDoc(familyRef, {
                    members: [...familyData.members, auth.currentUser?.uid],
                });

                if(auth.currentUser?.uid) {
                    const userRef = doc(db, "users", auth.currentUser?.uid);
                    const userSnapshot = await getDoc(userRef);

                    if (userSnapshot.exists()) {
                        await updateDoc(userRef, {
                            familyId: familyId,
                        });
                    }
                }

                onUpdate();
            } else {
                // Obsługa przypadku braku wyników
                console.log("Brak rodziny dla podanego kodu.");
            }
        }

        onUpdate();
        close();
    };

    const handleRemoveFamily = async (event: React.FormEvent) => {
        event.preventDefault();

        if(userFamily) {
            const q = doc(db, "family", userFamily.id);
            const querySnapshot = await getDoc(q);

            if (querySnapshot.exists()) {
                const familyId = querySnapshot.id;
                const familyRef = doc(db, "family", familyId);

                await deleteDoc(familyRef).then(async () => {
                    if (auth.currentUser?.uid) {
                        const userRef = doc(db, "users", auth.currentUser?.uid);
                        const userSnapshot = await getDoc(userRef);

                        if (userSnapshot.exists()) {
                            await updateDoc(userRef, {
                                familyId: null,
                            });
                        }
                    }
                });
            } else {
                // Obsługa przypadku braku wyników
                console.log("Brak rodziny dla podanego kodu.");
            }
        }

        onUpdate();
        close();
    };

    const handleLeaveFamily = async (event: React.FormEvent) => {
        event.preventDefault();

        // console.log(userFamily);

        if(userFamily) {
            const familyRef = doc(db, "family", userFamily.id);
            const snapshot = await getDoc(familyRef);

            if (snapshot.exists()) {
                const familyData = snapshot.data();
                const familyId = snapshot.id;

                const familyRef = doc(db, "family", familyId);

                await updateDoc(familyRef, {
                    members: familyData.members.filter(
                      (member: string) => member !== auth.currentUser?.uid
                    ),
                });

                if(auth.currentUser?.uid) {
                    const userRef = doc(db, "users", auth.currentUser?.uid);
                    const userSnapshot = await getDoc(userRef);

                    if (userSnapshot.exists()) {
                        await updateDoc(userRef, {
                            familyId: null,
                        });
                    }
                }
            } else {
                console.log("Brak rodziny dla podanego kodu.");
            }

            onUpdate();
            close();
        }
    };

    useEffect(() => {
        if (auth.currentUser && userFamily?.createdBy) {
            if (userFamily.createdBy === auth.currentUser.uid) {
                setIsAdmin(true);
                // console.log("Admin");
            } else {
                // console.log("Not Admin");
            }
            // console.log(userFamily.createdBy);
            // console.log(auth.currentUser.uid);
        }
    }, [userFamily, auth.currentUser]);

    const getFamily = async () => {
        const userId = await auth.currentUser?.uid;

        if (userId) {
            const q = query(
                collection(db, "family"),
                where("members", "array-contains", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const familyId = querySnapshot.docs[0].id;
                const familyData = querySnapshot.docs[0].data() as Family;
                familyData.id = familyId;

                setUserFamily(familyData);
                setMembers(familyData.members);
            } else {
                setMembers([userId]);
                console.log("Brak rodziny dla bieżącego użytkownika.");
            }
        } else {
            // Obsługa przypadku braku zalogowanego użytkownika
            console.log("Brak zalogowanego użytkownika.");
        }
    };

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
            toast.error(
                "Wystąpił błąd podczas pobierania budżetu miesięcznego!",
                {
                    position: "top-center",
                    autoClose: DefaultAlertTime,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
        }
    };

    const fetchFamilyRecurrentExpenses = async () => {
        const recurrentExpenses: Expense[] = [];
        try {
            for (const uid of members) {
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

    const fetchFamilyData = async () => {
        try {
            const uid = auth.currentUser?.uid || null;

            // console.log("test");

            if (uid) {
                if (members.length > 0) {
                    const q = query(
                        collection(db, "usersData"),
                        where("user", "in", members),
                        where("type", "!=", true)
                    );
                    const querySnapshot = await getDocs(q);


                        const familyData = querySnapshot.docs;
                        const familyDataArray = familyData.map((doc) => {
                            return {
                                id: doc.id,
                                category: doc.data().category,
                                creationDate: doc.data().creationDate,
                                description: doc.data().description,
                                type: doc.data().type,
                                user: doc.data().user,
                                value: doc.data().value,
                            };
                        });

                        familyDataArray.push(...await fetchFamilyRecurrentExpenses());

                        const filteredData = familyDataArray.filter(item => {
                            const itemDate = new Date(item.creationDate.toMillis());
                            return (
                                itemDate.getFullYear() === selectedYear &&
                                itemDate.getMonth() + 1 === selectedMonth
                            );
                        });

                        if (members) {
                            // console.log("filteredData" + filteredData);
                            // setFamilyData([...filteredData, ...await fetchFamilyRecurrentExpenses()]);
                            setFamilyData(filteredData);
                        } else {
                            // console.log("familyDataArray" + familyDataArray);
                            setFamilyData(familyDataArray);
        
                        }

                        // console.log(familyDataArray);

                }
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
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                getFamily();
            } else {
                setFamilyData([]);
                setUserFamily(null);
                setMembers([]);
                // Obsługa przypadku braku zalogowanego użytkownika
                // console.log("Brak zalogowanego użytkownika.");
            }
        });

        return () => unsubscribe(); // Czyszczenie subskrypcji przy odmontowywaniu komponentu
    }, [auth.onAuthStateChanged]);

    useEffect(() => {
        // Ta funkcja zostanie wykonana, gdy userFamily zostanie zaktualizowane
        // console.log(userFamily);
    }, [userFamily]);

    useEffect(() => {
        if (members.length > 0 && reload) {
            fetchFamilyData();
        }
    }, [members]);

    const colorScheme = "dark";

    const CopyInviteCode = () => {
        const el = document.createElement("textarea");
        el.value = userFamily?.inviteCode || "";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);

        toast.success("Skopiowano do schowka!", {
            position: "top-center",
            autoClose: QuickAlertTime,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    };

    useEffect(() => {
        // Fetch data only when logged in
        // getFamily();
        // fetchMonthlyBudget();
        // fetchFamilyData();

        if (members.length > 0) {
            fetchFamilyData();
        }
    }, [selectedMonth, selectedYear, loggedIn]);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedIn(true);
                if(members.length > 0 && reload) {
                    fetchFamilyData();
                }
            } else {
                setLoggedIn(false);
                if(!reload) {
                    setFamilyData([]);
                    setUserFamily(null);
                    setMembers([]);
                }
                setReload(true);
            }
        });
    }, [reload, familyData, selectedMonth, selectedYear]);

    const generatePDF = () => {

        //dodaj 

        const doc = new jsPDF();


        //ustaw czcionkę z polskimi znakami
        doc.addFont('https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');


        const tableColumn = ["Kategoria", "Data", "Opis", "Wartosc"];
        const tableRows: any[][] = [];

        familyData.forEach((expense) => {
            const expenseData: any[] = [
                expense.category,

                expense.creationDate.toDate().toLocaleDateString(),
                expense.description,
                expense.value,
            ];
            tableRows.push(expenseData);
        });

        //dodaj do tablicy sumę wydatków
        const sum = familyData.reduce((a, b) => a + b.value, 0);
        const sumData: any[] = ["Suma wydatków", "", "", sum];
        tableRows.push(sumData);


        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid'
        });


        doc.text(
            "Raport wydatków dla rodziny " + userFamily?.name,
            14,
            15
        );

        // Oblicz pozycję startY dla drugiej tabeli
        const pageHeight = doc.internal.pageSize.height;
        const firstTableHeight = 20 + (familyData.length + 1) * 10;
        const secondTableStartY = pageHeight - firstTableHeight;


        // talica z zarobkami, suma wydatków i roznica między nimi
        const earningsTableColumn = ["Przychody", "Wydatki", "Roznica"];
        const earningsTableRows: any[][] = [];

        const earningsData: any[] = [
            earnings,
            familyData.reduce((a, b) => a + b.value, 0),
            earnings - familyData.reduce((a, b) => a + b.value, 0),
        ];
        earningsTableRows.push(earningsData);

        (doc as any).autoTable({
            head: [earningsTableColumn],
            body: earningsTableRows,
            startY: secondTableStartY + 50,
            theme: 'grid'
        });


        doc.save("raport.pdf");
    };

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
        <div className="family-page">
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
                    {loggedIn &&
                    <div className="family-page-header">
                        <Menu shadow="md" width={200} position="top-start">
                            <Menu.Target>
                                <Button className={"family-button"}>
                                    Rodzina:{" "}
                                    {userFamily
                                        ? userFamily.name
                                        : "Brak rodziny"}
                                </Button>
                            </Menu.Target>

                            {/* {auth.currentUser && ( */}
                            <Menu.Dropdown>
                                {userFamily && (
                                    <>
                                        <Menu.Label>
                                            Kod: {userFamily?.inviteCode}
                                        </Menu.Label>
                                        <Menu.Item
                                            onClick={() => CopyInviteCode()}
                                        >
                                            Kopiuj do schowka
                                        </Menu.Item>
                                        <Menu.Divider/>
                                    </>
                                )}
                                {!userFamily && (
                                    <>
                                        <Menu.Item
                                            onClick={() =>
                                                handleOpenModal("addFamily")
                                            }
                                        >
                                            Stwórz rodzinę
                                        </Menu.Item>

                                        <Menu.Item
                                            onClick={() =>
                                                handleOpenModal("joinFamily")
                                            }
                                        >
                                            Dołącz do rodziny
                                        </Menu.Item>
                                    </>
                                )}

                                {userFamily && (
                                    <Menu.Item
                                        onClick={() =>
                                            handleOpenModal("peekMembers")
                                        }
                                    >
                                        Pokaż członków
                                    </Menu.Item>
                                )}

                                {isAdmin && (
                                    <Menu.Item
                                        onClick={() =>
                                            handleOpenModal("removeFamily")
                                        }
                                    >
                                        Usuń rodzinę
                                    </Menu.Item>
                                )}

                                {userFamily && !isAdmin && (
                                    <Menu.Item
                                        onClick={() =>
                                            handleOpenModal("leaveFamily")
                                        }
                                    >
                                        Opuść rodzinę
                                    </Menu.Item>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                    }
                    {loggedIn ? (
                        <div className="overview"
                             style={{minWidth: familyData.length !== 0 ? "45vw" : "100%"}}
                        >
                            {familyData?.length !== 0 ? (
                                <>
                                    <div id="chart-container">
                                        <BasicPieChart
                                            data={familyData}
                                            earnings={earnings}
                                        />
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
                                    <BasicPieChart
                                        data={familyData}
                                        earnings={0}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overview"
                             style={{minWidth: familyData.length !== 0 ? "45vw" : "100%", top: "calc(50% - 250px)"}}
                        >
                            <Text
                                size="xl"
                                weight={700}
                                style={{marginBottom: "1rem"}}
                            >
                                Witaj w PocketPal!
                            </Text>

                            <BasicPieChart data={familyData} earnings={0}/>
                        </div>
                    )}
                    {loggedIn && familyData?.length !== 0 ? (
                        <HistoryComponent
                            data={familyData}
                            fetchData={fetchFamilyData}
                        />
                    ) : (
                        <></>
                    )}
                </div>

                {section === "addFamily" && (
                    <Modal
                        opened={opened}
                        onClose={close}
                        size={"sm"}
                        title="Stwórz rodzinę"
                        withinPortal={false}
                        classNames={{
                            inner: "modalInner",
                            content: "modalContent",
                            header: "modalHeader",
                        }}
                        centered
                    >
                        <form>
                            <div className="family-adding-form">
                                <TextInput
                                    // label="Nazwa rodziny"
                                    placeholder="Wpisz nazwę rodziny"
                                    onChange={(e) =>
                                        setFamilyName(e.currentTarget.value)
                                    }
                                    className="family-name-input"
                                    styles={{root: {width: "100%"}}}
                                />

                                <Button type="submit" onClick={handleAddFamily}>
                                    Stwórz
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {section === "joinFamily" && (
                    <Modal
                        opened={opened}
                        onClose={close}
                        size={"sm"}
                        title="Dołącz do rodziny"
                        withinPortal={false}
                        classNames={{
                            inner: "modalInner",
                            content: "modalContent",
                            header: "modalHeader",
                        }}
                        centered
                    >
                        <form>
                            <div className="family-adding-form">
                                <TextInput
                                    // label="Nazwa rodziny"
                                    placeholder="Wpisz kod dostępu do rodziny"
                                    onChange={(e) =>
                                        setInviteCode(e.currentTarget.value)
                                    }
                                    styles={{root: {width: "100%"}}}
                                />

                                <Button
                                    type="submit"
                                    onClick={handleJoinFamily}
                                >
                                    Dołącz
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {section === "peekMembers" && (
                    <Modal
                        opened={opened}
                        onClose={close}
                        size={"sm"}
                        title="Członkowie rodziny"
                        withinPortal={false}
                        classNames={{
                            inner: "modalInner",
                            content: "modalContent",
                            header: "modalHeader",
                        }}
                        centered
                    >
                        <form>
                            <div className="peek-members-div">
                                {/* member names */}
                                <ul>
                                    {members &&
                                        memberNames.map((memberName, index) => (
                                            // <li><Button key={index} fullWidth>{memberName}</Button></li>
                                            <li key={index}>{memberName}</li>
                                        ))}
                                </ul>
                            </div>
                        </form>
                    </Modal>
                )}

                {section === "removeFamily" && (
                    <Modal
                        opened={opened}
                        onClose={close}
                        size={"sm"}
                        title="Opuść rodzinę"
                        withinPortal={false}
                        classNames={{
                            inner: "modalInner",
                            content: "modalContent",
                            header: "modalHeader",
                        }}
                        centered
                    >
                        <form>
                            <div className="family-adding-form">
                                <p>
                                    Czy na pewno chcesz <b>usunąć rodzinę?</b>
                                </p>

                                <Button
                                    type="submit"
                                    onClick={handleRemoveFamily}
                                    color="red"
                                >
                                    Usuń
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {section === "leaveFamily" && (
                    <Modal
                        opened={opened}
                        onClose={close}
                        size={"sm"}
                        title="Opuść rodzinę"
                        withinPortal={false}
                        classNames={{
                            inner: "modalInner",
                            content: "modalContent",
                            header: "modalHeader",
                        }}
                        centered
                    >
                        <form>
                            <div className="family-adding-form">
                                <p>
                                    Czy na pewno chcesz <b>opuścić rodzinę?</b>
                                </p>

                                <Button
                                    type="submit"
                                    onClick={handleLeaveFamily}
                                    color="red"
                                >
                                    Opuść
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}

                {loggedIn ? <ExpenseAddingForm onUpdate={onUpdateData}/> : <></>}
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

export default FamilyPage;
