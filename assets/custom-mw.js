const swachesSizeHandler = (cusClass, value) => {
	const swatchElements = document.getElementsByClassName('all-sizes-cls');
	swatchElements.forEach(element => {
		element.classList.remove('soldout')
		element.classList.add('hidden')
	});

	if (cusClass) {
		const filteredSwatchElements = Array.from(swatchElements).filter(swatchElement => {
			const valueAtri = swatchElement.getAttribute('value');

			return swatchElement.classList.contains(cusClass) && valueAtri != value;
		});

		filteredSwatchElements.forEach(element => {
			element.classList.remove('soldout')
			element.classList.remove('hidden')
		})

		const label = filteredSwatchElements[0]?.querySelector('label');
		if (label) {
			label.click();
		} else {
			console.error('Label not found');
		}
	}
}

document.addEventListener("DOMContentLoaded", function () {

	function isMobile() { return window.innerWidth <= 768 }

	function copyElementsOnMobile() {
		if (!isMobile()) return;

		const priceElement = document.querySelector('.product-main .modal_price');
		const targetElement = document.querySelector('.mobile_header_prd .modal_price');

		if (priceElement && targetElement) {
			targetElement.innerHTML = priceElement.innerHTML;
		}
	}
	copyElementsOnMobile();
	window.addEventListener('resize', copyElementsOnMobile);

	document.querySelectorAll(".ctm_chage_var").forEach(function (elem) {
		elem.addEventListener("change", function () {
			setTimeout(() => {
				copyElementsOnMobile();
				document.querySelector(".ctm_prd_price_mobile").innerHTML = document.querySelector("[data-price-ui]").innerHTML;
			}, 100);
		})
	})

	const bredCtmGrid = document.querySelector('.bred_ctm_grid');

	if (bredCtmGrid) {
		bredCtmGrid.addEventListener('click', function (event) {
			event.preventDefault();

			const breadcrumbLinks = document.querySelectorAll('.brd_cum_slat a');
			if (breadcrumbLinks.length > 1) {
				breadcrumbLinks[1].click();
			}
		});
	}

	// active first image on produt page
	const firstThumbnail = document.querySelector(".product_gallery_nav .gallery-cell.product-gallery__thumbnail");
	if (firstThumbnail) {
		firstThumbnail.click();
	}
});


//////////////////////////////////
const closeSideCart = (event) => {
	event.stopPropagation();
	document.querySelector('.cart-container.active_link')?.classList.remove('active_link');
	document.querySelector('.side_cart_active')?.classList.remove('side_cart_active');
}
window.closeSideCart = closeSideCart;

$('body').on('click', '.pplr_monogram.fileupload', function () {
	$('body').removeClass('ImageAdded');
});

