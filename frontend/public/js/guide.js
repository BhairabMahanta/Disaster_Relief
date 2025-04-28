document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('pdf-modal');
    const closeButton = document.querySelector('.close');
    const buttons = document.querySelectorAll('.online-resource-button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const pdfName = button.getAttribute('data-pdf');
            const pdfViewer = document.getElementById('pdf-viewer');
            pdfViewer.src = `/resources/${pdfName}`;
            modal.style.display = 'block';
        });
    });

    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});