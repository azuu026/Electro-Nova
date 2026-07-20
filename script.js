// Configuración oficial de Supabase para ElectroNova
const SUPABASE_URL = 'https://pmovlxvsilpxpwwiozen.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtb3ZseHZzaWxweHB3d2lvemVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NjgyMjksImV4cCI6MjEwMDE0NDIyOX0.3Bdnm1SPTLuBk74Dg-q_mFZqBvYdO3eG8SDHrWLLSIY';

// Inicializar Supabase en el navegador
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const commentForm = document.getElementById('comment-form');
const reviewsContainer = document.getElementById('reviews-container');

// 1. Cargar comentarios guardados desde la base de datos
async function loadReviews() {
    if (!reviewsContainer) return;

    const { data: opiniones, error } = await supabase
        .from('opiniones')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error al cargar comentarios:', error);
        return;
    }

    renderReviews(opiniones);
}

// 2. Dibujar las tarjetas de opinión en la pantalla
function renderReviews(opiniones) {
    reviewsContainer.innerHTML = '';

    if (!opiniones || opiniones.length === 0) {
        reviewsContainer.innerHTML = '<p style="color: #718096; text-align: center;">Sé el primero en dejar una opinión sobre Electro-Nova.</p>';
        return;
    }

    opiniones.forEach(review => {
        const stars = '⭐'.repeat(parseInt(review.calificacion || 5));
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('review-card');
        reviewCard.innerHTML = `
            <div class="review-header">
                <span class="review-author">${escapeHTML(review.nombre)}</span>
                <span class="review-stars">${stars}</span>
            </div>
            <p class="review-body">${escapeHTML(review.comentario)}</p>
        `;
        reviewsContainer.appendChild(reviewCard);
    });
}

// 3. Guardar un nuevo comentario al hacer clic en "Publicar"
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('review-name').value;
        const rating = document.getElementById('review-rating').value;
        const text = document.getElementById('review-text').value;

        const { error } = await supabase
            .from('opiniones')
            .insert([
                { nombre: name, calificacion: rating, comentario: text }
            ]);

        if (error) {
            console.error('Error al guardar la opinión:', error);
            alert('Ocurrió un error al publicar tu opinión. Revisa la consola.');
        } else {
            alert('¡Gracias! Tu opinión ha sido publicada exitosamente.');
            commentForm.reset();
            loadReviews(); // Actualiza la lista en pantalla
        }
    });
}

// 4. Escuchar en tiempo real nuevos comentarios
supabase
    .channel('public:opiniones')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opiniones' }, () => {
        loadReviews();
    })
    .subscribe();

// Función de seguridad contra vulnerabilidades web (XSS)
function escapeHTML(str) {
    return str ? str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    ) : '';
}

// Cargar opiniones al abrir la página
loadReviews();
