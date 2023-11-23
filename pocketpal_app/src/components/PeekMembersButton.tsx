import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { getDocs, where, query, collection } from "@firebase/firestore";
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
            // console.log("peek members getting names for " + familyId);
            const q = query(
                collection(db, "family"),
                where("id", "==", familyId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const familyData = querySnapshot.docs[0].data();
                setMembers(familyData.members);

                const memberNamesPromises = familyData.members.map(
                    async (member) => {
                        const userQuery = query(
                            collection(db, "users"),
                            where("id", "==", member)
                        );

                        const userQuerySnapshot = await getDocs(userQuery);

                        if (!userQuerySnapshot.empty) {
                            const userData = userQuerySnapshot.docs[0].data();
                            return userData.displayName;
                        } else {
                            console.log("Brak użytkownika dla podanego id.");
                            return ""; // or handle the case when the user is not found
                        }
                    }
                );

                const resolvedMemberNames = await Promise.all(
                    memberNamesPromises
                );

                // console.log("Members:", familyData.members);
                // console.log("Member Names:", resolvedMemberNames);

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
