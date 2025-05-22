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

const ProfessorNews: React.FC<ProfessorNewsProps> = ({ idGrupo }) => {
  const port = '5000';
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newsTitle, setNewsTitle] = useState("");
  const [newsDescription, setNewsDescription] = useState("");


  

  useEffect(() => {
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

  const publishNews = async () =>{
    if(newsTitle.length > 0 && newsDescription.length > 0){
      const newsPublished = {
        titulo: newsTitle, 
        mensaje: newsDescription,
        idGrupo: idGrupo
      }
      try{
        const url = 'http://localhost:' + port + '/api/Noticia';
        const response = await axios.post(url, newsPublished);
        console.log('Respuesta:', response.data);
      }catch(error){
        console.error('Error al hacer POST:', error);
      }
    }
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
              <div key={item.idNoticia} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800">{item.titulo}</h3>
                <p className="text-gray-600 text-sm mb-2">Publicado: {new Date(item.fechaPublicacion).toLocaleString()}</p>
                <p className="text-gray-700">{item.mensaje}</p>
              </div>
            ))}

          
      </div>
  );
};

export default ProfessorNews; 