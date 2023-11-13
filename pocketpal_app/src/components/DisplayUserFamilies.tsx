import React from "react";
import { Accordion, Button, MantineProvider } from "@mantine/core";
import { auth, db } from "../config/firebase.tsx";
import { deleteDoc, doc, getDocs, where, query, collection, } from "@firebase/firestore";

const DisplayUserFamilies = () => {

    const getFamilies = async () => {
        const uid = auth.currentUser?.uid || null;
    
        if (uid) {
            const querySnapshot = await getDocs(
                query(collection(db, "family"), where("members", "array-contains", uid))
            );
    
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
                // Tutaj możesz przetwarzać dane otrzymane z dokumentów rodziny
            });
        }
    }

    getFamilies();

    return (
        <div>
            <h1>Display User Families</h1>

            {/* <Accordion.Item key={item.id} value={item.id}>
                <Accordion.Control>
                    {item.category} | {item.value}zł ({dateFormatted})
                </Accordion.Control>
                <Accordion.Panel></Accordion.Panel>
            </Accordion.Item> */}

            {/* lista rodzin */}

            
        </div>
    );
};

export default DisplayUserFamilies;
