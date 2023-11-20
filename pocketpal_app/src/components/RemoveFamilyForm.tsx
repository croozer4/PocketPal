import { useDisclosure } from "@mantine/hooks";
import {
    Select,
    NumberInput,
    Switch,
    TextInput,
    Modal,
    Button,
} from "@mantine/core";

// import { auth, projectFirestore } from "../config/firebase";
import {
    deleteDoc,
    doc,
    getDocs,
    where,
    query,
    collection,
    DocumentData,
    collectionGroup,
    updateDoc,
} from "@firebase/firestore";

import { auth, db } from "../config/firebase.tsx";
import { useState } from "react";
import { on } from "events";

// import "../styles/FamilyAddingFormStyles.css";

function RemoveFamilyForm({ onUpdate, familyId }: { onUpdate: () => void, familyId: string }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [familyName, setFamilyName] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const q = query(
            collection(db, "family"),
            where("id", "==", familyId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const familyData = querySnapshot.docs[0].data();
            const familyId = querySnapshot.docs[0].id;

            const familyRef = doc(db, "family", familyId);

            await deleteDoc(familyRef);

            onUpdate();
        } else {
            // Obsługa przypadku braku wyników
            console.log("Brak rodziny dla podanego kodu.");
        }

        

        onUpdate();
        close();
    };

    return (
        <>
            <Button onClick={open} className="add-family-button" color="red">
                Usuń rodzinę
            </Button>
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

                        <p>Czy na pewno chcesz <b>usunąć rodzinę?</b></p>

                        <Button type="submit" onClick={handleSubmit} color="red">Usuń</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default RemoveFamilyForm;
