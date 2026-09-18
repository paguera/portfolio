
import type { User } from "../types";
import { createContext } from 'react';


interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean; // Ajouté pour gérer le temps de vérification du cookie au chargement
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

