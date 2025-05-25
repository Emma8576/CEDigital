import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NewsItem {
  idNoticia: number;
  titulo: string;
  mensaje: string;
  fechaPublicacion: string; // Or Date if you parse it
  idGrupo: number;
}

interface StudentNewsProps {
  idGrupo: number;
}

const StudentNews: React.FC<StudentNewsProps> = ({ idGrupo }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Use the correct backend endpoint
        const response = await axios.get<NewsItem[]>(`http://localhost:5261/api/Noticia/grupo/${idGrupo}`);
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

  return (
    <div className="space-y-4">
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

export default StudentNews; 