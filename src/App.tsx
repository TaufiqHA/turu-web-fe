/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './context';
import { Login } from './components/Login';
import { AppShell } from './components/AppShell';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user } = useAppContext();
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4 sm:p-8 m-0 font-sans text-slate-900 overflow-hidden">
      <div className="w-full max-w-[360px] h-[100vh] sm:max-h-[750px] bg-white sm:rounded-[3rem] sm:border-8 sm:border-slate-800 shadow-2xl relative overflow-hidden flex flex-col shrink-0">
        <AnimatePresence mode="popLayout">
          {user ? (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full w-full absolute inset-0">
              <AppShell />
            </motion.div>
          ) : (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full w-full absolute inset-0">
              <Login />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
