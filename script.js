// 1. Datos de conexión de Supabase (los obtienes en Settings -> API de Supabase)
const SUPABASE_URL = 'https://TU_SUPABASE_URL.supabase.co';
const SUPABASE_KEY = 'TU_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const commentForm = document.getElementById('comment-form');
const reviewsContainer = document.getElementById('reviews-container');

// 2. Cargar opiniones existentes al abrir la página
async function loadReviews() {
    if (!reviewsContainer) return;

    const { data: opiniones, error } = await supabase
        .from('opiniones')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar comentarios:', error);
        return;
    }

    renderReviews(opiniones);
}

// 3. Función para dibujar los comentarios en la pantalla
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

// 4. Guardar un nuevo comentario al enviar el formulario
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
            console.error('Error al guardar:', error);
            alert('Ocurrió un error al publicar tu opinión.');
        } else {
            alert('¡Gracias! Tu opinión ha sido publicada.');
            commentForm.reset();
        }
    });
}

// 5. ESCUCHAR EN TIEMPO REAL nuevos comentarios
supabase
    .channel('public:opiniones')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'opiniones' }, () => {
        loadReviews(); // Recarga automáticamente la lista cuando alguien publica
    })
    .subscribe();

// Función de seguridad contra script malicioso (XSS)
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

// Inicializar la carga de comentarios
loadReviews();
