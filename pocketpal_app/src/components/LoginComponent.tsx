import { useEffect, useState } from "react";
import Auth from "./AuthenticationComponent.tsx"
import { auth } from "../config/firebase";
import {UnstyledButton} from "@mantine/core";
import {GrClose} from "react-icons/gr";
import "../styles/LoginComponentStyles.css";

function LoginComponent({ onClose, userPhotoURL }) {
    const [loggedIn, setLoggedIn] = useState(false);

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
            <UnstyledButton onClick={onClose} className="close-button">
                <GrClose/>
            </UnstyledButton>
            <Auth/>
            {loggedIn ? (
              <>
                <h4>Użytkownik zalogowany</h4>
                <img src={userPhotoURL} alt="User Profile" className="userAvatarAuth"/>
              </>
            ) : (
                <h4>Użytkownik niezalogowany</h4>
            )}
            {loggedIn ? (
                <button onClick={() => auth.signOut()}>Wyloguj</button>
            ) : null}
        </div>
    );
}

export default LoginComponent;