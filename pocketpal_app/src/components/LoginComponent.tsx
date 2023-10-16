import { useEffect, useState } from "react";
import Auth from "./AuthenticationComponent.tsx"
import { auth } from "../config/firebase";
import { PasswordInput, TextInput, UnstyledButton, Button } from "@mantine/core";
import { GrClose } from "react-icons/gr";
import "../styles/LoginComponentStyles.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";

function LoginComponent({ onClose, userPhotoURL }) {
    const [loggedIn, setLoggedIn] = useState(false);

    const [section, setSection] = useState("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }

    const handleRegister = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorCode, errorMessage);
                // ..
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

    

    return (
        <div className="authForm">

            <UnstyledButton onClick={onClose} className="close-button" style={{ width: '50px', height: '80px'}}>
                <GrClose />
            </UnstyledButton>


            {loggedIn ? (
                <>
                    <h4>Użytkownik zalogowany</h4>
                    <img src={userPhotoURL} alt="User Profile" className="userAvatarAuth" />
                </>
            ) : (
                <>
                    {section == "login" ? (
                        <div>
                            <h2 className="auth_log">Logowanie</h2>
                            <TextInput type="text" placeholder="Email" className="authInput" onChange={(e)=>setEmail(e.target.value) } />
                            <PasswordInput type="password" placeholder="Hasło" className="authInput" onChange={(e)=>setPassword(e.target.value) } />
                            <div className="area_button">
                                <Button className="registerButton" color="dark" onClick={() => setSection("register")}>Rejestracja</Button>
                                <Button className="loginButton" color="blue" onClick={() => handleLogin()}>Zaloguj się</Button>
                                <Auth />
                            </div>

                        </div>
                    ) : (
                        <div>
                            <h2 className="auth_log">Rejestracja</h2>
                            <TextInput type="text" placeholder="Email" className="authInput" onChange={(e)=>setEmail(e.target.value) } />
                            <PasswordInput type="password" placeholder="Hasło" className="authInput" onChange={(e)=>setPassword(e.target.value) }/>
                            <PasswordInput type="password" placeholder="Powtórz hasło" className="authInput" onChange={(e)=>setRepeatPassword(e.target.value) }/>
                            <div className="area_button">
                                <Button className="registerButton" color="dark" onClick={() => setSection("login")}>Logowanie</Button>
                                <Button className="loginButton" onClick={() => handleRegister()}>Zarejestruj się</Button>
                                <Auth />
                            </div>
                        </div>
                    )
                    }
                </>
            )}

            {loggedIn ? (
                <button onClick={() => auth.signOut()}>Wyloguj</button>
            ) : null}
        </div>
    );
}

export default LoginComponent;