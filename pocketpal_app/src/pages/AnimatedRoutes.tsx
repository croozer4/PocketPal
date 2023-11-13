import React  from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';

import { AnimatePresence } from 'framer-motion';

import MainPage from "./MainPage";
import FamilyPage from "./FamilyPage";

export function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<MainPage />} />
                <Route path="/family" element={<FamilyPage />} />
                <Route path="*" element={<h1>404</h1>} />
            </Routes>
        </AnimatePresence>
    );
}
