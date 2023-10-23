import {auth, projectFirestore} from "../config/firebase";
import {collection, addDoc} from "firebase/firestore";
import {useState} from "react";
import {Select, NumberInput, Switch, TextInput, Modal, Button} from "@mantine/core";
import {DatePicker} from "@mantine/dates";
import {useDisclosure} from "@mantine/hooks";
import "../styles/ExpenseAddingFormStyles.css";
import {toast} from "react-toastify";
import {QuickAlertTime} from "../config/globals.tsx";

function ExpenseAddingForm() {
  const [opened, {open, close}] = useDisclosure(false);

  const [InputValue, setInputValue] = useState<number>(); // Ustaw początkową wartość na 0
  const [InputCategory, setInputCategory] = useState<string>();
  const [InputCreationDate, setInputCreationDate] = useState<Date | null>(null);
  const [InputType, setInputType] = useState<boolean>(false);
  const [InputDescription, setInputDescription] = useState("");
  // const [InputDate, setInputDate] = useState<Date | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    // console.log("submitting form");
    event.preventDefault();

    if (!auth.currentUser) return;
    
    if(InputValue === null || InputValue === undefined || InputValue <= 0) {
      toast.error('Wpisz poprawną wartość wydatku!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    const docRef = await addDoc(collection(projectFirestore, "usersData"), {
      description: InputDescription,
      category: InputCategory,
      creationDate: InputCreationDate,
      type: InputType,
      user: auth.currentUser.uid,
      value: InputValue,
    });
    // console.log("Document written with ID: ", docRef.id);

    toast.success('Dodano wydatek!', {
      position: "top-center",
      autoClose: QuickAlertTime,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

    // alert("Pomyślnie dodano wydatek");

    close();

    // wyzeruj stan
    setInputValue(undefined);
    setInputCategory("");
    setInputCreationDate(null);
    setInputType(false);
    setInputDescription("");
  };

  return (
    <>
      <Button
        onClick={open}
        className={"modalButton"}
      >
        Dodaj wydatek
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        size={"lg"}
        title="Dodaj wydatek"
        withinPortal={false}
        classNames={{ inner: "modalInner" }}
      >
        <form>
          <NumberInput
            label="Wartość wydatku"
            name="InputValue"
            value={InputValue} // Przypisz stan InputValue jako wartość
            rightSection={"zł"} // Opcjonalnie, jeśli chcesz dodać sekcję po prawej stronie
            onChange={(value) => { if(value) setInputValue(Number(value)) } }
            placeholder="Wpisz wartość wydatku"
          />
          <Select
            label="Kategoria"
            placeholder="Wybierz kategorię"
            data={[
              {value: "jedzenie", label: "Jedzenie"},
              {value: "rozrywka", label: "Rozrywka"},
              {value: "transport", label: "Transport"},
              {value: "inne", label: "Inne"},
            ]}
            name="InputCategory"
            onChange={(value: string) => setInputCategory(value)}
          />
          <DatePicker
            value={InputCreationDate}
            onChange={(value) => setInputCreationDate(value)}
          />
          <Switch
            label="Czy jest to wydatek stały?"
            defaultChecked={false}
            onChange={(e) => setInputType(e.target.checked)}
          />
          <TextInput
            label="Opis wydatku"
            placeholder="Opis wydatku"
            onChange={(e) => setInputDescription(e.target.value)}
          />
          {/* <input type="submit" value="Dodaj" onClick={handleSubmit}/> */}
          <Button type="submit" onClick={handleSubmit}>Dodaj</Button>
        </form>
      </Modal>
    </>
  );
}

export default ExpenseAddingForm;
