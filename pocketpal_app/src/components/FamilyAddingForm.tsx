import { useDisclosure } from "@mantine/hooks";
import {
    Select,
    NumberInput,
    Switch,
    TextInput,
    Modal,
    Button,
} from "@mantine/core";

import { auth, projectFirestore } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";

import { useState } from "react";

import "../styles/FamilyAddingFormStyles.css";

function FamilyAddingForm({ onUpdate }: { onUpdate: () => void }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [familyName, setFamilyName] = useState<string>("");


    const handleSubmit = async (event: React.FormEvent) => {

        event.preventDefault();

        await addDoc(collection(projectFirestore, "family"), {
            name: familyName,
            // wygeneruj losowy kod
            inviteCode: familyName + "-" + Math.random().toString(8).substring(2, 7),
            // dodaj użytkownika, który stworzył rodzinę
            createdBy: auth.currentUser?.uid,
            // dodaj użytkownika, który stworzył rodzinę jako admin
            admins: [auth.currentUser?.uid],
            // dodaj użytkownika, który stworzył rodzinę jako członek
            members: [auth.currentUser?.uid,],
            
        });

        close();
    }

    return (
        <>
            <Button onClick={open} className="add-family-button">
                Stwórz nową rodzinę
            </Button>
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
                            onChange={(e) => setFamilyName(e.currentTarget.value)}
                            className="family-name-input"
                            styles={{ root: { width: "100%" } }}
                        />

                        <Button type="submit" onClick={handleSubmit}>Stwórz</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default FamilyAddingForm;
