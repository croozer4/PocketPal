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

  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");


  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  }

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });

  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        console.log("User logged in");
      } else {
        setLoggedIn(false);
        console.log("User logged out");
      }
    });
  });

  // funkcja do resetowania hasła
  const resetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
        
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error(errorMessage);
      });
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
          onClose={close}
          size={"lg"}
          title="Logowanie"
          classNames={{ inner: "modalInner" }}
        >
          <h4>Użytkownik zalogowany</h4>
          <img src={userPhotoURL} alt="User Profile" className="userAvatarAuth" />
          <button onClick={() => auth.signOut()}>Wyloguj</button>
        </Modal>
      ) : (
        <>
          {section == "login" ? (
            <Modal
              opened={opened}
              onClose={close}
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
                <Button color="dark" onClick={() => setResetPasswordModal(true)}>
                  Zapomniałem hasła
                </Button>
                {/* <Button color="dark"
                        onClick={() => resetPassword()}
                >
                  Zapomniałem hasła
                </Button> */}
                <Auth />
              </div>
            </Modal>
          ) : (
            <Modal
              opened={opened}
              onClose={close}
              size={"lg"}
              title="Rejestracja"
              classNames={{ inner: "modalInner" }}
            >
              <TextInput type="text" placeholder="Email" className="authInput"
                onChange={(e) => setEmail(e.target.value)} />
              <PasswordInput type="password" placeholder="Hasło" className="authInput"
                onChange={(e) => setPassword(e.target.value)} />
              <PasswordInput type="password" placeholder="Powtórz hasło" className="authInput"
                onChange={(e) => setRepeatPassword(e.target.value)} />
              <div className="area_button">
                <Button className="registerButton" color="dark" onClick={() => setSection("login")}>Logowanie</Button>
                <Button className="loginButton" onClick={() => handleRegister()}>Zarejestruj się</Button>
                <Auth />
              </div>
            </Modal>
            
            

          )
          
          
          }
          {resetPasswordModal && (
          
            <Modal
              opened={resetPasswordModal}
              onClose={() => {
                setResetPasswordModal(false);
                setResetPasswordEmail(""); 
              }}
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
                  setResetPasswordModal(false);
                  
                }}

              >
                Zresetuj hasło
              </Button>
              
            </Modal>
          )}

        </>
      )
      }
    </>
  );
}

export default LoginComponent;