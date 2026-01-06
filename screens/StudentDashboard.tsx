import React, { useState, useEffect, useRef } from 'react';
import { User, Course } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  onStartAttendance: (course: Course) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, onStartAttendance }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const currentClass: Course = {
    id: 'cs101',
    code: 'CS101',
    name: 'Intro to Algorithms',
    room: 'Room 304',
    time: '09:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400'
  };

  const handleScan = async (course: Course) => {
    if (showScanner) {
      stopScanner();
      return;
    }
    setShowScanner(true);
  };

  const startScanner = () => {
    if (scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeSupportedFormats.QR_CODE]
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);
    
    scanner.render(
      async (decodedText) => {
        // Stop scanning immediately on success
        scanner.clear();
        scannerRef.current = null;
        setShowScanner(false);
        
        await processAttendance(decodedText, currentClass);
      },
      (error) => {
        // Silence errors to avoid console noise during continuous scanning
      }
    );

    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setShowScanner(false);
  };

  const processAttendance = async (sessionCode: string, course: Course) => {
    setIsScanning(true);
    setScanMessage('Verifying...');

    try {
      const res = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          courseCode: course.code,
          sessionCode: sessionCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanMessage('Check-in Successful!');
      } else {
        setScanMessage(data.message || 'Check-in failed');
      }
    } catch (error) {
      console.error(error);
      setScanMessage('Network error');
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(''), 3000);
    }
  };

  const handleManualEntry = async () => {
    const code = prompt("Please enter the session code displayed on the lecturer's screen (e.g. CS101-17...)");
    if (code) {
      await processAttendance(code, currentClass);
    }
  };

  useEffect(() => {
    if (showScanner) {
      startScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showScanner]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-background-dark max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Smart Attendance</h1>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-6">
        {/* Course Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {currentClass.code} - {currentClass.name.toUpperCase()}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">Scan for Attendance</h2>
        <p className="text-slate-500 text-center text-sm max-w-[250px] mb-8">
          Align the QR code within the frame to automatically mark your attendance.
        </p>

        {/* Camera Viewfinder */}
        <div 
          onClick={() => handleScan(currentClass)}
          className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer group bg-black"
        >
          {/* Blurred Background Image (Simulating Camera Feed) */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-80 blur-[2px] scale-105" 
            style={{ backgroundImage: `url(${currentClass.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10">
            {showScanner && <div id="reader" className="w-full h-full absolute inset-0 bg-black z-20"></div>}
            
            {/* Top Brackets */}
            <div className="w-full flex justify-between">
              <div className="w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <div className="w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>

            {/* Scan Line Animation */}
            <div className={`w-full h-[2px] bg-blue-500 shadow-[0_0_20px_#3b82f6] absolute top-1/2 left-0 ${isScanning ? 'animate-pulse' : 'animate-scan-vertical'}`}></div>

            {/* Status Message Overlay */}
            {scanMessage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 animate-in fade-in">
                <div className="bg-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                  {isScanning ? <span className="material-symbols-outlined animate-spin text-blue-600">progress_activity</span> : <span className="material-symbols-outlined text-green-600">check_circle</span>}
                  <span className="font-bold text-slate-900">{scanMessage}</span>
                </div>
              </div>
            )}

            {/* Bottom Brackets */}
            <div className="w-full flex justify-between mb-20">
              <div className="w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <div className="w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-3xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-6 left-0 w-full flex items-center justify-center gap-8">
               {/* Gallery Button */}
               <button className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors text-white">
                  <span className="material-symbols-outlined">image</span>
               </button>

               {/* Shutter/Scan Button */}
               <button className="size-16 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-lg hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
               </button>

               {/* Flash Button */}
               <button className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors text-white">
                  <span className="material-symbols-outlined">flash_on</span>
               </button>
            </div>
          </div>
        </div>

        {/* Manual Code Entry Card */}
        <div 
          onClick={handleManualEntry}
          className="w-full mt-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className="size-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">keyboard</span>
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Having trouble scanning?</h4>
                    <p className="text-xs text-slate-500">Enter the class code manually</p>
                </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg">arrow_forward_ios</span>
        </div>

        {/* Footer Status */}
        <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="material-symbols-outlined text-emerald-500 text-sm filled">check_circle</span>
            Last check-in: ENG202 - 10:45 AM
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
