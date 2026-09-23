import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export const AVAILABLE_PERSONAS = [
  {
    id: 1,
    key: 'admin',
    name: 'Abu Bin Ishtiyak',
    role: 'Admin',
    roleSlug: 'admin',
    email: 'info@softnio.com',
    title: 'Super Administrator',
    department: 'Executive Board',
    avatar: 'AB',
    badgeColor: 'primary'
  },
  {
    id: 2,
    key: 'manager',
    name: 'Emma Walker',
    role: 'Manager',
    roleSlug: 'manager',
    email: 'emma.walker@example.com',
    title: 'Operations & People Manager',
    department: 'Operations',
    avatar: 'EW',
    badgeColor: 'amber'
  },
  {
    id: 36, // Seeded Dr. Julian Morales
    key: 'employee',
    name: 'Dr. Julian Morales',
    role: 'Employee',
    roleSlug: 'pharmacist',
    email: 'julian.morales@example.com',
    title: 'Clinical Pharmacist',
    department: 'Pharmacy & Clinical',
    avatar: 'JM',
    badgeColor: 'emerald'
  }
];

export function AuthProvider({ children }) {
  const [activePersonaKey, setActivePersonaKey] = useState(() => {
    return localStorage.getItem('hrms_active_persona') || 'admin';
  });

  const currentUser = useMemo(() => {
    return AVAILABLE_PERSONAS.find(p => p.key === activePersonaKey) || AVAILABLE_PERSONAS[0];
  }, [activePersonaKey]);

  useEffect(() => {
    localStorage.setItem('hrms_active_persona', currentUser.key);
    localStorage.setItem('hrms_active_user_id', String(currentUser.id));
  }, [currentUser]);

  const switchPersona = (key) => {
    const target = AVAILABLE_PERSONAS.find(p => p.key === key || p.id === Number(key));
    if (target) {
      setActivePersonaKey(target.key);
    }
  };

  const isAdmin = currentUser.role === 'Admin';
  const isManager = currentUser.role === 'Manager' || isAdmin;
  const isEmployee = currentUser.role === 'Employee';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        personas: AVAILABLE_PERSONAS,
        switchPersona,
        isAdmin,
        isManager,
        isEmployee
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
