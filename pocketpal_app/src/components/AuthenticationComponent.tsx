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


      let userData = {
        displayName: "",
        email: "",
        uid: "",
        photoUrl: "",
      };
      await signInWithPopup(auth, provider).then((user) => {
        onClose();
        userData = {
          displayName: user.user.displayName || "",
          email: user.user.email || "",
          uid: user.user.uid || "",
          photoUrl: user.user.photoURL || "",
        };
      });

      // Sprawdzamy, czy użytkownik już istnieje w kolekcji "users" na podstawie jego UID
      const userRef = doc(usersCollection, userData.uid);
      const userDoc = await getDoc(userRef);

      // Jeśli użytkownik nie istnieje w kolekcji, to go dodajemy
      if (!userDoc.exists()) {
        const userDataUpload = {
          displayName: userData.displayName,
          email: userData.email,
          photoUrl: userData.photoUrl,
        };

        await setDoc(userRef, userDataUpload);
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