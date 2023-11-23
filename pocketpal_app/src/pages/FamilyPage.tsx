import React, { useEffect } from "react";
import { useState } from "react";
import { Button } from "@mantine/core";
import { MantineProvider, Text } from "@mantine/core";
import FamilyAddingForm from "../components/FamilyAddingForm.tsx";
import DisplayUserFamilies from "../components/DisplayUserFamilies.tsx";
import { auth, db } from "../config/firebase.tsx";
import {
    deleteDoc,
    doc,
    getDocs,
    where,
    query,
    collection,
    DocumentData,
} from "@firebase/firestore";

import { IconPhoto, IconDownload, IconArrowRight } from "@tabler/icons-react";

import "../styles/FamilyPageStyle.css";
import JoinFamilyForm from "../components/JoinFamilyForm.tsx";
import LeaveFamilyForm from "../components/LeaveFamilyForm.tsx";
import RemoveFamilyForm from "../components/RemoveFamilyForm.tsx";
import PeekMembersForm from "../components/PeekMembersButton.tsx";
import { on } from "events";
import { set } from "date-fns";
import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { toast } from "react-toastify";
import { QuickAlertTime } from "../config/globals.tsx";



interface Family {
    id: string;
    name: string;
    admins: string[];
    createdBy: string;
    inviteCode: string;
    members: string[];
    // Dodaj inne właściwości, jeśli istnieją
}

const FamilyPage = () => {
    const [reload, setReload] = useState<boolean>(true);
    const [userFamily, setUserFamily] = useState<Family | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [members, setMembers] = useState<string[]>([]);
        

    const onUpdate = () => {
        console.log("onUpdate");
        setReload(true);
        window.location.reload();
    };

    useEffect(() => {
        if (auth.currentUser && userFamily?.createdBy) {
            if (userFamily.createdBy === auth.currentUser.uid) {
                setIsAdmin(true);
                console.log("Admin");
            } else {
                console.log("Not Admin");
            }
            console.log(userFamily.createdBy);
            console.log(auth.currentUser.uid);
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
                const familyData = querySnapshot.docs[0].data() as Family;
                setUserFamily(familyData);
                setMembers(familyData.members);
            } else {
                // Obsługa przypadku braku wyników
                console.log("Brak rodziny dla bieżącego użytkownika.");
            }
        } else {
            // Obsługa przypadku braku zalogowanego użytkownika
            console.log("Brak zalogowanego użytkownika.");
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                getFamily();
            } else {
                // Obsługa przypadku braku zalogowanego użytkownika
                console.log("Brak zalogowanego użytkownika.");
            }
        });

        return () => unsubscribe(); // Czyszczenie subskrypcji przy odmontowywaniu komponentu
    }, [auth.onAuthStateChanged]);

    useEffect(() => {
        // Ta funkcja zostanie wykonana, gdy userFamily zostanie zaktualizowane
        console.log(userFamily);
    }, [userFamily]);

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

    return (
        <div className="family-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                <div className="interface">
                    <div className="family-page-header">

                    <Menu shadow="md" width={200}>
            <Menu.Target>
                <Button>Rodzina: {userFamily ? userFamily.name : "Brak rodziny"}</Button>
            </Menu.Target>

        {userFamily && (
            <Menu.Dropdown>
                <Menu.Label>Kod: {userFamily?.inviteCode}</Menu.Label>
                <Menu.Item onClick={()=>CopyInviteCode()}>
                Kopiuj do schowka
                </Menu.Item>
            </Menu.Dropdown>
        )}
            </Menu>
                        
                        {/* <DisplayUserFamilies /> */}
                        {/* <p>Invite Code: {userFamily?.inviteCode}</p> */}
                        <div className="family-buttons">
                            {!userFamily && (
                                <>
                                    <FamilyAddingForm onUpdate={onUpdate} />
                                    <JoinFamilyForm onUpdate={onUpdate} />
                                </>
                            )}
                            {userFamily && (
                                <>
                                    <PeekMembersForm
                                        onUpdate={onUpdate}
                                        familyId={userFamily.id}
                                    />
                                    {isAdmin && (
                                        <RemoveFamilyForm
                                            onUpdate={onUpdate}
                                            familyId={userFamily.id}
                                        />
                                    )}
                                    {!isAdmin && (
                                        <LeaveFamilyForm
                                            onUpdate={onUpdate}
                                            familyId={userFamily.id}
                                        />
                                    )}
                                    
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </MantineProvider>
        </div>
    );
};

export default FamilyPage;
