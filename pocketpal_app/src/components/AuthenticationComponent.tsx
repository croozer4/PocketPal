import {auth, provider} from "../config/firebase";
import {signInWithPopup} from "firebase/auth";
import {toast} from "react-toastify";
import {DefaultAlertTime, QuickAlertTime} from "../config/globals.tsx";
//import Google Icon from tabler icons;
// import { IconGoogle } from '@tabler/icons-react';


const AuthComponent = ({onClose}) => {
  const login = () => {
    signInWithPopup(auth, provider)
      .then(() => {
        toast.success("Zalogowano pomyślnie!", {
          position: "top-center",
          autoClose: QuickAlertTime,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        })

        onClose();
    })
      .catch((error) => {
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
      })
    });
  };

  return (
    <button onClick={login}>Google</button>
  );
};

export default AuthComponent;