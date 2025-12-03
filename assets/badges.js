class Badges extends HTMLElement {
  constructor() {
    super();
    this.tags = this.dataset.tags.split(",");
    this.addDummyCustomTags();
    this.initBadges();
  }
  

  buildStyles(tag) {
    return `style = "background-color: ${tag.backgroundColor}; color: ${tag.textColor}"`;
  }

  addDummyCustomTags() {
    if(!window.badges) return;
    const {compareAtPrice, price, available} = this.dataset;
    this.addSaleTag(compareAtPrice, price);
    this.addSoldOutTag(available);
  }

  addSaleTag(compareAtPrice, price) {
    for (const tag of this.tags) {
      if(tag.toLowerCase().indexOf("sale:") > -1) this.tags.push(window.badges.config.saleDummyTag)
    }
    if(typeof compareAtPrice === 'undefined' || !compareAtPrice) return
    if(typeof price === 'undefined') return
    if(compareAtPrice > price) {
      this.tags.push(window.badges.config.saleDummyTag)
    }
  }

  
  addSoldOutTag(available) {
    if(typeof available === 'undefined') return
    const boolAvailable = (available === 'true')
    if (!boolAvailable) {
      this.tags.push(window.badges.config.soldOutDummyTag)
    }
  }

  initBadges() {
    if(!window.badges) return;

    var positions = {
      "top-left": [],
      "top-right": [],
      "bottom-left": [],
      "bottom-right": []
    }
    for (const badge of window.badges.list) {
      if(this.tags.includes(badge.tag)) {
        let html = `<div ${this.buildStyles(badge)} data-pdp="${badge.showPdp}" data-mini-cart="${badge.showMiniCart}" class="card__badge p">${badge.text}</div>`
        positions[badge.position].push(html)
      }
    }
    let badgesHtml = '';
    for (const pos in positions) {
      if(positions[pos].length) {
        badgesHtml = badgesHtml + `<div class="badges badges--${pos}">${positions[pos].join("")} </div>`
      }
    }
    this.innerHTML = badgesHtml;
  }
}
customElements.define('grid-badges', Badges);