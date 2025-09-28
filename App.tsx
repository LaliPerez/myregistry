import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Attendee } from './types';
import Header from './components/Header';
import AddAttendeeForm from './components/AddAttendeeForm';
import AttendeeTable from './components/AttendeeTable';
import { DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    try {
      const storedAttendees = localStorage.getItem('attendees');
      if (storedAttendees) {
        setAttendees(JSON.parse(storedAttendees));
      }
    } catch (error) {
      console.error("Failed to load attendees from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('attendees', JSON.stringify(attendees));
    } catch (error) {
      console.error("Failed to save attendees to localStorage", error);
    }
  }, [attendees]);

  const handleAddAttendee = (newAttendee: Attendee) => {
    setAttendees(prevAttendees => [...prevAttendees, newAttendee]);
  };

  const handleDownloadPdf = () => {
    if (attendees.length === 0) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Registro de Asistencia a Capacitación", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);

    const tableColumn = ["Nombre y Apellido", "Número de ID", "Fecha de Registro", "Firma"];
    const tableRows: any[][] = [];

    attendees.forEach(attendee => {
      const attendeeData = [
        attendee.name,
        attendee.idNumber,
        new Date(attendee.timestamp).toLocaleString('es-ES'),
        '', // Placeholder for image
      ];
      tableRows.push(attendeeData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
           const attendee = attendees[data.row.index];
           if (attendee && attendee.signature) {
             const img = new Image();
             img.src = attendee.signature;
             const cellHeight = data.cell.height - 4; // padding
             const aspectRatio = img.width / img.height;
             const imgWidth = cellHeight * aspectRatio;
             const imgHeight = cellHeight;
             const x = data.cell.x + (data.cell.width - imgWidth) / 2;
             const y = data.cell.y + 2;
             doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
           }
        }
      },
      rowPageBreak: 'avoid',
      styles: { valign: 'middle' },
      columnStyles: { 3: { cellWidth: 40 } },
    });

    doc.save("registro_asistencia.pdf");
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AddAttendeeForm onAdd={handleAddAttendee} />
        
        <div className="bg-white p-6 rounded-lg shadow-md">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Lista de Asistentes</h2>
              <button
                onClick={handleDownloadPdf}
                disabled={attendees.length === 0}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                  attendees.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Descargar PDF
              </button>
           </div>
          <AttendeeTable attendees={attendees} />
        </div>

      </main>
    </>
  );
};

export default App;
