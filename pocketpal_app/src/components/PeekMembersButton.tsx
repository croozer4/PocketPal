import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { getDocs, getDoc, where, query, collection, doc } from "@firebase/firestore";
import { db } from "../config/firebase.tsx";
import { useEffect, useState } from "react";

import "../styles/PeekMembersStyle.css";

function PeekMembersForm({
    onUpdate,
    familyId,
}: {
    onUpdate: () => void;
    familyId: string;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const [members, setMembers] = useState<string[]>([]);
    const [memberNames, setMemberNames] = useState<string[]>([]);
    const [membersReady, setMembersReady] = useState<boolean>(false);

    useEffect(() => {
        const getMembers = async () => {
            const q = query(
                collection(db, "family"),
                where("id", "==", familyId)
            );
    
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const familyData = querySnapshot.docs[0].data();
                setMembers(familyData.members);
    
                const memberNamesPromises = familyData.members.map(
                    async (member: any) => {
                        const userQuery = doc(db, "users", member);
    
                        try {
                            const userQuerySnapshot = await getDoc(userQuery);
    
                            if (userQuerySnapshot.exists()) {
                                const userData = userQuerySnapshot.data();
                                return userData.displayName;
                            } else {
                                // console.log("Brak użytkownika dla podanego id.");
                                return "";
                            }
                        } catch (error) {
                            console.error("Błąd podczas pobierania danych użytkownika:", error);
                            return "";
                        }
                    }
                );
    
                const resolvedMemberNames = await Promise.all(
                    memberNamesPromises
                );
    
                setMemberNames(resolvedMemberNames);
                setMembersReady(true);
            } else {
                console.log("Brak rodziny dla podanego kodu.");
            }
        };
    
        getMembers();
    }, [familyId, opened]);
    

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
                    <div className="peek-members-div">
                        {/* member names */}
                        <ul>
                            {membersReady &&
                                memberNames.map((memberName, index) => (
                                    // <li><Button key={index} fullWidth>{memberName}</Button></li>
                                    <li key={index}>{memberName}</li>
                                ))}
                        </ul>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default PeekMembersForm;
