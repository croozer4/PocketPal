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
import { useEffect, useState } from "react";
import { get } from "http";

// import "../styles/FamilyAddingFormStyles.css";

function PeekMembersForm({
    onUpdate,
    familyId,
}: {
    onUpdate: () => void;
    familyId: string;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const [familyName, setFamilyName] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");
    const [members, setMembers] = useState<string[]>([]);
    const [memberNames, setMemberNames] = useState<string[]>([]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        onUpdate();
        close();
    };

    useEffect(() => {
        const getMembers = async () => {
            console.log("getting names for" + familyId);
            const q = query(
                collection(db, "family"),
                where("id", "==", familyId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const familyData = querySnapshot.docs[0].data();
                setMembers(familyData.members);

                const memberNames: string[] = [];

                for (const member of members) {
                    const q = query(
                        collection(db, "users"),
                        where("id", "==", member)
                    );

                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        memberNames.push(userData.displayName);
                    } else {
                        // Obsługa przypadku braku wyników
                        console.log("Brak użytkownika dla podanego id.");
                    }
                }
                console.log(members);

                console.log(memberNames);
            } else {
                // Obsługa przypadku braku wyników
                console.log("Brak rodziny dla podanego kodu.");
            }
        };

        getMembers();
    }, [opened]);

    return (
        <>
            <Button onClick={open} className="add-family-button">
                Zobacz członków
            </Button>
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
                    <div className="family-adding-form">
                        {/* member names */}

                        <ul>
                            {memberNames &&
                                memberNames.map((memberName) => (
                                    <li key={memberName}>{memberName}</li>
                                ))}
                        </ul>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default PeekMembersForm;
