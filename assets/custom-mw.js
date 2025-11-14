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
    document.querySelector('[data-option-size-title]').innerHTML = 
        `<div class="option_title opt_title_size">Step ${stepNumber}. Choose Your Size</div>  
         <button class="open-size-guide-btn">Size Guide</button>`;
	}

	function classAddToComment() {
		const interval = setInterval(function () {
				// document.querySelector('[data-option-size-title]').innerHTML = 
				// 	`<div class="option_title opt_title_size">Step 2. Choose Your Size</div>   <button class="open-size-guide-btn">Size Guide</button>`;
				updateStepTitle();

				document.querySelector('[data-option-size-title]').parentElement.classList.add('opt_title_size_parent');
				if (window.location.href.includes("custom-rug-carpet")) {
					document.querySelector('[data-option-size-title]').parentElement.classList.remove('opt_title_size_parent');
				}

				const CommentElem = document.querySelectorAll(".pplr-comments--requests");
				if (CommentElem.length > 0) {
					CommentElem.forEach((elem) => {
						elem.querySelector("textarea").setAttribute("placeholder", "For design changes, you can mention here eg: background color...");
					});
					clearInterval(interval);
				}

				if(document.querySelector(".pplr-c-button")) {
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

		///////////////////// SIZE GUIDE MODEL ////////////////////////
		const sizeGuideModal = document.getElementById('sizeGuideModal');
		const modalContent = document.querySelector('.ctm_sizeGuide');
		const shapeImagesContainers = Array.from(document.querySelectorAll('.ctm_shapeImages > div'));
		const ImgShapes = document.querySelectorAll(`.shapeImg[data-size]`)

		if (event.target.closest('.open-size-guide-btn') && !document.querySelector('[data-label="Add to Cart"]').contains(event.target)) {
			event.stopPropagation();
			event.preventDefault();
			document.body.classList.add("size_guide_model_open");
			sizeGuideModal.style.display = 'block';
		}

		if ((event.target === sizeGuideModal && !modalContent.contains(event.target)) || event.target.closest('#closeModal')) {
			sizeGuideModal.style.display = 'none';
			document.body.classList.remove("size_guide_model_open");
		}

		if (event.target.closest('.shapeOption')) {
			const option = event.target;
			const selectedShape = option.getAttribute('data-shape');

			document.querySelectorAll('.shapeOption').forEach((opt) => opt.classList.remove('active'));
			option.classList.add('active');

			shapeImagesContainers.forEach((elem) => elem.setAttribute('shape-active', false));
			document.querySelector(`[data-image-shape="${selectedShape}"]`).setAttribute('shape-active', true);
			ImgShapes.forEach((imgSl) => imgSl.classList.remove("active"));
			document.querySelector(`[data-image-shape="${selectedShape}"] .shapeImg`).classList.add("active");
		}

		if (event.target.closest('.shapeImg') || event.target.closest('.shapeImg img')) {
			ImgShapes.forEach((imgSl) => imgSl.classList.remove("active"));
			event.target.closest(".shapeImg").classList.add("active");
		}

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



