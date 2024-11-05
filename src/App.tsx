import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import FindRide from "./pages/FindRide";
import CreateRide from "./pages/CreateRide";
import MyRides from "./pages/MyRides";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {isAuthenticated && <Navbar />}
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <Login />}
              />
              <Route
                path="/"
                element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile"
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
              />
              <Route
                path="/find-ride"
                element={isAuthenticated ? <FindRide /> : <Navigate to="/login" />}
              />
              <Route
                path="/create-ride"
                element={isAuthenticated ? <CreateRide /> : <Navigate to="/login" />}
              />
              <Route
                path="/my-rides"
                element={isAuthenticated ? <MyRides /> : <Navigate to="/login" />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;