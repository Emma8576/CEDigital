import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  nombre: string;
  tipo: string;
  carnet?: string;
}

// Update interfaces to match backend DTOs more closely
interface Folder {
  idCarpeta: number;
  nombreCarpeta: string;
  idGrupo: number;
  type: 'folder'; // Explicit type discriminator
}

interface FileItem {
    idArchivo: number;
    nombreArchivo: string;
    fechaPublicacion: string; // Or Date
    tamañoArchivo: number; // Assuming size is in bytes
    idCarpeta: number;
    ruta: string; // Not strictly needed for display, but good to have
    type: 'file'; // Explicit type discriminator
}

// Combined type for file explorer items
type FileExplorerItem = Folder | FileItem;

interface StudentDocumentExplorerProps {
  idGrupo: number;
  user: User | null;
}

const StudentDocumentExplorer: React.FC<StudentDocumentExplorerProps> = ({ idGrupo, user }) => {
  // currentPath will now store a list of folder IDs
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileExplorerItem | null>(null);
  // documents will hold the items (folders and files) in the current view
  const [documents, setDocuments] = useState<FileExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        if (currentPath.length === 0) {
          // Fetch root folders for the group
          const response = await axios.get<Omit<Folder, 'type'>[]>(`http://localhost:5261/api/Carpeta/grupo/${idGrupo}`);
          // Map backend folders to FileExplorerItem, add type 'folder'
          const rootFolders: FileExplorerItem[] = response.data.map(folder => ({
              ...folder,
              type: 'folder'
          }));
          setDocuments(rootFolders);
        } else {
          // Fetch files within the current folder
          const currentFolderId = currentPath[currentPath.length - 1];
          const response = await axios.get<Omit<FileItem, 'type'>[]>(`http://localhost:5261/api/Carpeta/${currentFolderId}/archivos`);
           // Map backend files to FileExplorerItem, add type 'file'
          const files: FileExplorerItem[] = response.data.map(file => ({
              ...file,
              type: 'file' // Explicitly set type to 'file'
          }));
          setDocuments(files);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Error al cargar los documentos.");
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [idGrupo, currentPath]); // Dependency on idGrupo and currentPath

  const handleItemClick = (item: FileExplorerItem) => {
    // Use type guard to check if it's a folder
    if (item.type === 'folder') {
      // Navigate into the folder by adding its ID to the path
      setCurrentPath([...currentPath, item.idCarpeta]);
      setSelectedItem(null);
    } else {
      // It's a file, select it (or trigger download, etc.)
      setSelectedItem(item);
    }
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItem(null);
    }
  };

  // Update breadcrumb rendering to use currentPath and potentially fetch folder names if needed (for now, just IDs or a simple representation)
  const renderBreadcrumb = () => {
    // For simplicity, let's just show 'Inicio' and the current folder ID for now
    // A more robust solution would involve fetching folder names for the path
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button
          onClick={() => setCurrentPath([])}
          className="hover:text-blue-500"
        >
          Inicio
        </button>
        {currentPath.map((folderId, index) => (
             <React.Fragment key={folderId}>
                <span>/</span>
                 {/* Ideally, fetch and display the actual folder name */}
                <button
                    onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                    className="hover:text-blue-500"
                >
                    Carpeta ID: {folderId} {/* Placeholder */}
                </button>
            </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center mt-8 text-gray-600">Cargando documentos...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Explorador de Documentos</h2>
        {currentPath.length > 0 && (
          <button
            onClick={handleBack}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        )}
      </div>

      {renderBreadcrumb()}

      <div className="space-y-2">
        {documents.length === 0 && (
          <div className="text-gray-500">No hay documentos en esta carpeta.</div>
        )}
        {documents.map((item) => (
          <div
            // Use appropriate ID from backend data based on type
            key={item.type === 'folder' ? item.idCarpeta : item.idArchivo}
            className={`flex items-center p-3 rounded-lg cursor-pointer ${
              // Use appropriate ID for selected item comparison based on type
              selectedItem && ((item.type === 'folder' && selectedItem.type === 'folder' && selectedItem.idCarpeta === item.idCarpeta) || (item.type === 'file' && selectedItem.type === 'file' && selectedItem.idArchivo === item.idArchivo)) ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleItemClick(item)}
          >
            <svg
              className={`w-5 h-5 mr-3 ${
                // Check the 'type' property
                item.type === 'folder' ? 'text-yellow-500' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Use type guard for rendering SVG based on type */}
              {item.type === 'folder' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              )}
            </svg>
            {/* Use appropriate name property from backend data based on type */}
            <span className="text-gray-700">{item.type === 'folder' ? item.nombreCarpeta : item.nombreArchivo}</span>
          </div>
        ))}
      </div>

      {/* Display file details and download button if a file is selected */}
      {/* Use type guard for selectedItem */}
      {selectedItem && selectedItem.type === 'file' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Archivo seleccionado:</h3>
          {/* Use appropriate name property */}
          <p className="text-gray-600">{selectedItem.nombreArchivo}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              // Implement download logic using the backend download endpoint
               const fileId = selectedItem.idArchivo;
               const downloadUrl = `http://localhost:5261/api/Carpeta/descargar/${fileId}`;
               window.open(downloadUrl, '_blank'); // Open in new tab to trigger download
            }}
          >
            Descargar
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDocumentExplorer; 