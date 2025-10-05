import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { MatchesService } from '../services/api'; // Assuming MatchesService is in this path

interface Match {
  id: number;
  title: string;
  matchDate: string;
  locationName: string;
  hostTeamName: string;
  memberCount: number;
  maxMemberCount: number;
  status: string;
  // Add other match properties as needed
}

interface MatchesContextType {
  matches: Match[];
  fetchMatches: () => void;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const MatchesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await MatchesService.list();
      setMatches(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("Failed to fetch matches:", err);
      setError(err?.message || "Failed to load matches.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <MatchesContext.Provider value={{ matches, fetchMatches }}>
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};
