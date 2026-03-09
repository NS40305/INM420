/* ============================================================
   UX Persona Card — JavaScript
   Image upload, cropping, and interactive dot-rating
   ============================================================ */

(function () {
    'use strict';

    // ---- DOM Elements ----
    const imageInput = document.getElementById('imageInput');
    const personaPhoto = document.getElementById('personaPhoto');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const photoArea = document.getElementById('photoArea');

    const cropModal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    const cropContainer = document.getElementById('cropContainer');
    const cropBox = document.getElementById('cropBox');
    const btnCropApply = document.getElementById('btnCropApply');
    const btnCropCancel = document.getElementById('btnCropCancel');

    const dotRating = document.getElementById('dotRating');

    // ---- State ----
    let originalImageData = null;   // base64 of loaded image
    let cropState = {
        dragging: false,
        resizing: false,
        handle: null,
        startX: 0,
        startY: 0,
        boxX: 0,
        boxY: 0,
        boxW: 0,
        boxH: 0
    };

    // ==========================================================
    //  IMAGE UPLOAD  (click the photo area to upload)
    // ==========================================================

    photoArea.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            originalImageData = ev.target.result;
            openCropModal(originalImageData);
        };
        reader.readAsDataURL(file);
        // Reset so the same file can be re-selected
        imageInput.value = '';
    });

    // ==========================================================
    //  CROP MODAL
    // ==========================================================

    function openCropModal(src) {
        cropImage.onload = () => {
            initCropBox();
        };
        cropImage.src = src;
        cropModal.classList.remove('hidden');
    }

    function closeCropModal() {
        cropModal.classList.add('hidden');
    }

    btnCropCancel.addEventListener('click', closeCropModal);

    // Close modal on backdrop click
    cropModal.addEventListener('click', (e) => {
        if (e.target === cropModal) closeCropModal();
    });

    function initCropBox() {
        // Position the crop box at center, ~70% of image area
        const rect = cropImage.getBoundingClientRect();
        const contRect = cropContainer.getBoundingClientRect();

        const imgLeft = rect.left - contRect.left;
        const imgTop = rect.top - contRect.top;

        const bw = rect.width * 0.7;
        const bh = rect.height * 0.7;
        const bx = imgLeft + (rect.width - bw) / 2;
        const by = imgTop + (rect.height - bh) / 2;

        setCropBox(bx, by, bw, bh);
    }

    function setCropBox(x, y, w, h) {
        cropBox.style.left = x + 'px';
        cropBox.style.top = y + 'px';
        cropBox.style.width = w + 'px';
        cropBox.style.height = h + 'px';
        cropState.boxX = x;
        cropState.boxY = y;
        cropState.boxW = w;
        cropState.boxH = h;
    }

    // ---- Drag & Resize Handlers ----

    cropBox.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('crop-handle')) {
            cropState.resizing = true;
            cropState.handle = e.target;
        } else {
            cropState.dragging = true;
        }
        cropState.startX = e.clientX;
        cropState.startY = e.clientY;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!cropState.dragging && !cropState.resizing) return;

        const dx = e.clientX - cropState.startX;
        const dy = e.clientY - cropState.startY;
        const contRect = cropContainer.getBoundingClientRect();
        const imgRect = cropImage.getBoundingClientRect();

        // Boundaries based on image position within container
        const imgLeft = imgRect.left - contRect.left;
        const imgTop = imgRect.top - contRect.top;
        const imgRight = imgLeft + imgRect.width;
        const imgBottom = imgTop + imgRect.height;

        if (cropState.dragging) {
            let nx = cropState.boxX + dx;
            let ny = cropState.boxY + dy;

            // Clamp inside image
            nx = Math.max(imgLeft, Math.min(nx, imgRight - cropState.boxW));
            ny = Math.max(imgTop, Math.min(ny, imgBottom - cropState.boxH));

            setCropBox(nx, ny, cropState.boxW, cropState.boxH);
        }

        if (cropState.resizing) {
            let { boxX, boxY, boxW, boxH } = cropState;
            const handle = cropState.handle;

            if (handle.classList.contains('bottom-right')) {
                boxW += dx;
                boxH += dy;
            } else if (handle.classList.contains('bottom-left')) {
                boxX += dx;
                boxW -= dx;
                boxH += dy;
            } else if (handle.classList.contains('top-right')) {
                boxY += dy;
                boxW += dx;
                boxH -= dy;
            } else if (handle.classList.contains('top-left')) {
                boxX += dx;
                boxY += dy;
                boxW -= dx;
                boxH -= dy;
            }

            // Enforce minimum size
            if (boxW < 50) { boxW = 50; boxX = cropState.boxX; }
            if (boxH < 50) { boxH = 50; boxY = cropState.boxY; }

            // Clamp inside image
            boxX = Math.max(imgLeft, boxX);
            boxY = Math.max(imgTop, boxY);
            if (boxX + boxW > imgRight) boxW = imgRight - boxX;
            if (boxY + boxH > imgBottom) boxH = imgBottom - boxY;

            setCropBox(boxX, boxY, boxW, boxH);
        }

        cropState.startX = e.clientX;
        cropState.startY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        cropState.dragging = false;
        cropState.resizing = false;
        cropState.handle = null;
    });

    // ---- Touch Support for Crop ----

    cropBox.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (e.target.classList.contains('crop-handle')) {
            cropState.resizing = true;
            cropState.handle = e.target;
        } else {
            cropState.dragging = true;
        }
        cropState.startX = touch.clientX;
        cropState.startY = touch.clientY;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!cropState.dragging && !cropState.resizing) return;
        const touch = e.touches[0];
        // Simulate a mouse move event
        const synth = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        document.dispatchEvent(synth);
        cropState.startX = touch.clientX;
        cropState.startY = touch.clientY;
    }, { passive: false });

    document.addEventListener('touchend', () => {
        cropState.dragging = false;
        cropState.resizing = false;
        cropState.handle = null;
    });

    // ==========================================================
    //  APPLY CROP
    // ==========================================================

    btnCropApply.addEventListener('click', () => {
        const imgRect = cropImage.getBoundingClientRect();
        const contRect = cropContainer.getBoundingClientRect();

        const imgLeft = imgRect.left - contRect.left;
        const imgTop = imgRect.top - contRect.top;

        // Convert displayed crop box coords → natural image coords
        const scaleX = cropImage.naturalWidth / imgRect.width;
        const scaleY = cropImage.naturalHeight / imgRect.height;

        const sx = (cropState.boxX - imgLeft) * scaleX;
        const sy = (cropState.boxY - imgTop) * scaleY;
        const sw = cropState.boxW * scaleX;
        const sh = cropState.boxH * scaleY;

        // Canvas crop
        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cropImage, sx, sy, sw, sh, 0, 0, sw, sh);

        const croppedData = canvas.toDataURL('image/jpeg', 0.92);
        personaPhoto.src = croppedData;
        personaPhoto.classList.remove('hidden');
        photoPlaceholder.style.display = 'none';

        closeCropModal();
    });

    // ==========================================================
    //  DOT RATING (Computer Literacy)
    // ==========================================================

    dotRating.addEventListener('click', (e) => {
        const dot = e.target.closest('.dot');
        if (!dot) return;
        const value = parseInt(dot.dataset.value, 10);
        const dots = dotRating.querySelectorAll('.dot');
        dots.forEach((d) => {
            const v = parseInt(d.dataset.value, 10);
            d.classList.toggle('filled', v <= value);
        });
    });

})();
