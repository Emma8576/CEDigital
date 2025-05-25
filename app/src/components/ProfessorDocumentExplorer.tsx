import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfessorDocumentExplorer.css'

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

interface ProfessorDocumentExplorerProps {
  idGrupo: number;
  user: User | null;
}

function showBlock(key:number, divNumber:number){
  if(key === divNumber){
    return 'block';
  }else{
    return 'None';
  }
}

const ProfessorDocumentExplorer: React.FC<ProfessorDocumentExplorerProps> = ({ idGrupo, user }) => {
  // currentPath will now store a list of folder IDs
  const path = '5000'
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileExplorerItem | null>(null);
  // documents will hold the items (folders and files) in the current view
  const [documents, setDocuments] = useState<FileExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createFileInputs, setCreateFileInputs] = useState(0);
  const [folderName, setFolderName] = useState("");
  const [idCurrentFolder, setIdCurrentFolder] = useState(-1);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<{ [evaluationId: number]: string | null }>({}); // New state for success messages

  const primeFilesNames = ['Exámenes', 'Presentaciones', 'Proyectos', 'Quices'];

  const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        if (currentPath.length === 0) {
          // Fetch root folders for the group
          const response = await axios.get<Omit<Folder, 'type'>[]>(`http://localhost:${path}/api/Carpeta/grupo/${idGrupo}`);
          // Map backend folders to FileExplorerItem, add type 'folder'
          const rootFolders: FileExplorerItem[] = response.data.map(folder => ({
              ...folder,
              type: 'folder'
          }));
          setDocuments(rootFolders);
        } else {
          // Fetch files within the current folder
          const currentFolderId = currentPath[currentPath.length - 1];
          const response = await axios.get<Omit<FileItem, 'type'>[]>(`http://localhost:${path}/api/Carpeta/${currentFolderId}/archivos`);
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

  useEffect(() => {
    fetchDocuments();
  }, [idGrupo, currentPath]); // Dependency on idGrupo and currentPath

  const handleFileUpload = async (currentFolderId: number, file: File) => {
    try {

      setUploadingFile(currentFolderId);
      setUploadSuccessMessage(prev => ({ ...prev, [currentFolderId]: null }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('idCarpeta', currentFolderId.toString());
      const localLink = 'http://localhost:' + path + '/api/Carpeta/subir-archivo';

      const response = await axios.put<{ message: string, filePath: string }>(localLink, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      alert("Se ha creado el archivo exitosamente");
      setCreateFileInputs(0);
      closeDialog();
      fetchDocuments();
      setUploadSuccessMessage(prev => ({ ...prev, [currentFolderId]: response.data.message }));
      
      setUploadingFile(null);
      
      // You might want to refetch deliveries here after a successful upload
      // to reflect the new state if the backend were fully functional.
      // For now, we just show a success message.

    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadingFile(null);
      // You might want to show an error message to the user here
    }
  };

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
                    onClick={() => {setCurrentPath(currentPath.slice(0, index + 1));}}
                    className="hover:text-blue-500"
                >
                    Carpeta ID: {folderId} {/* Placeholder */}
                    
                </button>
            </React.Fragment>
        ))}
      </div>
    );
  };

  const crearForlderOFile = () =>{
    (document.getElementById('dialogCreate') as HTMLDialogElement)?.showModal();
  }
  const closeDialog = () =>{
    (document.getElementById('dialogCreate') as HTMLDialogElement)?.close();
    setCreateFileInputs(0);
  }

  const changeCreateDialog = (isFolder: boolean) =>{
    if(isFolder){
      setCreateFileInputs(1);
    }else{
      setCreateFileInputs(2);
    }
  }

  const createNewFolder = async() =>{
    if(folderName.length === 0){
      alert("La carpeta debe tener un nombre");
    }else{
      try{
        const url = 'http://localhost:' + path + '/api/Carpeta';
        const newFolder = {
          nombreCarpeta: folderName,
          idGrupo: idGrupo
        }
        await axios.post(url, newFolder);
        alert("La carpeta se ha creado exitosamente.");
        setCreateFileInputs(0);
        closeDialog();
        fetchDocuments();
      }catch(error){
        console.error('Error al hacer POST:', error);
      }
    }
  }

  const deleteFolder = async(id: number,nombreCarpeta: string, type:string) =>{
    if(type === 'folder'){
      if(primeFilesNames.includes(nombreCarpeta)){
        alert("Las carpetas primarias no se pueden borrar");
      }else{
        const confirmDelete = window.confirm("¿Borrar la carpeta " + nombreCarpeta + " permanentemente?");
        if(confirmDelete){
          try{
            await axios.delete(`http://localhost:${path}/api/Carpeta/${id}`);
            alert("La carpeta " + nombreCarpeta + " se ha borrado exitosamente.");
            fetchDocuments();
          }catch(err){
            console.log("Error al borrar la carpeta: ", err);
          }

        }
      }
    }else{
      const confirmKill = window.confirm("¿Está segur@ de borrar permanentemente este archivo?");
      if(confirmKill){
        try{
          await axios.delete(`http://localhost:${path}/api/Carpeta/archivo/${id}`);
          alert("El archivo '" + nombreCarpeta + "' se ha borrado correctamente.");
          fetchDocuments();
        }catch(err){
          console.log("Error al eliminar el archivo.");
        }
      }

    }
  }

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
            onClick={() => {handleItemClick(item); setIdCurrentFolder(item.idCarpeta);}}
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
            <div className='delete-button' style={{fontSize:'25px', marginTop: '-3px'}} onClick={(e) => deleteFolder(item.type === 'folder' ? item.idCarpeta : item.idArchivo,item.type === 'folder' ? item.nombreCarpeta : item.nombreArchivo, item.type)}>
              -
            </div>
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
               const downloadUrl = `http://localhost:${path}/api/Carpeta/descargar/${fileId}`;
               window.open(downloadUrl, '_blank'); // Open in new tab to trigger download
            }}
          >
            Descargar
          </button>
        </div>
      )}

      <div className='delete-button' onClick={crearForlderOFile} style={{fontSize:'25px'}}>
        +
      </div>
      <dialog className='dialog-box' id='dialogCreate'>
        <div style={{display:showBlock(createFileInputs, 0)}}>
          <div className='dialog-text' >
            ¿Crear una carpeta o agregar un archivo a la carpeta actual?
          </div>
          <div className='button-rows'>
            <div className='delete-button' onClick={() => changeCreateDialog(true)}>
              Carpeta
            </div>
            <div className='delete-button' onClick={() => changeCreateDialog(false)}>
              Archivo
            </div>
            <div className='delete-button' onClick={closeDialog}>
              Cancelar
            </div>
          </div>
        </div>
        <div style={{display:showBlock(createFileInputs, 1)}}>
          <input
            id="folderTitleInput"
            name="folderTitleInput"
            type="email"
            style={{maxWidth:'200px', marginBottom:'5px', justifyContent:'center'}}
            required
            className="custom-input"
            placeholder="Nombre de la carpeta..."
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
          />
          <div className='button-rows' style={{marginTop:'25px'}}>
            <div className='delete-button' onClick={closeDialog}>
              Cancelar
            </div>
            <div className='delete-button' onClick={createNewFolder}>
              Crear
            </div>
          </div>
        </div>
        <div style={{display:showBlock(createFileInputs, 2)}}>
          <div className="space-y-2">                                                  
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                  <p className="text-xs text-gray-500">(MAX: 80MB - Tipos de archivo permitidos...)</p> {/* TODO: Add allowed file types */}                                                                                </div>
              <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(idCurrentFolder, file);
                  }}
              />
            </label>
            {uploadingFile === idCurrentFolder && (
                <span className="ml-2 text-gray-600 text-sm">Subiendo...</span>
            )}
            {/* Display success message */}                                                                             {uploadSuccessMessage[idCurrentFolder] && (
                <span className="ml-2 text-green-600 text-sm">{uploadSuccessMessage[idCurrentFolder]}</span>
              )}
          </div>
          <div className='delete-button' onClick={closeDialog}>
            Cancelar
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ProfessorDocumentExplorer; 