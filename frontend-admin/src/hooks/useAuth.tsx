import { useContext } from "react";
import { AuthContext } from '../context/AuthContext';

// Ajout d'un export pour permettre l'accès direct à `useAuth` depuis le fichier
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};