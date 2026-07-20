// 1. Configuración de tu proyecto Firebase (Reemplaza con las credenciales de tu consola de Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyASmADbKbVQvEHpUqF3ajn4KnkmYDTINXw",
    authDomain: "electro-nova.firebaseapp.com",
    projectId: "electro-nova",
    storageBucket: "electro-nova.firebasestorage.app",
    messagingSenderId: "281058602595",
    appId: "1:281058602595:web:6a7dce85aeef13a97a1256"
};

// 2. Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elementos del DOM en tu HTML
const commentForm = document.getElementById('comment-form');
const reviewsContainer = document.getElementById('reviews-container');

// 3. GUARDAR COMENTARIO en la base de datos cuando el usuario envía el formulario
if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const name = document.getElementById('review-name').value;
        const rating = document.getElementById('review-rating').value;
        const text = document.getElementById('review-text').value;

        // Agregar nuevo registro a la colección "opiniones"
        db.collection('opiniones').add({
            nombre: name,
            calificacion: rating,
            comentario: text,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert('¡Gracias! Tu opinión ha sido publicada.');
            commentForm.reset(); // Limpia el formulario
        })
        .catch((error) => {
            console.error("Error al guardar la opinión: ", error);
            alert('Ocurrió un error al publicar tu opinión.');
        });
    });
}

// 4. LEER EN TIEMPO REAL los comentarios almacenados y dibujarlos en la pantalla
db.collection('opiniones').orderBy('fecha', 'desc')
    .onSnapshot((snapshot) => {
        reviewsContainer.innerHTML = ''; // Limpia la lista actual

        if (snapshot.empty) {
            reviewsContainer.innerHTML = '<p style="color: #718096;">Sé el primero en dejar un comentario.</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const review = doc.data();
            
            // Generar las estrellas según la calificación elegida
            let stars = '⭐'.repeat(parseInt(review.calificacion || 5));

            // Crear el elemento HTML para la tarjeta de la opinión
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
    });

// Función de seguridad para evitar inyección de código maligno (XSS)
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
