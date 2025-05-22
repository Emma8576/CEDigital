import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfessorNews.css';


interface NewsItem {
  idNoticia: number;
  titulo: string;
  mensaje: string;
  fechaPublicacion: string; // Or Date if you parse it
  idGrupo: number;
}


interface ProfessorNewsProps {
  idGrupo: number;
}

function startEditingBlock(newsId: number, newsEditedId: number, isEditing: boolean, isEditBlock: boolean){
  if(isEditBlock){
    if((newsId === newsEditedId) && isEditing){
      return 'block';
    }else{
      return 'None';
    }
  }else{
    if((newsId === newsEditedId) && isEditing){
      return 'None';
    }else{
      return 'block';
    }
  }
}

const ProfessorNews: React.FC<ProfessorNewsProps> = ({ idGrupo }) => {
  const port = '5000';
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDescription, setNewsDescription] = useState("");
  const [newsTitleEdit, setNewsTitleEdit] = useState("");
  const [newsDescriptionEdit, setNewsDescriptionEdit] = useState("");
  const [newsEditedId, setNewsEditedId] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);

  const fetchNews = async () => {
      try {
        setLoading(true);
        // Use the correct backend endpoint
        const response = await axios.get<NewsItem[]>(`http://localhost:${port}/api/Noticia/grupo/${idGrupo}`);
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Error al cargar las noticias.");
        setLoading(false);
      }
    };
  

  useEffect(() => {
    

    fetchNews();
  }, [idGrupo]); // Re-fetch news if idGrupo changes

  if (loading) {
    return <div className="text-center mt-4 text-gray-600">Cargando noticias...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
  }

  if (news.length === 0) {
    return <div className="text-center mt-4 text-gray-500">No hay noticias disponibles para este grupo.</div>;
  }

  

  const deleteNews = async (newsId: number) =>{
    let deleteThisNews = window.confirm("¿Eliminar esta noticia?");
    if(deleteThisNews === true){
      try{
        await axios.delete(`http://localhost:${port}/api/Noticia/${newsId}`);
        alert("La noticia ha sido borrada.");
        fetchNews();
      }catch(error){
        console.log(error);
      }
    }else{
      console.log("Denied");
    }
  }

  const publishNews = async () =>{
    if(newsTitle.length > 0 && newsDescription.length > 0){
      const newsPublished = {
        titulo: newsTitle, 
        mensaje: newsDescription,
        idGrupo: idGrupo
      }
      try{
        const url = 'http://localhost:' + port + '/api/Noticia';
        await axios.post(url, newsPublished);
        alert("La noticia ha sido publicada exitosamente.");
        fetchNews();
      }catch(error){
        console.error('Error al hacer POST:', error);
      }
    }
  }

  const startEditing = (idNoticia: number, noticiaTitle: string, noticiaDesc: string) =>{
    setNewsEditedId(idNoticia);
    setNewsTitleEdit(noticiaTitle);
    setNewsDescriptionEdit(noticiaDesc);
    setIsEditing(true);
  }

  const saveChanges = async() =>{
    if(newsTitleEdit.length > 0 && newsDescriptionEdit.length > 0){
      let updateThisNews = window.confirm("¿Editar esta noticia?");
      if(updateThisNews){
        const updatedData = {
          idNoticia: newsEditedId,
          titulo: newsTitleEdit,
          mensaje: newsDescriptionEdit
        }
        const url = 'http://localhost:' + port + '/api/Noticia/' + newsEditedId;
        await axios.put(url, updatedData);
        fetchNews();
      }else{
        console.error('Error al hacer PUT: ', error);
      }
    }else{
      alert("No puede dejar la noticia vacía");
    }
    setIsEditing(false);
  }

  return (
      <div className="space-y-4">
          
            <div style={{fontWeight: 'bold'}}>Publicar Nueva Noticia</div>
            <div>
              <div >
                <input
                  id="newsTitle"
                  name="newsTitle"
                  type="email"
                  style={{maxWidth:'500px', marginBottom:'5px'}}
                  required
                  className="custom-input"
                  placeholder="Título de la noticia"
                  value={newsTitle}
                  onChange={e => setNewsTitle(e.target.value)}
                />
                <textarea
                  id="newsDescriptor"
                  name="newsDescriptor"
                  style={{maxWidth:'500px', minHeight:'100px'}}
                  required
                  className="custom-input"
                  placeholder="Descripción..."
                  value={newsDescription}
                  onChange={e => setNewsDescription(e.target.value)}
                />
              </div>
              <div className='publish-button' style={{marginTop:'5px'}} onClick={publishNews}>
                Publicar
              </div>
            </div>
            <div style={{fontWeight: 'bold'}}>Noticias Publicadas</div>
            {news.map((item) => (
              
              <div key={item.idNoticia} className="bg-white rounded-lg shadow p-4" style={{display:'grid'}}>
                <div>
                  <div style={{display: 'float', marginBottom:'5px'}}>
                    <div style={{ float:'left'}}>
                      <h3 className="text-lg font-semibold text-gray-800" >{item.titulo}</h3>
                    </div>
                    <div className='delete-button' onClick={() => {deleteNews(item.idNoticia)}} style={{float: 'right'}}>x</div>
                  </div>
                </div>
                <p style={{display:startEditingBlock(item.idNoticia, newsEditedId, isEditing, false)}} className="text-gray-600 text-sm mb-2">Publicado: {new Date(item.fechaPublicacion).toLocaleString()}</p>
                <p style={{display:startEditingBlock(item.idNoticia, newsEditedId, isEditing, false)}} className="text-gray-700">{item.mensaje}</p>
                <input
                  id="newsTitleEdit"
                  name="newsTitleEdit"
                  type="email"
                  style={{maxWidth:'500px', marginBottom:'5px', display:startEditingBlock(item.idNoticia, newsEditedId, isEditing, true)}}
                  required
                  className="custom-input"
                  placeholder="Título de la noticia"
                  value={newsTitleEdit}
                  onChange={e => setNewsTitleEdit(e.target.value)}
                />
                <textarea
                  id="newsDescriptorEdit"
                  name="newsDescriptorEdit"
                  style={{maxWidth:'500px', minHeight:'100px', display:startEditingBlock(item.idNoticia, newsEditedId, isEditing, true)}}
                  required
                  className="custom-input"
                  placeholder="Descripción..."
                  value={newsDescriptionEdit}
                  onChange={e => setNewsDescriptionEdit(e.target.value)}
                />
                <div className='publish-button' style={{marginTop:'5px', display:startEditingBlock(item.idNoticia, newsEditedId, isEditing, false)}}  onClick={() => startEditing(item.idNoticia, item.titulo, item.mensaje)}>Editar</div>
                <div className='publish-button' style={{marginTop:'5px', display:startEditingBlock(item.idNoticia, newsEditedId, isEditing, true)}}  onClick={saveChanges}>Guardar</div>
              </div>
            ))}

          
      </div>
  );
};

export default ProfessorNews; 