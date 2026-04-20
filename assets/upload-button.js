if (!customElements.get('upload-button')) {
  customElements.define(
    'upload-button',
    class UploadButton extends HTMLElement {
      static CANVAS_SUPPORTED_FILE_SIZE = 10 * 1024 * 1024;
      static MAX_SUPPORTED_TRANSFORM_FILE_SIZE = 50 * 1024 * 1024;
      static MAX_SUPPORTED_FILE_SIZE = 250 * 1024 * 1024;
      static ONLY_RESIZE_SUPPORTED_FORMATS = ['application/pdf'];
      static RESIZE_SUPPORTED_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/webp', 'image/png', '.ico', 'image/HEIC'];
      static CANVAS_SUPPORTED_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/webp', 'image/png', 'image/svg+xml'];
      static SUPABASE_URL = 'https://mgettdoycdkgplgaknqd.supabase.co';
      static API_BASE_URL = 'https://api.rugtomize.co';

      constructor() {
        super();
        this.selectedFile = null;
        this.onClickListener = this.onClick.bind(this);
        this.onFileChangeListener = this.onFileChange.bind(this);
        this.onColorChangeListener = this.onColorChange.bind(this);
        this.onRemoveBgListener = this.onRemoveBg.bind(this);
        this.onAddToCartListener = this.onAddToCart.bind(this);
        this.onEditNotesListener = this.onEditNotes.bind(this);
        this.onSaveNotesListener = this.onSaveNotes.bind(this);
        this.onFormSubmitListener = this.onFormSubmit.bind(this);
      }

      get imageInput() {
        return document.querySelector('#custom-rug-image');
      }

      get bgColorInput() {
        return document.querySelector('[data-bg-color="color"]');
      }

      get removeBgInput() {
        return document.querySelector('#custom-rug-remove-bg');
      }

      get addToCartButton() {
        return document.querySelector('#custom-rug-add-to-cart .custom-rug-sticky-add-to-cart-button');
      }

      get addToCartButtonText() {
        return document.querySelector('.custom-rug-sticky-add-to-cart-button-text');
      }

      get editNotesButton() {
        return document.querySelector('.custom-rug-edit-notes');
      }

      get saveNotesButton() {
        return document.querySelector('.edit-note-save-button');
      }

      get editNoteHeaderButtons() {
        return document.querySelectorAll('.edit-notes-header-button');
      }

      get productForm() {
        const formId = this.getAttribute('data-form-id');
        return formId ? document.getElementById(formId) : null;
      }

      connectedCallback() {
        this.addEventListener('click', this.onClickListener);
        this.imageInput?.addEventListener('change', this.onFileChangeListener);
        this.bgColorInput?.addEventListener('input', this.onColorChangeListener);
        this.removeBgInput?.addEventListener('click', this.onRemoveBgListener);
        this.addToCartButton?.addEventListener('click', this.onAddToCartListener);
        this.editNotesButton?.addEventListener('click', this.onEditNotesListener);
        this.saveNotesButton?.addEventListener('click', this.onSaveNotesListener);
        this.editNoteHeaderButtons.forEach((btn) => btn.addEventListener('click', this.onEditNoteHeader.bind(this)));
        this.productForm?.addEventListener('submit', this.onFormSubmitListener);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClickListener);
        this.imageInput?.removeEventListener('change', this.onFileChangeListener);
        this.bgColorInput?.removeEventListener('input', this.onColorChangeListener);
        this.removeBgInput?.removeEventListener('click', this.onRemoveBgListener);
        this.addToCartButton?.removeEventListener('click', this.onAddToCartListener);
        this.editNotesButton?.removeEventListener('click', this.onEditNotesListener);
        this.saveNotesButton?.removeEventListener('click', this.onSaveNotesListener);
        this.productForm?.removeEventListener('submit', this.onFormSubmitListener);
      }

      onClick() {
        this.imageInput?.click();
      }

      async onFileChange(event) {
        const input = event.target;
        const file = input.files?.[0];
        this.selectedFile = file;
        if (!file) return;

        this.trackClarity('File Upload', { fileType: file.type, fileName: file.name });

        try {
          const dataUrl = await this.readFileAsDataURL(file);

          if (file.size > UploadButton.MAX_SUPPORTED_FILE_SIZE) {
            alert('Maximum supported file size is 250MB.');
            return;
          }

          const isSupportedType = UploadButton.CANVAS_SUPPORTED_FILE_TYPES.includes(file.type);

          if (file.size > UploadButton.CANVAS_SUPPORTED_FILE_SIZE || !isSupportedType) {
            CanvasRugEditor.reset();
            CanvasRugEditor.showCanvas();
            this.uploadInBackground(file, { useUploadedFile: true });
            return;
          }

          CanvasRugEditor.reset();
          CanvasRugEditor.loadForeground(dataUrl);
          this.uploadInBackground(file);
          this.scrollToCanvas();
        } finally {
          input.value = '';
        }
      }

      onRemoveBg() {
        const shownImage = CanvasRugEditor.startRemoveBg();
        if (shownImage === 'main') {
          this.removeBgInput.style.backgroundColor = 'white';
          this.removeBgInput.style.color = 'black';
        } else {
          this.removeBgInput.style.backgroundColor = '#272726';
          this.removeBgInput.style.color = 'white';
        }
      }

      onColorChange(event) {
        event.stopPropagation();
        event.preventDefault();
        CanvasRugEditor.setBgColor(event.target.value);
      }

      async onAddToCart() {
        this.trackClarity('Add to cart [Custom]');
        try {
          this.scrollToCanvas();
          this.addToCartButton.disabled = true;
          this.addToCartButtonText.textContent = 'Adding to cart';
          CanvasRugEditor.loading(true, true, 'Preparing your rug...');
          await CanvasRugEditor.handleClickAddToCart();
        } catch (error) {
          console.error(error);
          CanvasRugEditor.loading(false, true);
        }
      }

      onEditNotes() {
        document.querySelector('#product-main-form-container').style.transform = 'translateX(calc(-100%))';
        document.querySelector('.edit-notes-section-container').style.display = 'block';
      }

      onSaveNotes() {
        document.querySelector('#product-main-form-container').style.transform = 'unset';
        document.querySelector('.edit-notes-section-container').style.display = 'none';
      }

      onEditNoteHeader(event) {
        const btn = event.currentTarget;
        const value = btn.dataset.value;

        if (value === 'needs-fixing') {
          btn.setAttribute('data-active', 'true');
          document.querySelector('.edit-notes-header-button[data-value="keep-mockup"]')?.removeAttribute('data-active');
          document.querySelector('.edit-notes-textarea').style.display = 'block';
        } else if (value === 'keep-mockup') {
          btn.setAttribute('data-active', 'true');
          document.querySelector('.edit-notes-header-button[data-value="needs-fixing"]')?.removeAttribute('data-active');
          document.querySelector('.edit-notes-textarea').style.display = 'none';
        }
      }

      async onFormSubmit(event) {
        event.preventDefault();

        const btn = this.addToCartButton;
        const btnText = this.addToCartButtonText;
        const formData = new FormData(this.productForm);

        CanvasRugEditor.loading(true, true, 'Adding to cart...');

        try {
          const res = await fetch('/cart/add.js', { method: 'POST', body: formData });
          await res.json();

          const cart = await (await fetch('/cart.js')).json();

          setTimeout(() => {
            refreshCart(cart);
            setTimeout(() => {
              btn.disabled = false;
              btnText.textContent = 'Add to cart';
              CanvasRugEditor.loading(false, true);
              CanvasRugEditor.afterAddToCart();
            }, 500);
          }, 500);
        } catch (error) {
          console.error(error);
          btn.disabled = false;
          btnText.textContent = 'Add to cart';
          CanvasRugEditor.loading(false, true);
        }
      }

      scrollToCanvas() {
        const canvas = document.getElementById('rug-canvas-container');
        if (canvas) {
          window.scrollTo({ top: canvas.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        }
      }

      trackClarity(event, data) {
        try {
          if (window.clarity) {
            clarity('event', event);
            if (data) clarity('set', event, data);
          }
        } catch (error) {
          console.error(error);
        }
      }

      readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      svgFileToPngBlob(file, options = {}) {
        const { width = 400, height = 400, background = null, scale = 1 } = options;

        return new Promise(async (resolve, reject) => {
          try {
            if (!file || file.type !== 'image/svg+xml') return reject(new Error('Input must be an SVG file'));

            const svgText = await file.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            const svg = doc.documentElement;

            const svgWidth = svg.getAttribute('width') || svg.viewBox?.baseVal?.width || width;
            const svgHeight = svg.getAttribute('height') || svg.viewBox?.baseVal?.height || height;
            svg.setAttribute('width', svgWidth);
            svg.setAttribute('height', svgHeight);

            const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
            const img = new Image();

            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = svgWidth * scale;
              canvas.height = svgHeight * scale;
              const ctx = canvas.getContext('2d');
              ctx.scale(scale, scale);
              if (background) {
                ctx.fillStyle = background;
                ctx.fillRect(0, 0, svgWidth, svgHeight);
              }
              ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
              URL.revokeObjectURL(url);
              canvas.toBlob((pngBlob) => {
                pngBlob ? resolve(pngBlob) : reject(new Error('PNG conversion failed'));
              }, 'image/png');
            };

            img.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error('Failed to load SVG into image'));
            };

            img.src = url;
          } catch (err) {
            reject(err);
          }
        });
      }

      async uploadInBackground(file, options = {}) {
        const useUploadedFile = !!options.useUploadedFile;
        let res;

        try {
          window.useUploadedFileFlag = useUploadedFile;
          if (useUploadedFile) CanvasRugEditor.loading(true, false, 'Uploading your design...');
          CanvasRugEditor.setCircularProgressStatic(0);

          res = await fetch(`${UploadButton.API_BASE_URL}/api/media/upload-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, fileSize: file.size, contentType: file.type })
          });

          if (!res.ok) throw new Error('Failed to get upload URL: ' + res.status);

          const { bucket, path, token } = await res.json();

          const uploadUrl = `${UploadButton.SUPABASE_URL}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}?token=${encodeURIComponent(token)}`;

          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) CanvasRugEditor.setCircularProgressStatic(Math.round((evt.loaded / evt.total) * 100));
            };
            xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject('Upload failed with status ' + xhr.status);
            xhr.onerror = () => reject('XHR Error');
            xhr.send(file);
          });

          if (useUploadedFile) CanvasRugEditor.loading(true, false, 'Creating your rug...');

          let blob;
          let originalUrl;

          if (file.type.toLowerCase().includes('svg')) {
            blob = await this.svgFileToPngBlob(file);
          } else if (
            UploadButton.ONLY_RESIZE_SUPPORTED_FORMATS.includes(file.type) ||
            (file.size > UploadButton.MAX_SUPPORTED_TRANSFORM_FILE_SIZE && UploadButton.RESIZE_SUPPORTED_FILE_TYPES.includes(file.type))
          ) {
            const resResize = await fetch(`${UploadButton.API_BASE_URL}/api/media/resize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path })
            });
            if (!resResize.ok) throw new Error('Resize failed');
            blob = await resResize.blob();
          } else {
            const signedUrlResponse = await fetch(`${UploadButton.API_BASE_URL}/api/media/preview`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path })
            });
            if (!signedUrlResponse.ok) throw new Error('Failed to get preview URL');
            ({ url: originalUrl } = await signedUrlResponse.json());
            const imageRes = await fetch(originalUrl);
            if (!imageRes.ok) throw new Error('Failed to download image from URL');
            blob = await imageRes.blob();
          }

          if (useUploadedFile) CanvasRugEditor.loadForeground(URL.createObjectURL(blob));

          CanvasRugEditor.setUploadedImage({ path, token, bucket, mimeType: file.type, originalPreviewFileUrl: originalUrl, previewDataUrl: blob });

        } catch (error) {
          console.error(error);
          if (res?.status === 429) alert('Maximum upload limit reached. Please contact support.');
          CanvasRugEditor.loading(false, false);
        }
      }
    }
  );
}
