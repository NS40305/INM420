document.addEventListener('DOMContentLoaded', function () {
    const toggler = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('#mainnav');

    if (toggler && collapse) {
        toggler.addEventListener('click', function () {
            // Toggle the 'show' class on the collapse element
            collapse.classList.toggle('show');

            // Update aria-expanded attribute
            const isExpanded = collapse.classList.contains('show');
            toggler.setAttribute('aria-expanded', isExpanded);
        });
    }
});
