import { useDisclosure } from "@mantine/hooks";
import {
    Select,
    NumberInput,
    Switch,
    TextInput,
    Modal,
    Button,
} from "@mantine/core";

function FamilyAddingForm({ onUpdate }: { onUpdate: () => void }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Button onClick={open} className="add-family-button">
                Stwórz rodzinę
            </Button>
            <Modal
                opened={opened}
                onClose={close}
                size={"lg"}
                title="Stwórz rodzinę"
                withinPortal={false}
                classNames={{
                    inner: "modalInner",
                    content: "modalContent",
                    header: "modalHeader",
                }}
                centered
            ></Modal>
        </>
    );
}

export default FamilyAddingForm;
