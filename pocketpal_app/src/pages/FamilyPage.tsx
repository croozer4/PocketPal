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

interface Family {
    name: string;
    // Dodaj inne właściwości, jeśli istnieją
}

const FamilyPage = () => {
    const [reload, setReload] = useState<boolean>(true);
    const [userFamily, setUserFamily] = useState<Family | null>(null);

    const onUpdate = () => {
        setReload(true);
    };

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

    return (
        <div className="family-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                <div className="interface">
                    <div className="family-page-header">
                        <DisplayUserFamilies />
                        <div className="family-buttons">
                            {!userFamily && (
                                <>
                                    <FamilyAddingForm onUpdate={onUpdate} />
                                    <Button>Dołącz do rodziny</Button>
                                </>
                            )}
                            {userFamily && (
                                <>
                                    <Button color="red">Usuń rodzinę</Button>
                                    <Button color="red">Opuść rodzinę</Button>
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