/////////////////////////////// PRODUCT PAGE ///////////////////////////////
if (document.body.classList.contains("product")) {

	// const hIdeComment = () => {
	// 	const CommentElem = document.querySelectorAll(".pplr-comments--requests");
	// 	if (CommentElem.length > 0) {
	// 		CommentElem.forEach((elem) => {
	// 			elem.classList.add("pplr-comments--requests--hide");
	// 		});
	// 	}
	// }

	// const showComment = () => {
	// 	const CommentElem = document.querySelectorAll(".pplr-comments--requests");
	// 	if (CommentElem.length > 0) {
	// 		CommentElem.forEach((elem) => {
	// 			elem.classList.remove("pplr-comments--requests--hide");
	// 		});
	// 	}
	// }

	function updateStepTitle() {
    const stepNumber = window.location.href.includes("custom-rug-carpet") ? 2 : 1;
	const el = document.querySelector('[data-option-size-title]');
	if (!el) return;
	const desired = `<div class="option_title opt_title_size">Select size:</div>  
		 <button class="open-size-guide-btn">Size Guide</button>`;
	// only update if content changed to avoid continuous reflows
	if (el.innerHTML.trim() !== desired.trim()) {
		el.innerHTML = desired;
	}
	}

	function classAddToComment() {
		// run the update a few times while page elements are still rendering, then stop
		let attempts = 0;
		const maxAttempts = 50; // at 400ms this is ~20s max
		const interval = setInterval(function () {
			attempts++;
			const sizeTitleEl = document.querySelector('[data-option-size-title]');
			if (sizeTitleEl) {
				updateStepTitle();
				const parent = sizeTitleEl.parentElement;
				if (parent && !parent.classList.contains('opt_title_size_parent')) {
					parent.classList.add('opt_title_size_parent');
				}
				if (window.location.href.includes("custom-rug-carpet") && parent) {
					parent.classList.remove('opt_title_size_parent');
				}
			}

			const CommentElem = document.querySelectorAll(".pplr-comments--requests");
			if (CommentElem.length > 0) {
				CommentElem.forEach((elem) => {
					const ta = elem.querySelector("textarea");
					if (ta) ta.setAttribute("placeholder", "For design changes, you can mention here eg: background color...");
				});
				clearInterval(interval);
				return;
			}

			if (document.querySelector(".pplr-c-button")) {
				clearInterval(interval);
				return;
			}

			if (attempts >= maxAttempts) {
				clearInterval(interval);
			}
		}, 400);
	}

	function stickyAtcBtn(atcBtn) {
    window.addEventListener('scroll', () => {
        const rect = atcBtn.getBoundingClientRect();

        if (rect.bottom <= 72) {
					document.body.classList.add('ATC_btn_fix');
        } else if(rect.bottom >= 0) {
					document.querySelector('.ATC_btn_fix')?.classList.remove('ATC_btn_fix');
        }   
    });
	}

	// Function to update size dropdown display
	function updateSizeDropdownDisplay() {
		const selectedSizeInput = document.querySelector('.swatch[data-option-index="1"] input.ctm_chage_var:checked');
		const selectedSizeDisplay = document.getElementById('selectedSizeDisplay');
		
		if (selectedSizeInput && selectedSizeDisplay) {
			selectedSizeDisplay.textContent = selectedSizeInput.value;
		}
	}

	// Function to update shape selection in modal based on current selection
	function syncModalWithCurrentSelection() {
		const selectedShapeInput = document.querySelector('.swatch[data-option-index="0"] input.ctm_chage_var:checked');
		const selectedSizeInput = document.querySelector('.swatch[data-option-index="1"] input.ctm_chage_var:checked');
		
		if (selectedShapeInput && selectedSizeInput) {
			const shapeName = selectedShapeInput.value;
			const sizeName = selectedSizeInput.value;
			
			// Update active shape tab in modal
			const shapeTab = document.querySelector(`.shapeOption[data-shape="${shapeName}"]`);
			if (shapeTab) {
				shapeTab.click();
			}
			
			// Update active size in modal
			setTimeout(() => {
				const sizeCard = document.querySelector(`.shapeImg[data-size="${sizeName}"][data-shape-value="${shapeName}"]`);
				if (sizeCard) {
					const parentContainer = sizeCard.closest('[data-image-shape]');
					parentContainer?.querySelectorAll('.shapeImg').forEach((img) => img.classList.remove('active'));
					sizeCard.classList.add('active');
				}
			}, 50);
		}
	}

	document.addEventListener("DOMContentLoaded", function () {
		const ATC_button = document.querySelector('.product-block--form');
		if (ATC_button) stickyAtcBtn(ATC_button);

		document.querySelector(".ctm_prd_price_mobile").innerHTML = document.querySelector("[data-price-ui]").innerHTML;
		classAddToComment();
		document.querySelector(".collapsible-tab__heading")?.click();

		const optionSizeSelect = document.querySelector('[data-option-title="Size"]');
		if (optionSizeSelect) {
			// optionSizeSelect.innerHTML = `<div class="option_title opt_title_size">Step 2. Choose Your Size</div>   <button class="open-size-guide-btn">Size Guide</button>`;
				updateStepTitle();
		}

		const prdThumMessage = document.getElementById('main_thumb_message').cloneNode(true);
		if (prdThumMessage) document.querySelector("[data-product-gallery]").appendChild(prdThumMessage);

		// Initialize size dropdown with current selection
		updateSizeDropdownDisplay();

		// Listen for variant changes to update dropdown
		document.querySelectorAll('.swatch[data-option-index="1"] input.ctm_chage_var').forEach(input => {
			input.addEventListener('change', updateSizeDropdownDisplay);
		});

		// Sync modal when it opens
		const openSizeModalBtn = document.getElementById('openSizeModal');
		if (openSizeModalBtn) {
			openSizeModalBtn.addEventListener('click', syncModalWithCurrentSelection);
		}
	});

	document.addEventListener("click", function (event) {

		////////////////// PRODUCT PAGE.. //////////////////
		const productDetail = document.querySelector('form[action="/cart/add"] .purchase-details');
		const ImageAdded = document.querySelector(".cp-sel-Photos.pplr_show_preview .jscroll") || document.querySelector(".cp-sel-Photos .jscroll");
		const imageUploadHtml = `<h2 class="upload_confrom">Image uploaded</h2>`
		// const requestblock = `<div class="request_block_active">Have any design request like background color etc? <div class="activate_comment_block">Click here</div></div>`
		const previewOpenBlock = `<div class="open_ctm_preview">PREVIEW</div>`

		if (event.target.closest('.js-modal-close.pplr_close.p_r_c')) {
			if (document.querySelector(".pplr-c-button")) return;

			// hIdeComment();
			productDetail.style.display = 'block';
			productDetail.classList.add('prd_margin_left');
			// if (ImageAdded.querySelector('.upload_confrom') && ImageAdded.querySelector('.request_block_active')) return;
			if (ImageAdded.querySelector('.upload_confrom')) return;
			ImageAdded.insertAdjacentHTML('afterbegin', imageUploadHtml);
			ImageAdded.insertAdjacentHTML('beforeend', previewOpenBlock);
			// ImageAdded.insertAdjacentHTML('beforeend', requestblock);
		}

		if (event.target.closest('.pplr_img_w .pplr_delete') || event.target.closest('.js-modal-close.pplr_close.p_r_d')) {
			if (document.querySelector(".pplr-c-button")) return;

			// showComment();
			productDetail.style.display = 'none';
			productDetail.classList.remove('prd_margin_left');
			ImageAdded.querySelector('.upload_confrom').remove();
			// ImageAdded.querySelector('.request_block_active').remove();
			ImageAdded.querySelector('.open_ctm_preview').remove();
		}

		if (event.target.closest('.open_ctm_preview')) {
			document.querySelector('.pplr_prev_span button')?.click();
		}

		//////////////////////// ONLY FOR THE CUSTOM RUG CARPET ////////////////////////
		// if(!document.querySelector(".pplr-c-button")) {
		// 	// if (event.target.closest('.activate_comment_block')) {
		// 	// 	document.querySelector('.pplr-comments--requests.pplr_show_preview')?.classList.toggle('pplr-comments--requests--hide');
		// 	// } 

		// 	// if (window.location.href.includes('custom-rug-carpet')) {
		// 	// 	if (event.target.closest('.activate_comment_block')) {
		// 	// 		document.querySelector('.pplr-comments--requests.pplr_show_preview')?.classList.toggle('pplr-comments--requests--hide');
		// 	// 	}
		// 	// } else {
		// 	// 	if (event.target.closest('.activate_comment_block')) {
		// 	// 		document.querySelector('.pplr-comments--requests')?.classList.toggle('pplr-comments--requests--hide');
		// 	// 	} 
		// 	// }

		// 	// if (!document.querySelector('.pplr-comments--requests.pplr_show_preview')?.contains(event.target)) {
		// 	// 	document.querySelector('.pplr-comments--requests.pplr_show_preview')?.classList.add('pplr-comments--requests--hide');
		// 	// }
			
		// 	// if (window.location.href.includes('custom-rug-carpet')) {
		// 	// 	if (event.target.closest('.activate_comment_block') && !document.querySelector('.pplr-comments--requests.pplr_show_preview').contains(event.target)) {
		// 	// 		document.querySelector('.pplr-comments--requests.pplr_show_preview')?.classList.toggle('pplr-comments--requests--hide');
		// 	// 	} else if (!document.querySelector('.pplr-comments--requests.pplr_show_preview')?.contains(event.target)) {
		// 	// 		document.querySelector('.pplr-comments--requests.pplr_show_preview')?.classList.add('pplr-comments--requests--hide');
		// 	// 	}
		// 	// } else {
		// 	// 	if (event.target.closest('.activate_comment_block') && !document.querySelector('.pplr-comments--requests').contains(event.target)) {
		// 	// 		document.querySelector('.pplr-comments--requests')?.classList.toggle('pplr-comments--requests--hide');
		// 	// 	} else if (!document.querySelector('.pplr-comments--requests')?.contains(event.target)) {
		// 	// 		document.querySelector('.pplr-comments--requests')?.classList.add('pplr-comments--requests--hide');
		// 	// 	}
		// 	// }
		// }

		///////////////////// SIZE GUIDE MODALS ////////////////////////
		const sizeGuideModal = document.getElementById('sizeGuideModal'); // Original modal
		const newSizeModal = document.getElementById('newSizeModal'); // New side drawer modal
		const modalContent = document.querySelector('.ctm_sizeGuide');
		const newModalContent = document.querySelector('.newSizeDrawer');
		const openSizeModalBtn = document.getElementById('openSizeModal');

		// Function to sync modal with currently selected shape
		function syncNewModalWithSelectedShape() {
			// Get currently selected shape from the form
			const selectedShapeInput = document.querySelector('.swatch[data-option-index="0"] input.ctm_chage_var:checked');
			if (!selectedShapeInput) return;
			
			const selectedShape = selectedShapeInput.value;
			const newModalBody = newModalContent?.querySelector('.ctm_sizeGuide_body');
			if (!newModalBody) return;
			
			// Find the corresponding shapeOption in the new modal
			const shapeOption = newModalBody.querySelector(`.shapeOption[data-shape="${selectedShape}"]`);
			if (!shapeOption) return;
			
			// Update active tab
			newModalBody.querySelectorAll('.shapeOption').forEach((opt) => opt.classList.remove('active'));
			shapeOption.classList.add('active');
			
			// Show/hide shape images
			newModalBody.querySelectorAll('.ctm_shapeImages > div').forEach((elem) => elem.setAttribute('shape-active', false));
			const shapeContainer = newModalBody.querySelector(`[data-image-shape="${selectedShape}"]`);
			if (shapeContainer) {
				shapeContainer.setAttribute('shape-active', true);
				
				// Auto-select the currently selected size for this shape
				const selectedSizeInput = document.querySelector('.swatch[data-option-index="1"] input.ctm_chage_var:checked');
				if (selectedSizeInput) {
					const selectedSize = selectedSizeInput.value;
					const sizeImg = shapeContainer.querySelector(`.shapeImg[data-size="${selectedSize}"]`);
					if (sizeImg) {
						shapeContainer.querySelectorAll('.shapeImg').forEach((img) => img.classList.remove('active'));
						sizeImg.classList.add('active');
					} else {
						// If size not found, select first size
						const firstSize = shapeContainer.querySelector('.shapeImg');
						if (firstSize) {
							shapeContainer.querySelectorAll('.shapeImg').forEach((img) => img.classList.remove('active'));
							firstSize.classList.add('active');
						}
					}
				} else {
					// If no size selected, select first size
					const firstSize = shapeContainer.querySelector('.shapeImg');
					if (firstSize) {
						shapeContainer.querySelectorAll('.shapeImg').forEach((img) => img.classList.remove('active'));
						firstSize.classList.add('active');
					}
				}
			}
		}

		// Open NEW side drawer modal when clicking dropdown button
		if (event.target.closest('#openSizeModal')) {
			event.stopPropagation();
			event.preventDefault();
			document.body.classList.add("size_guide_model_open");
			newSizeModal.style.display = 'block';
			setTimeout(() => {
				newSizeModal.classList.add('active');
				// Sync modal with currently selected shape
				syncNewModalWithSelectedShape();
			}, 10);
			openSizeModalBtn?.classList.add('active');
		}

		// Open ORIGINAL centered modal when clicking "Size Guide" button
		if (event.target.closest('.open-size-guide-btn') && !document.querySelector('[data-label="Add to Cart"]').contains(event.target)) {
			event.stopPropagation();
			event.preventDefault();
			document.body.classList.add("size_guide_model_open");
			sizeGuideModal.style.display = 'block';
		}

		// Close ORIGINAL modal
		if ((event.target === sizeGuideModal && !modalContent.contains(event.target)) || event.target.closest('#closeModal')) {
			sizeGuideModal.style.display = 'none';
			document.body.classList.remove("size_guide_model_open");
		}

		// Close NEW modal
		if ((event.target === newSizeModal && !newModalContent.contains(event.target)) || event.target.closest('#closeNewModal')) {
			newSizeModal.classList.remove('active');
			setTimeout(() => {
				newSizeModal.style.display = 'none';
			}, 300);
			document.body.classList.remove("size_guide_model_open");
			openSizeModalBtn?.classList.remove('active');
		}

		// Handle shape tab switching (works for both modals)
		if (event.target.closest('.shapeOption')) {
			const option = event.target.closest('.shapeOption');
			const selectedShape = option.getAttribute('data-shape');
			const parentBody = option.closest('.ctm_sizeGuide_body');

			// Update active tab
			parentBody.querySelectorAll('.shapeOption').forEach((opt) => opt.classList.remove('active'));
			option.classList.add('active');

			// Show/hide shape images
			parentBody.querySelectorAll('.ctm_shapeImages > div').forEach((elem) => elem.setAttribute('shape-active', false));
			const shapeContainer = parentBody.querySelector(`[data-image-shape="${selectedShape}"]`);
			shapeContainer.setAttribute('shape-active', true);

			// Auto-select first size for the selected shape (only in new modal)
			if (option.closest('.newSizeDrawer')) {
				shapeContainer.querySelectorAll('.shapeImg').forEach((img) => img.classList.remove('active'));
				const firstSize = shapeContainer.querySelector('.shapeImg');
				if (firstSize) {
					firstSize.classList.add('active');
				}
			}
		}

		// Handle size selection (only for NEW modal)
		if (event.target.closest('.newSizeDrawer .shapeImg')) {
			const clickedImg = event.target.closest('.shapeImg');
			const parentContainer = clickedImg.closest('[data-image-shape]');
			
			// Remove active from all sizes in this shape
			parentContainer.querySelectorAll('.shapeImg').forEach((img) => img.classList.remove('active'));
			
			// Add active to clicked size
			clickedImg.classList.add('active');

			// Get selected shape and size
			const selectedShape = clickedImg.getAttribute('data-shape-value');
			const selectedSize = clickedImg.getAttribute('data-size');

			// Update the form inputs
			document.querySelector(`input[value="${selectedShape}"]`)?.click();
			setTimeout(() => {
				document.querySelector(`input[value="${selectedSize}"]`)?.click();
			}, 100);

			// Update dropdown display
			const selectedSizeDisplay = document.getElementById('selectedSizeDisplay');
			if (selectedSizeDisplay) {
				selectedSizeDisplay.textContent = selectedSize;
			}

			// Close NEW modal after selection
			setTimeout(() => {
				newSizeModal.classList.remove('active');
				setTimeout(() => {
					newSizeModal.style.display = 'none';
				}, 300);
				document.body.classList.remove("size_guide_model_open");
				openSizeModalBtn?.classList.remove('active');
			}, 300);
		}

		// Legacy select size button (if it exists)
		if (event.target.closest(".ctm_selectSize #size_guide_submit")) {
			const selectOption = document.querySelector("[data-active] .shapeOption.active");
			const selImg = document.querySelector("[data-active] .shapeImg.active");
			document.querySelector(`input[value="${selectOption.getAttribute('data-shape')}"]`)?.click();
			document.querySelector(`input[value="${selImg.getAttribute('data-size')}"]`)?.click();
			sizeGuideModal.style.display = 'none';
			document.body.classList.remove("size_guide_model_open");
		}
		///////////////// END MODEL ////////////////////////
	});
}



