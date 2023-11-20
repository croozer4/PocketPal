import React, { useState, useEffect } from "react";
import { Accordion } from "@mantine/core";
import { auth, db } from "../config/firebase.tsx";
import { deleteDoc, doc, getDocs, where, query, collection, DocumentData } from "@firebase/firestore";

import { Button } from "@mantine/core";
interface Family {
    name: string;
    // Dodaj inne właściwości, jeśli istnieją
}

const DisplayUserFamilies = () => {
    const [userFamily, setUserFamily] = useState<Family | null>(null);

    const getFamily = async () => {
        const userId = auth.currentUser?.uid;
    
        if (userId) {
            const q = query(collection(db, "family"), where("members", "array-contains", userId));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const familyData = querySnapshot.docs[0].data() as Family;
                setUserFamily(familyData);
                // console.log(userFamily)
            } else {
                // Obsługa przypadku braku wyników
                console.log("Brak rodziny dla bieżącego użytkownika.");
            }
        } else {
            // Obsługa przypadku braku zalogowanego użytkownika
            console.log("Brak zalogowanego użytkownika.");
        }
    }
    

    useEffect(() => {
        getFamily();
    }, [auth.currentUser]);

    return (
        <div>
            {userFamily && (
                <p>Rodzina użytkownika: '{userFamily.name}'</p>
            )}

            {/* <Button onClick={() => getFamily()}>Pobież dane rodziny</Button> */}

            {/* reszta komponentu */}
        </div>
    );
};

export default DisplayUserFamilies;
