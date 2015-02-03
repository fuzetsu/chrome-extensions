if(!document.querySelector('.chrome-invert-image-style')) {
	var style = document.createElement('style');
	
	style.textContent = 'img { -webkit-filter: invert(100%); }';
	style.className = 'chrome-invert-image-style';
	
	document.head.appendChild(style);
}