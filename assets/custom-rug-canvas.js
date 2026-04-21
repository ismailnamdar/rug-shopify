if (!customElements.get('custom-rug-canvas')) {
  customElements.define(
    'custom-rug-canvas',
    class CustomRugCanvas extends HTMLElement {
      static API_BASE_URL = 'https://api.rugtomize.co';
      static SUPABASE_URL = 'https://mgettdoycdkgplgaknqd.supabase.co';

      static rectangleDefaultDimensions = {
        "2'X3'": { name: "2'X3'", wFeet: 3, hFeet: 2, w: 8, h: 2 * 8 / 3 },
        "3'X5'": { name: "3'X5'", wFeet: 5, hFeet: 3, w: 10 * 0.8, h: 6 * 0.8 },
        "5'X7'": { name: "5'X7'", wFeet: 7, hFeet: 5, w: 10 * 0.8, h: 5 * 10 / 7 * 0.8 },
        "8'X10'": { name: "8'X10'", wFeet: 10, hFeet: 8, w: 10 * 0.8, h: 8 * 0.8 },
        "8'X12'": { name: "8'X12'", wFeet: 12, hFeet: 8, w: 10 * 0.8, h: 8 * 0.8 },
      };

      constructor() {
        super();

        const circleR = 10;
        this.sizes = {
          circle: {
            "3'X3'": { name: "3'X3'", wFeet: 3, hFeet: 3, w: 5, h: 5 },
            "4'X4'": { name: "4'X4'", wFeet: 4, hFeet: 4, w: 6, h: 6 },
            "5'X5'": { name: "5'X5'", wFeet: 5, hFeet: 5, w: 7, h: 7 },
            "6'X6'": { name: "6'X6'", wFeet: 6, hFeet: 6, w: 8, h: 8 },
            "8'X8'": { name: "8'X8'", wFeet: 8, hFeet: 8, w: 10, h: 10 },
          },
          rectangle: { ...CustomRugCanvas.rectangleDefaultDimensions },
          runner: {
            "2.5'X7'": { name: "2.5'X7'", wFeet: 7, hFeet: 2.5, w: 9, h: 2.5 * 9 / 7 },
            "2.5'X10'": { name: "2.5'X10'", wFeet: 10, hFeet: 2.5, w: 10, h: 2.5 },
            "5'X10'": { name: "5'X10'", wFeet: 10, hFeet: 5, w: 10, h: 5 },
          },
        };

        this.handlePositions = {};
        this.center = { x: 0, y: 0 };
        this.canvasScale = { w: 14, h: 14 };

        this.fgImg = null;
        this.bgImg = null;
        this.backgroundRemoving = false;
        this.addToCartPending = false;
        this.shownImage = 'main';
        this.fgUrl = null;
        this.fgUrlRemoved = null;
        this.uploadedImage = {};
        this.removedBackground = false;

        this.shape = 'rectangle';
        this.shapeSize = "2'X3'";
        this.scalePct = 100;
        this.rotationDeg = 0;
        this.offset = { x: 0, y: 0 };
        this.selected = true;
        this.bgColor = '#000000';
        this.interaction = null;

        this._resizeObserver = null;
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onVariantChange = this._onVariantChange.bind(this);
      }

      get canvas() {
        return this.querySelector('#rug-canvas');
      }

      get bottomBanner() {
        return this.getAttribute('data-bottom-banner') === 'true';
      }

      connectedCallback() {
        this.shape = this.getAttribute('data-shape') || 'rectangle';
        this.shapeSize = this.getAttribute('data-size') || "2'X3'";
        this._shapeOptionIndex = parseInt(this.getAttribute('data-shape-option-index') || '0');
        this._sizeOptionIndex = parseInt(this.getAttribute('data-size-option-index') || '1');
        document.addEventListener('variant:change', this._onVariantChange);

        const canvas = this.canvas;
        if (canvas) {
          canvas.addEventListener('pointerdown', this._onPointerDown);
          canvas.addEventListener('pointermove', this._onPointerMove);
          canvas.addEventListener('pointerup', this._onPointerUp);
        }

        this.querySelector('#rug-canvas-scale-up')?.addEventListener('click', () => this.setScale(this.scalePct + 10));
        this.querySelector('#rug-canvas-scale-down')?.addEventListener('click', () => this.setScale(Math.max(10, this.scalePct - 10)));
        this.querySelector('#rug-canvas-rotate')?.addEventListener('click', () => this.setRotation((this.rotationDeg - 45) % 360));
        this.querySelector('#rug-canvas-change-photo')?.addEventListener('click', () => document.querySelector('#custom-rug-image')?.click());

        this._resizeObserver = new ResizeObserver(() => this._onResize());
        if (canvas) this._resizeObserver.observe(canvas);

        const bgUrl = this.getAttribute('data-bg-url');
        if (bgUrl) this.loadBackground(bgUrl);

        window.CanvasRugEditor = this;
      }

      disconnectedCallback() {
        const canvas = this.canvas;
        if (canvas) {
          canvas.removeEventListener('pointerdown', this._onPointerDown);
          canvas.removeEventListener('pointermove', this._onPointerMove);
          canvas.removeEventListener('pointerup', this._onPointerUp);
        }
        this._resizeObserver?.disconnect();
        document.removeEventListener('variant:change', this._onVariantChange);
      }

      /* ---- VARIANT CHANGE ---- */
      _onVariantChange(event) {
        const variant = event.detail?.variant;
        if (!variant) return;
        const shapeValue = variant.option1?.toLowerCase();
        const sizeValue = variant.option2?.toUpperCase();
        if (shapeValue) {
          if (shapeValue !== this.shape) this.setShape(shapeValue);
        }
        if (sizeValue && sizeValue !== this.shapeSize) this.setSize(sizeValue);
      }

      /* ---- RESIZE ---- */
      _onResize() {
        const canvas = this.canvas;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        const isMobile = height <= 768;
        const ratio = isMobile ? width / height : height / width;
        const dpr = window.devicePixelRatio || 1;

        this._updateCircleDimensions(isMobile);
        this._updateRectangleDimensions(isMobile);

        this.canvasScale = {
          h: isMobile ? 14 : 14 * ratio,
          w: isMobile ? 14 * ratio : 14,
        };

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.draw();
      }

      _updateCircleDimensions(isMobile) {
        const radius = isMobile ? 6 : 12;
        this.sizes.circle = Object.fromEntries(
          Object.entries(this.sizes.circle).map(([key, val]) => [key, { ...val, w: radius, h: radius }])
        );
      }

      _updateRectangleDimensions(isMobile) {
        if (isMobile) {
          this.sizes.rectangle = { ...CustomRugCanvas.rectangleDefaultDimensions };
          return;
        }
        this.sizes.rectangle = Object.fromEntries(
          Object.entries(CustomRugCanvas.rectangleDefaultDimensions).map(([key, val]) => [
            key, { ...val, w: val.w * 1.2, h: val.h * 1.2 },
          ])
        );
      }

      /* ---- HELPERS ---- */

      _maskDims(width, height) {
        const dim = this.sizes[this.shape][this.shapeSize];
        const ratio = dim.h / dim.w;

        if (this.shape === 'runner' || this.shape === 'rectangle') {
          const w = Math.floor(width / this.canvasScale.w * dim.w);
          return { w, h: Math.floor(w * ratio) };
        }

        const minIsWidth = Math.min(width, height) === width;
        const size = minIsWidth
          ? Math.floor(width / this.canvasScale.w * dim.w)
          : Math.floor(height / this.canvasScale.h * dim.h);
        return { w: size, h: size };
      }

      _computeDrawDims(w, h, iw, ih, scalePct) {
        let dw, dh;
        if (iw / ih < w / h) { dh = h; dw = h * (iw / ih); }
        else { dw = w; dh = w / (iw / ih); }
        return { dw: dw * (scalePct / 100), dh: dh * (scalePct / 100) };
      }

      _drawImageCover(ctx, img, x, y, w, h, scale, rotation, cover) {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const rectRatio = w / h;
        let dw, dh;
        if (cover ? imgRatio > rectRatio : imgRatio < rectRatio) { dh = h; dw = h * imgRatio; }
        else { dw = w; dh = w / imgRatio; }
        dw *= scale / 100;
        dh *= scale / 100;

        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      _drawGreenCheck(ctx, x, y, r = 9) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x - r * 0.45, y);
        ctx.lineTo(x - r * 0.1, y + r * 0.4);
        ctx.lineTo(x + r * 0.55, y - r * 0.45);
        ctx.stroke();
        ctx.restore();
      }

      _drawCenteredBanner(ctx, canvasWidth, canvasHeight, position, config, isMobile) {
        const { title, lines, titleFont, lineFont } = config;
        const paddingY = isMobile ? 16 : 18;
        const lineGap = isMobile ? 20 : 28;
        const iconR = isMobile ? 6 : 10;
        const iconGap = isMobile ? 8 : 12;

        ctx.save();
        ctx.font = titleFont;
        const titleW = ctx.measureText(title).width;
        ctx.font = lineFont;
        const linesW = Math.max(...lines.map(l => ctx.measureText(l).width)) + iconR * 2 + iconGap;
        const startX = (canvasWidth - Math.max(titleW, linesW)) / 2;
        const bannerHeight = paddingY * 2 + lineGap * lines.length;
        const startY = position === 'top' ? 0 : canvasHeight - bannerHeight;
        const titleY = startY + paddingY + 8;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, startY, canvasWidth, bannerHeight);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = titleFont;
        ctx.fillText(title, startX, titleY);
        ctx.font = lineFont;
        lines.forEach((text, i) => {
          const y = titleY + lineGap * (i + 1);
          this._drawGreenCheck(ctx, startX + iconR, y - 6, iconR);
          ctx.fillText(text, startX + iconR * 2 + iconGap, y);
        });

        ctx.restore();
        return bannerHeight;
      }

      _drawRotateIcon(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI * 0.5, Math.PI * 0.95, true);
        ctx.stroke();
        ctx.save();
        ctx.translate(-6, -6);
        ctx.rotate(-120 * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(-8, -6);
        ctx.lineTo(-6, -2);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
      }

      _drawScaleIcon(ctx, x, y, rotationDeg) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotationDeg * Math.PI / 180);
        ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2, 6); ctx.lineTo(6, 6); ctx.lineTo(6, 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-6, -6); ctx.lineTo(-6, -2); ctx.stroke();
        ctx.restore();
      }

      /* ---- DRAW ---- */

      draw({ measurement = true, hideBorder = false } = {}) {
        const canvas = this.canvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const isMobile = window.innerWidth < 768;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const sansSerif = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        // const titleFontSize = isMobile ? 14 : 22;
        // const lineFontSize = isMobile ? 12 : 14;

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, width, height);

        if (this.bgImg) this._drawImageCover(ctx, this.bgImg, 0, 0, width, height, 100, 0, true);

        // Hide Banner
        // this._drawCenteredBanner(ctx, width, height, 'top', {
        //   title: 'Our Design Team Will',
        //   lines: ['Center Image Appropriately', 'Enhance Image Quality'],
        //   titleFont: `bold ${titleFontSize}px ${sansSerif}`,
        //   lineFont: `${lineFontSize}px ${sansSerif}`,
        // }, isMobile);

        // if (this.bottomBanner) {
        //   this._drawCenteredBanner(ctx, width, height, 'bottom', {
        //     title: 'Post Purchase We Can',
        //     lines: ['Modify Background Color', 'Provide Proof Before Production'],
        //     titleFont: `bold ${titleFontSize}px ${sansSerif}`,
        //     lineFont: `${lineFontSize}px ${sansSerif}`,
        //   }, isMobile);
        // }

        const { w, h } = this._maskDims(width, height);
        const x = (width - w) / 2;
        const y = (height - h) / 2;

        const makeMaskPath = () => {
          ctx.beginPath();
          if (this.shape === 'circle') {
            ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          } else {
            ctx.rect(x, y, w, h);
          }
        };

        ctx.save();
        makeMaskPath();
        ctx.clip();
        ctx.fillStyle = this.bgColor || '#000000';
        ctx.fillRect(x, y, w, h);
        if (this.fgImg) {
          this._drawImageCover(ctx, this.fgImg, x + this.offset.x, y + this.offset.y, w, h, this.scalePct, this.rotationDeg);
        }
        ctx.restore();

        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        makeMaskPath();
        ctx.stroke();
        ctx.restore();

        if (measurement !== false) {
          const dim = this.sizes[this.shape][this.shapeSize];
          const arrowSize = 6;
          ctx.save();
          ctx.strokeStyle = '#000000';
          ctx.fillStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.font = `bold 18px ${sansSerif}`;

          const hLineY = y + h + 18;
          ctx.beginPath(); ctx.moveTo(x, hLineY); ctx.lineTo(x + w, hLineY); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, hLineY - arrowSize); ctx.lineTo(x, hLineY + arrowSize); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + w, hLineY - arrowSize); ctx.lineTo(x + w, hLineY + arrowSize); ctx.stroke();
          ctx.textAlign = 'center';
          ctx.fillText(`${dim.wFeet}'`, x + w / 2, hLineY + 16);

          const vLineX = x - 20;
          ctx.beginPath(); ctx.moveTo(vLineX, y); ctx.lineTo(vLineX, y + h); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(vLineX - arrowSize, y); ctx.lineTo(vLineX + arrowSize, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(vLineX - arrowSize, y + h); ctx.lineTo(vLineX + arrowSize, y + h); ctx.stroke();
          ctx.textAlign = 'left';
          ctx.fillText(`${dim.hFeet}'`, vLineX - 20, y + h / 2 + 4);

          ctx.restore();
        }

        if (this.fgImg && this.selected && !hideBorder) {
          const { dw, dh } = this._computeDrawDims(w, h, this.fgImg.naturalWidth, this.fgImg.naturalHeight, this.scalePct);
          const cx = x + w / 2 + this.offset.x;
          const cy = y + h / 2 + this.offset.y;
          this.center.x = cx;
          this.center.y = cy;

          const rad = this.rotationDeg * Math.PI / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const hw = dw / 2, hh = dh / 2;
          const rot = (px, py) => ({ x: cx + px * cos - py * sin, y: cy + px * sin + py * cos });
          const corners = { nw: rot(-hw, -hh), ne: rot(hw, -hh), se: rot(hw, hh), sw: rot(-hw, hh) };

          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(corners.nw.x, corners.nw.y);
          ctx.lineTo(corners.ne.x, corners.ne.y);
          ctx.lineTo(corners.se.x, corners.se.y);
          ctx.lineTo(corners.sw.x, corners.sw.y);
          ctx.closePath();
          ctx.stroke();

          const neLen = Math.hypot(corners.ne.x - cx, corners.ne.y - cy);
          const rotatePos = {
            x: corners.ne.x + (corners.ne.x - cx) / neLen * 16,
            y: corners.ne.y + (corners.ne.y - cy) / neLen * 16,
          };
          this.handlePositions.rotate = rotatePos;

          const seLen = Math.hypot(corners.se.x - cx, corners.se.y - cy);
          const scalePos = {
            x: corners.se.x + (corners.se.x - cx) / seLen * 16,
            y: corners.se.y + (corners.se.y - cy) / seLen * 16,
          };
          this.handlePositions.scale = scalePos;

          const iconRadius = 16;

          ctx.beginPath(); ctx.arc(scalePos.x, scalePos.y, iconRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff'; ctx.fill();
          ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.stroke();
          ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
          this._drawScaleIcon(ctx, scalePos.x, scalePos.y, this.rotationDeg);

          ctx.beginPath(); ctx.arc(rotatePos.x, rotatePos.y, iconRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff'; ctx.fill();
          ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.stroke();
          ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
          this._drawRotateIcon(ctx, rotatePos.x, rotatePos.y);
        }
      }

      /* ---- POINTER EVENTS ---- */

      _localPointer(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      _onPointerDown(e) {
        const p = this._localPointer(e);
        const threshold = 16;

        for (const [name, pt] of Object.entries(this.handlePositions)) {
          if (Math.hypot(p.x - pt.x, p.y - pt.y) <= threshold) {
            this.selected = true;
            if (name === 'rotate') {
              this.interaction = { mode: 'rotate', startAngle: Math.atan2(p.y - this.center.y, p.x - this.center.x), startRotation: this.rotationDeg };
            } else if (name === 'scale') {
              this.interaction = { mode: 'scale', startDist: Math.hypot(p.x - this.center.x, p.y - this.center.y), startScale: this.scalePct };
            }
            return;
          }
        }

        if (this.fgImg) {
          const canvas = this.canvas;
          const { w, h } = this._maskDims(Math.round(canvas.clientWidth), Math.round(canvas.clientHeight));
          const { dw, dh } = this._computeDrawDims(w, h, this.fgImg.naturalWidth, this.fgImg.naturalHeight, this.scalePct);
          const rad = this.rotationDeg * Math.PI / 180;
          const dx = p.x - this.center.x;
          const dy = p.y - this.center.y;
          const localX = dx * Math.cos(rad) + dy * Math.sin(rad);
          const localY = -dx * Math.sin(rad) + dy * Math.cos(rad);
          this.selected = Math.abs(localX) <= dw / 2 && Math.abs(localY) <= dh / 2;
        } else {
          this.selected = false;
        }

        this.draw();
      }

      _onPointerMove(e) {
        if (!this.interaction) return;
        const p = this._localPointer(e);

        if (this.interaction.mode === 'scale') {
          const d = Math.hypot(p.x - this.center.x, p.y - this.center.y);
          this.scalePct = Math.max(10, Math.min(400, this.interaction.startScale * (d / this.interaction.startDist)));
        } else if (this.interaction.mode === 'move') {
          this.offset.x = this.interaction.startOffsetX + (p.x - this.interaction.startX);
          this.offset.y = this.interaction.startOffsetY + (p.y - this.interaction.startY);
        } else if (this.interaction.mode === 'rotate') {
          const a = Math.atan2(p.y - this.center.y, p.x - this.center.x);
          this.rotationDeg = (this.interaction.startRotation + (a - this.interaction.startAngle) * 180 / Math.PI) % 360;
          if (this.rotationDeg < 0) this.rotationDeg += 360;
        }

        this.draw();
      }

      _onPointerUp() {
        this.interaction = null;
      }

      /* ---- UPLOAD PREVIEW ---- */

      async _uploadPreview(blob) {
        const form = new FormData();
        form.append('file', new File([blob], 'preview-image.png', { type: 'image/png' }));
        const res = await fetch(`${CustomRugCanvas.API_BASE_URL}/api/media/upload-shopify`, { method: 'POST', body: form });
        const data = await res.json();
        return data.url;
      }

      /* ---- PUBLIC API ---- */

      reset() {
        this.fgUrl = null;
        this.fgUrlRemoved = null;
        this.fgImg = null;
        this.backgroundRemoving = false;
        this.addToCartPending = false;
        this.shownImage = 'main';
        this.removedBackground = false;
        this.uploadedImage = {};

        const btn = document.querySelector('#custom-rug-remove-bg');
        if (btn) { btn.style.backgroundColor = 'white'; btn.style.color = 'black'; }
      }

      afterAddToCart() {
        document.querySelector('.edit-notes-header-button[data-value="keep-mockup"]')?.click();
      }

      loading(isLoading, infinite = false, textRaw = '') {
        const wrapper = document.querySelector('.circular-progress-wrapper');
        if (!wrapper) return;
        const text = isLoading ? textRaw : '';

        if (infinite) {
          wrapper.classList.toggle('infinite', true);
          wrapper.setAttribute('data-mode', 'infinite');
          wrapper.style.display = isLoading ? '' : 'none';
        } else {
          wrapper.classList.toggle('infinite', false);
          wrapper.setAttribute('data-mode', 'progress');
          const circle = wrapper.querySelector('.circular-progress');
          if (circle) { circle.style.strokeDasharray = '0'; circle.style.strokeDashoffset = '0'; }
          wrapper.style.display = isLoading ? 'flex' : 'none';
          const valueEl = wrapper.querySelector('.value');
          if (valueEl) valueEl.textContent = '0%';
        }

        const textEl = wrapper.querySelector('.circular-progress-text');
        if (textEl) textEl.textContent = text;
      }

      setCircularProgressStatic(progress) {
        const wrapper = document.querySelector('.circular-progress-wrapper');
        if (!wrapper) return;
        const circumference = 2 * Math.PI * 45;
        const circle = wrapper.querySelector('.circular-progress');
        if (circle) {
          circle.style.strokeDasharray = circumference;
          circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;
        }
        const valueEl = wrapper.querySelector('.value');
        if (valueEl) valueEl.textContent = `${progress}%`;
      }

      showCanvas() {
        const hide = (sel) => { const el = document.querySelector(sel); if (el) el.style.display = 'none'; };
        const show = (sel, d = 'block') => { const el = document.querySelector(sel); if (el) el.style.display = d; };

        hide('#SliderGallery-slider-wrapper');
        hide('#custom-upload-button');

        show('#custom-buy-buttons-wrapper');
        show('#custom-rug-background-section');
        show('#custom-rug-add-to-cart', 'flex');
        show('#rug-canvas-container');
        show('.product-main-canvas-container');
        // show('#custom-rug-proof-section');
        // show('#custom-rug-comments-section');

        this.draw();
      }

      loadForeground(src) {
        this.showCanvas();
        this.fgUrl = src;
        this.fgImg = new Image();
        this.fgImg.onload = () => { this.draw(); this.loading(false); };
        this.fgImg.src = src;
      }

      loadBackground(src) {
        this.bgImg = new Image();
        this.bgImg.onload = () => this.draw();
        this.bgImg.src = src;
      }

      setShape(s) {
        this.shape = s;
        this.shapeSize = Object.keys(this.sizes[s])[0];
        this.draw();
      }

      setSize(s) {
        this.shapeSize = s;
        this.draw();
      }

      setDimension(obj) {
        this.dimension = obj;
        this.draw();
      }

      setScale(v) {
        this.scalePct = v;
        this.draw();
      }

      setRotation(v) {
        this.rotationDeg = v;
        this.draw();
      }

      setBgColor(v) {
        this.bgColor = v;
        const btn = document.querySelector('.custom-rug-bg-color-button');
        if (btn) btn.style.background = `linear-gradient(to right, ${v} 0%, ${v} 10%, rgba(255,0,0,0) 10%, rgba(255,0,0,0) 100%)`;
        const input = document.querySelector('#custom-rug-bg-color');
        if (input) input.value = v;
        this.draw();
      }

      setUploadedImage(v) {
        this.uploadedImage = v;
        if (this.backgroundRemoving) this.removeBackground();
        if (this.addToCartPending) this.handleClickAddToCart();
      }

      startRemoveBg() {
        if (this.removedBackground) {
          const img = new Image();
          img.onload = () => { this.fgImg = img; this.draw(); };
          img.src = this.shownImage === 'main' ? this.fgUrlRemoved : this.fgUrl;
        } else {
          this.removeBackground();
        }
        this.shownImage = this.shownImage === 'main' ? 'background-removed' : 'main';
        return this.shownImage;
      }

      async exportPNG() {
        this.draw({ hideBorder: true });
        const canvas = this.canvas;
        const MAX_SIZE = 600;
        const scale = Math.min(1, MAX_SIZE / Math.max(canvas.width, canvas.height));
        const targetW = Math.round(canvas.width * scale);
        const targetH = Math.round(canvas.height * scale);

        const offscreen = 'OffscreenCanvas' in window
          ? new OffscreenCanvas(targetW, targetH)
          : Object.assign(document.createElement('canvas'), { width: targetW, height: targetH });

        const offCtx = offscreen.getContext('2d');
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = 'high';
        offCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetW, targetH);

        const blob = offscreen.convertToBlob
          ? await offscreen.convertToBlob({ type: 'image/webp', quality: 0.65 })
          : await new Promise(res => offscreen.toBlob(res, 'image/webp', 0.65));

        const path = await this._uploadPreview(blob);
        this.uploadedImage.previewPath = path;
        return path;
      }

      async createMedia(originalPath, previewPath, mimeType, backgroundColor, removeBg) {
        const res = await fetch(`${CustomRugCanvas.API_BASE_URL}/api/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_path: originalPath,
            preview_path: previewPath,
            mime_type: mimeType,
            background_color: backgroundColor || null,
            remove_bg: removeBg || false,
          }),
        });
        return res.json();
      }

      async handleClickAddToCart() {
        console.log('called ');
        const { path: originalPath, mimeType, originalPreviewFileUrl } = this.uploadedImage;

        console.log('called 2', this.uploadedImage);
        if (originalPath == null) { this.addToCartPending = true; return; }

        console.log('called exportPNG');
        const previewPath = await this.exportPNG();
        const { data, original_file_url: originalFileUrl, preview_file_url: previewFileUrl } = await this.createMedia(
          originalPath, previewPath, mimeType, this.bgColor, this.shownImage === 'background-removed'
        );

        console.log('called exportPNG finished');

        const originalUrl = originalPreviewFileUrl || originalFileUrl;
        const comments = document.querySelector('.edit-notes-textarea')?.value || '';
        const sendProof = document.querySelector('#custom-rug-proof-section #custom-rug-send-proof')?.checked;

        console.log('called test');
        const setProp = (name, value) => {
          const el = document.querySelector(`#custom-rug-properties-section input[name="${name}"]`);
          if (el) el.value = value;
        };

        setProp('properties[__Send Proof]', sendProof ? 'true' : 'false');
        setProp('properties[__mediaId]', data.id);
        setProp('properties[__Background Color]', this.bgColor);
        setProp('properties[__Remove Background]', this.removedBackground ? 'yes' : 'no');
        setProp('properties[__Scale]', this.scalePct);
        setProp('properties[__Rotation]', this.rotationDeg);
        setProp('properties[__Original image]', originalUrl);
        setProp('properties[Product preview image]', previewFileUrl);
        setProp('properties[Comments]', comments);

        document.querySelector('#custom-rug-submit-button')?.click();
        this.addToCartPending = false;
      }

      async removeBackground() {
        try {
          const container = document.querySelector('#rug-canvas-container');
          if (container) window.scrollTo({ top: container.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });

          this.backgroundRemoving = true;
          this.loading(true, true, 'Removing background...');

          if (this.uploadedImage.previewDataUrl == null) return;

          const fd = new FormData();
          fd.append('image_file', this.uploadedImage.previewDataUrl);

          const res = await fetch(`${CustomRugCanvas.API_BASE_URL}/api/media/remove-bg`, { method: 'POST', body: fd });
          if (!res.ok) throw new Error('Background removal failed');

          const previewUrl = URL.createObjectURL(await res.blob());
          const img = new Image();
          img.onload = () => {
            this.fgImg = img;
            this.draw();
            this.backgroundRemoving = false;
            this.loading(false, true);
            this.shownImage = 'background-removed';
            this.fgUrlRemoved = previewUrl;
            this.removedBackground = true;
          };
          img.src = previewUrl;

        } catch (err) {
          console.error('Remove BG Error:', err);
          this.backgroundRemoving = false;
          this.shownImage = 'main';
          this.loading(false, true);
        }
      }
    }
  );
}
