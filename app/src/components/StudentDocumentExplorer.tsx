import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  nombre: string;
  tipo: string;
  carnet?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: Document[];
}

interface StudentDocumentExplorerProps {
  idGrupo: number;
  user: User | null;
}

const StudentDocumentExplorer: React.FC<StudentDocumentExplorerProps> = ({ idGrupo, user }) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        let currentMockFolder: Document[] = mockDocuments;
        for (const pathId of currentPath) {
          const foundFolder = currentMockFolder.find(item => item.id === pathId && item.type === 'folder');
          if (foundFolder && foundFolder.children) {
            currentMockFolder = foundFolder.children;
          } else {
            currentMockFolder = [];
            break;
          }
        }
        setDocuments(currentMockFolder);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Error al cargar los documentos.");
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [idGrupo, currentPath]);

  const getCurrentFolder = (): Document[] => {
    return documents;
  };

  const handleItemClick = (item: Document) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.id]);
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItem(null);
    }
  };

  const findItemInMock = (id: string, items: Document[]): Document | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const foundInChildren = findItemInMock(id, item.children);
        if (foundInChildren) return foundInChildren;
      }
    }
    return undefined;
  };

  const renderBreadcrumb = () => {
    let currentBreadcrumbPath: Document[] = [];
    let currentItems = mockDocuments;

    for (const pathId of currentPath) {
      const foundItem = findItemInMock(pathId, currentItems);
      if (foundItem) {
        currentBreadcrumbPath.push(foundItem);
        if (foundItem.children) {
          currentItems = foundItem.children;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button
          onClick={() => setCurrentPath([])}
          className="hover:text-blue-500"
        >
          Inicio
        </button>
        {currentBreadcrumbPath.map((item, index) => (
          <React.Fragment key={item.id}>
            <span>/</span>
            <button
              onClick={() => setCurrentPath(currentBreadcrumbPath.slice(0, index + 1).map(item => item.id))}
              className="hover:text-blue-500"
            >
              {item.name}
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
            key={item.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer ${
              selectedItem?.id === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleItemClick(item)}
          >
            <svg
              className={`w-5 h-5 mr-3 ${
                item.type === 'folder' ? 'text-yellow-500' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            <span className="text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>

      {selectedItem && selectedItem.type === 'file' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Archivo seleccionado:</h3>
          <p className="text-gray-600">{selectedItem.name}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              console.log('Attempting to download file:', selectedItem.id);
            }}
          >
            Descargar
          </button>
        </div>
      )}
    </div>
  );
};

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Material de Clase',
    type: 'folder',
    children: [
      {
        id: '1-1',
        name: 'Presentaciones',
        type: 'folder',
        children: [
          {
            id: '1-1-1',
            name: 'Introducción.pdf',
            type: 'file',
          }
        ]
      },
      {
        id: '1-2',
        name: 'Guías de Laboratorio',
        type: 'folder',
        children: [
          {
            id: '1-2-1',
            name: 'Lab1.pdf',
            type: 'file',
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Tareas',
    type: 'folder',
    children: [
      {
        id: '2-1',
        name: 'Tarea1.pdf',
        type: 'file',
      }
    ]
  }
];

export default StudentDocumentExplorer; 