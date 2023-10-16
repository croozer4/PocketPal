import React from "react";
import { auth, projectFirestore } from "../config/firebase";

import { collection, doc, setDoc, addDoc } from "firebase/firestore";

import { useState } from "react";
import { Select, NumberInput, Text, Switch, TextInput, Modal } from "@mantine/core";
import { DatePicker } from "@mantine/dates";

import "../styles/ExpenseAddingFormStyles.css";

function ExpenseAddingForm({ openedAddingExpense }) {
    const [InputValue, setInputValue] = useState<number>(0); // Ustaw początkową wartość na 0

    const [InputCategory, setInputCategory] = useState<string[]>();
    const [InputCreationDate, setInputCreationDate] = useState<Date | null>(
        null
    );
    const [InputType, setInputType] = useState<boolean>(false);
    const [InputDescription, setInputDescription] = useState("");
    // const [InputDate, setInputDate] = useState<Date | null>(null);

    const handleSubmit = async (event: any) => {
        console.log("submitting form");
        event.preventDefault();

        if (!auth.currentUser) return;

        // const docRef = doc(projectFirestore, "usersData", "asdasd");

        // await setDoc(docRef, {
        //     description: InputDescription,
        //     category: InputCategory,
        //     creationDate: InputCreationDate,
        //     type: InputType,
        //     user: auth.currentUser.uid,
        //     value: InputValue,

        // });

        const docRef = await addDoc(collection(projectFirestore, "usersData"), {
            description: InputDescription,
            category: InputCategory,
            creationDate: InputCreationDate,
            type: InputType,
            user: auth.currentUser.uid,
            value: InputValue,
        });

        alert("Pomyślnie dodano wydatek");
    };

    return (
        <Modal opened={openedAddingExpense} onClose={close} size={"l"}>
            <h1>Dodaj wydatek</h1>

            <form>
                <NumberInput
                label="Wartość wydatku"
                    name="InputValue"
                    value={InputValue} // Przypisz stan InputValue jako wartość
                    min={0} // Opcjonalnie, jeśli chcesz określić minimalną wartość
                    onChange={(value) => setInputValue(Number(value))}
                />
                <Select
                    label="Kategoria"
                    placeholder="Wybierz kategorię"
                    data={[
                        { value: "jedzenie", label: "Jedzenie" },
                        { value: "rozrywka", label: "Rozrywka" },
                        { value: "transport", label: "Transport" },
                        { value: "inne", label: "Inne" },
                    ]}
                    name="InputCategory"
                    onChange={(value: any) => setInputCategory(value)}
                />
                <DatePicker
                    value={InputCreationDate}
                    onChange={(value) => setInputCreationDate(value)}
                />
                <Switch
                    label="Czy jest to wydatek stały?"
                    defaultChecked={false}
                    onChange={(e) => setInputType(e.target.checked)}
                />
                <TextInput
                    label="Opis wydatku"
                    placeholder="Opis wydatku"
                    onChange={(e) => setInputDescription(e.target.value)}
                />
                <input type="submit" value="Dodaj" onClick={handleSubmit} />
            </form>
        </Modal>
    );
}

export default ExpenseAddingForm;
