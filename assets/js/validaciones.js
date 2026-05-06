document.addEventListener('DOMContentLoaded', () => {
    const password = document.getElementById('password');
    const bar = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');

    password.addEventListener('input', () => {
        const val = password.value;
        let score = 0;

        if (val.length >= 8) score++;      // Longitud suficiente
        if (/[A-Z]/.test(val)) score++;    // Tiene mayúscula
        if (/[0-9]/.test(val)) score++;    // Tiene número

        // Definimos los estados según el progreso
        let width = '0%';
        let color = '';
        let msg = '';

        switch (score) {
            case 1:
                width = '33%';
                color = '#ff4b4b'; // Rojo
                msg = 'Contraseña débil';
                break;
            case 2:
                width = '66%';
                color = '#ff9800'; // Naranja
                msg = 'Seguridad media';
                break;
            case 3:
                width = '100%';
                color = '#4caf50'; // Verde
                msg = '¡Contraseña fuerte!';
                break;
            default:
                width = '0%';
                msg = '';
        }

        bar.style.width = width;
        bar.style.backgroundColor = color;
        text.innerText = msg;
        text.style.color = color;
    });
});