import { auth, projectFirestore } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Select,
    NumberInput,
    Switch,
    TextInput,
    Modal,
    Button,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import "../styles/ExpenseAddingFormStyles.css";
import { toast } from "react-toastify";
import { QuickAlertTime } from "../config/globals.tsx";
import { IconPlus } from "@tabler/icons-react";
import { set } from "date-fns";

function ExpenseAddingForm({ onUpdate }: { onUpdate: () => void }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [opened, { open, close }] = useDisclosure(false);
    const [recurringOpened, { open: openRecurring, close: closeRecurring }] =
        useDisclosure(false);

    const [InputValue, setInputValue] = useState<number>(); // Ustaw początkową wartość na 0
    const [InputCategory, setInputCategory] = useState<string>();
    const [InputCreationDate, setInputCreationDate] = useState<Date | null>(
        null
    );
    const [InputEndDate, setInputEndDate] = useState<Date | null>(null);
    const [InputType, setInputType] = useState<boolean>(false);
    const [InputDescription, setInputDescription] = useState("");

    const [repeat, setRepeat] = useState<string>();

    useEffect(() => {
        if (InputType === true) {
            openRecurring();
        }
    }, [InputType]);

    useEffect(() => {
        if (InputType === false) {
            setInputEndDate(null);
            setRepeat("");
        }
    }, [InputType]);

    const handleCloseRecurring = () => {
        console.log("handleCloseRecurring");
        if (
            (InputType === true && InputEndDate === null) ||
            (InputType === true && repeat === "")
        ) {
            setRepeat("");
            setInputEndDate(null);
            setInputType(false);
            console.log("zamknięto modal bez dodania daty zakończenia wydatku");
            closeRecurring();
        }

        closeRecurring();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        // console.log("submitting form");
        event.preventDefault();

        if (!auth.currentUser) return;

        if (
            InputValue === null ||
            InputValue === undefined ||
            InputValue <= 0
        ) {
            toast.error("Wpisz poprawną wartość wydatku!", {
                position: "top-center",
                autoClose: QuickAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        if (!InputCategory) {
            toast.error("Wybierz kategorię wydatku!", {
                position: "top-center",
                autoClose: QuickAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        const creationDate = InputCreationDate || new Date();
        const endDate = InputEndDate || new Date();

        if (InputType && endDate < creationDate) {
            toast.error(
                "Data zakończenia wydatku nie może być wcześniejsza niż data jego rozpoczęcia!",
                {
                    position: "top-center",
                    autoClose: QuickAlertTime,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
            return;
        }

        if (InputType && !repeat) {
            toast.error("Wybierz częstotliwość powtarzania wydatku!", {
                position: "top-center",
                autoClose: QuickAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        if (InputType === false) {
            const dataToUpload = {
                description: InputDescription,
                category: InputCategory,
                creationDate,
                type: InputType,
                user: auth.currentUser.uid,
                value: InputValue,
            };

            await addDoc(collection(projectFirestore, "usersData"), {
                ...dataToUpload,
            });
            if (InputType) {
                await addDoc(
                    collection(
                        projectFirestore,
                        "users",
                        auth.currentUser?.uid,
                        "recurrentExpenses"
                    ),
                    {
                        ...dataToUpload,
                    }
                );
            }

            if (InputType) {
                toast.success("Dodano stały wydatek!", {
                    position: "top-center",
                    autoClose: QuickAlertTime,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else {
                toast.success("Dodano wydatek!", {
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

            close();

            // wyzeruj stan
            setInputValue(undefined);
            setInputCategory("");
            setInputCreationDate(null);
            setInputType(false);
            setInputDescription("");
            setRepeat("");
            setInputEndDate(null);

            onUpdate();
        } else {
            // dodawanie wydatku stałego co miesiąc tego samego dnia do daty zakończenia
            // generuj identyfikator wydatku

            const recurrentId = Math.random().toString(36).substr(2, 9);

            const dataToUpload = {
                description: InputDescription,
                category: InputCategory,
                creationDate,
                type: InputType,
                user: auth.currentUser.uid,
                value: InputValue,
                recurrentId: recurrentId,
            };

            await addDoc(collection(projectFirestore, "usersData"), {
                ...dataToUpload,
            });

            const date = new Date(creationDate);
            const originalDate = new Date(creationDate);
            const endDate = new Date(InputEndDate);

            while (date <= endDate) {
                await addDoc(
                    collection(
                        projectFirestore,
                        "users",
                        auth.currentUser?.uid,
                        "recurrentExpenses"
                    ),
                    {
                        ...dataToUpload,
                        creationDate: date,
                    }
                );
                if (repeat === "Tydzień") date.setDate(date.getDate() + 7);
                else {
                
                    // sprawdz ile dni ma następny miesiąc
                    const nextMonth = new Date(date);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    const daysInNextMonth = new Date(
                        nextMonth.getFullYear(),
                        nextMonth.getMonth(),
                        0
                    ).getDate();

                    console.log("następny miesiąc to " + nextMonth + " i ma " + daysInNextMonth + " dni");

                    // sprawdz czy data jest większa niż ilość dni w następnym miesiącu
                    if (date.getDate() > daysInNextMonth) {
                        // jeśli tak to ustaw datę na ostatni dzień miesiąca
                        console.log("data jest większa niż ilość dni w następnym miesiącu");
                        date.setDate(daysInNextMonth);
                        console.log("ustawiona data to " + date);
                    } else {
                        // jeśli nie to ustaw datę na tą samą datę w następnym miesiącu
                        console.log("data jest mniejsza niż ilość dni w następnym miesiącu");
                        date.setMonth(date.getMonth() + 1);
                        console.log("ustawiona data to " + date);
                    }

                }
                
                
            }

            toast.success("Dodano stały wydatek!", {
                position: "top-center",
                autoClose: QuickAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            close();

            // wyzeruj stan
            setInputValue(undefined);
            setInputCategory("");
            setInputCreationDate(null);
            setInputType(false);
            setInputDescription("");
            setRepeat("");
            setInputEndDate(null);

            onUpdate();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <>
            <Button
                onClick={open}
                className={"modalButton"}
                style={{
                    paddingLeft: isMobile ? "5px" : "20px",
                    paddingRight: isMobile ? "5px" : "20px",
                    borderRadius: isMobile ? "50%" : "0.25rem",
                }}
            >
                {isMobile ? <IconPlus /> : "Dodaj wydatek"}
            </Button>
            <Modal
                opened={opened}
                onClose={close}
                size={"lg"}
                title="Dodaj wydatek"
                withinPortal={false}
                classNames={{
                    inner: "modalInner",
                    content: "modalContent",
                    header: "modalHeader",
                }}
                centered
            >
                <form>
                    <div className="modal-container-sections">
                        <div className="modal-section-calendar">
                            <DatePicker
                                value={InputCreationDate}
                                onChange={(value) =>
                                    setInputCreationDate(value)
                                }
                            />
                        </div>

                        <div className="modal-section-inputs">
                            {/* Wprowadzanie kwoty wydatku */}
                            <NumberInput
                                label="Wartość wydatku"
                                name="InputValue"
                                value={InputValue} // Przypisz stan InputValue jako wartość
                                rightSection={"zł"} // Opcjonalnie, jeśli chcesz dodać sekcję po prawej stronie
                                onChange={(value) => {
                                    if (value) setInputValue(Number(value));
                                }}
                                placeholder="Wpisz wartość wydatku"
                                data-autofocus
                                styles={{ input: { marginTop: "7px" } }}
                            />

                            {/* Wprowadzanie kategorii wydatku */}
                            <Select
                                label="Kategoria"
                                placeholder="Wybierz kategorię"
                                data={[
                                    { value: "Jedzenie", label: "Jedzenie" },
                                    { value: "Rozrywka", label: "Rozrywka" },
                                    { value: "Transport", label: "Transport" },
                                    { value: "Opłaty", label: "Opłaty" },
                                    { value: "Inne", label: "Inne" },
                                ]}
                                name="InputCategory"
                                onChange={(value: string) =>
                                    setInputCategory(value)
                                }
                                styles={{ input: { marginTop: "7px" } }}
                            />

                            {/* Wprowadzanie opisu wydatku */}
                            <TextInput
                                label="Opis wydatku"
                                placeholder="Opis wydatku"
                                onChange={(e) =>
                                    setInputDescription(e.target.value)
                                }
                                styles={{ input: { marginTop: "7px" } }}
                            />

                            {/* Wprowadzanie rodzaju wydatku (czy stały?) */}
                            <Switch
                                className="modal-switch"
                                label="Czy jest to wydatek stały?"
                                defaultChecked={false}
                                checked={InputType}
                                onChange={(e) => setInputType(e.target.checked)}
                            />
                        </div>
                    </div>
                    <br />
                    <div className="modal-container-submit">
                        {/* Przycisk zatwierdzenia */}
                        <Button type="submit" onClick={handleSubmit}>
                            Dodaj
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                opened={recurringOpened}
                onClose={handleCloseRecurring}
                size={"sm"}
                title="Wybierz datę zakończenia wydatku"
                withinPortal={false}
                classNames={{
                    inner: "modalInner",
                    content: "modalContent",
                    header: "modalHeader",
                }}
                centered
            >
                <form>
                    <DatePicker
                        value={InputEndDate}
                        onChange={(value) => setInputEndDate(value)}
                    />

                    <Select
                        label="Powtarzaj co"
                        placeholder="Powtarzaj co"
                        data={[
                            { value: "Miesiac", label: "Miesiąc" },
                            { value: "Tydzień", label: "Tydzień" },
                        ]}
                        name="Reapeat"
                        onChange={(value: string) => setRepeat(value)}
                        styles={{ input: { marginTop: "7px" } }}
                    />
                    <br />
                </form>
            </Modal>
        </>
    );
}

export default ExpenseAddingForm;
