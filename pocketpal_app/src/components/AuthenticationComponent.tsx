import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { DefaultAlertTime, QuickAlertTime } from "../config/globals.tsx";
import { getFirestore, collection } from "firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import {UnstyledButton} from "@mantine/core";


const AuthComponent = ({ onClose }: { onClose: () => void }) => {
  const login = async () => {
    try {
      // Logowanie za pomocą konta Google

      const db = getFirestore();
      const usersCollection = collection(db, "users");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sprawdzamy, czy użytkownik już istnieje w kolekcji "users" na podstawie jego UID
      const userRef = doc(usersCollection, user.uid);
      const userDoc = await getDoc(userRef);

      // Jeśli użytkownik nie istnieje w kolekcji, to go dodajemy
      if (!userDoc.exists()) {
        const userData = {
          displayName: user.displayName,
          email: user.email,
          // inne dane użytkownika, które chcesz zapisywać
        };

        await setDoc(userRef, userData);
      }

      toast.success("Zalogowano pomyślnie!", {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił błąd podczas logowania!", {
        position: "top-center",
        autoClose: DefaultAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return <UnstyledButton onClick={login}><IconBrandGoogleFilled/></UnstyledButton>;
};

export default AuthComponent;