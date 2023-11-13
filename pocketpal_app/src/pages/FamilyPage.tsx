import React from "react";
import { useState } from "react";
import { Button } from "@mantine/core";
import { MantineProvider, Text } from "@mantine/core";
import FamilyAddingForm  from "../components/FamilyAddingForm.tsx";

const FamilyPage = () => {

    const [reload, setReload] = useState<boolean>(true);

    const onUpdate = () => {
        setReload(true);
    };

    const colorScheme = "dark";

    return (
        <div className="family-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                <div className="interface">
                    <FamilyAddingForm onUpdate={onUpdate}/>


                    <Button>Dodaj do rodziny</Button>
                </div>
            </MantineProvider>
        </div>
    );
};

export default FamilyPage;
