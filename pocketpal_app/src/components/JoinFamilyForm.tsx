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
    addDoc,
} from "@firebase/firestore";

import { auth, db } from "../config/firebase.tsx";
import { useState } from "react";

// import "../styles/FamilyAddingFormStyles.css";

function JoinFamilyForm({ onUpdate }: { onUpdate: () => void }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [familyName, setFamilyName] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // stara werjsa bez requestów
        // const q = query(
        //     collection(db, "family"),
        //     where("inviteCode", "==", inviteCode)
        // );

        // const querySnapshot = await getDocs(q);

        // if (!querySnapshot.empty) {
        //     const familyData = querySnapshot.docs[0].data();
        //     const familyId = querySnapshot.docs[0].id;

        //     const familyRef = doc(db, "family", familyId);

        //     await updateDoc(familyRef, {
        //         members: [...familyData.members, auth.currentUser?.uid],
        //     });

        //     onUpdate();
        // } else {
        //     // Obsługa przypadku braku wyników
        //     console.log("Brak rodziny dla podanego kodu.");
        // }

        // onUpdate();
        // close();

        // nowa wersja z requestami

        const q = query(
            collection(db, "family"),
            where("inviteCode", "==", inviteCode)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // zrob nowy dokument w kolekcji requests
            const requestRef = collection(db, "requests");

            const request = {
                familyAdminId: querySnapshot.docs[0].data().admins[0],
                familyId: querySnapshot.docs[0].id,
                status: "pending",
                submittinUserId: auth.currentUser?.uid,
            };


            await addDoc(requestRef, request);
            
            console.log(request);

            onUpdate();
            close();
        }
        else {
            // Obsługa przypadku braku wyników
            console.log("Brak rodziny dla podanego kodu.");
        }
    };

    return (
        <>
            <Button onClick={open} className="add-family-button">
                Dołącz do rodziny
            </Button>
            <Modal
                opened={opened}
                onClose={close}
                size={"sm"}
                title="Dołącz do rodziny (zgłoszenie)"
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
                            onChange={(e) => setInviteCode(e.currentTarget.value)}
                            styles={{ root: { width: "100%" } }}
                        />

                        <Button type="submit" onClick={handleSubmit}>Dołącz</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default JoinFamilyForm;
