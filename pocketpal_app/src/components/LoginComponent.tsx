import { useEffect, useState } from "react";
import Auth from "./AuthenticationComponent.tsx"
import { auth } from "../config/firebase";
import { PasswordInput, TextInput, Button, Modal, UnstyledButton } from "@mantine/core";
import "../styles/LoginComponentStyles.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useDisclosure } from "@mantine/hooks";
import "../styles/LoginComponentStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { DefaultAlertTime, QuickAlertTime  } from "../config/globals.tsx";
import { toast } from "react-toastify";
import { updateProfile } from "firebase/auth";


interface LoginComponentProps {
  userPhotoURL: string;

}

function LoginComponent({ userPhotoURL }: LoginComponentProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const [loggedIn, setLoggedIn] = useState(false);

  const [section, setSection] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [resetPasswordEmail, setResetPasswordEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");


  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  }

 

  const handleRegister = () => {
    if (password !== repeatPassword) {
      toast.error('Hasła nie są takie same!', {
        position: "top-center",
        autoClose: QuickAlertTime,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // Signed in 
        const userData = userCredential.user;
        console.log("User registered");
        updateProfile(userData, {
          displayName: firstName + " " + lastName,
        }).then(() => {
          // Profile updated!
          // ...
          console.log("User profile updated");
        }).catch((error) => {
          // An error occurred
          // ...
          console.error("Error while updating user profile");
        });
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      }
      );
    }
  }

        
  

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        // console.log("User logged in");
      } else {
        setLoggedIn(false);
        // console.log("User logged out");
      }
    });
  });

  // funkcja do resetowania hasła
  const resetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.info('Wysłano link do zresetowania hasła!', {
          position: "top-center",
          autoClose: DefaultAlertTime,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        })
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  }

  const handleClose = () => {
    close();
    setEmail("");
    setPassword("");
    setRepeatPassword("");
    setResetPasswordEmail("");

    setTimeout(() => {
      setSection("login");
    }, 200);
  }

  return (
    <>
      <UnstyledButton className="login-button" onClick={open}>
        {userPhotoURL ? (
          <img src={userPhotoURL} alt="User Profile" className="user-avatar" />
        ) : (
          <FontAwesomeIcon icon={faUser} />
        )}
      </UnstyledButton>
      {loggedIn ? (
        <Modal
          opened={opened}
          onClose={handleClose}
          size={"lg"}
          title="Logowanie"
          classNames={{ inner: "modalInner" }}
        >
          <h4>Użytkownik zalogowany</h4>
          <img src={userPhotoURL} alt="User Profile" className="userAvatarAuth" />
          <p>{auth.currentUser?.displayName}</p>
          <button onClick={() => {
            auth.signOut()
              .then(() => {
                toast.success('Wylogowano!', {
                  position: "top-center",
                  autoClose: QuickAlertTime,
                  hideProgressBar: true,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                })
                handleClose();
              })
          }}>Wyloguj</button>
        </Modal>
      ) : (
        <>
          {section === "login" && (
            <Modal
              opened={opened}
              onClose={handleClose}
              size={"lg"}
              title="Logowanie"
              classNames={{ inner: "modalInner" }}
            >
              
              <TextInput type="text" placeholder="Email" className="authInput"
                onChange={(e) => setEmail(e.target.value)} />
              <PasswordInput type="password" placeholder="Hasło" className="authInput"
                onChange={(e) => setPassword(e.target.value)} />

              <div className="area_button">
                <Button className="registerButton" color="dark"
                  onClick={() => setSection("register")}>Rejestracja</Button>
                <Button className="loginButton" color="blue" onClick={() => handleLogin()}>Zaloguj się</Button>
                <Button color="dark" onClick={() => setSection("resetPassword")}>
                  Zapomniałem hasła
                </Button>
                {/* <Button color="dark"
                        onClick={() => resetPassword()}
                >
                  Zapomniałem hasła
                </Button> */}
                <Auth onClose={() => handleClose()} />
              </div>
            </Modal>
          )}

          {section === "register" && (
            <Modal
              opened={opened}
              onClose={handleClose}
              size={"lg"}
              title="Rejestracja"
              classNames={{ inner: "modalInner" }}
            >
              <TextInput
                type="text" placeholder="Imię" className="authInput" onChange={(e) => setFirstName(e.target.value)}/>
              <TextInput
                type="text" placeholder="Nazwisko" className="authInput"
                onChange={(e) => setLastName(e.target.value)}/>
              <TextInput type="text" placeholder="Email" className="authInput"
                onChange={(e) => setEmail(e.target.value)} />
              <PasswordInput type="password" placeholder="Hasło" className="authInput"
                onChange={(e) => setPassword(e.target.value)} />
              <PasswordInput type="password" placeholder="Powtórz hasło" className="authInput"
                onChange={(e) => setRepeatPassword(e.target.value)} />
              <div className="area_button">
                <Button className="registerButton" color="dark" onClick={() => setSection("login")}>Logowanie</Button>
                <Button className="loginButton" onClick={() => handleRegister()}>Zarejestruj się</Button>
                <Auth onClose={() => handleClose()} />
              </div>
            </Modal>
          )}

          {section === "resetPassword" && (
            <Modal
              opened={opened}
              onClose={handleClose}
              size={"lg"}
              title="Zresetuj hasło"
              classNames={{ inner: "modalInner" }}
            >
              <TextInput type="text" placeholder="Email" className="authInput"
                onChange={(e) => setEmail(e.target.value)} />
              <Button
                color="blue"
                onClick={() => {
                  resetPassword();
                }}
              >
                Zresetuj hasło
              </Button>
            </Modal>
          )}
        </>
      )}
    </>
  );
}

export default LoginComponent;