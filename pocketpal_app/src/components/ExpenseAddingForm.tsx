import { auth, projectFirestore } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import React, {useEffect, useState} from "react";
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
import {IconPlus} from "@tabler/icons-react";

function ExpenseAddingForm({ onUpdate }: { onUpdate: () => void }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [opened, { open, close }] = useDisclosure(false);

    const [InputValue, setInputValue] = useState<number>(); // Ustaw początkową wartość na 0
    const [InputCategory, setInputCategory] = useState<string>();
    const [InputCreationDate, setInputCreationDate] = useState<Date | null>(
        null
    );
    const [InputType, setInputType] = useState<boolean>(false);
    const [InputDescription, setInputDescription] = useState("");
    // const [InputDate, setInputDate] = useState<Date | null>(null);

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

        const creationDate = InputCreationDate || new Date();

        await addDoc(collection(projectFirestore, "usersData"), {
            description: InputDescription,
            category: InputCategory,
            creationDate,
            type: InputType,
            user: auth.currentUser.uid,
            value: InputValue,
        });
        // console.log("Document written with ID: ", docRef.id);

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

        // alert("Pomyślnie dodano wydatek");

        close();

        // wyzeruj stan
        setInputValue(undefined);
        setInputCategory("");
        setInputCreationDate(null);
        setInputType(false);
        setInputDescription("");

        onUpdate();
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
        <>
            <Button onClick={open} className={"modalButton"}
            style={{ paddingLeft: isMobile ? "5px" : "20px", paddingRight: isMobile ? "5px" : "20px", borderRadius: isMobile ? "50%" : "0.25rem"}}>
                { isMobile ? <IconPlus/> : "Dodaj wydatek"}
            </Button>
            <Modal
                opened={opened}
                onClose={close}
                size={"lg"}
                title="Dodaj wydatek"
                withinPortal={false}
                classNames={{ inner: "modalInner", content: "modalContent", header: "modalHeader" }}
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
        </>
    );
}

export default ExpenseAddingForm;
